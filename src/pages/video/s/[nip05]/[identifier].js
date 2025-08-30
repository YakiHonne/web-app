// import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
// import nextI18nextConfig from "../../../next-i18next.config";
import { getSubData } from "@/Helpers/Controlers";
import dynamic from "next/dynamic";
import {
  getEmptyuserMetadata,
  getParsedAuthor,
} from "@/Helpers/Encryptions";
import HeadMetadata from "@/Components/HeadMetadata";
import { extractFirstImage } from "@/Helpers/ImageExtractor";
import { getAuthPubkeyFromNip05, getVideoContent } from "@/Helpers/Helpers";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Video"), {
  ssr: false,
});

export default function Page({ event, author }) {
  let parsedEvent = getVideoContent(event);
  let data = {
    title: parsedEvent.title || author?.display_name || author?.name,
    description:
      parsedEvent.description || parsedEvent.content.substring(0, 100),
    image:
      parsedEvent.image ||
      extractFirstImage(parsedEvent.content) ||
      author?.picture ||
      author?.banner,
    path: `video/${parsedEvent.naddr}`,
  };
  if (event)
    return (
      <div>
        <HeadMetadata data={data} />
        <ClientComponent event={parsedEvent} userProfile={author} />
      </div>
    );
}

export async function getStaticProps({ params }) {
  const { nip05, identifier } = params;
  let pubkey = await getAuthPubkeyFromNip05(decodeURIComponent(nip05));
  const res = await getSubData(
    [
      {
        authors: [pubkey],
        kinds: [34235, 34236, 21, 22],
        "#d": [decodeURIComponent(identifier)],
      },
    ],
    1000,
    undefined,
    undefined,
    1
  );
  let event = {
    ...res.data[0],
    sig: "si",
  };
  const author = await getSubData(
    [{ authors: [event.pubkey], kinds: [0] }],
    1000,
    undefined,
    undefined,
    1
  );
  return {
    props: {
      event: event,
      // ...(await serverSideTranslations(
      //   locale ?? "en",
      //   ["common"],
      //   nextI18nextConfig
      // )),
      author:
        author.data.length > 0
          ? getParsedAuthor(author.data[0])
          : getEmptyuserMetadata(event.pubkey),
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
