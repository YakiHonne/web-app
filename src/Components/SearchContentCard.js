import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import { getUser } from "@/Helpers/Controlers";
import UserProfilePic from "@/Components/UserProfilePic";
import Date_ from "@/Components/Date_";
import Link from "next/link";
import DynamicIndicator from "@/Components/DynamicIndicator";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { getLinkFromAddr } from "@/Helpers/Helpers";
import { nEventEncode } from "@/Helpers/ClientHelpers";
import { useTranslation } from "react-i18next";

export default function SearchContentCard({ event, exit, userProfile = true }) {
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [user, setUser] = useState(getEmptyuserMetadata(event.pubkey));
  const [isNip05Verified, setIsNip05Verified] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchAuthor = async () => {
      let auth = await getUser(event.pubkey);
      if (auth) {
        setUser(auth);
        let ndkUser = new NDKUser({ pubkey: event.pubkey });
        ndkUser.ndk = ndkInstance;
        let checknip05 = auth.nip05
          ? await ndkUser.validateNip05(auth.nip05)
          : false;

        if (checknip05) setIsNip05Verified(true);
      }
    };
    fetchAuthor();
  }, [nostrAuthors]);

  if (event.kind === 1)
    return (
      <Link
        href={`/notes/${nEventEncode(event.id)}`}
        className="fx-centered fx-start-h box-pad-v-s box-pad-h-m fit-container pointer search-bar-post"
        onClick={(e) => {
          exit();
        }}
      >
        <UserProfilePic
          img={user.picture || ""}
          size={48}
          allowClick={false}
          user_id={user.pubkey}
        />
        <div
          className="fx-centered fx-col fx-start-h fx-start-v"
          style={{ gap: "4px" }}
        >
          <div className="fx-centered" style={{ gap: "3px" }}>
            <div className="fx-centered" style={{ gap: "3px" }}>
              <p className="p-medium">{user.display_name || user.name}</p>
              {isNip05Verified && <div className="checkmark-c1"></div>}
            </div>
            <p className="gray-c p-medium">
              <Date_ toConvert={new Date(event.created_at * 1000)} />
            </p>
          </div>
          <p className="p-one-line gray-c">{event.content}</p>
        </div>
      </Link>
    );
  return (
    <Link
      href={getLinkFromAddr(event.naddr)}
      className="fx-centered fx-start-h box-pad-v-s box-pad-h-m fit-container pointer search-bar-post"
      onClick={(e) => {
        exit();
      }}
    >
      <div style={{ position: "relative" }}>
        {!event.image && (
          <div
            className="round-icon"
            style={{ minWidth: "48px", aspectRatio: "1/1" }}
          >
            {[30004, 30003].includes(event.kind) && (
              <div className="curation-24"></div>
            )}
            {[30023].includes(event.kind) && <div className="posts-24"></div>}
            {[34235].includes(event.kind) && <div className="play-24"></div>}
            {[30031].includes(event.kind) && (
              <div className="smart-widget-24"></div>
            )}
          </div>
        )}
        {event.image && (
          <div
            className="sc-s-18 bg-img cover-bg"
            style={{
              backgroundImage: `url(${event.image})`,
              minWidth: "48px",
              aspectRatio: "1/1",
            }}
          ></div>
        )}
        {userProfile && (
          <div
            className="round-icon"
            style={{
              position: "absolute",
              right: "-5px",
              bottom: "-5px",
              backgroundColor: "var(--white)",
              border: "none",
              minWidth: "24px",
              aspectRatio: "1/1",
            }}
          >
            <UserProfilePic
              img={user.picture || ""}
              size={20}
              allowClick={false}
              user_id={user.pubkey}
            />
          </div>
        )}
      </div>
      <div
        className="fx-centered fx-col fx-start-h fx-start-v"
        style={{ gap: "4px" }}
      >
        <div className="fx-centered" style={{ gap: "3px" }}>
          <div className="fx-centered" style={{ gap: "3px" }}>
            <p className="p-medium">{user.display_name || user.name}</p>
            {isNip05Verified && <div className="checkmark-c1"></div>}
          </div>
          <p className="p-medium gray-c">|</p>
          <DynamicIndicator item={event} />
        </div>
        <p className="p-one-line">
          {event.title || (
            <span className="p-italic gray-c">{t("AMvUjqZ")}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
