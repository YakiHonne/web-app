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
import { safeDecode } from "@/Helpers/ssgParams";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Curation"), {
  ssr: false,
});

export default function Page({ event, author }) {
  let parsedEvent = getParsedRepEvent(event);
  let data = {
    title: parsedEvent.title || author?.display_name || author?.name,
    description:
      parsedEvent.description || parsedEvent.content.substring(0, 100),
    image:
      parsedEvent.image ||
      extractFirstImage(parsedEvent.content) ||
      author?.picture ||
      author?.banner,
    path: `curation/${parsedEvent.naddr}`,
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
  const { naddr } = params;
  const decoded = safeDecode(naddr);
  if (!decoded || decoded.type !== "naddr")
    return { notFound: true, revalidate: 3600 };
  let { pubkey, identifier, kind, relays } = decoded.data || {};
  if (!pubkey || kind === undefined)
    return { notFound: true, revalidate: 3600 };
  const res = await getDataForSSG(
    [{ authors: [pubkey], kinds: [kind], "#d": [identifier] }],
    1000,
    1,
    relays || []
  );
  let event = {
    ...res.data[0],
  };
  const author = await getDataForSSG(
    [{ authors: [event.pubkey], kinds: [0] }],
    1000,
    1
  );
  return {
    props: {
      event: event,
      author:
        author.data.length > 0
          ? getParsedAuthor(author.data[0])
          : getEmptyuserMetadata(event.pubkey),
    },
    revalidate: event?.tags?.find((_) => _[0] === "nip63")
      ? 2
      : event?.id
        ? 604800
        : 3600,
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
