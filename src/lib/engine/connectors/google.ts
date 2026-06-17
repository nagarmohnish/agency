// Google Ads connector — REST (v18+), no heavy gRPC/SDK dependency, so it runs
// cleanly on Vercel's Node runtime. Auth is OAuth2 refresh-token -> short-lived
// access token, cached in-process until ~60s before expiry.
//
// Credentials come exclusively from config.ts (requireGoogle()); this file is
// importable with no env set and only errors when a method is actually called.
//
// Reads use GAQL via customers/{id}/googleAds:searchStream. Mutations are routed
// from MutationRequest.kind to the right REST mutate endpoint. We implement the
// handful the loop needs now; unknown kinds throw clearly so the gate logs them.

import { config, requireGoogle } from "../config";
import type { BreakdownRow, CampaignSummary, MetricRow, MutationRequest } from "../types";
import type { AdConnector } from "./types";

// Google Ads enum → friendly label maps.
const NETWORK_LABEL: Record<string, string> = {
  SEARCH: "Google Search",
  SEARCH_PARTNERS: "Search partners",
  CONTENT: "Display network",
  YOUTUBE: "YouTube",
  YOUTUBE_SEARCH: "YouTube search",
  YOUTUBE_WATCH: "YouTube",
  GOOGLE_TV: "Google TV",
  MIXED: "Cross-network",
  UNKNOWN: "Other",
  UNSPECIFIED: "Other",
};
const AGE_LABEL: Record<string, string> = {
  AGE_RANGE_18_24: "18–24",
  AGE_RANGE_25_34: "25–34",
  AGE_RANGE_35_44: "35–44",
  AGE_RANGE_45_54: "45–54",
  AGE_RANGE_55_64: "55–64",
  AGE_RANGE_65_UP: "65+",
  AGE_RANGE_UNDETERMINED: "Unknown",
};
const GENDER_LABEL: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  UNDETERMINED: "Unknown",
};

const OAUTH_URL = "https://oauth2.googleapis.com/token";

interface Account {
  google_customer_id: string | null;
  google_login_customer_id: string | null;
}

// Cache access tokens PER refresh-token (i.e. per company), not process-wide.
// A global singleton would hand company B company A's token once creds go
// per-tenant (D27) — a silent cross-tenant leak. Key = refresh token.
const accessTokenCache = new Map<string, { token: string; expiresAt: number }>();

