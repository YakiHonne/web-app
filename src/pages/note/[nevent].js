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

export default function Page({ event, author }) {
  let data = {
    title: author?.display_name || author?.name,
    description: event.content,
    image:
      extractFirstImage(event.content) || author?.picture || author?.banner,
    path: `note/${nip19.neventEncode({ id: event.id })}`,
  };
  if (event)
    return (
      <div>
        <HeadMetadata data={data} />
        <ClientComponent event={event} />
      </div>
    );
}

export async function getStaticProps({ params }) {
  const { nevent } = params;
  let id = nip19.decode(nevent)?.data.id || nip19.decode(nevent)?.data;
  const res = await getSubData([{ ids: [id] }], 1000, undefined, undefined, 1);
  let event = {
    ...res.data[0],
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
