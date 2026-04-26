"use client";

// /discord — alternate UI for ROI Labs styled like a Discord app shell.
// Three columns: thin icon rail (server bar) + middle "channels" sidebar
// + main content pane. Content is pulled from the same ROI Labs source
// (Meta + Google primary, three-step process, stats, principles) and
// slotted into "channels" you click between.
//
// Inspired by https://github.com/AzaanUllah-Khan/Discord-UI-Clone — same
// structural pattern, dark-themed, brand yellow replacing Discord blurple.

import { useState } from "react";

// ─── Discord palette (dark mode) ───────────────────────────────────────
const BG_RAIL = "#1E1F22";       // far-left server rail
const BG_SIDE = "#2B2D31";       // middle channel sidebar
const BG_MAIN = "#313338";       // main content pane
const BG_INPUT = "#1E1F22";
const BORDER = "#1F2023";
const TEXT = "#F2F3F5";
const TEXT_MUTED = "#B5BAC1";
const TEXT_DIM = "#80848E";
const ACCENT = "#FACC15";        // ROI brand yellow (replaces blurple)
const ACCENT_TEXT = "#000";

const channels = [
  { id: "overview", label: "overview" },
  { id: "platforms", label: "platforms" },
  { id: "contact", label: "contact" },
];

const platforms = [
  { id: "meta", initials: "M", name: "Meta" },
  { id: "google", initials: "G", name: "Google" },
  { id: "linkedin", initials: "Li", name: "LinkedIn" },
  { id: "snap", initials: "Sn", name: "Snap" },
  { id: "prog", initials: "Pr", name: "Programmatic" },
];

