import dynamic from 'next/dynamic'
import React from 'react'
// import { serverSideTranslations } from "next-i18next/serverSideTranslations";
// import nextI18nextConfig from "../../next-i18next.config.js";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Home"), {
  ssr: false,
});

export default function index() {
  return (
   <ClientComponent />
  )
}

// export async function getServerSideProps({ locale }) {
//   return {
//     props: {
//       ...(await serverSideTranslations(
//         locale ?? "en",
//         ["common"],
//         nextI18nextConfig
//       )),
//     },
//   };
// }
