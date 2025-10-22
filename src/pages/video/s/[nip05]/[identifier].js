import React from "react";
import { getSubData } from "@/Helpers/Controlers";
import dynamic from "next/dynamic";
import { getEmptyuserMetadata, getParsedAuthor } from "@/Helpers/Encryptions";
import HeadMetadata from "@/Components/HeadMetadata";
import { extractFirstImage } from "@/Helpers/ImageExtractor";
import { getAuthPubkeyFromNip05, getVideoContent } from "@/Helpers/Helpers";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Video"), {
  ssr: false,
});

export default function Page({ event, author,  naddrData, naddr  }) {
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
        <ClientComponent event={parsedEvent} userProfile={author} naddrData={naddrData} />
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
            kinds: [34235, 34236],
            "#d": [decodeURIComponent(identifier)],
          },
        ],
        1000,
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
      event: event,
      naddrData: { pubkey, identifier, kind: [34235, 34236] },
      naddr: `${nip05}/${identifier}`,
      author:
        author?.data?.length > 0
          ? getParsedAuthor(author.data[0])
          : getEmptyuserMetadata(pubkey),
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
