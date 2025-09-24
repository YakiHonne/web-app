import useUserProfile from "@/Hooks/useUsersProfile";
import React from "react";
import UserProfilePic from "./UserProfilePic";

export default function UsersGroupProfilePicture({
  pubkeys,
  number = 3,
  imgSize,
}) {
  let users = pubkeys.slice(0, number);
  return (
    <div className="fx-centered" style={{ position: "relative" }}>
      {users.map((user, index) => {
        return (
          <div
            key={user}
            style={{
              marginLeft: index > 0 ? "-15px" : "0",
              zIndex: users.length - index,
              position: "relative",
            }}
          >
            <UserCard pubkey={user} imgSize={imgSize} />
          </div>
        );
      })}
    </div>
  );
}

const UserCard = ({ pubkey, imgSize = 30 }) => {
  const { userProfile } = useUserProfile(pubkey, false);
  return (
    <UserProfilePic
      size={imgSize}
      mainAccountUser={false}
      user_id={pubkey}
      img={userProfile?.picture}
      allowClick={false}
      allowPropagation={true}
    />
  );
};
