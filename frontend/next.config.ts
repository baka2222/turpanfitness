import type { NextConfig } from "next";
import path from "path";

// In Docker the app runs behind nginx; internal calls to media/API use the
// service DNS name. Overridable via env so the same config works on bare metal.
const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone) for a slim Docker image.
  output: "standalone",
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: ["127.0.0.1", "localhost:8000", "::1", "0.0.0.0", "172.20.10.3"],
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: `${INTERNAL_API_URL}/media/:path*`,
      },
    ];
  },
  images: {
    // Behind nginx/Cloudflare we serve pre-sized uploads directly; skip the
    // Next optimizer so it never needs to reach back through the proxy.
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "*", port: "8000", pathname: "/media/**" },
      { protocol: "https", hostname: "**", pathname: "/media/**" },
    ],
  },
};

export default nextConfig;