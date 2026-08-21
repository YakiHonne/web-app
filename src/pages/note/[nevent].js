import React from "react";
import { nip19 } from "nostr-tools";
import dynamic from "next/dynamic";
import { getEmptyuserMetadata, getParsedAuthor } from "@/Helpers/Encryptions";
import HeadMetadata from "@/Components/HeadMetadata";
import { extractFirstImage } from "@/Helpers/ImageExtractor";
import { getDataForSSG } from "@/Helpers/lib";
import { safeDecode } from "@/Helpers/ssgParams";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Note"), {
  ssr: false,
});

export default function Page({ event, author, nevent }) {
  let data = {
    title: author?.display_name || author?.name,
    description: event?.content || "Note not found",
    image:
      extractFirstImage(event?.content) || author?.picture || author?.banner,
    path: `note/${nevent}`,
  };
  // if (event)
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent event={event} nevent={nevent} />
    </div>
  );
}

export async function getStaticProps({ params }) {
  const { nevent } = params;
  const decoded = safeDecode(nevent);
  if (!decoded || !["nevent", "note"].includes(decoded.type))
    return { notFound: true, revalidate: 3600 };
  let id = decoded.type === "note" ? decoded.data : decoded.data?.id;
  if (!id) return { notFound: true, revalidate: 3600 };
  let relays = decoded.type === "nevent" ? decoded.data?.relays || [] : [];
  const res = await getDataForSSG(
    [{ ids: [id] }],
    1000,
    1,
    relays
  );
  let event =
    res.data.length > 0
      ? {
        ...res.data[0],
      }
      : null;
  const author = event
    ? await getDataForSSG([{ authors: [event.pubkey], kinds: [0] }], 1000, 1)
    : getEmptyuserMetadata("");
  const isPremium = event && event?.tags.find(_ => _[0] === 'nip63') ? true : false;
  return {
    props: {
      event,
      nevent,
      author:
        author.data?.length > 0
          ? getParsedAuthor(author.data[0])
          : { ...author },
    },
    revalidate: isPremium ? 2 : event ? 604800 : 3600,
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
