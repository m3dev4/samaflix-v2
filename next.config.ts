import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
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
