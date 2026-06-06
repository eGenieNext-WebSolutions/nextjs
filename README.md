This is a starter template for [Learn Next.js](https://nextjs.org/learn).

## Blaze integration

Server-side access to the [Blaze](https://app.blaze.ai) **GraphQL** API
(`api.withblaze.app`). The API key stays on the server and is never exposed
to the browser. No Zapier required.

The API exposes dashboard data — sentiment, engagement, segments — and is in
**Alpha**. It does not currently offer content generation or scheduling.

### Setup

1. Request an API key (Alpha): email `chirag@withblaze.app` from the email
   registered on your Blaze account, with your account identifier.
2. Copy `.env.example` to `.env.local` and set `BLAZE_API_KEY`.

### Usage

From the browser, POST GraphQL to the proxy — the key is attached server-side:

```js
await fetch('/api/blaze/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'query Ping { ping { status } }' }),
});
```

From server code (API routes, `getServerSideProps`):

```js
import { graphql, ping, introspect } from '../lib/blaze';

await ping();                       // health check
await introspect();                 // discover available queries
await graphql('query { /* ... */ }', { /* variables */ });
```

### MCP server

`blaze-mcp/` is a standalone MCP server exposing `ping`, `introspect`, and
`graphql_query` tools. See `blaze-mcp/README.md`.
