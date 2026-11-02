import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/build", destination: "/", permanent: false }];
  },
};

export default nextConfig;
