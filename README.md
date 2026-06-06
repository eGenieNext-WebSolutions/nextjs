This is a starter template for [Learn Next.js](https://nextjs.org/learn).

## Blaze.ai integration

Server-side access to the [Blaze.ai](https://www.blaze.ai) API. The API key
stays on the server and is never exposed to the browser. No Zapier required.

### Setup

1. In Blaze.ai, generate a workspace key: **Workspace avatar → Settings →
   Integrations → New Key**.
2. Copy `.env.example` to `.env.local` and set `BLAZE_API_KEY`.
3. Blaze.ai doesn't publish an open REST spec, so the endpoint paths in
   `lib/blaze.js` are placeholders. Once you have Blaze's real paths/auth,
   override them via the env vars listed in `.env.example` (no code changes).

### Usage

From the browser, hit the authenticated proxy — the key is attached
server-side:

```js
await fetch('/api/blaze/v1/content/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Product launch announcement' }),
});
```

From server code (API routes, `getServerSideProps`), use the typed helpers:

```js
import { generateContent, scheduleCampaign, getContent, auditApps } from '../lib/blaze';

await generateContent({ prompt: 'Spring campaign caption' });
await scheduleCampaign({ contentId: '123', date: '2026-06-10' });
await getContent({ status: 'published' });
await auditApps({ status: 'all' });
```