export default function DiscordPage() {
  const [active, setActive] = useState("overview");
  const [hoveredRail, setHoveredRail] = useState<string | null>(null);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: BG_MAIN,
        color: TEXT,
        display: "flex",
        fontFamily: "var(--font-montserrat), system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* === FAR-LEFT RAIL: server icons === */}
      <div
        style={{
          width: 72,
          background: BG_RAIL,
          padding: "12px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* ROI brand chip */}
        <RailIcon
          label="ROI Labs"
          isActive={active === "overview"}
          onClick={() => setActive("overview")}
          onHover={(h) => setHoveredRail(h ? "ROI Labs" : null)}
          isHovered={hoveredRail === "ROI Labs"}
        >
          <span style={{ color: ACCENT, fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>R</span>
        </RailIcon>

        <div style={{ width: 32, height: 2, background: "#3F4147", borderRadius: 1, margin: "4px 0" }} />

        {platforms.map((p) => (
          <RailIcon
            key={p.id}
            label={p.name}
            onClick={() => setActive("platforms")}
            onHover={(h) => setHoveredRail(h ? p.name : null)}
            isHovered={hoveredRail === p.name}
          >
            <span style={{ color: TEXT_MUTED, fontWeight: 600, fontSize: 14 }}>{p.initials}</span>
          </RailIcon>
        ))}

        <div style={{ flex: 1 }} />
        <RailIcon
          label="Inbox"
          onClick={() => setActive("contact")}
          onHover={(h) => setHoveredRail(h ? "Inbox" : null)}
          isHovered={hoveredRail === "Inbox"}
        >
          <Icon name="mail" />
        </RailIcon>
      </div>

      {/* === MIDDLE: channel list === */}
      <aside
        style={{
          width: 240,
          background: BG_SIDE,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          borderRight: `1px solid ${BORDER}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 0 rgba(0,0,0,0.2)",
          }}
        >
          <span style={{ color: TEXT, fontWeight: 600, fontSize: 15 }}>roi-labs</span>
          <Icon name="chevron-down" color={TEXT_MUTED} />
        </div>

        {/* Section label */}
        <div style={{ padding: "16px 16px 4px" }}>
          <div
            style={{
              fontSize: 11,
              color: TEXT_DIM,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              fontWeight: 700,
              padding: "4px 0",
            }}
          >
            text channels
          </div>
        </div>

        {/* Channel list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
          {channels.map((c) => (
            <ChannelItem
              key={c.id}
              label={c.label}
              isActive={active === c.id}
              onClick={() => setActive(c.id)}
            />
          ))}
        </div>

        {/* Profile footer */}
        <div
          style={{
            background: BG_RAIL,
            padding: "8px 8px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: ACCENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: ACCENT_TEXT,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            R
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, lineHeight: 1.1 }}>
              ROI Labs
            </div>
            <div style={{ fontSize: 11, color: TEXT_DIM, lineHeight: 1.1, marginTop: 2 }}>
              <span style={{ color: "#23A559" }}>●</span> Online
            </div>
          </div>
          <Icon name="settings" color={TEXT_MUTED} />
        </div>
      </aside>

      {/* === MAIN PANE === */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header
          style={{
            height: 48,
            background: BG_MAIN,
            borderBottom: `1px solid ${BORDER}`,
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 1px 0 rgba(0,0,0,0.2)",
            flexShrink: 0,
          }}
        >
          <Icon name="hash" color={TEXT_MUTED} />
          <span style={{ color: TEXT, fontWeight: 600 }}>
            {channels.find((c) => c.id === active)?.label}
          </span>
          <span style={{ width: 1, height: 22, background: BORDER, margin: "0 8px" }} />
          <span style={{ color: TEXT_DIM, fontSize: 13 }}>
            {topicFor(active)}
          </span>
          <div style={{ flex: 1 }} />
          <a
            href="/"
            style={{
              fontSize: 12,
              color: TEXT_MUTED,
              textDecoration: "none",
              padding: "4px 10px",
              borderRadius: 4,
              border: `1px solid ${BORDER}`,
            }}
          >
            ← back to main site
          </a>
        </header>

        {/* Section content */}
        <section
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px 40px 80px",
          }}
        >
          {active === "overview" && <OverviewSection />}
          {active === "platforms" && <PlatformsSection />}
          {active === "contact" && <ContactSection />}
        </section>

        {/* Faux input bar */}
        <div
          style={{
            padding: "0 16px 24px",
            flexShrink: 0,
          }}
        >
          <a
            href="/#contact"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              background: BG_INPUT,
              borderRadius: 8,
              color: TEXT_DIM,
              fontSize: 14,
              textDecoration: "none",
              border: `1px solid ${BORDER}`,
            }}
          >
            <Icon name="plus-circle" color={TEXT_MUTED} />
            <span>Send us a message →</span>
          </a>
        </div>
      </main>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function topicFor(id: string): string {
  switch (id) {
    case "overview": return "Performance marketing for revenue, not vanity metrics.";
    case "platforms": return "Meta + Google primary. Add-ons added when they earn it.";
    case "contact": return "Send your last 90 days. We'll come back with a clear read.";
    default: return "";
  }
}

function RailIcon({
  children,
  isActive,
  isHovered,
  onClick,
  onHover,
  label,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onHover?: (h: boolean) => void;
  label: string;
}) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {/* Pill indicator on the very left edge */}
      <span
        style={{
          position: "absolute",
          left: -12,
          width: 4,
          height: isActive ? 32 : isHovered ? 18 : 8,
          background: isActive || isHovered ? "#FFFFFF" : "transparent",
          borderRadius: "0 4px 4px 0",
          transition: "height 0.15s ease",
        }}
      />
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
        title={label}
        style={{
          width: 48,
          height: 48,
          borderRadius: isActive || isHovered ? 14 : 24,
          background: isActive ? ACCENT : "#313338",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-radius 0.15s ease, background 0.15s ease",
        }}
      >
        {children}
      </button>
    </div>
  );
}

function ChannelItem({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        padding: "6px 8px",
        margin: "1px 0",
        background: isActive ? "#404249" : hover ? "#35373C" : "transparent",
        border: "none",
        borderRadius: 4,
        color: isActive ? TEXT : TEXT_MUTED,
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: isActive ? 500 : 400,
        textAlign: "left",
        fontFamily: "inherit",
      }}
    >
      <Icon name="hash" color={isActive ? TEXT_DIM : TEXT_DIM} size={20} />
      {label}
    </button>
  );
}

/* ─── Sections (ROI content slotted into Discord shell) ───────────────── */

function OverviewSection() {
  return (
    <div style={{ maxWidth: 720 }}>
      <SystemMessage>
        Welcome to <strong style={{ color: TEXT }}>#overview</strong> — the ROI Labs landing channel.
      </SystemMessage>
      <Message
        author="ROI Labs"
        time="Today at 09:14"
        body={
          <>
            <p style={{ margin: "0 0 12px", fontSize: 19, lineHeight: 1.4 }}>
              <span style={{ color: TEXT, fontWeight: 600 }}>Paid media, measured in </span>
              <em style={{ color: ACCENT, fontStyle: "italic", fontWeight: 600 }}>revenue</em>
              <span style={{ color: TEXT, fontWeight: 600 }}>.</span>
            </p>
            <p style={{ margin: 0, color: TEXT_MUTED }}>
              We run Meta and Google ads end-to-end — strategy, creative, and measurement
              under one roof, optimized for what hits your bank account, not your
              dashboard.
            </p>
          </>
        }
      />
      <Message
        author="ROI Labs"
        time="Today at 09:15"
        body={
          <p style={{ margin: 0 }}>
            Pick a channel on the left to dive in: <ChannelChip>#platforms</ChannelChip>{" "}
            <ChannelChip>#contact</ChannelChip>.
          </p>
        }
      />
    </div>
  );
}

function PlatformsSection() {
  return (
    <div style={{ maxWidth: 720 }}>
      <SystemMessage>
        Two platforms run in-house. Others added when they earn it.
      </SystemMessage>
      {[
        {
          name: "Meta Ads",
          tag: "primary",
          items: ["Conversion campaigns", "Lead generation", "Catalog & dynamic ads", "Reels-native creative", "Advantage+ Shopping", "Pixel & CAPI setup"],
        },
        {
          name: "Google Ads",
          tag: "primary",
          items: ["Search & shopping", "Performance Max", "YouTube ads", "Demand Gen", "Tag manager & GA4", "Negative-keyword discipline"],
        },
        {
          name: "LinkedIn / Snap / Programmatic",
          tag: "add-on",
          items: ["Added when channel mix justifies", "ABM, AR lenses, native + display"],
        },
      ].map((p) => (
        <Message
          key={p.name}
          author="ROI Labs"
          time="Today at 09:18"
          body={
            <>
              <p style={{ margin: "0 0 6px", fontWeight: 600, color: TEXT }}>
                {p.name}{" "}
                <Tag color={p.tag === "primary" ? ACCENT : "#3F4147"}>{p.tag}</Tag>
              </p>
              <ul style={{ margin: "8px 0 0 18px", padding: 0, color: TEXT_MUTED, fontSize: 14 }}>
                {p.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </>
          }
        />
      ))}
    </div>
  );
}

function ContactSection() {
  return (
    <div style={{ maxWidth: 560 }}>
      <SystemMessage>Send us your last 90 days. We&apos;ll come back with a clear read.</SystemMessage>
      <Message
        author="ROI Labs"
        time="Today at 09:30"
        body={
          <>
            <p style={{ margin: "0 0 12px" }}>
              Email us at{" "}
              <a
                href="mailto:mohnish@roilabs.in"
                style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}
              >
                mohnish@roilabs.in
              </a>
            </p>
            <a
              href="/#contact"
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: ACCENT,
                color: ACCENT_TEXT,
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Talk to us
            </a>
          </>
        }
      />
    </div>
  );
}

/* ─── Message + system primitives ─────────────────────────────────────── */

function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "12px 0",
        margin: "16px 0",
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        textAlign: "center",
        color: TEXT_MUTED,
        fontSize: 13,
      }}
    >
      {children}
    </div>
  );
}

function Message({
  author,
  time,
  body,
}: {
  author: string;
  time: string;
  body: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        padding: "8px 0",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: ACCENT,
          color: ACCENT_TEXT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        R
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: TEXT, fontWeight: 600, marginRight: 8 }}>{author}</span>
          <span style={{ color: TEXT_DIM, fontSize: 12 }}>{time}</span>
        </div>
        <div style={{ color: TEXT_MUTED, fontSize: 15, lineHeight: 1.45 }}>{body}</div>
      </div>
    </div>
  );
}

function ChannelChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "rgba(80, 80, 90, 0.4)",
        color: ACCENT,
        padding: "1px 4px",
        borderRadius: 4,
        fontSize: 14,
      }}
    >
      {children}
    </span>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  const isLight = color === ACCENT;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 6px",
        background: color,
        color: isLight ? "#000" : "#FFF",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginLeft: 6,
        verticalAlign: "middle",
      }}
    >
      {children}
    </span>
  );
}

/* ─── Tiny inline icon set ────────────────────────────────────────────── */

function Icon({
  name,
  size = 18,
  color = "currentColor",
}: {
  name: "hash" | "chevron-down" | "settings" | "mail" | "plus-circle";
  size?: number;
  color?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "hash":
      return (
        <svg {...common}>
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "plus-circle":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
  }
}
