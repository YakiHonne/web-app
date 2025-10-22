import React from "react";
import { getSubData } from "@/Helpers/Controlers";
import dynamic from "next/dynamic";
import { getEmptyuserMetadata, getParsedAuthor } from "@/Helpers/Encryptions";
import HeadMetadata from "@/Components/HeadMetadata";
import { getAuthPubkeyFromNip05 } from "@/Helpers/Helpers";
import { nip19 } from "nostr-tools";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/User/UserHome"),
  {
    ssr: false,
  }
);

export default function Page({ event, nprofile }) {
  let data = {
    title: event?.display_name || event?.name,
    description: event.about || "N/A",
    image: event?.picture || event?.banner,
    path: `profile/${nprofile}`,
  };

  if (event)
    return (
      <div>
        <HeadMetadata data={data} />
        <ClientComponent user={event} />
      </div>
    );
}

export async function getStaticProps({ locale, params }) {
  const { userId } = params;
  let pubkey = userId.includes("@")
    ? await getAuthPubkeyFromNip05(userId)
    : decodePubkey(userId);
  if (pubkey) {
    pubkey =
      pubkey.startsWith("npub") || pubkey.startsWith("nprofile")
        ? decodePubkey(pubkey)
        : pubkey;
  }
  if (!pubkey) {
    return {
      props: {
        event: {
          ...getEmptyuserMetadata(""),
          followings: [],
          nprofile: userId,
        },
      },
    };
  }
  const [resMetaData, resFollowings] = await Promise.all([
    getSubData([{ authors: [pubkey], kinds: [0] }], 400),
    getSubData([{ authors: [pubkey], kinds: [3] }], 50),
  ]);
  let metadata = getEmptyuserMetadata(pubkey);
  let followings = [];

  let metadata_ = resMetaData.data.find((_) => _.kind === 0);
  let followings_ = resFollowings.data.find((_) => _.kind === 3);

  if (metadata_) metadata = getParsedAuthor(metadata_);
  if (followings_)
    followings = followings_.tags.filter((_) => _[0] === "p").map((_) => _[1]);

  return {
    props: {
      event: {
        ...metadata,
        followings,
        nprofile: nip19.nprofileEncode({ pubkey: pubkey }),
      },
    },
  };
}

const decodePubkey = (pubkey) => {
  try {
    let hexPubkey =
      nip19.decode(pubkey).data.pubkey || nip19.decode(pubkey).data;
    return hexPubkey;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
