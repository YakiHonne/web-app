import React, { useEffect, useMemo } from "react";
import ArrowUp from "@/Components/ArrowUp";
import UserMetadata from "./UserMetadata";
import UserFeed from "./UserFeed";
import PagePlaceholder from "@/Components/PagePlaceholder";
import useUserProfile from "@/Hooks/useUsersProfile";
import { saveUsers } from "@/Helpers/DB";

export default function UserHome({ user: ssrUser }) {
  const isMissingMetadata = !!ssrUser.pubkey && ssrUser.created_at === 0;
  const { userProfile } = useUserProfile(
    isMissingMetadata ? ssrUser.pubkey : "",
    false,
  );
  const user = useMemo(() => {
    if (!isMissingMetadata || userProfile.empty) return ssrUser;
    if (userProfile.pubkey !== ssrUser.pubkey) return ssrUser;
    return {
      ...ssrUser,
      ...userProfile,
      followings: ssrUser.followings,
      pinned: ssrUser.pinned,
      nprofile: ssrUser.nprofile,
    };
  }, [ssrUser, userProfile, isMissingMetadata]);

  useEffect(() => {
    if (isMissingMetadata) saveUsers([ssrUser.pubkey]);
  }, [ssrUser.pubkey, isMissingMetadata]);

  return (
    <>
      <div>
        <ArrowUp />
        <div
          className="fx-centered fit-container  fx-start-v"
          style={{ gap: 0 }}
        >
          <div
            style={{
              zIndex: 11,
              position: "relative",
            }}
            className="main-middle"
          >
            {user.pubkey && (
              <>
                <UserMetadata user={user} />
                <div
                  className="fit-container fx-centered fx-col"
                  style={{ position: "relative" }}
                >
                  <UserFeed pubkey={user.pubkey} user={user} />
                </div>
              </>
            )}
            {!user.pubkey && <PagePlaceholder page="user-not-found" />}
          </div>
        </div>
      </div>
    </>
  );
}
