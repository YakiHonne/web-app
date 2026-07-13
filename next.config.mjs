import withPWAInit from "next-pwa";
// import runtimeCaching from "next-pwa/cache.js";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  buildExcludes: [
    /\.map$/,
    /app-build-manifest\.json$/,
    /dynamic-css-manifest\.json$/,
  ],
  // runtimeCaching,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: false,
  eslint: {
    dirs: ["src"],
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@uiw/react-md-editor", "@uiw/react-markdown-preview"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
};

export default withPWA(nextConfig);
