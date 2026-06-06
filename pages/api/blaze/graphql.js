// Server-side proxy to the Blaze GraphQL API.
//
// The browser POSTs { query, variables } to /api/blaze/graphql and this
// handler forwards it with the x-api-key attached server-side, so the key
// is never exposed to the client.
//
// Example (client):
//   fetch('/api/blaze/graphql', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ query: 'query Ping { ping { status } }' }),
//   });

import { graphql } from '../../../lib/blaze';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { query, variables } = req.body || {};
  if (!query) {
    return res.status(400).json({ error: 'Missing "query" in request body' });
  }

  try {
    const data = await graphql(query, variables);
    return res.status(200).json({ data });
  } catch (err) {
    if (err.message?.includes('BLAZE_API_KEY')) {
      return res.status(500).json({ error: err.message });
    }
    return res
      .status(err.status || 502)
      .json({ error: err.message, details: err.body ?? null });
  }
}
