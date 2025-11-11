# **Universal Google Drive ID Extractor**

A free, universal serverless API to extract Google Drive (Doc, Folder, Sheet) IDs from any URL.

This project provides a single, reliable API endpoint that you can call from any automation platform (Make.com, n8n, Zapier), website, or script to instantly parse a Google Drive ID from a URL.

It's built to be deployed in 1-click to Vercel's free "Hobby" plan.


## **Why Does This Exist?**

In automation platforms, you often find yourself rebuilding the same logic—like complex Regex—in multiple different workflows. This violates the **"DRY" (Don't Repeat Yourself)** principle.

If you need to fix a bug or improve the regex, you have to find and update it in every single workflow.

This API solves that. It turns that logic into a **universal utility**. Instead of a "Text Parser" module, you just use one "HTTP Request" module and call this API.

**Read the full tutorial and "why" on my blog:**[ https://henryreith.co](https://henryreith.co)


## **Live API Endpoint**

Once deployed, your API will be available at:


```
https://<your-project-name>.vercel.app/api
```



## **How to Use the API**

Make a **<code>POST</code>** request to the `/api` endpoint with a JSON body containing the `url`.


### **Request**

**Endpoint:** `POST /api/`

**Body:**


### **Success Response (200)**

If an ID is found, the API will return a JSON object with the `googleID`.


### **Error Response (404 / 400)**

If no ID is found or the URL is missing, it will return an error.


## **Examples**


### **<code>curl</code> (Command Line)**


### **JavaScript <code>fetch</code> (Web App)**


### **Make.com (HTTP Module)**

You can use this to replace your "Callable Scenario" with a universal API call.



1. Add the **HTTP > Make a request** module.
2. **URL:** `https://&lt;your-project-name>.vercel.app/api`
3. **Method:** `POST`
4. **Body type:** `Raw`
5. **Content type:** `JSON (application/json)`
6. **Request content:**
7.  \
**Parse response:** Yes

The module will output `data.googleID`.


## **Deploy Your Own**

You can deploy this project to your own Vercel account in 60 seconds.



1. **Fork** this repository to your own GitHub account.
2. Create a new project on[ Vercel](https://vercel.com/new).
3. Import your forked repository.
4. Vercel will automatically detect it's a Node.js project.
5. Click **Deploy**.

That's it! Vercel will build the `api/index.js` file and give you a public URL.


## **License**

This project is open-source and available under the[ MIT License](https://opensource.org/licenses/MIT).
