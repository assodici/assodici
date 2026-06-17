import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      { hostname: "www.gravatar.com" },
    ],
  },
};

export default nextConfig;
