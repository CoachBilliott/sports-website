import type { NextConfig } from "next";
import path from "path";

/** Set NEXT_PUBLIC_BASE_PATH=/district when embedding into the root Vercel site. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
