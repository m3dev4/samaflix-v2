/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimisation du bundle
    config.optimization = {
      ...config.optimization,
      minimize: true,
      splitChunks: {
        chunks: 'all',
        maxSize: 20000000, // 20MB max par chunk
      }
    }
    if (isServer) {
      config.output.filename = '_worker.js';
    }
    return config
  },
  output: 'standalone',
  experimental: {
    runtime: 'edge',
    serverComponents: true,
    optimizeCss: true,
  },
}

module.exports = nextConfig
