import React from "react";
import { getSubData } from "@/Helpers/Controlers";
import { nip19 } from "nostr-tools";
import dynamic from "next/dynamic";
import { getEmptyuserMetadata, getParsedAuthor } from "@/Helpers/Encryptions";
import HeadMetadata from "@/Components/HeadMetadata";
import { extractFirstImage } from "@/Helpers/ImageExtractor";

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
  let id = nip19.decode(nevent)?.data.id || nip19.decode(nevent)?.data;
  const res = await getSubData([{ ids: [id] }], 5000, undefined, undefined, 1);
  let event =
    res.data.length > 0
      ? {
          ...res.data[0],
        }
      : null;
  const author = event
    ? await getSubData(
        [{ authors: [event.pubkey], kinds: [0] }],
        1000,
        undefined,
        undefined,
        1
      )
    : getEmptyuserMetadata("");
  return {
    props: {
      event,
      nevent,
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
