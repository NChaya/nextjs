import type { NextConfig } from "next";

import { BACKEND_URL } from "./config/constants";

const nextConfig: NextConfig = {
  // Forward /api/* to the Python (FastAPI) backend so the browser never
  // talks to it directly (no CORS setup needed).
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
