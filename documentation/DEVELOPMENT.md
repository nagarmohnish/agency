# ROI Labs — edit → verify → deploy


The live site (**https://roilabs.in**) is this Next.js app on Vercel. The
homepage is the **Aurora Light** design. This is the loop for changing it
safely and shipping.

> Heads-up: `design/pages/roi-labs-home.html` is **not** the live site —
> it's a throwaway standalone export (Vercel-ignored). Don't edit it
> expecting changes to go live. Edit the files below.

---

## Where the landing page lives

| File | What it controls |
|------|------------------|
| [`src/app/AuroraHome.tsx`](../src/app/AuroraHome.tsx) | **Hero, copy, all section markup** (the `HTML` string), plus the scroll-reveal / count-up motion and the contact form → `/api/leads`. Edit copy and structure here. |
| [`src/app/aurora.css`](../src/app/aurora.css) | **All homepage styling**, scoped under `.aurora`. Colors, spacing, the orbit, responsive rules. |
| [`src/app/page.tsx`](../src/app/page.tsx) | Homepage `<title>` / SEO metadata. |
| [`src/app/layout.tsx`](../src/app/layout.tsx) | Site-wide fonts (Sora/Manrope) + default metadata. |
| [`public/roi-logo-light.png`](../public/roi-logo-light.png) | The nav logo. |

The global `Navbar` / `Footer` are intentionally **hidden on `/`** (the Aurora
page ships its own) — see the `pathname === "/"` guards in
`src/components/Navbar.tsx` and `Footer.tsx`.

Stat figures are placeholders in `[brackets]` (e.g. `[500+]`, `[$25M+]`) — swap
in real numbers in `AuroraHome.tsx`.

---

## 1. Edit locally (hot reload)

```bash
npm install        # first time only
npm run dev        # http://localhost:3000  — edits reload instantly
```

Preview on your phone / another device on the same Wi-Fi:

```bash
npm run dev:lan    # then open http://<your-computer-ip>:3000
```

The contact form posts to `/api/leads` (Supabase). Local keys live in
`.env.local`; without them the form still shows success but won't store the
lead. Production keys are configured in Vercel.

## 2. Verify before shipping

```bash
npm run verify     # production build — must pass (TypeScript + build errors fail here)
# optional: test the real production build locally
npm run preview    # builds, then serves at http://localhost:3000
```

Click through: hero + count-up stats, hover the orbit agents, submit the form,
and check a narrow (mobile) width.

## 3. Make it live

```bash
npm run deploy     # builds locally as a gate, then deploys to roilabs.in
```

`deploy` runs `vercel --prod`. **Important:** pushing to GitHub `master` does
**not** auto-deploy this project — only `npm run deploy` (or
`npx vercel@latest --prod --yes`) ships to production. You'll be `nagarmohnish`
on the linked Vercel project; a successful run prints `Aliased https://roilabs.in`.

Optional, to keep git history in sync (does not deploy on its own):

```bash
git add -A && git commit -m "describe the change" && git push
```

After deploy, confirm: open https://roilabs.in (CSS/JS filenames are
fingerprinted, so a normal reload picks up changes — no hard refresh needed).
