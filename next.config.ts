import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  swcMinify: false,
  images: {
    unoptimized: true,
    domains: [
      "image.tmdb.org",
      "cpasmieux.is",
      "uqload.net",
      "upload.wikimedia.org",
      "www.cpasmieux.ad"
    ],
  },
};

export default nextConfig;
