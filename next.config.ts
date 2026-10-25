import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auto-hospedado no VPS ARVEX: .next/standalone/server.js roda no container do Dockerfile.
  output: "standalone",
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
