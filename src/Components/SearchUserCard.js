import React, { useEffect, useMemo, useState } from "react";
import { getAuthPubkeyFromNip05 } from "@/Helpers/Helpers";
import UserProfilePic from "@/Components/UserProfilePic";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

export default function SearchUserCard({ user, url, exit }) {
  const { t } = useTranslation();
  const userFollowings = useSelector((state) => state.userFollowings);
  const [verified, setVerified] = useState(false);
  const isFollowing = useMemo(() => {
    return userFollowings.includes(user.pubkey);
  }, [userFollowings]);

  useEffect(() => {
    const verifyUser = async () => {
      if (user.nip05 && typeof user.nip05 === "string") {
        let status = await getAuthPubkeyFromNip05(user.nip05);
        if (status === user.pubkey) setVerified(true);
        else setVerified(false);
      } else setVerified(false);
    };
    verifyUser();
  }, [user]);
  if (
    !(
      typeof user.nip05 === "string" &&
      typeof user.display_name === "string" &&
      typeof user.name === "string"
    )
  )
    return;
  if (!url)
    return (
      <div className="fx-scattered fit-container pointer search-bar-post">
        <div className="fx-centered">
          <UserProfilePic
            img={user.picture || ""}
            size={36}
            allowClick={false}
            user_id={user.pubkey}
          />
          <div className="fx-centered fx-start-h">
            <div
              className="fx-centered fx-col fx-start-v "
              style={{ rowGap: 0 }}
            >
              <div className="fx-centered">
                <p className={`p-one-line ${verified ? "c1-c" : ""}`}>
                  {user.display_name || user.name}
                </p>
                {verified && <div className="checkmark-c1"></div>}
                {isFollowing && (
                  <div className="sticker sticker-small sticker-gray-black">
                    {t("AOwS3ca")}
                  </div>
                )}
              </div>
              <p className={`${verified ? "" : "gray-c"} p-medium p-one-line`}>
                {user.nip05 ? user.nip05 : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  return (
    <Link
      href={`/profile/${url}`}
      className="fx-scattered box-pad-v-s box-pad-h-m fit-container pointer search-bar-post"
      onClick={(e) => {
        exit();
      }}
    >
      <div className="fx-centered">
        <UserProfilePic
          img={user.picture || ""}
          size={36}
          allowClick={false}
          user_id={user.pubkey}
        />
        <div className="fx-centered fx-start-h">
          <div className="fx-centered fx-col fx-start-v " style={{ rowGap: 0 }}>
            <div className="fx-centered">
              <p className={`p-one-line ${verified ? "c1-c" : ""}`}>
                {user.display_name || user.name}
              </p>
              {verified && <div className="checkmark-c1"></div>}
              {isFollowing && (
                <div className="sticker sticker-small sticker-gray-black">
                  {t("AOwS3ca")}
                </div>
              )}
            </div>
            <p className={`${verified ? "" : "gray-c"} p-medium p-one-line`}>
              {user.nip05 || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
