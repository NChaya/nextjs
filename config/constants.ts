// Python (FastAPI) backend hosted on EC2. Requests to /api/* on this app
// (local or Amplify) are proxied here by the rewrite in next.config.ts.
// For local testing against a local backend, set BACKEND_URL=http://127.0.0.1:8000
// in .env.local instead of editing this file.
export const BACKEND_URL = process.env.BACKEND_URL ?? "http://3.22.77.199:8000";
