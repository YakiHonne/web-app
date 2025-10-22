import React from "react";
import { getSubData } from "@/Helpers/Controlers";
import dynamic from "next/dynamic";
import {
  getEmptyuserMetadata,
  getParsedAuthor,
  getParsedRepEvent,
} from "@/Helpers/Encryptions";
import HeadMetadata from "@/Components/HeadMetadata";
import { extractFirstImage } from "@/Helpers/ImageExtractor";
import { getAuthPubkeyFromNip05 } from "@/Helpers/Helpers";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Article"), {
  ssr: false,
});

export default function Page({ event, author, naddrData, naddr }) {
  let parsedEvent = getParsedRepEvent(event);
  let data = {
    title:
      parsedEvent?.title || author?.display_name || author?.name || "Untitled",
    description:
      parsedEvent?.description || parsedEvent?.content?.substring(0, 100) || "",
    image:
      parsedEvent?.image ||
      extractFirstImage(parsedEvent?.content) ||
      author?.picture ||
      author?.banner,
    path: `article/${parsedEvent?.naddr || naddr}`,
  };
  // if (event)
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent
        event={parsedEvent}
        naddrData={naddrData}
        userProfile={author}
      />
    </div>
  );
}

export async function getStaticProps({ params }) {
  const { nip05, identifier } = params;
  let pubkey = await getAuthPubkeyFromNip05(decodeURIComponent(nip05));
  const res = pubkey
    ? await getSubData(
        [
          {
            authors: [pubkey],
            kinds: [30023],
            "#d": [decodeURIComponent(identifier)],
          },
        ],
        5000,
        undefined,
        undefined,
        1
      )
    : null;
  let event =
    pubkey && res?.data?.length > 0
      ? {
          ...res.data[0],
        }
      : null;
  const author = pubkey
    ? await getSubData(
        [{ authors: [pubkey], kinds: [0] }],
        1000,
        undefined,
        undefined,
        1
      )
    : getEmptyuserMetadata(pubkey);
  return {
    props: {
      event,
      naddrData: { pubkey, identifier, kind: 30023 },
      // naddrData: pubkey ? { pubkey, identifier, kind: 30023 } : null,
      naddr: `${nip05}/${identifier}`,
      author:
        author.data?.length > 0
          ? getParsedAuthor(author.data[0])
          : { ...author },
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
