import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['*']
    },
    optimizeCss: true,
  },
  webpack: (config, { isServer, dev }) => {
    config.optimization = {
      ...config.optimization,
      minimize: true,
      splitChunks: {
        chunks: 'all',
        maxSize: 20000000, // 20MB max par chunk
      }
    }
    if (isServer) {
      config.output = {
        ...config.output,
        filename: '[name].js',
        chunkFilename: '[name].[chunkhash].js'
      };
    }
    return config;
  }
};

export default nextConfig;
