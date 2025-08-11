// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import HttpBackend from 'i18next-http-backend';
// import LanguageDetector from 'i18next-browser-languagedetector';
// import supportedLanguageKeys from '@/Content/SupportedLanguages';

// if (!i18n.isInitialized) {
//   i18n
//     .use(HttpBackend) // load translations from `/locales/{{lng}}/{{ns}}.json`
//     .use(LanguageDetector) // detect language
//     .use(initReactI18next) // 👈 pass i18n instance to react-i18next
//     .init({
//       fallbackLng: 'en',
//       supportedLngs: supportedLanguageKeys,
//       debug: process.env.NODE_ENV === 'development',

//       ns: ['common'],
//       defaultNS: 'common',

//       backend: {
//         loadPath: '/locales/{{lng}}/{{ns}}.json',
//       },

//       detection: {
//         order: ['cookie', 'localStorage', 'navigator'],
//         caches: ['cookie'],
//       },

//       react: {
//         useSuspense: true, // required for App Router
//       },
//     });
// }

// export default i18n;
// src/lib/i18n.js or src/lib/i18n.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import supportedLanguageKeys from '@/Content/SupportedLanguages';

if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: supportedLanguageKeys,
      ns: ['common'],
      defaultNS: 'common',
      debug: process.env.NODE_ENV === 'development',
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['cookie', 'localStorage', 'navigator'],
        caches: ['cookie'],
      },
      react: {
        useSuspense: false, // 👈 important for SSR with pages router
      },
    });
}

export default i18n;
