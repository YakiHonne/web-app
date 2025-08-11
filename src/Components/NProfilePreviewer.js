import React, { useEffect, useState } from "react";
import { nip19 } from "nostr-tools";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import Link from "next/link";
import { getUser } from "@/Helpers/Controlers";

export default function NProfilePreviewer({
  pubkey,
  margin = true,
  close = false,
  showSharing = true,
  onClose,
  setMetataData = () => null,
}) {
  const [author, setAuthor] = useState(getEmptyuserMetadata(pubkey));

  useEffect(() => {
    let last_created_at = 0;
    let user = getUser(pubkey);
    if (user) setAuthor(user);
    // const sub = ndkInstance.subscribe([{ kinds: [0], authors: [pubkey] }], {
    //   cacheUsage: "CACHE_FIRST",
    //   groupable: false,
    // });

    // sub.on("event", (event) => {
    //   console.log(event)
    //   if (event.created_at > last_created_at) {
    //     last_created_at = event.created_at;
    //     let content = JSON.parse(event.content);
    //     setMetataData(content);
    //     setAuthor({
    //       picture: content.picture || "",
    //       name:
    //         content.name || content.display_name || getBech32("npub", event.pubkey).substring(0, 10),
    //       display_name:
    //         content.display_name || content.name ||
    //         getBech32("npub", event.pubkey).substring(0, 10),
    //     });
    //     sub.stop();
    //   }
    // });

    // let timeout = setTimeout(() => {
    //   sub.stop();
    //   clearTimeout(timeout);
    // }, 4000);
    // return () => {
    //   sub.stop();
    // };
  }, []);

  return (
    <div
      className={`fit-container sc-s-18 bg-sp fx-scattered  box-pad-h-s box-pad-v-s ${
        margin ? "box-marg-s" : ""
      }`}
    >
      <div className="fx-centered" style={{ columnGap: "12px" }}>
        <UserProfilePic img={author.picture} size={40} user_id={pubkey} />
        <div>
          <p style={{ margin: 0 }}>{author.display_name || author.name}</p>
          <p style={{ margin: 0 }} className="p-medium gray-c">
            @{author.name || author.display_name}
          </p>
        </div>
      </div>
      {!close && showSharing && (
        <Link href={`/profile/${nip19.nprofileEncode({ pubkey })}`} target="_blank">
          <div className="share-icon-24"></div>
        </Link>
      )}
      {close && (
        <div className="close" style={{ position: "static" }} onClick={onClose}>
          <div></div>
        </div>
      )}
    </div>
  );
}
