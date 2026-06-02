# VisionVibe_ – AI‑Powered Image Decoration & Description Platform  

_(no CI badges detected)_

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-≥18-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-13-black.svg)

## 📖 Short Description  

VisionVibe_ is a modern **Next.js 13** application that leverages Google Gemini’s multimodal AI to **describe** and **decorate** user‑uploaded images in real time.  
Built for developers, designers, and product teams, it provides a clean API layer that authenticates users via **Clerk**, stores metadata with **Drizzle ORM**, and persists data in a relational database.  
The service is fully typed with TypeScript, offers server‑side endpoints for both description and decoration, and includes webhook handling for Clerk events.  

## ✨ Features  

- **AI‑driven image description** – Generate natural‑language captions for any image using Gemini’s vision model.  
- **AI‑driven image decoration** – Apply style prompts (e.g., “add a neon border”) to images via Gemini’s generative capabilities.  
- **Secure authentication** – Integrated with Clerk; every request is validated against a user session.  
- **Typed request/response contracts** – All payloads conform to the `ImageFile` and `VisionVibeControls` TypeScript interfaces.  
- **Database‑backed design storage** – Designs and user records are persisted with Drizzle ORM, enabling history and analytics.  
- **Webhook support** – Automatic handling of Clerk events (e.g., user creation) via Svix‑signed webhooks.  
- **Server‑side rendering ready** – Built on Next.js 13 app router, ready for edge or node runtimes.  
- **Extensible architecture** – Core AI logic lives in `@/lib/gemini/service`, making it easy to swap providers or add new features.  

## 📋 Table of Contents  

