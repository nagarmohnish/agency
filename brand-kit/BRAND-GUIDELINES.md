# ROI Labs — Brand Guidelines

> Share-ready brand reference for ROI Labs (roilabs.in). Everything here is the
> *real* system pulled from the production site and the ROI Engine product — not a
> mockup. Hex codes, fonts, and logo usage are authoritative.

---

## 1. The one-line identity

**ROI Labs** is an AI-native paid-media agency. The brand reads as **precise,
confident, and money-serious** — warm near-black surfaces, a single decisive
**brand yellow**, and clean grotesk type. No gradients-as-decoration, no stock
gloss. Yellow is the signature; it is used sparingly so it always means something.

---

## 2. Logo

The wordmark is **ROI** (brand yellow) stacked over / beside **LABS** (neutral —
black on light, white on dark). Files are in [`logos/`](logos/).

| File | Use on | "LABS" color |
|---|---|---|
| `roi-labs--light-bg.png` | light / cream backgrounds | black `#1A1710` |
| `roi-labs--dark-bg.png`  | dark / charcoal backgrounds | white `#FFFFFF` |
| `roi-labs--blue.png`     | small / favicon contexts | — |
| `roi-labs--mark.png`     | square mark / app icon | — |

**Rules**
- **"ROI" is always brand yellow `#FACC15`.** Never recolor it.
- Keep clear space around the logo equal to the height of the "O".
- Don't add shadows, outlines, or gradients to the wordmark.
- Don't place the light-bg logo on a busy/low-contrast surface — switch to the
  dark-bg version instead.
- Minimum width ~96px so "LABS" stays legible.

**In-product wordmark.** Inside the ROI **Engine** cockpit the lockup is rendered
as live text: `ROI` (yellow `#FACC15`, weight 800) + `Engine` (neutral). On a light
sidebar the yellow sits on a deep-indigo column (`#1E1B4B`) so it stays legible.

---

## 3. Color

ROI Labs runs **two coordinated palettes**: the **Aurora** palette for the
marketing site, and the **Atlas / Terminal** dual-mode palette for the ROI Engine
product UI. Both share the same brand yellow.

### 3.1 Brand core (shared)

| Token | Hex | Use |
|---|---|---|
| **Brand Yellow** | `#FACC15` | the signature — logo "ROI", primary CTAs, highlights |
| Yellow Deep | `#EFC00A` | hover / pressed state of yellow |
| Gold Text | `#8A6D00` | when yellow must appear *as text on a light bg* (AA-safe) |
| Yellow Highlight | `#FFE05A` | top stop of the yellow gradient |
| Yellow Gradient | `linear-gradient(95deg,#FFE05A,#FACC15 55%,#F2BE00)` | rare hero accents |

> **Accessibility rule:** brand yellow `#FACC15` is **never used as text on white**
> (it fails WCAG). For text, use **Gold Text `#8A6D00`** or place the yellow on a
> dark surface.

### 3.2 Aurora — marketing site (roilabs.in)

Warm, light, premium. Cream paper + warm ink + brand yellow.

| Token | Hex |
|---|---|
| Background (cream) | `#FCFBF7` |
| Surface | `#FFFFFF` |
| Surface 2 (warm) | `#FBF6E6` |
| Ink (text) | `#1A1710` |
| Muted text | `#6A6456` |
| Faint text | `#9C968A` |
| Hairline | `#ECE7DA` |
| Hairline 2 | `#F4F0E6` |
| Success green | `#1E9E6A` |
| Error | `#CC4A3F` |

### 3.3 Atlas — Engine light mode

Cool, white, instrument-panel. Indigo is the working accent; yellow is reserved
for the logo + the single primary CTA.

| Token | Hex |
|---|---|
| Background | `#F4F5F7` |
| Panel | `#FFFFFF` |
| Panel 2 | `#F6F7FB` |
| Sidebar (deep indigo) | `#1E1B4B` |
| Ink | `#15171C` |
| Ink 2 | `#6B7280` |
| Ink 3 | `#9CA0A8` |
| Border | `#ECEDF1` |
| **Accent (indigo)** | `#4F46E5` |
| Accent 2 | `#4338CA` |
| Accent tint | `#EEF0FE` |
| Positive | `#16A34A` |
| Negative | `#DC2626` |
| Warning | `#B45309` |

### 3.4 Terminal — Engine dark mode

Near-black trading-terminal. Same structure, flipped.

| Token | Hex |
|---|---|
| Background | `#08090A` |
| Panel | `#0C0D0F` |
| Panel 2 | `#101113` |
| Sidebar | `#0B0C0E` |
| Ink | `#E6E7E9` |
| Ink 2 | `#9A9DA4` |
| Border | `#17181B` |
| Accent | brand yellow `#FACC15` |

---

## 4. Typography

ROI Labs uses **geometric / grotesk sans** throughout, with a display cut for
headlines. No serifs in the current live system except the legacy logo-serif.

| Role | Font | Weights | Where |
|---|---|---|---|
| **Display / headlines** | **Sora** | 600–800 | marketing headlines |
| **Body / UI (site)** | **Manrope** | 400–700 | marketing body & UI |
| **Display (product)** | **Space Grotesk** | 600–700 | Engine headings, KPI values |
| **Body / UI (product)** | **Hanken Grotesk** | 400–600 | Engine UI |
| **Mono / data** | **JetBrains Mono** | 400–600 | metrics, tabular numbers, code |

All are free Google Fonts. Numbers in data contexts use **tabular / mono** so
columns align.

**Fallback stack:** `system-ui, -apple-system, "Segoe UI", sans-serif`.

---

## 5. Shape & depth

| Token | Value |
|---|---|
| Radius sm | `6px` |
| Radius md | `10px` |
| Radius lg | `14px` |
| Radius xl | `20px` |
| Pill | `9999px` |
| Shadow (rest) | `0 1px 2px rgba(20,22,28,.05)` |
| Shadow (lift) | `0 34px 70px -30px rgba(80,62,22,.30)` (Aurora) |

Borders are **hairlines** (1px, low-contrast). Cards are flat with a faint shadow —
the product should read as a precise instrument, not a glossy SaaS landing page.

---

## 6. Voice & tone

- **Plain, numerate, no hype.** "Measured in revenue," not "supercharge your growth."
- Lead with the number and the decision. Every metric self-explains (source, why).
- Confidence without adjectives. The audit log *is* the case study.
- Honest about limits — say "pending integration" rather than faking data.

---

## 7. Quick copy-paste

```
Brand yellow      #FACC15
Yellow (hover)    #EFC00A
Gold text (AA)    #8A6D00
Aurora cream bg   #FCFBF7
Aurora ink        #1A1710
Engine indigo     #4F46E5
Engine ink        #15171C
Sidebar indigo    #1E1B4B
Fonts             Sora · Manrope · Space Grotesk · Hanken Grotesk · JetBrains Mono
```

See [`tokens.css`](tokens.css) and [`tokens.json`](tokens.json) for machine-readable
tokens, and [`swatches.html`](swatches.html) for a visual reference you can open in
any browser.
