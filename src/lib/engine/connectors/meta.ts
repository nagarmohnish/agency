// Meta Marketing API connector — Graph API over fetch, system-user token.
// Like the Google connector, importable with no env; only methods that hit the
// API require the token (requireMeta()).
//
// The account id is stored as "act_1234567890". Reads use /campaigns and
// /insights; mutations POST to the entity id (status/budget) — Meta returns the
// updated entity. New entities are created with status=PAUSED unless explicitly
// (and approvedly) set live, matching the official Meta Ads MCP's safe default.

import { config, requireMeta } from "../config";
import type { BreakdownDimension, BreakdownRow, CampaignSummary, MetricRow, MutationRequest } from "../types";
import type { AdConnector } from "./types";

const META_NETWORK_LABEL: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  audience_network: "Audience Network",
  messenger: "Messenger",
  unknown: "Other",
};

interface Account {
  meta_ad_account_id: string | null;
}

export class MetaConnector implements AdConnector {
  readonly platform = "meta" as const;
  constructor(private account: Account) {}

  private adAccount(): string {
    const id = this.account.meta_ad_account_id?.trim();
    if (!id) throw new Error("Account has no meta_ad_account_id set.");
    return id.startsWith("act_") ? id : `act_${id}`;
  }

  private base(): string {
    return `https://graph.facebook.com/${config.meta.apiVersion}`;
  }

  private async get(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
    const { accessToken } = requireMeta();
    const qs = new URLSearchParams({ ...params, access_token: accessToken });
    const res = await fetch(`${this.base()}${path}?${qs}`);
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      throw new Error(`Meta GET ${path} failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return json;
  }

  private async postForm(path: string, fields: Record<string, string>): Promise<Record<string, unknown>> {
    const { accessToken } = requireMeta();
    const body = new URLSearchParams({ ...fields, access_token: accessToken });
    const res = await fetch(`${this.base()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      throw new Error(`Meta POST ${path} failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return json;
  }

  async ping(): Promise<{ ok: boolean; detail: string }> {
    try {
      const r = await this.get(`/${this.adAccount()}`, { fields: "name,account_status,currency" });
      return { ok: true, detail: `Connected to ${r.name ?? this.adAccount()} (${r.currency ?? "?"})` };
    } catch (e) {
      return { ok: false, detail: e instanceof Error ? e.message : String(e) };
    }
  }

  async listCampaigns(): Promise<CampaignSummary[]> {
    const r = await this.get(`/${this.adAccount()}/campaigns`, {
      fields: "id,name,status,objective,daily_budget",
      limit: "200",
    });
    const data = (r.data ?? []) as Array<{
      id: string;
      name: string;
      status: string;
      objective?: string;
      daily_budget?: string;
    }>;
    return data.map((c) => ({
      externalId: c.id,
      name: c.name,
      status: c.status,
      objective: c.objective,
      // Meta budgets are minor units (cents for EUR/USD).
      dailyBudgetCents: c.daily_budget ? Number(c.daily_budget) : undefined,
    }));
  }

  async getMetrics(days: number): Promise<MetricRow[]> {
    const r = await this.get(`/${this.adAccount()}/insights`, {
      level: "campaign",
      fields: "campaign_id,impressions,clicks,spend,actions,action_values",
      date_preset: days <= 7 ? "last_7d" : days <= 14 ? "last_14d" : "last_30d",
      time_increment: "1",
      limit: "500",
    });
    const data = (r.data ?? []) as Array<Record<string, unknown>>;
    return data.map((row) => {
      const actions = (row.actions ?? []) as Array<{ action_type: string; value: string }>;
      const values = (row.action_values ?? []) as Array<{ action_type: string; value: string }>;
      const purchase = actions.find((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase");
      const purchaseValue = values.find((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase");
      return {
        entityType: "campaign" as const,
        externalId: String(row.campaign_id),
        date: String(row.date_start ?? ""),
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
        spendCents: Math.round(Number(row.spend ?? 0) * 100),
        conversions: purchase ? Number(purchase.value) : 0,
        conversionValueCents: purchaseValue ? Math.round(Number(purchaseValue.value) * 100) : 0,
      };
    });
  }

  async getBreakdowns(days: number): Promise<BreakdownRow[]> {
    const preset = days <= 7 ? "last_7d" : days <= 14 ? "last_14d" : "last_30d";
    const out: BreakdownRow[] = [];

    const conv = (row: Record<string, unknown>) => {
      const actions = (row.actions ?? []) as Array<{ action_type: string; value: string }>;
      const values = (row.action_values ?? []) as Array<{ action_type: string; value: string }>;
      const isPurchase = (t: string) => t === "purchase" || t === "offsite_conversion.fb_pixel_purchase";
      const p = actions.find((a) => isPurchase(a.action_type));
      const pv = values.find((a) => isPurchase(a.action_type));
      return {
        campaignId: String(row.campaign_id ?? ""),
        campaignName: String(row.campaign_name ?? row.campaign_id ?? ""),
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
        spendCents: Math.round(Number(row.spend ?? 0) * 100),
        conversions: p ? Number(p.value) : 0,
        conversionValueCents: pv ? Math.round(Number(pv.value) * 100) : 0,
      };
    };

    const pull = async (dimension: BreakdownDimension, breakdown: string, label: (k: string) => string) => {
      try {
        const r = await this.get(`/${this.adAccount()}/insights`, {
          level: "campaign",
          fields: "campaign_id,campaign_name,impressions,clicks,spend,actions,action_values",
          breakdowns: breakdown,
          date_preset: preset,
          limit: "1000",
        });
        for (const row of (r.data ?? []) as Array<Record<string, unknown>>) {
          const key = String(row[breakdown] ?? "unknown");
          out.push({ dimension, label: label(key), ...conv(row) });
        }
      } catch {
        /* breakdown unavailable — skip */
      }
    };

    await pull("network", "publisher_platform", (k) => META_NETWORK_LABEL[k] ?? k);
    await pull("age", "age", (k) => k);
    await pull("gender", "gender", (k) => (k === "male" ? "Male" : k === "female" ? "Female" : "Unknown"));
    return out;
  }

  async mutate(req: MutationRequest, opts: { forcePaused: boolean }): Promise<Record<string, unknown>> {
    switch (req.kind) {
      case "update_campaign_status":
      case "pause_campaign": {
        const id = String(req.payload.campaignId ?? "");
        const desired = req.kind === "pause_campaign" ? "PAUSED" : String(req.payload.status ?? "PAUSED");
        const status = opts.forcePaused ? "PAUSED" : desired;
        return this.postForm(`/${id}`, { status });
      }
      case "update_campaign_budget": {
        const id = String(req.payload.campaignId ?? "");
        const cents = Math.round(Number(req.payload.dailyAmountCents ?? 0));
        return this.postForm(`/${id}`, { daily_budget: String(cents) });
      }
      default:
        throw new Error(`MetaConnector: unsupported mutation kind "${req.kind}"`);
    }
  }
}
