// Python (FastAPI) backend hosted on EC2. Requests to /api/* on this app
// (local or Amplify) are proxied here by the rewrite in next.config.ts.
export const BACKEND_URL = "http://18.224.66.251:8000";
