import React from "react";
import dynamic from "next/dynamic";
import { getEmptyuserMetadata, getParsedAuthor } from "@/Helpers/Encryptions";
import HeadMetadata from "@/Components/HeadMetadata";
import { getAuthPubkeyFromNip05 } from "@/Helpers/Helpers";
import { nip19 } from "nostr-tools";
import { getDataForSSG, parseNip05 } from "@/Helpers/lib";
import { safeDecode, MAX_PARAM_LENGTH } from "@/Helpers/ssgParams";
import { bannedListSet } from "@/Content/BannedList";

const NotFoundComponent = dynamic(() => import("@/(PagesComponents)/404"), {
  ssr: false,
});

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/User/UserHome"),
  {
    ssr: false,
  },
);

export default function Page({ event, nprofile }) {
  if (event?.pubkey && bannedListSet.has(event.pubkey))
    return <NotFoundComponent />;
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
  if (bannedListSet.has(userId)) return { notFound: true, revalidate: 3600 };
  let pubkey = userId.includes("@")
    ? await parseNip05(userId)
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
  if (bannedListSet.has(pubkey)) return { notFound: true, revalidate: 3600 };
  const [resMetaData, resFollowings, resPinned] = await Promise.all([
    getDataForSSG([{ authors: [pubkey], kinds: [0] }], 500, 3),
    getDataForSSG([{ authors: [pubkey], kinds: [3] }], 1000, 3),
    getDataForSSG([{ authors: [pubkey], kinds: [10001] }], 1000, 3),
  ]);

  let metadata = getEmptyuserMetadata(pubkey);
  let followings = [];
  let metadata_ =
    resMetaData.data.length > 0
      ? resMetaData.data.sort((a, b) => b.created_at - a.created_at)[0]
      : null;
  let followings_ =
    resFollowings.data.length > 0
      ? resFollowings.data.sort((a, b) => b.created_at - a.created_at)[0]
      : null;
  let pinned_ =
    resPinned.data.length > 0
      ? resPinned.data.sort((a, b) => b.created_at - a.created_at)[0]
      : null;
  pinned_ = pinned_
    ? pinned_.tags.filter((_) => _[0] === "e").map((_) => _[1])
    : [];
  if (metadata_) metadata = getParsedAuthor(metadata_);
  if (followings_)
    followings = followings_.tags.filter((_) => _[0] === "p").map((_) => _[1]);

  return {
    props: {
      event: {
        ...metadata,
        followings,
        pinned: pinned_,
        nprofile: nip19.nprofileEncode({ pubkey: pubkey }),
      },
    },
    revalidate: metadata_ ? 86400 : 3600,
  };
}

const decodePubkey = (pubkey) => {
  if (typeof pubkey !== "string") return false;
  if (pubkey.length < 32 || pubkey.length > MAX_PARAM_LENGTH) return false;
  const decoded = safeDecode(pubkey);
  if (!decoded) return false;
  return decoded.data?.pubkey || decoded.data || false;
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
