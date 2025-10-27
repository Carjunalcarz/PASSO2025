# Appwrite Domain Configuration Guide

## Issue
Login works on localhost but fails on deployed domain: `x4w0gwcgkow0sk888ccooso8.180.232.187.219.sslip.io`

## Root Cause
Appwrite server needs to have the deployed domain added to its allowed origins list.

## Solution

### Step 1: Access Appwrite Console
1. Navigate to your Appwrite console: `http://180.232.187.219`
2. Login with your admin credentials

### Step 2: Add Your Domain to Web Platforms
1. Go to **Settings** → **Platforms**
2. Click **Web** or **Add Platform** → **Web**
3. Enter your deployed domain in the **Hostname** field:
   ```
   x4w0gwcgkow0sk888ccooso8.180.232.187.219.sslip.io
   ```
4. Click **Add**

### Step 3: Configure CORS (if needed)
If you still have issues after adding the domain:

1. Go to **Settings** → **Platforms**
2. Find your web platform
3. Ensure the following is configured:
   - **Allowed Origins**: Should include your deployed domain
   - **Allowed Methods**: Should include POST, GET, OPTIONS
   - **Allowed Headers**: Should include Content-Type, Authorization

### Step 4: Test Connection
After configuring:

1. Try logging in from your deployed domain
2. Open browser DevTools (F12) → Console
3. Look for CORS errors or authentication errors
4. Check Network tab for failed requests

## Alternative: Use Environment Variables

If you're deploying to production, consider using different endpoints based on environment:

### Create `.env.production`:
```bash
VITE_APPWRITE_ENDPOINT = "http://180.232.187.219/v1"
VITE_APPWRITE_PROJECT_ID = "68ff6bfb0032b68216bc"
```

### Update your build process:
Make sure your deployment platform (Vercel, Netlify, etc.) uses the correct environment variables.

## Quick Test

Run this in browser console on deployed site:
```javascript
// Test Appwrite connection
fetch('http://180.232.187.219/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

If this fails, there's a CORS or network issue.

## Troubleshooting

### Still can't login?
1. Check browser console for specific error
2. Check Appwrite server logs
3. Verify domain is added in Appwrite console
4. Try clearing browser cache/cookies
5. Check if domain uses HTTPS (some browsers require secure contexts)

### Common Errors:
- **CORS error**: Domain not added to allowed origins
- **401 Unauthorized**: Credentials issue or session expired
- **Network error**: Server is down or unreachable
