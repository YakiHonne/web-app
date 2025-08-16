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
};

export default nextConfig;
