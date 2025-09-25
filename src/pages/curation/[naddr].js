import React from "react";
import { getSubData } from "@/Helpers/Controlers";
import { nip19 } from "nostr-tools";
import dynamic from "next/dynamic";
import { getEmptyuserMetadata, getParsedAuthor, getParsedRepEvent } from "@/Helpers/Encryptions";
import HeadMetadata from "@/Components/HeadMetadata";
import { extractFirstImage } from "@/Helpers/ImageExtractor";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Curation"), {
  ssr: false,
});

export default function Page({ event, author }) {
    let parsedEvent = getParsedRepEvent(event)
  let data = {
    title: parsedEvent.title || author?.display_name || author?.name,
    description: parsedEvent.description || parsedEvent.content.substring(0, 100),
    image:
    parsedEvent.image || extractFirstImage(parsedEvent.content) || author?.picture || author?.banner,
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
  let { pubkey, identifier, kind } = nip19.decode(naddr).data || {};
  const res = await getSubData(
    [{ authors: [pubkey], kinds: [kind], "#d": [identifier] }],
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
