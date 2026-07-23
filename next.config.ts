import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: ["pdf-parse"],
  async redirects() {
    return [
      {
        source: "/deliverx",
        destination: "/team-copilot",
        permanent: true,
      },
      {
        source: "/deliverx/:path*",
        destination: "/team-copilot/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*\\.(svg|png|jpg|jpeg|gif|webp|ico|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
