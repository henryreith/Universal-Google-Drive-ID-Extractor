# Universal Google Drive ID Extractor

A free, universal serverless API to extract Google Drive (Doc, Folder, Sheet) IDs from any full Google Drive URL. Supports single or batch requests.

This project provides a single, reliable API endpoint that you can call from any automation platform (Make.com, n8n, Zapier), AI Agent, website, or script to instantly parse Google Drive IDs from the full doc or folder URL.


## Why Does This Exist?

In automation platforms, you often find yourself rebuilding the same logic—like complex Regex—in multiple different workflows. This violates the **"DRY" (Don't Repeat Yourself)** principle.

Worse, in tools like Make.com or when building AI Agents, every step (like a "Text Parser") **costs you credits or operations**.

This API solves both problems. It turns that logic into a **single, free, universal utility**. Instead of 3-4 modules, you use one HTTP request. Instead of 100 API calls for 100 URLs, you can send them all in one batch.

**Read the full tutorial and "why" on my blog:** [https://henryreith.co](https://henryreith.co)


## Live API Endpoint

The API is available at:

https://universal-google-drive-id-extractor.vercel.app/api


## How to Use the API

Make a **POST** request to the /api endpoint. The API is backward-compatible and accepts two different JSON structures.


### 1. Single URL Request

**Endpoint:** POST /api/

**Body:**

{ \
  "url": "[https://docs.google.com/document/d/1aBcD_eX-yZ_1234567890-AbCdEfGhIjKlMnOp/edit?usp=sharing](https://docs.google.com/document/d/1aBcD_eX-yZ_1234567890-AbCdEfGhIjKlMnOp/edit?usp=sharing)" \
} \


**Success Response (200):**

{ \
  "googleDriveID": "1aBcD_eX-yZ_1234567890-AbCdEfGhIjKlMnOp" \
} \


**Error Response (404):**

{ \
  "error": "Could not find a valid Google Drive ID in the provided URL." \
} \



### 2. Batch (Multiple) URLs Request

This is the most efficient method for processing many URLs from a database or spreadsheet.

**Endpoint:** POST /api/

**Body:**

{ \
  "urls": [ \
    "[https://docs.google.com/document/d/1aBcD_.../edit](https://docs.google.com/document/d/1aBcD_.../edit)", \
    "[https://drive.google.com/drive/folders/2bCdE](https://drive.google.com/drive/folders/2bCdE)_...", \
    "[https://invalid.url/foo](https://invalid.url/foo)" \
  ] \
} \


**Success Response (200):**

Returns an array of results. If an ID can't be found for a specific URL, its googleID will be null.

{ \
  "results": [ \
    { \
      "url": "[https://docs.google.com/document/d/1aBcD_.../edit](https://docs.google.com/document/d/1aBcD_.../edit)", \
      "googleDriveID": "1aBcD_..." \
    }, \
    { \
      "url": "[https://drive.google.com/drive/folders/2bCdE](https://drive.google.com/drive/folders/2bCdE)_...", \
      "googleDriveID": "2bCdE_..." \
    }, \
    { \
      "url": "[https://invalid.url/foo](https://invalid.url/foo)", \
      "googleDriveID": null \
    } \
  ] \
} \



## Examples


### curl (Batch Request)

curl -X POST 'https://universal-google-drive-id-extractor.vercel.app/api' \ \
-H 'Content-Type: application/json' \ \
-d '{ \
  "urls": [ \
    "[https://docs.google.com/spreadsheets/d/1zyX-AbCd_.../edit](https://docs.google.com/spreadsheets/d/1zyX-AbCd_.../edit)", \
    "[https://docs.google.com/document/d/2bCdE_.../edit](https://docs.google.com/document/d/2bCdE_.../edit)" \
  ] \
}' \



### JavaScript fetch (Batch Request)

async function getMultipleGoogleIDs(urlArray) { \
  try { \
    const response = await fetch('https://universal-google-drive-id-extractor.vercel.app/api', { \
      method: 'POST', \
      headers: { 'Content-Type': 'application/json' }, \
      body: JSON.stringify({ urls: urlArray }) \
    }); \
 \
    const data = await response.json(); \
 \
    if (!response.ok) { \
      throw new Error(data.error || 'Something went wrong'); \
    } \
 \
    console.log('Batch results:', data.results); \
    // data.results is [ { url: "...", googleID: "..." }, ... ] \
    return data.results; \
     \
  } catch (error) { \
    console.error('Failed to extract IDs:', error.message); \
  } \
} \
 \
// Example usage: \
getMultipleGoogleIDs([ \
  '[https://drive.google.com/drive/folders/1-2345_AbCdEf](https://drive.google.com/drive/folders/1-2345_AbCdEf)...', \
  '[https://docs.google.com/document/d/2-3456_BcDeFg](https://docs.google.com/document/d/2-3456_BcDeFg)...' \
]); \



### Make.com (HTTP Module for Batch)



1. Use an **Array Aggregator** to gather all your URLs into a single array.
2. Add the **HTTP > Make a request** module *after* the aggregator.
3. **URL:** https://universal-google-drive-id-extractor.vercel.app/api
4. **Method:** POST
5. **Body type:** Raw
6. **Content type:** JSON (application/json)
7. **Request content:** \
{ \
  "urls": {{ 1.array }} \
} \

8. **Parse response:** Yes
9. Now you can iterate over the data.results array that is returned.


## License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).
