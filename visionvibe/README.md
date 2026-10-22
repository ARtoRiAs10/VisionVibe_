# Vision Vibe — AI Interior Design Studio

Turn an empty room into a designed interior. Pick a theme, style, budget, room type and
lighting mood; Vision Vibe expands those choices into a professional **art-direction brief**
and renders it with the best available **free AI image engine** — with automatic failover
between providers.

> **Zero keys required.** With no API keys at all the app still generates images using the
> key-less Pollinations and AI Horde engines. Add a Gemini key and it edits *your actual room
> photo* (true before/after, same walls and perspective).

---

## ✨ What is implemented

| Area | Details |
| --- | --- |
| **AI routing** | `lib/ai/router.ts` picks the best provider per capability (image, image-edit, vision, text) and fails over automatically with per-attempt logging. |
| **Free image engines** | **Pollinations** (key-less, FLUX) and **AI Horde** (key-less, supports true *img2img*). Optional: **Gemini**, **Hugging Face**, **Stability**. |
| **Accurate photo mode** | With `GEMINI_API_KEY` the uploaded photo is edited (architecture, windows and light direction preserved). Without it, AI Horde runs *img2img* on the same photo. |
| **Art-directed prompts** | `lib/ai/prompt.ts` maps every selection to palettes, materials, furniture plans, lighting and camera language — plus negative constraints. |
| **Copywriting** | Vision models describe the *generated* image; text models describe the concept. Falls back to a deterministic template. |
| **Studio UI** | Drag & drop / paste upload, chip-based selectors, live prompt preview, before/after compare slider, story + prompt tabs, download, share, copy prompt, favourites, one-click variations. |
| **Gallery** | Persisted designs (Neon + Drizzle) with search, theme filter, favourites filter, publish to `/explore`, delete, and a detail page showing the exact art direction. |
| **Demo mode** | Works with **no** Clerk keys and **no** database (in-memory store) so you can run it immediately. |
| **Theming** | Light/dark/system theme with no flash-on-load, plus toast notifications. |

---

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # fill in what you want (everything is optional)
npm run dev
```

Open <http://localhost:3000>.

### 1. Free (no key)

Nothing to configure — press **Generate design** and it renders through Pollinations/AI Horde.

### 2. Accurate photo editing (recommended)

1. Get a free Gemini key: <https://aistudio.google.com/apikey>
2. Put it in `.env.local`:

```bash
GEMINI_API_KEY=your_key_here
```

The AI then edits your uploaded room photo, keeping the real walls, windows, floor and
perspective — and writes a description of the result.

### 3. Persistent gallery

Create a free Neon database (<https://neon.tech>) and set:

```bash
DATABASE_URL=postgresql://...
npx drizzle-kit push
```

### 4. Real accounts (optional)

Add your Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) and point a
Clerk webhook at `/api/webhooks/clerk`.

---

## 🔀 How the routing works

```
                    ┌───────────────────────────────┐
   brief + photo ──▶│  lib/ai/router.ts             │
                    └───────────────┬───────────────┘
                                    │
      image + reference photo       │      image only
      ┌─────────────┴────────┐      │      ┌────────────┴──────────┐
      │ Gemini (img→img)     │      │      │ Gemini (text→img)     │
      │ AI Horde (img→img)   │      │      │ Pollinations (flux)   │
      └──────────────────────┘      │      │ Hugging Face (FLUX)   │
                                    │      │ AI Horde (SD 1.5)     │
                                    └──────┴───────────────────────┘
                                    │
      vision + text              │
      ┌─────────────┴────────┐   │
      │ Gemini (vision)      │   │
      │ OpenRouter (vision)  │   │
      │ Pollinations (text)  │   │
      └──────────────────────┘   │
```

Every provider is optional and every provider has a fallback, so the studio never hard-fails
because a key is missing. The free tier of Pollinations allows roughly one image per 45 s per
IP — the router waits it out and falls back to AI Horde in the meantime.

---

## 📁 Project structure

```
app/
  page.tsx                     marketing landing page
  explore/page.tsx             public community gallery
  (dashboard)/dashboard        the studio
  (dashboard)/designs          your gallery + [id] detail page
  api/generate                 ⭐ main generation pipeline
  api/enhance-prompt           AI prompt rewriting
  api/describe-image           standalone image description
  api/designs, api/designs/[id] CRUD + favourite/publish
  api/providers                which engines are available
lib/
  ai/router.ts                 provider routing + failover
  ai/prompt.ts                 design catalogue + prompt engine
  ai/providers/*               pollinations, horde, gemini, openrouter, huggingface
  db/repository.ts             Drizzle + in-memory fallback
  auth.ts                      Clerk helpers with demo mode
  env.ts                       empty-value-safe env reader
components/                    studio, uploader, controls, viewer, gallery, toasts
types/index.ts                 shared types
drizzle/                       SQL migrations
```

---

## 🗄️ Database

```bash
npx drizzle-kit push     # apply schema to Neon
npx drizzle-kit generate # create a new migration
```

`designs` stores the original photo, the generated image, the description, the full art
direction, the provider/model that rendered it and the user's selections.

---

## 🚢 Deploy

Any Node host works (Vercel, Railway, Render…).

1. Set the environment variables from `.env.example`
2. `npm run build && npm run start`
3. Run `npx drizzle-kit push` once against the production database

---

## 🔑 Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | no | Photo-accurate editing, vision analysis, copywriting |
| `OPENROUTER_API_KEY` | no | Extra free text + vision models |
| `HF_TOKEN` | no | Hugging Face FLUX fallback |
| `STABILITY_API_KEY` | no | Stability SD fallback |
| `DATABASE_URL` | no | Neon/Postgres persistence (in-memory demo store otherwise) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | no | Accounts (demo mode otherwise) |
| `CLERK_WEBHOOK_SECRET` | no | Clerk webhook verification |
| `POLLINATIONS_*` | no | Override the key-less engine URLs/models |
| `HORDE_API_KEY` | no | Raises the AI Horde size limit |

---

MIT
