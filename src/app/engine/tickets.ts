// Tickets & Approvals — data model + granular permission helpers (demo).
// Spec: documentation/TICKETS.md (D21). Demo-first: seeded members + tickets +
// a "View as role" switcher drive the board; live auth/server re-checks come later.

export type Channel = "meta" | "google" | "shopify" | "subscriptions";
export type Role = "admin" | "operator" | "viewer";
export type TicketType = "budget" | "creative" | "campaign" | "tracking";
export type Status = "open" | "awaiting" | "approved" | "done" | "rejected" | "changes";

export type Permission =
  | "analytics.view" | "tickets.view" | "tickets.create" | "tickets.edit" | "tickets.comment" | "tickets.transition"
  | "approve.budget" | "approve.creative" | "approve.campaign" | "approve.tracking"
  | "actions.execute" | "members.manage" | "settings.manage";

export const ALL_PERMS: Permission[] = [
  "analytics.view", "tickets.view", "tickets.create", "tickets.edit", "tickets.comment", "tickets.transition",
  "approve.budget", "approve.creative", "approve.campaign", "approve.tracking",
  "actions.execute", "members.manage", "settings.manage",
];

// roles = preset bundles of permissions
export const ROLE_PERMS: Record<Role, Permission[]> = {
  admin: ALL_PERMS,
  operator: ["analytics.view", "tickets.view", "tickets.create", "tickets.edit", "tickets.comment", "tickets.transition", "actions.execute"],
  viewer: ["analytics.view", "tickets.view", "tickets.comment"],
};

// ticket type → the approval permission it requires
export const APPROVE_FOR: Record<TicketType, Permission> = {
  budget: "approve.budget", creative: "approve.creative", campaign: "approve.campaign", tracking: "approve.tracking",
};

export interface Member {
  id: string; name: string; initials: string; color: string;
  org: "ROI Labs" | "The Astro Time"; title: string;
  role: Role; grants?: Permission[]; scope?: Channel[]; // grants + optional channel scope (unset = all)
}

export function effectivePerms(m: Member): Set<Permission> {
  return new Set<Permission>([...ROLE_PERMS[m.role], ...(m.grants ?? [])]);
}
export function can(m: Member, p: Permission, ch?: Channel): boolean {
  if (!effectivePerms(m).has(p)) return false;
  if (ch && m.scope && m.scope.length > 0 && !m.scope.includes(ch)) return false;
  return true;
}

export interface Comment { who: string; initials: string; color: string; at: string; body: string }
export interface Activity { at: string; who: string; action: string }
export interface Stat { label: string; value: string; accent?: boolean; good?: boolean }
export interface Ticket {
  key: string; type: TicketType; title: string; description: string; status: Status;
  priority: "high" | "med" | "low"; channel: Channel;
  reporterId: string; approverId: string; agent?: string;
  data: Stat[]; cap?: { pct: number; note: string };
  comments: Comment[]; activity: Activity[]; createdAt: string;
}

export function canApprove(m: Member, t: Ticket): boolean {
  return t.status === "awaiting" && can(m, APPROVE_FOR[t.type], t.channel);
}

export const COLUMNS: { id: Status; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "awaiting", label: "Awaiting approval" },
  { id: "approved", label: "Approved" },
  { id: "done", label: "Done" },
];

export const TYPE_META: Record<TicketType, { label: string; c: string; bg: string }> = {
  budget: { label: "BUDGET", c: "#3b5bdb", bg: "#e6ecfd" },
  creative: { label: "CREATIVE", c: "#d4604d", bg: "#fde3df" },
  campaign: { label: "CAMPAIGN", c: "#6c5ce7", bg: "#ece9fd" },
  tracking: { label: "TRACKING", c: "#0d9f72", bg: "#dcf3e8" },
};
export const PRIORITY_C: Record<string, string> = { high: "#ef6b6b", med: "#c08a2e", low: "#9aa3b5" };

// ── seeded members ─ ROI Labs operator + a client admin + domain approvers + a viewer ──
export const MEMBERS: Member[] = [
  { id: "op", name: "Ishaan Gupta", initials: "IG", color: "#4F5BD5", org: "ROI Labs", title: "Ad ops · Operator", role: "operator" },
  { id: "admin", name: "Aanya Rao", initials: "AR", color: "#e07b6b", org: "The Astro Time", title: "Founder · Admin", role: "admin" },
  { id: "fin", name: "Vikram Shah", initials: "VS", color: "#2bbf7a", org: "The Astro Time", title: "Finance · Budget approver", role: "viewer", grants: ["approve.budget"] },
  { id: "brand", name: "Neha Kapoor", initials: "NK", color: "#c08a2e", org: "The Astro Time", title: "Brand · Creative approver", role: "viewer", grants: ["approve.creative"] },
  { id: "view", name: "Arjun Mehta", initials: "AM", color: "#8a92f5", org: "The Astro Time", title: "Growth · Viewer", role: "viewer" },
];
export const memberById = (id: string) => MEMBERS.find((m) => m.id === id) ?? MEMBERS[0];

