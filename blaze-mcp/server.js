#!/usr/bin/env node
// Blaze MCP server (stdio transport).
//
// Exposes Blaze's GraphQL API as MCP tools so an MCP client (Claude Code,
// Claude Desktop, etc.) can ping the API, introspect available queries, and
// run arbitrary GraphQL. The API key is read from BLAZE_API_KEY and never
// passed through the model.
//
// Reuses ../lib/blaze.js. Docs: https://docs.withblaze.app (Alpha).

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { graphql, ping, introspect } from '../lib/blaze.js';

const server = new McpServer({ name: 'blaze', version: '1.0.0' });

// Wrap a handler so errors come back as tool errors instead of crashing.
function tool(fn) {
  return async (args) => {
    try {
      const data = await fn(args);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text:
              `Blaze error: ${err.message}` +
              (err.body ? `\n${JSON.stringify(err.body, null, 2)}` : ''),
          },
        ],
      };
    }
  };
}

server.registerTool(
  'ping',
  {
    title: 'Ping Blaze',
    description: 'Health check against the Blaze GraphQL API.',
    inputSchema: {},
  },
  tool(() => ping())
);

server.registerTool(
  'introspect',
  {
    title: 'Introspect schema',
    description: 'List the GraphQL queries the API exposes (sentiment, engagement, segments, etc.).',
    inputSchema: {},
  },
  tool(() => introspect())
);

server.registerTool(
  'graphql_query',
  {
    title: 'Run GraphQL',
    description: 'Run an arbitrary Blaze GraphQL query/mutation with optional variables.',
    inputSchema: {
      query: z.string().describe('The GraphQL query or mutation string'),
      variables: z.record(z.any()).optional().describe('JSON variables for the query'),
    },
  },
  tool(({ query, variables }) => graphql(query, variables))
);

const transport = new StdioServerTransport();
await server.connect(transport);
