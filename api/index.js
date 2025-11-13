/**
 * =============================================================================
 * Universal Google Drive ID Extractor (Serverless Function)
 * =============================================================================
 *
 * This serverless function creates a public API endpoint to extract
 * Google Drive IDs from a single URL or a batch of URLs.
 *
 * It is designed to be a "utility" for automation platforms such as:
 * - Make.com
 * - n8n
 * - Zapier
 * - AI Agents (OpenAI, Claude, etc.)
 *
 * This API offloads a repetitive parsing problem, saving credits and
 * processing time for your automation scenarios.
 *
 * =============================================================================
 * ENDPOINT
 * =============================================================================
 *
 *  POST https://universal-google-drive-id-extractor.vercel.app/api
 *
 *  Body (single):
 *    {
 *      "url": "https://docs.google.com/document/d/ABC123.../edit"
 *    }
 *
 *  Body (batch):
 *    {
 *      "urls": [
 *        "https://...1",
 *        "https://...2",
 *        ...
 *      ]
 *    }
 *
 * =============================================================================
 * RESPONSES
 * =============================================================================
 *
 *  SINGLE:
 *    200 OK:
 *      {
 *        "googleDriveID": "ABC123...",
 *        "success": true,
 *        "error": null
 *      }
 *
 *    404 Not Found:
 *      {
 *        "googleDriveID": null,
 *        "success": false,
 *        "error": "Could not find a valid Google Drive ID..."
 *      }
 *
 *  BATCH:
 *    200 OK:
 *      {
 *        "items": [
 *          {
 *            "index": 0,
 *            "input": "https://...1",
 *            "googleDriveID": "ABC123...",
 *            "success": true,
 *            "error": null
 *          },
 *          {
 *            "index": 1,
 *            "input": "https://...2",
 *            "googleDriveID": null,
 *            "success": false,
 *            "error": "No valid Google Drive ID found in this input."
 *          }
 *        ],
 *        "meta": {
 *          "total": 2,
 *          "succeeded": 1,
 *          "failed": 1
 *        }
 *      }
 *
 *  ERRORS:
 *    400 Bad Request — invalid body shape
 *    405 Method Not Allowed — non-POST
 *    500 Internal Server Error — unexpected failure
 *
 * =============================================================================
 */

// Matches the most common Google Drive URL patterns.
//
// Supported examples:
// - https://docs.google.com/document/d/<ID>/edit
// - https://docs.google.com/spreadsheets/d/<ID>/edit
// - https://drive.google.com/file/d/<ID>/view
// - https://drive.google.com/folders/<ID>
// - https://drive.google.com/open?id=<ID>
//
// Note: forward slashes are escaped deliberately.
const GID_REGEX = /(?:\/d\/|folders\/|id=)([a-zA-Z0-9_-]{10,})/;

/**
 * Extract the Drive ID from a given URL or text.
 * Returns: string | null
 */
function extractGoogleDriveId(input) {
  if (typeof input !== "string") return null;
  const match = input.match(GID_REGEX);
  return match ? match[1] : null;
}

/**
 * =============================================================================
 * Handler (Vercel Serverless Function)
 * =============================================================================
 */
export default async function handler(req, res) {
  // Enable CORS for browser/automation compatibility
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests for real work
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed. Use POST.`
    });
  }

  try {
    let body = req.body;

    // Sometimes req.body may be a string or empty depending on caller
    if (typeof body === "string") {
      body = body.trim() ? JSON.parse(body) : {};
    } else if (!body) {
      // Fallback: read raw body
      let raw = "";
      for await (const chunk of req) raw += chunk;
      body = raw.trim() ? JSON.parse(raw) : {};
    }

    const { url, urls } = body || {};

    // =========================================================================
    // BATCH MODE
    // =========================================================================
    if (Array.isArray(urls)) {
      const items = urls.map((input, index) => {
        const googleDriveID = extractGoogleDriveId(input);

        return {
          index,
          input,
          googleDriveID,
          success: Boolean(googleDriveID),
          error: googleDriveID
            ? null
            : "No valid Google Drive ID found in this input."
        };
      });

      const meta = {
        total: items.length,
        succeeded: items.filter(i => i.success).length,
        failed: items.filter(i => !i.success).length
      };

      return res.status(200).json({ items, meta });
    }

    // =========================================================================
    // SINGLE MODE
    // =========================================================================
    if (typeof url === "string") {
      const googleDriveID = extractGoogleDriveId(url);

      if (googleDriveID) {
        return res.status(200).json({
          googleDriveID,
          success: true,
          error: null
        });
      }

      return res.status(404).json({
        googleDriveID: null,
        success: false,
        error:
          "Could not find a valid Google Drive ID in the provided URL or text."
      });
    }

    // =========================================================================
    // VALIDATION ERROR
    // =========================================================================
    return res.status(400).json({
      success: false,
      error: 'Invalid request. Expected { "url": "..." } or { "urls": [...] }.'
    });

  } catch (error) {
    console.error("Universal Google Drive ID Extractor error:", error);

    return res.status(500).json({
      success: false,
      error: "An internal server error occurred."
    });
  }
}
