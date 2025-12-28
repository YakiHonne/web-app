import React from "react";
import { nip19 } from "nostr-tools";
import dynamic from "next/dynamic";
import {
  getEmptyuserMetadata,
  getParsedAuthor,
  getParsedMedia,
} from "@/Helpers/Encryptions";
import HeadMetadata from "@/Components/HeadMetadata";
import { getDataForSSG } from "@/Helpers/lib";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Image"), {
  ssr: false,
});

export default function Page({ event, author, nevent }) {
  let parsedEvent = getParsedMedia(event);
  let data = {
    title: parsedEvent?.description || author?.display_name || author?.name,
    description:
      parsedEvent?.description || author?.display_name || author?.name,
    image: parsedEvent?.url || author?.picture || author?.banner,
    path: `image/${parsedEvent?.nEvent || nevent}`,
  };
  // if (event)
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent
        event={parsedEvent}
        userProfile={author}
        nevent={nevent}
      />
    </div>
  );
}

export async function getStaticProps({ params }) {
  const { nevent } = params;
  let { pubkey, id, relays } = nip19.decode(nevent).data || {};
  const res = await getDataForSSG(
    [{ ids: [id] }],
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
