// Python (FastAPI) backend hosted on EC2. Requests to /api/* on this app
// (local or Amplify) are proxied here by the rewrite in next.config.ts.
export const BACKEND_URL = "http://127.0.0.1:8000";
