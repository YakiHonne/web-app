/** @type {import('next-i18next').UserConfig} */
const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'ar', 'es', 'it', 'ja', 'pt', 'th', 'zh-cn'],
  },
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  // Add these options to help prevent hydration mismatches
  react: {
    useSuspense: false,
  },
  // Ensure consistent behavior between server and client
  interpolation: {
    escapeValue: false,
  },
  
};