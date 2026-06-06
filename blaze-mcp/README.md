# Blaze.ai MCP server

Exposes Blaze.ai as MCP tools over stdio. Reuses `../lib/blaze.js`, so the
base URL, auth style, and endpoint paths are configured there and overridable
via env (see `../.env.example`).

## Tools

- `generate_content` — generate a post/blog/caption
- `schedule_campaign` — schedule content onto the Blaze calendar
- `get_content` — fetch existing content/campaigns
- `audit_apps` — list past and upcoming apps/projects

## Install

```bash
cd blaze-mcp
npm install
```

## Register with Claude Code (project-scoped)

A `.mcp.json` at the repo root already wires this up. Set `BLAZE_API_KEY` in
your environment, then Claude Code will offer to start the `blaze` server.

## Register with Claude Desktop

Add to `claude_desktop_config.json`:

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

## Note

Blaze.ai doesn't publish an open REST spec, so the endpoint paths in
`../lib/blaze.js` are placeholders. Override them with the env vars in
`../.env.example` once you have Blaze's real API details.
