import withPWAInit from "next-pwa";
// import runtimeCaching from "next-pwa/cache.js";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  // runtimeCaching,
  // buildExcludes: [/middleware-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    dirs: ["src"],
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@uiw/react-md-editor", "@uiw/react-markdown-preview", "@breeztech/breez-sdk-spark"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Add WASM support for Breez Spark SDK
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Resolve WASM imports from Breez SDK
    config.resolve.extensions = [...(config.resolve.extensions || []), '.wasm'];

    return config;
  },
};

export default withPWA(nextConfig);
