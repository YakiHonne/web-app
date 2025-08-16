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
  
  // Allow CSS imports from node_modules
  transpilePackages: ['@uiw/react-md-editor', '@uiw/react-markdown-preview'],
  
  webpack: (config, { isServer }) => {
    // Handle CSS imports from node_modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
