import React from "react";
import ArrowUp from "@/Components/ArrowUp";
import UserMetadata from "./UserMetadata";
import UserFeed from "./UserFeed";
import PagePlaceholder from "@/Components/PagePlaceholder";

export default function UserHome({ user }) {
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
              zIndex: "11",
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
