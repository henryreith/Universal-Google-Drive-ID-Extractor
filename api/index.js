/**
 * =============================================================================
 * Universal Google Drive ID Extractor (Serverless Function)
 * =============================================================================
 *
 * HOW IT WORKS:
 * 1. It receives an HTTP POST request with a JSON body: { "url": "..." }
 * 2. It runs the *exact same regex* as the Make.com scenario.
 * 3. It returns a JSON response: { "googleID": "..." } or { "error": "..." }
 *
 * =============================================================================
 */

// This is the main handler function that Vercel (and other platforms) will run.
// `req` is the incoming request, `res` is the response we send back.
export default async function handler(req, res) {
  
  // --- CORS HEADERS ---
  // Set CORS headers to allow *any* website to call this API.
  // This is what makes it "universally accessible".
  // For more security, you could restrict this to 'henryreith.co'
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // --- PREFLIGHT REQUESTS ---
  // Handle "preflight" OPTIONS requests from browsers.
  // This is a standard part of CORS.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- METHOD GUARD ---
  // We only want to accept POST requests.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // --- MAIN LOGIC ---
  try {
    // Get the "url" from the request body.
    // Vercel automatically parses the JSON body for us.
    const { url } = req.body;

    // --- VALIDATION ---
    // Ensure the 'url' property exists and is a string.
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "url" in request body. Expecting { "url": "..." }' });
    }

    // --- THE REGEX ---
    // This is the same proven pattern from your Make.com scenario.
    const regex = /(?:/d/|folders/|id=)([a-zA-Z0-9_-]{25,})/;
    const matches = url.match(regex);

    // --- RESPONSE ---
    // Check if the regex found a match (in its first capture group)
    if (matches && matches[1]) {
      const googleID = matches[1];
      // Success! Send the 200 OK status and the ID.
      return res.status(200).json({ googleID: googleID });
    } else {
      // We found a URL, but the regex didn't match.
      // 404 is appropriate as the "resource" (the ID) wasn't found.
      return res.status(404).json({ error: 'Could not find a valid Google Drive ID in the provided URL.' });
    }
  } catch (error) {
    // --- ERROR CATCH-ALL ---
    // Catch any other server-side errors
    console.error(error); // Log the error to the Vercel console for debugging
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
