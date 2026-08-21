import React from "react";
import { nip19 } from "nostr-tools";
import dynamic from "next/dynamic";
import { getEmptyuserMetadata, getParsedAuthor } from "@/Helpers/Encryptions";
import HeadMetadata from "@/Components/HeadMetadata";
import { extractFirstImage } from "@/Helpers/ImageExtractor";
import { getVideoContent } from "@/Helpers/Helpers";
import { getDataForSSG } from "@/Helpers/lib";
import { safeDecode } from "@/Helpers/ssgParams";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Video"), {
  ssr: false,
});

export default function Page({ event, author, naddrData, naddr }) {
  let parsedEvent = getVideoContent(event);
  let data = {
    title: parsedEvent?.title || author?.display_name || author?.name,
    description:
      parsedEvent?.description || parsedEvent?.content?.substring(0, 100),
    image:
      parsedEvent?.image ||
      extractFirstImage(parsedEvent?.content) ||
      author?.picture ||
      author?.banner,
    path: `video/${parsedEvent?.naddr || naddr}`,
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
  const decoded = safeDecode(naddr);
  if (!decoded || !["naddr", "nevent", "note"].includes(decoded.type))
    return { notFound: true, revalidate: 3600 };
  let { pubkey, identifier, kind, id, relays } =
    decoded.type === "note" ? { id: decoded.data } : decoded.data || {};
  if (!identifier && !id) return { notFound: true, revalidate: 3600 };
  const res = await getDataForSSG(
    identifier
      ? [{ authors: [pubkey], kinds: [kind], "#d": [identifier] }]
      : [{ ids: [id] }],
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
    ? await getDataForSSG([{ authors: [event.pubkey], kinds: [0] }], 1000, 1)
    : getEmptyuserMetadata(pubkey);
  return {
    props: {
      event,
      naddrData: {
        pubkey: pubkey || false,
        identifier: identifier || false,
        kind: kind || false,
        id: id || false,
        relays: relays || [],
      },
      naddr,
      author:
        author.data?.length > 0
          ? getParsedAuthor(author.data[0])
          : { ...author },
    },
    revalidate: event?.tags?.find((_) => _[0] === "nip63")
      ? 2
      : event
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
