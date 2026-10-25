import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auto-hospedado no VPS ARVEX: .next/standalone/server.js roda no container do Dockerfile.
  output: "standalone",
  poweredByHeader: false,
  // CSP do app (o arvex-edge só manda frame-ancestors/base-uri/object-src). 'unsafe-inline' em script é exigido pelo
  // bootstrap do Next sem nonces; não há conteúdo de usuário renderizado como HTML.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
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
