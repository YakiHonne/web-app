import withPWAInit from "next-pwa";
import CopyPlugin from "copy-webpack-plugin";
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

      // Configure WASM experiments
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        syncWebAssembly: true,
        layers: true,
      };

      // Add WASM rule
      config.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async",
      });

      // Add NormalModuleReplacementPlugin to handle wbg imports
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^wbg$/,
          (resource) => {
            // Ignore the wbg import - it's internal to WASM
            resource.request = path.resolve(__dirname, 'src/Helpers/Spark/wbg-shim.js');
          }
        )
      );
    } else {
      // Exclude Breez SDK from server-side builds completely
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('@breeztech/breez-sdk-spark');
      } else {
        const existingExternals = config.externals;
        config.externals = [existingExternals, '@breeztech/breez-sdk-spark'];
      }
    }

    return config;
  },
};

export default withPWA(nextConfig);
