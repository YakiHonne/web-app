import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { Suspense } from "react";
import ReduxProvider from "@/Store/ReduxProvider";

export default function I18NProvider({ children }) {
  return (
    <ReduxProvider>
      <I18nextProvider i18n={i18n}>
        <Suspense>{children}</Suspense>
      </I18nextProvider>
    </ReduxProvider>
  );
}
