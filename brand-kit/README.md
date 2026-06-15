# ROI Labs — Brand Kit

Share-ready brand assets for **ROI Labs** (roilabs.in). Hand this folder to a
designer, agency, or tool and they have everything to match the brand.

> **Answering "Any ROI Labs brand hex codes, fonts, or a logo I should match?"**
> Yes — all of it is here, pulled from production (no need to derive a system):
>
> - **Brand color:** yellow **`#FACC15`** (the signature). Full palettes below.
> - **Fonts:** **Sora** + **Manrope** (site), **Space Grotesk** + **Hanken Grotesk** + **JetBrains Mono** (product). All free Google Fonts.
> - **Logo:** in [`logos/`](logos/) — "ROI" in yellow, "LABS" neutral. Light-bg and dark-bg versions included.

## What's in here

| File | What it is |
|---|---|
| [`BRAND-GUIDELINES.md`](BRAND-GUIDELINES.md) | Full spec — colors, fonts, logo rules, voice, shape |
| [`tokens.css`](tokens.css) | All colors/type/shape as CSS custom properties |
| [`tokens.json`](tokens.json) | Same tokens as JSON (Figma / Style Dictionary / code) |
| [`swatches.html`](swatches.html) | **Open in any browser** — visual swatches, logos, type specimens |
| [`logos/`](logos/) | PNG logo files (light-bg, dark-bg, blue, mark) |

## The 10-second version

```
Brand yellow   #FACC15        (logo "ROI" + primary CTAs — never as text on white)
Gold text      #8A6D00        (use when yellow must be text on a light bg)
Site bg        #FCFBF7        warm cream
Site ink       #1A1710        warm near-black
Engine indigo  #4F46E5        product UI working accent
Fonts          Sora · Manrope · Space Grotesk · Hanken Grotesk · JetBrains Mono
```

## Notes for whoever's matching this

- There are **two coordinated palettes**: **Aurora** (warm cream marketing site)
  and **Atlas/Terminal** (the cool, dual-mode product UI). They share the brand
  yellow. Pick the one that matches the surface you're designing.
- **Yellow is sparing and meaningful** — logo, one primary CTA, key highlights.
  Don't flood with it.
- Tone is **precise and numerate** — "measured in revenue," not hype.

Quickest path: open [`swatches.html`](swatches.html) for the visual, then copy exact
values from [`tokens.json`](tokens.json).
