# MySERP — Live Google SERP Checker

A simple SERP (Search Engine Results Page) rank checker built with **Next.js**.
Enter a keyword and see the top ~20 Google results for a chosen country, with a
live URL-filter box. Powered by the [Serper.dev](https://serper.dev) API.

> **Note:** this app has a small backend (a Next.js API route at
> `/api/serp`). The Serper API key is read **server-side only** and is never
> exposed to the browser. Because of this, it must be deployed to a host that
> runs Next.js (e.g. Vercel) — plain static hosting like GitHub Pages will not
> run it.

## Features

- Keyword search with live Google results via Serper.dev
- Country, device, and optional location selectors
- Up to 20 results (fetches Serper pages 1 + 2, de-duplicated)
- "Search for URL" box that filters and highlights results client-side
- Mock-data fallback when no API key is set, so it runs out-of-the-box

## Deploy to Vercel (free, ~2 minutes)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tonymaster147/myserplive&env=SERPER_API_KEY&envDescription=Get%20a%20free%20key%20at%20serper.dev)

1. Click the button above (or go to [vercel.com/new](https://vercel.com/new))
   and import **`tonymaster147/myserplive`**.
2. When prompted, add an **Environment Variable**:
   - **Name:** `SERPER_API_KEY`
   - **Value:** your key from [serper.dev/api-key](https://serper.dev/api-key)
3. Click **Deploy**. You'll get a live URL like `myserplive.vercel.app`.

Every future `git push` to `main` redeploys automatically.

## Run locally

```bash
# 1. Install dependencies
npm install

# 2. Add your Serper key
cp .env.local.example .env.local
#   then edit .env.local and set SERPER_API_KEY=your_key

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without a key, the app still runs and shows **demo data** (badged "demo data").
With a valid key, results are badged "live from Google".

## Environment variables

| Name             | Required | Description                                   |
| ---------------- | -------- | --------------------------------------------- |
| `SERPER_API_KEY` | No\*     | Serper.dev API key. Without it, uses mock data. |

\* Required for live Google results.

## How it works

```
Browser  →  /api/serp (server, holds the key)  →  Serper.dev  →  Google
```

The key never leaves the server. Swap the data provider by editing the single
`fetchFromSerper` function in [`src/lib/serp.ts`](src/lib/serp.ts).

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Serper.dev](https://serper.dev) for Google SERP data
