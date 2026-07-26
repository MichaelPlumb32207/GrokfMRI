import type { NextConfig } from "next";

/**
 * Local-only observatory. Memory contents must never be deployed to Vercel
 * unless Michael explicitly asks later.
 */
const nextConfig: NextConfig = {
  // Keep serverful Node APIs available for filesystem reads.
  serverExternalPackages: [],
};

export default nextConfig;
