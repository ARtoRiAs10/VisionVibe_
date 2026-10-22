# VisionVibe — AI Interior Design Studio

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-≥20-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)

## 📖 Short Description

**VisionVibe** turns an empty room into a designed interior. The user picks a theme, style,
budget, room type and lighting mood; the app translates those choices into a professional
**art-direction brief** and renders it with the best available **free AI image engine** —
automatically failing over between providers.

- The app lives in [`visionvibe/`](./visionvibe) (Next.js 16 App Router, TypeScript, Tailwind v4).
- It runs **with zero API keys** (key-less Pollinations + AI Horde engines).
- Add a `GEMINI_API_KEY` and it edits **your actual room photo** (true before/after, same
  walls, windows and perspective).

## ✨ Features

- **Free AI routing** — `lib/ai/router.ts` selects the best provider per capability
  (text→image, image→image, vision, text) and fails over automatically.
- **Accurate photo mode** — Gemini image-to-image editing, or free AI Horde `img2img` when no
  Gemini key is present.
- **Art-directed prompts** — 8 themes × 40+ styles × 5 budget tiers are expanded into palettes,
  materials, furniture plans, lighting and camera language (`lib/ai/prompt.ts`).
- **Studio UI** — drag & drop / paste upload, chip selectors, live prompt preview,
  before/after compare slider, design story, download / share / copy prompt, favourites,
  one-click variations, dark mode, toasts.
- **Gallery & community** — designs persisted with Drizzle + Neon, with search, filters,
  favourites, publishing to `/explore` and a detail page showing the exact art direction.
- **Demo mode** — works without Clerk keys and without a database (in-memory store).
- **Auth & webhooks** — Clerk session auth plus Svix-verified Clerk webhooks.

## 🏗 Architecture

```
app/
  page.tsx                landing page
  explore/page.tsx        public community gallery
  (dashboard)/dashboard   the studio
  (dashboard)/designs     personal gallery + [id] detail
  api/generate            ⭐ generation pipeline (image + description + analysis)
  api/enhance-prompt      AI prompt rewriting
  api/designs(/[id])      CRUD, favourite, publish
  api/providers           engine availability
lib/
  ai/router.ts            provider routing + failover
  ai/prompt.ts            design catalogue + prompt engine
  ai/providers/*          pollinations, horde, gemini, openrouter, huggingface
  db/repository.ts        Drizzle + in-memory fallback
  auth.ts, env.ts         Clerk helpers, empty-value-safe env reader
```

See [`visionvibe/README.md`](./visionvibe/README.md) for the full documentation, setup
instructions, environment variables and API reference.

## 🚀 Quick start

```bash
cd visionvibe
npm install
cp .env.example .env.local    # optional — the app works without any keys
npm run dev
```

Open <http://localhost:3000>.

## 🔑 Optional environment variables

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Photo-accurate editing, room analysis, copywriting |
| `OPENROUTER_API_KEY` | Extra free text + vision models |
| `HF_TOKEN` / `STABILITY_API_KEY` | Additional text-to-image fallbacks |
| `DATABASE_URL` | Neon/Postgres persistence (`npx drizzle-kit push`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Real accounts |

---

MIT
