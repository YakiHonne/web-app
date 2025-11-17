import React from "react";
import { nip19 } from "nostr-tools";
import dynamic from "next/dynamic";
import {
  getEmptyuserMetadata,
  getParsedAuthor,
  getParsedRepEvent,
} from "@/Helpers/Encryptions";
import HeadMetadata from "@/Components/HeadMetadata";
import { extractFirstImage } from "@/Helpers/ImageExtractor";
import { getDataForSSG } from "@/Helpers/lib";

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
    path: `article/${naddr}`,
  };
  // if (event)
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent
        event={parsedEvent}
        userProfile={author}
        naddrData={naddrData}
      />
    </div>
  );
}

export async function getStaticProps({ params }) {
  const { naddr } = params;
  let { pubkey, identifier, kind, relays } = nip19.decode(naddr).data || {};
  const res = await getDataForSSG(
    [{ authors: [pubkey], kinds: [kind], "#d": [identifier] }],
    5000,
    1,
    relays || []
  );
  let event =
    res.data.length > 0
      ? {
          ...res.data[0],
        }
      : null;
  const author = event
    ? await getDataForSSG([{ authors: [pubkey], kinds: [0] }], 1000, 1)
    : getEmptyuserMetadata(pubkey);
  return {
    props: {
      event,
      naddrData: { pubkey, identifier, kind, relays: relays || [] },
      naddr,
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
