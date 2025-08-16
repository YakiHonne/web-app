/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // Only run ESLint on these directories during `next build` and `next lint`
    dirs: ['src'],
    // Don't fail build on ESLint warnings
    ignoreDuringBuilds: true,
  },
  // Remove i18n config since we're using client-side only i18n
  
  // Production build optimizations
  experimental: {
    // Enable webpack build worker for faster builds
    webpackBuildWorker: true,
  },
  
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // Production optimizations
      config.optimization = {
        ...config.optimization,
        // Enable parallel processing
        minimize: true,
        // Split chunks more efficiently
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Separate vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Separate common chunks
            common: {
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
      
      // Enable webpack cache for faster rebuilds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: ['next.config.mjs'],
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
