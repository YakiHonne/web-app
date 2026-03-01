import React from "react";
import useUsersProfile from "@/Hooks/useUsersProfile";
import Follow from "@/Components/Follow";
import UserProfilePic from "@/Components/UserProfilePic";

export default function UserToFllow({ pubkey }) {
  const { userProfile } = useUsersProfile(pubkey);
  return (
    <div className="fit-container fx-scattered">
      <div className="fx-centered">
        <div>
          <UserProfilePic pubkey={pubkey} img={userProfile.picture} size={20} />
        </div>
        <div>
          <p>{userProfile.display_name || userProfile.name}</p>
        </div>
      </div>
      <Follow toFollowKey={pubkey} />
    </div>
  );
}
