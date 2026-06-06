# Blaze MCP server

Exposes Blaze's **GraphQL** API as MCP tools over stdio. Reuses
`../lib/blaze.js`. Docs: https://docs.withblaze.app (Alpha access).

## Tools

- `ping` — health check
- `introspect` — list available GraphQL queries (sentiment, engagement, segments, …)
- `graphql_query` — run an arbitrary GraphQL query/mutation with variables

## Install

```bash
cd blaze-mcp
npm install
```

## Register with Claude Code (project-scoped)

`.mcp.json` at the repo root wires this up. Set `BLAZE_API_KEY` in your
environment and Claude Code will offer to start the `blaze` server.

## Register with Claude Desktop

```json
{
  "mcpServers": {
    "blaze": {
      "command": "node",
      "args": ["/absolute/path/to/nextjs/blaze-mcp/server.js"],
      "env": { "BLAZE_API_KEY": "your-key-here" }
    }
  }
}
```

## Getting a key

The API is in Alpha. Email `chirag@withblaze.app` from the email registered
on your Blaze account, including your account identifier.
