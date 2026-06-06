// Server-side Blaze API client (GraphQL).
//
// Blaze's API is GraphQL: a single POST endpoint, authenticated with an
// `x-api-key` header. The key stays on the server and never reaches the
// browser. Docs: https://docs.withblaze.app  (Alpha access — request a key
// from chirag@withblaze.app using your registered Blaze email.)

const API_URL = process.env.BLAZE_API_URL || 'https://api.withblaze.app';
const API_KEY = process.env.BLAZE_API_KEY;

// Run an arbitrary GraphQL query/mutation. Returns the `data` payload, or
// throws with `.status` / `.body` set on HTTP or GraphQL errors.
export async function graphql(query, variables) {
  if (!API_KEY) {
    throw new Error(
      'BLAZE_API_KEY is not set. Add it to your environment (see .env.example).'
    );
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    const err = new Error(`Blaze API ${res.status}: ${res.statusText}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  if (json && json.errors) {
    const err = new Error('Blaze GraphQL error');
    err.body = json.errors;
    throw err;
  }
  return json && 'data' in json ? json.data : json;
}

// Health check — the documented first call.
export function ping() {
  return graphql('query Ping { ping { status } }');
}

// GraphQL introspection — useful in Alpha to discover available queries and
// fields once you have a key (the public docs list these under API Reference).
export function introspect() {
  return graphql(`
    query Introspect {
      __schema {
        queryType { fields { name description } }
      }
    }
  `);
}

export const blaze = { graphql, ping, introspect };

export default blaze;
