import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // No framing by other sites (clickjacking on claim/release buttons).
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
