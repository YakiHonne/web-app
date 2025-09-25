import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

import { supportedLanguageKeys } from "@/Content/SupportedLanguages";

if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "en",
      supportedLngs: supportedLanguageKeys,
      ns: ["common"],
      defaultNS: "common",
      debug: process.env.NODE_ENV === "development",
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json",
      },
      detection: {
        order: ["cookie", "localStorage", "navigator"],
        caches: ["cookie"],
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
