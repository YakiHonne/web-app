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
}) {
  const [author, setAuthor] = useState(getEmptyuserMetadata(pubkey));

  useEffect(() => {
    let user = getUser(pubkey);
    if (user) setAuthor(user);
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
        <Link
          href={`/profile/${nip19.nprofileEncode({ pubkey })}`}
          target="_blank"
        >
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
