import withPWAInit from "next-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  transpilePackages: ["@uiw/react-md-editor", "@uiw/react-markdown-preview"],
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };

      // Enable WASM support
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };

      // Ignore WASM files from Breez SDK - let them load at runtime
      config.module.rules.push({
        test: /breez_sdk_spark_wasm_bg\.wasm$/,
        type: "asset/resource",
        generator: {
          filename: "static/wasm/[name].[hash][ext]",
        },
      });

      // Handle other WASM files normally
      config.module.rules.push({
        test: /\.wasm$/,
        exclude: /breez_sdk_spark_wasm_bg\.wasm$/,
        type: "webassembly/async",
      });

      // Ignore wbg imports - they're internal to the WASM module
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^wbg$/,
        })
      );
    } else {
      // Exclude Breez SDK from server-side builds completely
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('@breeztech/breez-sdk-spark');
        config.externals.push('@breeztech/breez-sdk-spark/web');
      } else {
        const existingExternals = config.externals;
        config.externals = [
          existingExternals,
          '@breeztech/breez-sdk-spark',
          '@breeztech/breez-sdk-spark/web'
        ];
      }
    }

    return config;
  },
};

export default withPWA(nextConfig);
