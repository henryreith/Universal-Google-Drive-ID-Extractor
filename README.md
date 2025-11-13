# Universal Google Drive ID Extractor

A free, universal serverless API to extract Google Drive (Doc, Folder, Sheet, File) IDs from any full Google Drive URL. Supports **single** and **batch** requests.

This project provides a single, reliable API endpoint that you can call from any automation platform (Make.com, n8n, Zapier), AI Agent, website, or script to instantly parse Google Drive IDs from full doc or folder URLs.

---

## Why Does This Exist?

In automation platforms, you often end up rebuilding the same logic (like Regex to grab an ID from a URL) in multiple workflows. That breaks the **DRY** principle, and in tools like Make.com or with AI agents, every parsing step can **cost you credits or operations**.

This API turns that into a **single, free, universal utility**.

- Instead of 3 or 4 modules, you use one HTTP request  
- Instead of 100 API calls for 100 URLs, you can send them all in **one batch**

**More about the idea and usage:** https://henryreith.co

---

## Live API Endpoint

Base URL:

```txt
https://universal-google-drive-id-extractor.vercel.app/api
```

HTTP method:

```txt
POST
```

Content type:

```txt
application/json
```

The API supports:

- A **single URL** via `"url"`
- A **batch of URLs** via `"urls"` (array)

---

## Request & Response Formats

### 1. Single URL Request

**Endpoint**

```txt
POST https://universal-google-drive-id-extractor.vercel.app/api
```

**Request body**

```json
{
  "url": "https://docs.google.com/document/d/1aBcD_eX-yZ_1234567890-AbCdEfGhIjKlMnOp/edit?usp=sharing"
}
```

**Success response (200)**

```json
{
  "googleDriveID": "1aBcD_eX-yZ_1234567890-AbCdEfGhIjKlMnOp",
  "success": true,
  "error": null
}
```

**Not found response (404)**

```json
{
  "googleDriveID": null,
  "success": false,
  "error": "Could not find a valid Google Drive ID in the provided URL or text."
}
```

---

### 2. Batch (Multiple URLs) Request

This is the most efficient way to process many URLs from a database, sheet, or tool like Make/n8n.

**Endpoint**

```txt
POST https://universal-google-drive-id-extractor.vercel.app/api
```

**Request body**

```json
{
  "urls": [
    "https://docs.google.com/document/d/1aBcD_.../edit",
    "https://drive.google.com/drive/folders/2bCdE_...",
    "https://invalid.url/foo"
  ]
}
```

**Success response (200)**

```json
{
  "items": [
    {
      "index": 0,
      "input": "https://docs.google.com/document/d/1aBcD_.../edit",
      "googleDriveID": "1aBcD_...",
      "success": true,
      "error": null
    },
    {
      "index": 1,
      "input": "https://drive.google.com/drive/folders/2bCdE_...",
      "googleDriveID": "2bCdE_...",
      "success": true,
      "error": null
    },
    {
      "index": 2,
      "input": "https://invalid.url/foo",
      "googleDriveID": null,
      "success": false,
      "error": "No valid Google Drive ID found in this input."
    }
  ],
  "meta": {
    "total": 3,
    "succeeded": 2,
    "failed": 1
  }
}
```

---

## License

MIT License. This project is independent and not affiliated with Google LLC.
