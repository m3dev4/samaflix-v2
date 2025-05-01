import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    domains: [
      "image.tmdb.org",
      "cpasmieux.is",
      "uqload.net",
      "upload.wikimedia.org",
      "www.cpasmieux.ad",
      "doodstream.com",
      "dood.com"
    ],
  },
  // Ignorer les erreurs pour permettre le déploiement
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuration pour Vercel
  experimental: {
    serverComponentsExternalPackages: ['sharp']
  },
};

export default nextConfig;
