// ROI Engine v2 — fact schema (daily grain only) + app-state types.
// RULE: facts are stored at daily grain. Every period total, comparison, and
// chart is computed at query time in metrics.ts / insights.ts. Nothing is
// pre-aggregated by period.

export type Source = "google" | "meta";
export type CampaignType = "search" | "pmax" | "shopping" | "prospecting" | "retargeting" | "other";
export type FunnelStage = "tof" | "mof" | "bof" | "unlabeled";
export type SegmentType = "age" | "gender" | "device" | "geo" | "placement";
export type CustomerType = "new" | "returning";
export type IntegrationStatus = "connected" | "in_progress" | "error";

// money is stored in cents (paise for INR), matching the live API.
export interface AdDaily {
  date: string; // YYYY-MM-DD
  source: Source;
  campaignId: string;
  campaignName: string;
  campaignType: CampaignType;
  funnelStage: FunnelStage; // parsed from campaignName by parseFunnel()
  impressions: number;
  clicks: number;
  spendCents: number;
  platformConversions: number;
  platformRevenueCents: number;
  // meta-only (optional)
  reach?: number;
  frequency?: number;
  video3sViews?: number;
  thruplays?: number;
  // google-only (optional)
  searchImpressionShare?: number; // 0..1
  lostIsBudget?: number; // 0..1
  lostIsRank?: number; // 0..1
}

export interface AdSegmentDaily {
  date: string;
  source: Source;
  campaignId: string;
  segmentType: SegmentType;
  segmentValue: string;
  impressions: number;
  clicks: number;
  spendCents: number;
  conversions: number;
  revenueCents: number;
}

export interface OrderProduct {
  title: string;
  quantity: number;
  revenueCents: number;
}

export interface Order {
  date: string;
  orderId: string;
  revenueGrossCents: number;
  discountAmountCents: number;
  refundAmountCents: number;
  revenueNetCents: number; // gross - discount - refund
  customerType: CustomerType;
  utmSource: string | null; // "google" | "meta" | "klaviyo" | null (direct/organic)
  utmMedium: string | null;
  utmCampaign: string | null;
  products: OrderProduct[];
  discountUsed: boolean;
}

export interface SearchTermDaily {
  date: string;
  campaignId: string;
  campaignName: string;
  searchTerm: string;
  impressions: number;
  clicks: number;
  spendCents: number;
  conversions: number;
}

export interface Integration {
  source: Source | "shopify";
  status: IntegrationStatus;
  lastSyncAt: string | null; // ISO
}

export interface Dataset {
  currency: string;
  generatedAt: string;
  adDaily: AdDaily[];
  segmentDaily: AdSegmentDaily[];
  orders: Order[];
  searchTerms: SearchTermDaily[];
  integrations: Integration[];
}

// --- app state (serialized to URL params) -----------------------------------

export type Lens = "platform" | "shopify" | "blended";
// source SCOPE (which platform's data is on screen) — distinct from the lens
// (how revenue is attributed). all = combined; shopify = store view (no ad spend);
// meta = pending until connected.
export type SourceScope = "all" | "google" | "meta" | "shopify";
export type Granularity = "day" | "week" | "month";
export type CompareMode = "off" | "preceding" | "preceding_dow" | "yoy" | "custom";

export interface DateRange {
  start: string; // YYYY-MM-DD inclusive
  end: string; // YYYY-MM-DD inclusive
}

export type FilterDim = "platform" | "campaign" | "campaignType" | "funnelStage" | "device" | "geo" | "customerType";

export interface Filter {
  dim: FilterDim;
  values: string[];
}

export interface AppState {
  range: DateRange;
  presetId: string; // e.g. "last_28" | "custom"
  compareMode: CompareMode;
  compareRange: DateRange | null; // resolved (or custom)
  granularity: Granularity;
  lens: Lens;
  source: SourceScope;
  filters: Filter[];
}
