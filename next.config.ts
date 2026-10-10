import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://18.224.66.251:8000";

const nextConfig: NextConfig = {
  // Forward /api/* to the Python (FastAPI) backend so the browser never
  // talks to it directly (no CORS setup needed).
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
