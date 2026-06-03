# ROI Labs — AI-Native Repositioning (design files)

Repositioned variants of the marketing site components. **Copy and service
architecture only** — the visual design (dark background, gold accent, serif
headings, card system, contact form) is unchanged from the live components in
`src/components/`.

## Positioning

From "performance marketing agency" (Meta + Google) → **AI-native growth
agency**. Buyers don't just search anymore — they ask AI. ROI Labs makes brands
get found and chosen across Google, Meta, and the AI assistants people trust to
decide (ChatGPT, Perplexity, Gemini, AI Overviews, Copilot). Still measured in
revenue.

## Files

| File          | What changed |
|---------------|--------------|
| `Navbar.tsx`  | Nav items → Services / How we work / About. "Talk to us" unchanged. |
| `Hero.tsx`    | Eyebrow, headline ("Growth in the AI era, measured in *revenue*."), subhead. |
| `Services.tsx`| New 3-pillar `PRIMARY` stack (Paid Media · AI Search & Answer Visibility · Content & Creative), 3 `ADD-ON` cards (SEO · Lifecycle & CRM · Other channels), and 5 numbered "How we work" capabilities. |
| `Contact.tsx` | Subhead + "What's Included" list. Form fields unchanged. |
| `Footer.tsx`  | Nav items updated to match. |
| `page.tsx`    | Composes the above + updated metadata. |

## Section anchors

- `#services` — Section 01 (the three-pillar stack)
- `#how-we-work` — Section 02 (the five numbered capabilities)
- `#contact` — contact form

## How to go live

These are drop-in replacements. To ship, either:

1. Copy the contents over the matching files in `src/components/` (and fold the
   metadata from `page.tsx` here into `src/app/page.tsx`), or
2. Re-point `src/app/page.tsx` to import `Hero`/`Services`/`Contact` from
   `@/components/ai-native/` and update `Navbar`/`Footer` references.

Imports use the `@/components/...` alias, so the shared `Logo` component
resolves either way.
