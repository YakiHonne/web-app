import React from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { nip19 } from "nostr-tools";
import HeadMetadata from "@/Components/HeadMetadata";
import { getEmptyuserMetadata, getParsedAuthor } from "@/Helpers/Encryptions";
import { getDataForSSG } from "@/Helpers/lib";

const NotFoundComponent = dynamic(() => import("@/(PagesComponents)/404"), {
  ssr: false,
});

const UserHomeComponent = dynamic(
  () => import("@/(PagesComponents)/User/UserHome"),
  {
    ssr: false,
  },
);

const NOSTR_PREFIXES = [
  "naddr",
  "nevent",
  "note",
  "npub",
  "nprofile",
  "nsec",
];

const USERNAME_REGEX = /^[a-z0-9_-]{3,30}$/;

const isNostrSchema = (value) => {
  if (!value) return false;
  const trimmed = value.trim().replaceAll("nostr:", "");
  return NOSTR_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
};

export default function Page({ event, nprofile }) {
  if (!event) return <NotFoundComponent />;

  const data = {
    title: event.display_name || event.name,
    description: event.about || "N/A",
    image: event.picture || event.banner,
    path: `${nprofile}`,
  };

  return (
    <div>
      <HeadMetadata data={data} />
      <UserHomeComponent user={event} />
    </div>
  );
}

const resolveUsernameToPubkey = async (username) => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/username/${encodeURIComponent(username)}`,
      {
        headers: { "yakihonne-api-key": process.env.NEXT_PUBLIC_API_KEY },
        timeout: 5000,
      },
    );
    return data?.pubkey || null;
  } catch {
    return null;
  }
};

export async function getStaticProps({ params }) {
  const { nevent } = params;

  if (isNostrSchema(nevent)) {
    return { props: { event: null }, revalidate: 86400 };
  }

  const username = typeof nevent === "string" ? nevent.toLowerCase() : "";

  if (!USERNAME_REGEX.test(username)) {
    return { props: { event: null }, revalidate: 86400 };
  }

  const pubkey = await resolveUsernameToPubkey(username);

  if (!pubkey) {
    return { props: { event: null }, revalidate: 60 };
  }

  const [resMetaData, resFollowings, resPinned] = await Promise.all([
    getDataForSSG([{ authors: [pubkey], kinds: [0] }], 500, 3),
    getDataForSSG([{ authors: [pubkey], kinds: [3] }], 1000, 3),
    getDataForSSG([{ authors: [pubkey], kinds: [10001] }], 1000, 3),
  ]);

  let metadata = getEmptyuserMetadata(pubkey);
  let followings = [];

  const metadata_ =
    resMetaData.data.length > 0
      ? resMetaData.data.sort((a, b) => b.created_at - a.created_at)[0]
      : null;
  const followings_ =
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
        nprofile: nip19.nprofileEncode({ pubkey }),
      },
      nprofile: username,
    },
    revalidate: 86400,
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
