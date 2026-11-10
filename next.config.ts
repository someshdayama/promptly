import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The PDF fonts never change between deploys; let browsers reuse them instead of re-checking all seven on every visit.
  async headers() {
    return [
      {
        source: "/fonts/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
    ];
  },
  async redirects() {
    return [{ source: "/build", destination: "/", permanent: false }];
  },
};

export default nextConfig;
