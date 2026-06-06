#!/usr/bin/env node
// Blaze.ai MCP server (stdio transport).
//
// Exposes Blaze.ai as MCP tools so an MCP client (Claude Code, Claude
// Desktop, etc.) can generate content, schedule campaigns, fetch content,
// and audit apps. The Blaze API key is read from the BLAZE_API_KEY env var
// and never passed through the model.
//
// Reuses the request helpers in ../lib/blaze.js, so endpoint paths/auth are
// configured there (and overridable via env). See ../.env.example.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import {
  generateContent,
  scheduleCampaign,
  getContent,
  auditApps,
} from '../lib/blaze.js';

const server = new McpServer({ name: 'blaze', version: '1.0.0' });

// Wrap a helper so any error comes back as a tool error instead of crashing.
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
            text: `Blaze error: ${err.message}` +
              (err.body ? `\n${JSON.stringify(err.body, null, 2)}` : ''),
          },
        ],
      };
    }
  };
}

server.registerTool(
  'generate_content',
  {
    title: 'Generate content',
    description: 'Generate marketing content (post, blog, caption) with Blaze.ai.',
    inputSchema: {
      prompt: z.string().describe('What to write about'),
      contentType: z.string().optional().describe('e.g. "post", "blog", "caption"'),
      channel: z.string().optional().describe('Target channel, e.g. "instagram"'),
    },
  },
  tool((args) => generateContent(args))
);

server.registerTool(
  'schedule_campaign',
  {
    title: 'Schedule campaign',
    description: 'Schedule a content item onto the Blaze.ai calendar.',
    inputSchema: {
      contentId: z.string().describe('ID of the content to schedule'),
      date: z.string().describe('ISO date/time to publish'),
      channel: z.string().optional().describe('Channel to publish to'),
    },
  },
  tool((args) => scheduleCampaign(args))
);

server.registerTool(
  'get_content',
  {
    title: 'Get content',
    description: 'Fetch existing content/campaigns from Blaze.ai.',
    inputSchema: {
      status: z.string().optional().describe('Filter by status, e.g. "published"'),
      limit: z.number().optional().describe('Max items to return'),
    },
  },
  tool((args) => getContent(args))
);

server.registerTool(
  'audit_apps',
  {
    title: 'Audit apps',
    description: 'List previously designed and upcoming apps/projects in Blaze.ai.',
    inputSchema: {
      status: z.string().optional().describe('e.g. "all", "past", "upcoming"'),
    },
  },
  tool((args) => auditApps(args))
);

const transport = new StdioServerTransport();
await server.connect(transport);