- [Project title](#visionvibe---ai‑powered-image-decoration--description-platform)  
- [Badges](#-badges-row)  
- [Short description](#-short-description)  
- [Features](#-features)  
- [Architecture / How it works](#-architecture--how-it-works)  
- [Prerequisites](#-prerequisites)  
- [Installation](#-installation)  
- [Quick Start](#-quick-start)  
- [Configuration](#-configuration)  
- [API Reference / Usage](#-api-reference--usage)  
- [Project Structure](#-project-structure)  
- [Running Tests](#-running-tests)  
- [Contributing](#-contributing)  
- [License](#-license)  

## 🏗️ Architecture / How it Works  

VisionVibe_ follows a **server‑centric, API‑first** design:

1. **Next.js API Routes** – Each endpoint lives under `app/api/*/route.ts`.  
   - `describe-image` receives an `ImageFile`, forwards it to `describeImage` (Gemini service), and returns a JSON caption.  
   - `decorate-image` receives an `ImageFile` plus `VisionVibeControls` (style instructions), calls `decorateImage`, and returns the transformed image.  
2. **Authentication** – Every request starts with `auth()` from `@clerk/nextjs/server`. Unauthorized requests receive a 401 response.  
3. **Gemini Service Layer** – Located in `@/lib/gemini/service`, this module abstracts the Gemini API calls, handling multipart uploads and response parsing.  
4. **Database Layer** – Drizzle ORM (`db`, `designs`, `users` schemas) stores user‑generated designs and user metadata. Queries use `eq` for safe filtering.  
5. **Webhooks** – Clerk events are verified using Svix (`Webhook` class) and processed in `app/api/webhooks/clerk/route.ts`. This keeps the user table in sync with Clerk.  

All components are typed, making the codebase easy to navigate and extend.

## ⚙️ Prerequisites  

| Requirement | Version / Details |
|-------------|-------------------|
| **Node.js** | >= 18 (LTS) |
| **npm** or **pnpm** | Latest stable |
| **Next.js** | 13.x (app router) |
| **Clerk account** | For authentication & webhooks |
| **Google Gemini API key** | Set `GEMINI_API_KEY` in `.env.local` |
| **Database** | PostgreSQL 13+ (compatible with Drizzle) |
| **OS** | macOS, Linux, or Windows (WSL) |

## 🚀 Installation  

```bash
# 1️⃣ Clone the repository
git clone https://github.com/ARtoRiAs10/VisionVibe_.git
cd VisionVibe_

# 2️⃣ Install dependencies (using pnpm for speed)
pnpm install

# 3️⃣ Set up environment variables
cp .env.example .env.local
# Edit .env.local and add:
#   CLERK_PUBLISHABLE_KEY=...
#   CLERK_SECRET_KEY=...
#   CLERK_WEBHOOK_SECRET=...
#   GEMINI_API_KEY=...
#   DATABASE_URL=postgresql://user:password@localhost:5432/visionvibe

# 4️⃣ Run database migrations (Drizzle)
pnpm run db:push   # creates tables defined in src/lib/db/schema.ts

# 5️⃣ Start the development server
pnpm dev
```

The app will be reachable at `http://localhost:3000`.

## 📖 Quick Start  

```bash
# Example: Describe an image via curl
curl -X POST http://localhost:3000/api/describe-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk_jwt>" \
  -d '{
        "imageFile": {
          "name": "sunset.jpg",
          "type": "image/jpeg",
          "base64": "<base64‑encoded‑data>"
        }
      }'
```

**Response**

```json
{
  "description": "A vibrant sunset over a calm ocean, with orange and pink hues reflecting on the water."
}
```

```bash
# Example: Decorate an image
curl -X POST http://localhost:3000/api/decorate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk_jwt>" \
  -d '{
        "imageFile": {
          "name": "portrait.png",
          "type": "image/png",
          "base64": "<base64‑data>"
        },
        "controls": {
          "style": "neon cyberpunk",
          "border": "5px solid #00ff00"
        }
      }'
```

**Response**

```json
{
  "decoratedImage": {
    "name": "portrait_decorated.png",
    "type": "image/png",
    "base64": "<base64‑decorated-data>"
  }
}
```

## 🔧 Configuration  

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `CLERK_PUBLISHABLE_KEY` | string | – | Public key for Clerk SDK |
| `CLERK_SECRET_KEY` | string | – | Server‑side secret for Clerk |
| `CLERK_WEBHOOK_SECRET` | string | – | Svix secret used to verify Clerk webhooks |
| `GEMINI_API_KEY` | string | – | API key for Google Gemini |
| `DATABASE_URL` | string | – | PostgreSQL connection string |
| `NEXT_PUBLIC_BASE_URL` | string | `http://localhost:3000` | Base URL used for generating absolute links |
| `PORT` | number | `3000` | Port on which Next.js server runs |

All variables are read from `.env.local`. Missing required variables will cause the server to abort with a clear error message.

## 📚 API Reference / Usage  

### `POST /api/describe-image`  

**Request Body**

```ts
{
  imageFile: ImageFile;
}
```

- `ImageFile` – `{ name: string; type: string; base64: string; }`

**Response**

```ts
{
  description: string;
}
```

### `POST /api/decorate-image`  

**Request Body**

```ts
{
  imageFile: ImageFile;
  controls: VisionVibeControls;
}
```

- `VisionVibeControls` – `{ style?: string; border?: string; [key: string]: any; }`

**Response**

```ts
{
  decoratedImage: ImageFile;
}
```

### `POST /api/webhooks/clerk`  

Handles Clerk webhook events. The request is verified using the `CLERK_WEBHOOK_SECRET`. No public response body; returns `200 OK` on success.

## 🗂️ Project Structure  

```
visionvibe/
├─ app/
│  └─ api/
│     ├─ decorate-image/
│     │  └─ route.ts          # POST handler → decorateImage()
│     ├─ describe-image/
│     │  └─ route.ts          # POST handler → describeImage()
│     └─ webhooks/
│        └─ clerk/
│           └─ route.ts       # Svix‑verified Clerk webhook endpoint
├─ lib/
│  ├─ db/
│  │  ├─ index.ts            # Drizzle DB instance
│  │  └─ schema.ts           # Table definitions (users, designs)
│  └─ gemini/
│     └─ service.ts          # Wrapper around Gemini API (describeImage, decorateImage)
├─ types/
│  └─ index.ts               # TypeScript interfaces (ImageFile, VisionVibeControls)
├─ public/                   # Static assets
├─ .env.example              # Template for required env vars
├─ package.json
├─ tsconfig.json
└─ README.md
```

## 🧪 Running Tests  

VisionVibe_ uses **Jest** for unit tests.

```bash
# Install dev dependencies (if not already)
pnpm install --dev

# Run the test suite
pnpm test
```

Coverage reports are generated in `coverage/`.

## 🤝 Contributing  

1. **Fork** the repository and clone your fork.  
2. Create a feature branch: `git checkout -b feat/awesome-feature`.  
3. Follow the existing code style (TypeScript ESLint rules, Prettier).  
4. Write tests for new functionality.  
5. Run `pnpm lint && pnpm test` to ensure everything passes.  
6. Commit with a clear message and push to your fork.  
7. Open a **Pull Request** against the `main` branch, referencing any related issue.  

We welcome improvements to AI prompts, additional decoration styles, and documentation enhancements.

## 📄 License  

This project is licensed under the **MIT License** – see the `LICENSE` file for details.