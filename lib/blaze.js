// Server-side Blaze.ai client.
//
// This file is only ever imported from API routes / server code, so the
// API key stays on the server and never ships to the browser.
//
// NOTE: Blaze.ai does not publish an open REST spec, so the endpoint paths
// below are best-effort placeholders. Each one can be overridden with an
// environment variable once you have Blaze's real paths, without touching
// the call sites.

const BASE_URL = process.env.BLAZE_API_BASE_URL || 'https://api.blaze.ai';
const API_KEY = process.env.BLAZE_API_KEY;

// Auth header style. Blaze workspace keys are typically sent as a bearer
// token; override to "x-api-key" if Blaze tells you otherwise.
const AUTH_STYLE = process.env.BLAZE_AUTH_STYLE || 'bearer'; // 'bearer' | 'x-api-key'

// Endpoint paths — confirm/override against Blaze's actual API.
const ENDPOINTS = {
  generate: process.env.BLAZE_PATH_GENERATE || '/v1/content/generate',
  schedule: process.env.BLAZE_PATH_SCHEDULE || '/v1/calendar/schedule',
  content: process.env.BLAZE_PATH_CONTENT || '/v1/content',
  apps: process.env.BLAZE_PATH_APPS || '/v1/apps',
};

function authHeaders() {
  if (!API_KEY) {
    throw new Error(
      'BLAZE_API_KEY is not set. Add it to your environment (see .env.example).'
    );
  }
  return AUTH_STYLE === 'x-api-key'
    ? { 'x-api-key': API_KEY }
    : { Authorization: `Bearer ${API_KEY}` };
}

function buildUrl(path, query) {
  const url = new URL(path.replace(/^\//, ''), BASE_URL.replace(/\/?$/, '/'));
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

// Core request wrapper. Returns parsed JSON (or text) and throws on non-2xx
// with the upstream status and body attached for debugging.
export async function request(path, { method = 'GET', body, query, headers } = {}) {
  const res = await fetch(buildUrl(path, query), {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...authHeaders(),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text; // non-JSON response
  }

  if (!res.ok) {
    const err = new Error(`Blaze API ${res.status}: ${res.statusText}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

// --- Intent helpers -------------------------------------------------------

// Generate marketing content (post, blog, caption, etc.).
export function generateContent(payload) {
  return request(ENDPOINTS.generate, { method: 'POST', body: payload });
}

// Schedule a campaign/content item onto the Blaze calendar.
export function scheduleCampaign(payload) {
  return request(ENDPOINTS.schedule, { method: 'POST', body: payload });
}

// Fetch existing content/campaigns. Pass filters as `query`.
export function getContent(query) {
  return request(ENDPOINTS.content, { method: 'GET', query });
}

// Audit previously designed and upcoming "apps"/projects. Pass filters as
// `query` (e.g. { status: 'all' }).
export function auditApps(query) {
  return request(ENDPOINTS.apps, { method: 'GET', query });
}

export const blaze = {
  request,
  generateContent,
  scheduleCampaign,
  getContent,
  auditApps,
};

export default blaze;
