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
 * Returns: { "googleID": "..." }
 *
 * 2.  BATCH URL REQUEST:
 * POST /api/
 * Body: { "urls": ["...", "...", ...] }
 * Returns: { "results": [ { "url": "...", "googleID": "..." }, ... ] }
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

// This is the main handler function that Vercel will run.
export default async function handler(req, res) {
  
  // --- CORS HEADERS ---
  // Allow any website to call this API.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // --- PREFLIGHT REQUEST ---
  // Handle "preflight" OPTIONS requests from browsers.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- METHOD GUARD ---
  // We only accept POST requests.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // --- MAIN LOGIC ---
  try {
    const { url, urls } = req.body;

    // --- BATCH PROCESSING ---
    // Check if the `urls` key exists and is an array.
    if (urls && Array.isArray(urls)) {
      
      // Process each URL in the array using the helper function.
      const results = urls.map(currentUrl => {
        return {
          url: currentUrl,
          googleID: extractId(currentUrl) // Returns the ID or null
        };
      });

      // Return the array of results.
      return res.status(200).json({ results: results });
    }

    // --- SINGLE URL PROCESSING ---
    // Check if the `url` key exists and is a string.
    if (url && typeof url === 'string') {
      const googleID = extractId(url);

      if (googleID) {
        // Success! Send the 200 OK status and the ID.
        return res.status(200).json({ googleID: googleID });
      } else {
        // We found a URL, but the regex didn't match.
        return res.status(404).json({ error: 'Could not find a valid Google Drive ID in the provided URL.' });
      }
    }

    // --- VALIDATION ERROR ---
    // If neither `url` (string) nor `urls` (array) was provided.
    return res.status(400).json({ 
      error: 'Invalid request body. Expecting { "url": "..." } or { "urls": ["...", ...] }' 
    });

  } catch (error) {
    // --- ERROR CATCH-ALL ---
    console.error(error); // Log to Vercel console
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
