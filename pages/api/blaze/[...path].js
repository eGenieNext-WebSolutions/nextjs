// Authenticated passthrough proxy to the Blaze.ai API.
//
// The browser calls /api/blaze/<blaze-path> and this handler forwards the
// request server-side with the Blaze API key attached, so the key is never
// exposed to the client. Any Blaze endpoint can be reached this way without
// adding a new route.
//
// Example (client):
//   fetch('/api/blaze/v1/content/generate', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ prompt: 'Launch announcement post' }),
//   });

import { request } from '../../../lib/blaze';

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default async function handler(req, res) {
  if (!ALLOWED_METHODS.includes(req.method)) {
    res.setHeader('Allow', ALLOWED_METHODS);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // req.query.path is the catch-all segments, e.g. ['v1', 'content']
  const { path = [], ...query } = req.query;
  const blazePath = '/' + (Array.isArray(path) ? path.join('/') : path);

  try {
    const data = await request(blazePath, {
      method: req.method,
      query,
      body: ['GET', 'DELETE'].includes(req.method) ? undefined : req.body,
    });
    return res.status(200).json(data);
  } catch (err) {
    if (err.message?.includes('BLAZE_API_KEY')) {
      return res.status(500).json({ error: err.message });
    }
    return res
      .status(err.status || 502)
      .json({ error: err.message, details: err.body ?? null });
  }
}
