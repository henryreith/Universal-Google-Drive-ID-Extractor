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
 */

/**
 * =============================================================================
 * Universal Google Drive ID Extractor (Serverless Function)
 * =============================================================================
 *
 * Public API endpoint to extract Google Drive IDs from a single URL
 * or a batch of URLs.
 *
 * Designed for automation platforms (Make, n8n, Zapier, etc.) and AI agents.
 *
 * =============================================================================
 * ENDPOINT
 * =============================================================================
 *
 *  POST https://universal-google-drive-id-extractor.vercel.app/api
 *
 *  Body (single):
 *    { "url": "https://docs.google.com/document/d/ABC123.../edit" }
 *
 *  Body (batch):
 *    { "urls": ["https://...1", "https://...2", ...] }
 *
 * =============================================================================
 * RESPONSES
 * =============================================================================
 *
 *  Single:
 *    200 OK: { "googleDriveID": "ABC123..." }
 *    404 Not Found: { "error": "Could not find a valid Google Drive ID..." }
 *
 *  Batch:
 *    200 OK: {
 *      "results": [
 *        { "url": "https://...1", "googleDriveID": "ABC123..." },
 *        { "url": "https://...2", "googleDriveID": null }
 *      ]
 *    }
 *
 *  Errors:
 *    400 Bad Request: invalid body shape
 *    405 Method Not Allowed: non POST method
 *    500 Internal Server Error: unexpected failure
 *
 * =============================================================================
 */

// Matches common Google Drive URL patterns:
// - https://docs.google.com/document/d/<ID>/edit
// - https://docs.google.com/spreadsheets/d/<ID>/edit
// - https://drive.google.com/file/d/<ID>/view
// - https://drive.google.com/folders/<ID>
// - https://drive.google.com/open?id=<ID>
//
// Note: forward slashes are escaped so the regex literal is valid.
const GID_REGEX = /(?:\/d\/|folders\/|id=)([a-zA-Z0-9_-]{10,})/;

/**
 * Try to extract a Google Drive ID from a URL or text.
 * Returns the ID string, or null if no match.
 */
function extractGoogleDriveId(input) {
  if (typeof input !== "string") return null;
  const match = input.match(GID_REGEX);
  return match ? match[1] : null;
}

/**
 * Main serverless function handler for Vercel (Next.js API route style).
 */
export default async function handler(req, res) {
  // Basic CORS headers so it can be called from browsers and tools
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST for actual work
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ error: `Method ${req.method} Not Allowed. Use POST.` });
  }

  try {
    let body = req.body;

    // On Vercel, if Content-Type is application/json, req.body is usually already parsed.
    // But to be safe, handle the cases where it might be a string or empty.
    if (typeof body === "string") {
      body = body.trim() ? JSON.parse(body) : {};
    } else if (!body) {
      // Fallback: read raw request stream and parse
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
      }
      body = raw.trim() ? JSON.parse(raw) : {};
    }

    const { url, urls } = body || {};

    // -------------------------------------------------------------------------
    // BATCH MODE: { "urls": [ "...", "..." ] }
    // -------------------------------------------------------------------------
    if (Array.isArray(urls)) {
      const results = urls.map((u) => ({
        url: u,
        googleDriveID: extractGoogleDriveId(u),
      }));

      return res.status(200).json({ results });
    }

    // -------------------------------------------------------------------------
    // SINGLE MODE: { "url": "..." }
    // -------------------------------------------------------------------------
    if (typeof url === "string") {
      const googleDriveID = extractGoogleDriveId(url);

      if (googleDriveID) {
        return res.status(200).json({ googleDriveID });
      }

      return res.status(404).json({
        error:
          "Could not find a valid Google Drive ID in the provided URL or text.",
      });
    }

    // -------------------------------------------------------------------------
    // VALIDATION ERROR
    // -------------------------------------------------------------------------
    return res.status(400).json({
      error:
        'Invalid request body. Expecting { "url": "..." } or { "urls": ["...", ...] }',
    });
  } catch (error) {
    // Catch all unexpected errors
    console.error("Universal Google Drive ID Extractor error:", error);
    return res.status(500).json({
      error: "An internal server error occurred.",
    });
  }
}