// ── seeded tickets — spread across columns/types, from the engine's proposals ──
export const SEED_TICKETS: Ticket[] = [
  {
    key: "AT-142", type: "budget", title: "Scale Advantage+ Shopping budget", channel: "meta", status: "awaiting", priority: "high",
    reporterId: "op", approverId: "fin", agent: "Media buying",
    description: "ROAS held at 4.18× (target 3.0×) for 5 straight days. More budget should compound while efficiency is high.",
    data: [{ label: "CURRENT", value: "₹3,200/day" }, { label: "PROPOSED", value: "₹4,500/day", accent: true }, { label: "IMPACT", value: "+₹1,300/day" }],
    cap: { pct: 75, note: "₹4,500 of ₹6,000/day cap · within cap" },
    comments: [{ who: "Ishaan Gupta", initials: "IG", color: "#4F5BD5", at: "12m ago", body: "Capping at +40% of current; well under the daily cap." }],
    activity: [{ at: "12m ago", who: "Ishaan Gupta", action: "submitted for approval" }, { at: "14m ago", who: "Media buying", action: "drafted from insight" }], createdAt: "14m ago",
  },
  {
    key: "AT-141", type: "creative", title: "Publish 3 UGC variants", channel: "meta", status: "awaiting", priority: "med",
    reporterId: "op", approverId: "brand", agent: "Creative production",
    description: "Current hooks fatiguing — CPM up 14% over 7 days. New AI-generated UGC angles are disclosure-labeled per platform policy.",
    data: [{ label: "VARIANTS", value: "3 assets" }, { label: "SPEND IMPACT", value: "₹0", good: true }, { label: "LABEL", value: "AI-disclosed" }],
    comments: [], activity: [{ at: "1h ago", who: "Ishaan Gupta", action: "submitted for approval" }], createdAt: "1h ago",
  },
  {
    key: "AT-140", type: "tracking", title: "Pass consultation booking value to Google", channel: "google", status: "awaiting", priority: "high",
    reporterId: "op", approverId: "admin", agent: "Measurement & attribution",
    description: "Consultation bookings fire a conversion with no value, so ROAS is understated and Smart Bidding optimises blind. Send booking value back to Google.",
    data: [{ label: "AFFECTS", value: "Smart Bidding" }, { label: "SPEND IMPACT", value: "₹0", good: true }, { label: "EFFORT", value: "Medium" }],
    comments: [], activity: [{ at: "3h ago", who: "Ishaan Gupta", action: "submitted for approval" }], createdAt: "3h ago",
  },
  {
    key: "AT-143", type: "budget", title: "Launch PMax — App installs (YouTube)", channel: "google", status: "open", priority: "med",
    reporterId: "op", approverId: "fin", agent: "Media buying",
    description: "CPI trending down 12% week-over-week. A capped PMax test can capture cheaper installs before CPMs climb.",
    data: [{ label: "NEW BUDGET", value: "₹2,000/day", accent: true }, { label: "TARGET CPI", value: "₹32" }],
    cap: { pct: 33, note: "₹2,000 of ₹6,000/day cap" },
    comments: [], activity: [{ at: "20m ago", who: "Ishaan Gupta", action: "created" }], createdAt: "20m ago",
  },
  {
    key: "AT-139", type: "campaign", title: "Pause Display — Remarketing", channel: "google", status: "approved", priority: "low",
    reporterId: "op", approverId: "admin", agent: "Measurement & attribution",
    description: "Display remarketing CAC ran 3× blended for 9 straight days with falling volume. Pause and reallocate.",
    data: [{ label: "CAC", value: "₹2,140" }, { label: "vs blended", value: "₹680" }, { label: "SAVING", value: "~₹1.1L/mo", good: true }],
    comments: [], activity: [{ at: "2h ago", who: "Aanya Rao", action: "approved" }, { at: "5h ago", who: "Ishaan Gupta", action: "submitted for approval" }], createdAt: "5h ago",
  },
  {
    key: "AT-138", type: "budget", title: "Reallocate ₹1.2K/day to Advantage+", channel: "meta", status: "done", priority: "med",
    reporterId: "op", approverId: "fin", agent: "Media buying",
    description: "Shifted budget from underperforming Lookalike sets into Advantage+ Shopping at the time's best ROAS.",
    data: [{ label: "MOVED", value: "₹1,200/day" }, { label: "RESULT", value: "+₹28K", good: true }],
    comments: [], activity: [{ at: "14h ago", who: "Ishaan Gupta", action: "executed → done" }, { at: "15h ago", who: "Vikram Shah", action: "approved" }, { at: "16h ago", who: "Ishaan Gupta", action: "submitted for approval" }], createdAt: "16h ago",
  },
];
