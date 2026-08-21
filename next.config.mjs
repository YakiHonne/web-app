import withPWAInit from "next-pwa";
import { createRequire } from "module";
import path from "path";
// import runtimeCaching from "next-pwa/cache.js";

const require = createRequire(import.meta.url);

// markdown-it's ESM entry (index.mjs) spreads each rule across separate
// modules that import `isSpace` (and other helpers) as cross-module named
// bindings. Next's webpack + SWC minification can hoist those into a temporal
// dead zone, producing a runtime "isSpace is not defined" when the editor v2
// (tiptap-markdown) parses imported markdown. The single-file CommonJS build
// has no cross-module live bindings and is immune, so we force it in both
// bundlers. Resolve through tiptap-markdown (its dependent) so this works
// under pnpm, where markdown-it is not hoisted to the root.
const tiptapRequire = createRequire(require.resolve("tiptap-markdown"));
const markdownItCjs = tiptapRequire.resolve("markdown-it/dist/index.cjs.js");
// Turbopack's resolveAlias resolves relative paths from the project root and
// mangles bare absolute POSIX paths (it prepends "./"), so give it a
// root-relative "./node_modules/..." specifier instead of the absolute path.
const markdownItCjsRelative =
  "./" + path.relative(process.cwd(), markdownItCjs).split(path.sep).join("/");

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
  cacheHandler: require.resolve("./cache-handler.cjs"),
  cacheMaxMemorySize: 0,
  productionBrowserSourceMaps: true,
  reactStrictMode: false,
  eslint: {
    dirs: ["src"],
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@uiw/react-md-editor", "@uiw/react-markdown-preview"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "upgrade-insecure-requests",
          },
        ],
      },
    ];
  },
  // Turbopack (used by `next dev --turbo`) reads this alias.
  turbopack: {
    resolveAlias: {
      "markdown-it": markdownItCjsRelative,
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Webpack (used by `next build`) reads this alias.
    config.resolve.alias = {
      ...config.resolve.alias,
      "markdown-it$": markdownItCjs,
    };

    return config;
  },
};

export default withPWA(nextConfig);
