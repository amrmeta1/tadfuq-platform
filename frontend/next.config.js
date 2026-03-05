/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable for Docker deployment
  experimental: {
    // Disable static page generation to avoid Context Provider issues
    isrMemoryCacheSize: 0,
  },
  // Avoid "Unable to snapshot resolve dependencies" (webpack PackFileCacheStrategy) in dev
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