async function getAccessToken(g: { clientId: string; clientSecret: string; refreshToken: string }): Promise<string> {
  const cached = accessTokenCache.get(g.refreshToken);
  if (cached && Date.now() < cached.expiresAt) return cached.token;
  const body = new URLSearchParams({
    client_id: g.clientId,
    client_secret: g.clientSecret,
    refresh_token: g.refreshToken,
    grant_type: "refresh_token",
  });
  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`Google OAuth failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  accessTokenCache.set(g.refreshToken, {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  });
  return json.access_token;
}

function cleanId(id: string | null | undefined): string {
  return (id ?? "").replace(/-/g, "").trim();
}

export class GoogleConnector implements AdConnector {
  readonly platform = "google" as const;
  constructor(private account: Account) {}

  private customerId(): string {
    const id = cleanId(this.account.google_customer_id);
    if (!id) throw new Error("Account has no google_customer_id set.");
    return id;
  }

  private async headers(): Promise<Record<string, string>> {
    const g = requireGoogle();
    const token = await getAccessToken(g);
    const h: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "developer-token": g.developerToken,
      "Content-Type": "application/json",
    };
    const login = cleanId(this.account.google_login_customer_id) || cleanId(g.loginCustomerId);
    if (login) h["login-customer-id"] = login;
    return h;
  }

  private base(): string {
    return `https://googleads.googleapis.com/${config.google.apiVersion}`;
  }

  /** Run a GAQL query via searchStream and return flattened result rows. */
  private async query(gaql: string): Promise<Record<string, unknown>[]> {
    const url = `${this.base()}/customers/${this.customerId()}/googleAds:searchStream`;
    const res = await fetch(url, {
      method: "POST",
      headers: await this.headers(),
      body: JSON.stringify({ query: gaql }),
    });
    if (!res.ok) {
      throw new Error(`Google Ads query failed (${res.status}): ${await res.text()}`);
    }
    // searchStream returns an array of {results: [...]} batches.
    const batches = (await res.json()) as Array<{ results?: Record<string, unknown>[] }>;
    return batches.flatMap((b) => b.results ?? []);
  }

  async ping(): Promise<{ ok: boolean; detail: string }> {
    try {
      const rows = await this.query(
        "SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1"
      );
      const c = rows[0]?.customer as { descriptiveName?: string; id?: string } | undefined;
      return { ok: true, detail: `Connected to ${c?.descriptiveName ?? c?.id ?? this.customerId()}` };
    } catch (e) {
      return { ok: false, detail: e instanceof Error ? e.message : String(e) };
    }
  }

  async listCampaigns(): Promise<CampaignSummary[]> {
    const rows = await this.query(
      `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
              campaign_budget.amount_micros
       FROM campaign
       WHERE campaign.status != 'REMOVED'
       ORDER BY campaign.id`
    );
    return rows.map((r) => {
      const c = r.campaign as { id: string; name: string; status: string; advertisingChannelType?: string };
      const b = r.campaignBudget as { amountMicros?: string } | undefined;
      return {
        externalId: String(c.id),
        name: c.name,
        status: c.status,
        objective: c.advertisingChannelType,
        dailyBudgetCents: b?.amountMicros ? Math.round(Number(b.amountMicros) / 10000) : undefined,
      };
    });
  }

  async getMetrics(days: number): Promise<MetricRow[]> {
    const rows = await this.query(
      `SELECT campaign.id, segments.date, metrics.impressions, metrics.clicks,
              metrics.cost_micros, metrics.conversions, metrics.conversions_value
       FROM campaign
       WHERE segments.date DURING LAST_${days <= 7 ? "7" : days <= 14 ? "14" : "30"}_DAYS`
    );
    return rows.map((r) => {
      const c = r.campaign as { id: string };
      const s = r.segments as { date: string };
      const m = r.metrics as {
        impressions?: string;
        clicks?: string;
        costMicros?: string;
        conversions?: number;
        conversionsValue?: number;
      };
      return {
        entityType: "campaign" as const,
        externalId: String(c.id),
        date: s.date,
        impressions: Number(m.impressions ?? 0),
        clicks: Number(m.clicks ?? 0),
        spendCents: Math.round(Number(m.costMicros ?? 0) / 10000),
        conversions: Number(m.conversions ?? 0),
        conversionValueCents: Math.round(Number(m.conversionsValue ?? 0) * 100),
      };
    });
  }

  async getBreakdowns(days: number): Promise<BreakdownRow[]> {
    const range = days <= 7 ? "LAST_7_DAYS" : days <= 14 ? "LAST_14_DAYS" : "LAST_30_DAYS";
    const out: BreakdownRow[] = [];

    const metric = (r: Record<string, unknown>) => {
      const c = r.campaign as { id: string; name: string };
      const m = (r.metrics ?? {}) as {
        impressions?: string; clicks?: string; costMicros?: string; conversions?: number; conversionsValue?: number;
      };
      return {
        campaignId: String(c.id),
        campaignName: c.name,
        impressions: Number(m.impressions ?? 0),
        clicks: Number(m.clicks ?? 0),
        spendCents: Math.round(Number(m.costMicros ?? 0) / 10000),
        conversions: Number(m.conversions ?? 0),
        conversionValueCents: Math.round(Number(m.conversionsValue ?? 0) * 100),
      };
    };
    const METRICS = "metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value";

    // Each dimension is independent — if one view isn't available for this
    // account's campaign types, skip it rather than failing the whole call.
    const safe = async (fn: () => Promise<void>) => {
      try { await fn(); } catch { /* dimension unavailable — skip */ }
    };

    await safe(async () => {
      const rows = await this.query(
        `SELECT campaign.id, campaign.name, segments.ad_network_type, ${METRICS}
         FROM campaign WHERE segments.date DURING ${range}`
      );
      for (const r of rows) {
        const key = String((r.segments as { adNetworkType?: string })?.adNetworkType ?? "UNKNOWN");
        out.push({ dimension: "network", label: NETWORK_LABEL[key] ?? key, ...metric(r) });
      }
    });

    await safe(async () => {
      const rows = await this.query(
        `SELECT campaign.id, campaign.name, ad_group_criterion.gender.type, ${METRICS}
         FROM gender_view WHERE segments.date DURING ${range}`
      );
      for (const r of rows) {
        const key = String((r.adGroupCriterion as { gender?: { type?: string } })?.gender?.type ?? "UNDETERMINED");
        out.push({ dimension: "gender", label: GENDER_LABEL[key] ?? key, ...metric(r) });
      }
    });

    await safe(async () => {
      const rows = await this.query(
        `SELECT campaign.id, campaign.name, ad_group_criterion.age_range.type, ${METRICS}
         FROM age_range_view WHERE segments.date DURING ${range}`
      );
      for (const r of rows) {
        const key = String((r.adGroupCriterion as { ageRange?: { type?: string } })?.ageRange?.type ?? "AGE_RANGE_UNDETERMINED");
        out.push({ dimension: "age", label: AGE_LABEL[key] ?? key, ...metric(r) });
      }
    });

    return out;
  }

  async mutate(req: MutationRequest, opts: { forcePaused: boolean }): Promise<Record<string, unknown>> {
    const cid = this.customerId();
    switch (req.kind) {
      case "update_campaign_status":
      case "pause_campaign": {
        const resourceName = String(req.payload.resourceName ?? "");
        // forcePaused (paused_writes mode) never lets us flip something to ENABLED.
        const desired = req.kind === "pause_campaign" ? "PAUSED" : String(req.payload.status ?? "PAUSED");
        const status = opts.forcePaused ? "PAUSED" : desired;
        return this.mutateCampaigns(cid, [
          { update: { resourceName, status }, updateMask: "status" },
        ]);
      }
      case "update_campaign_budget": {
        // payload: { budgetResourceName, dailyAmountCents }
        const resourceName = String(req.payload.budgetResourceName ?? "");
        const micros = Math.round(Number(req.payload.dailyAmountCents ?? 0) * 10000);
        return this.mutateBudgets(cid, [
          { update: { resourceName, amountMicros: String(micros) }, updateMask: "amount_micros" },
        ]);
      }
      default:
        throw new Error(`GoogleConnector: unsupported mutation kind "${req.kind}"`);
    }
  }

  private async mutateCampaigns(cid: string, operations: unknown[]): Promise<Record<string, unknown>> {
    return this.post(`/customers/${cid}/campaigns:mutate`, { operations });
  }

  private async mutateBudgets(cid: string, operations: unknown[]): Promise<Record<string, unknown>> {
    return this.post(`/customers/${cid}/campaignBudgets:mutate`, { operations });
  }

  private async post(path: string, payload: unknown): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.base()}${path}`, {
      method: "POST",
      headers: await this.headers(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Google Ads mutate failed (${res.status}): ${await res.text()}`);
    }
    return (await res.json()) as Record<string, unknown>;
  }
}
