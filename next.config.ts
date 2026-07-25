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
        source: "/workspace/evidence",
        destination: "/profile/evidence",
        permanent: true,
      },
      {
        source: "/deliverx",
        destination: "/professional-workspace",
        permanent: true,
      },
      {
        source: "/deliverx/:path*",
        destination: "/professional-workspace/:path*",
        permanent: true,
      },
      {
        source: "/team-copilot",
        destination: "/professional-workspace",
        permanent: true,
      },
      {
        source: "/team-copilot/:path*",
        destination: "/professional-workspace/:path*",
        permanent: true,
      },
      {
        source: "/xperience",
        destination: "/experience",
        permanent: true,
      },
      {
        source: "/xperience/app",
        destination: "/experience/app",
        permanent: true,
      },
      {
        source: "/xperience/app/:path*",
        destination: "/experience/app/:path*",
        permanent: true,
      },
      {
        source: "/start/xperience",
        destination: "/start/experience",
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
