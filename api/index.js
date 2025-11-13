/**
 * =============================================================================
 * Universal Google Drive ID Extractor (Serverless Function)
 * =============================================================================
 *
 * This serverless function creates a public API endpoint to extract
 * Google Drive IDs from a single URL or a batch of URLs.
 *
 * It is designed to be a "utility" for automation platforms (Make, n8n)
 * and AI Agents, saving them credits/operations by offloading this
 * common parsing task to a single, free API call.
 *
 * =============================================================================
 * API ENDPOINTS
 * =============================================================================
 *
 * This function handles two types of requests to the SAME endpoint (`/api`):
 *
 * 1.  SINGLE URL REQUEST:
 * POST /api/
 * Body: { "url": "..." }
 * Returns: { "googleDriveID": "..." }
 *
 * 2.  BATCH URL REQUEST:
 * POST /api/
 * Body: { "urls": ["...", "...", ...] }
 * Returns: { "results": [ { "url": "...", "googleDriveID": "..." }, ... ] }
 *
 * =============================================================================
 */

// This is the main regex that does all the work.
// It looks for /d/, folders/, or id= and captures the 25+ char ID.
const GID_REGEX = /(?:/d/|folders/|id=)([a-zA-Z0-9_-]{25,})/;

/**
 * A simple helper function to extract the ID from a single URL.
 * @param {string} url - The Google Drive URL.
 * @returns {string | null} The found ID, or null if not found.
 */
function extractId(url) {
  if (typeof url !== 'string') {
    return null;
  }
  const matches = url.match(GID_REGEX);
  return matches && matches[1] ? matches[1] : null;
}

/**
 * [FIX] A helper function to manually parse the request body.
 * Vercel/Node.js serverless functions do not parse JSON bodies automatically.
 * @param {object} req - The Node.js request object.
 * @returns {Promise<object | null>} A promise that resolves with the parsed JSON body, or null.
 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) {
        return resolve(null); // No body
      }
      try {
        resolve(JSON.parse(body)); // Try to parse
      } catch (e) {
        reject(new Error('Invalid JSON')); // Malformed JSON
      }
    });
    req.on('error', err => {
      reject(err);
    });
  });
}

// This is the main handler function that Vercel will run.
export default async function handler(req, res) {
  
  // --- CORS HEADERS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // --- PREFLIGHT REQUEST ---
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- METHOD GUARD ---
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // --- MAIN LOGIC ---
  try {
    // [FIX] Manually parse the request body
    const body = await parseBody(req);

    // [FIX] Check if body exists before destructuring
    if (!body) {
      return res.status(400).json({ error: 'Request body is missing or empty.' });
    }

    const { url, urls } = body;

    // --- BATCH PROCESSING ---
    if (urls && Array.isArray(urls)) {
      const results = urls.map(currentUrl => {
        return {
          url: currentUrl,
          googleDriveID: extractId(currentUrl)
        };
      });
      return res.status(200).json({ results: results });
    }

    // --- SINGLE URL PROCESSING ---
    if (url && typeof url === 'string') {
      const googleDriveID = extractId(url);
      if (googleDriveID) {
        return res.status(200).json({ googleDriveID: googleDriveID });
      } else {
        return res.status(404).json({ error: 'Could not find a valid Google Drive ID in the provided URL.' });
      }
    }

    // --- VALIDATION ERROR ---
    return res.status(400).json({ 
      error: 'Invalid request body. Expecting { "url": "..." } or { "urls": ["...", ...] }' 
    });

  } catch (error) {
    // --- ERROR CATCH-ALL ---
    console.error(error); // Log to Vercel console
    return res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
  }
}
