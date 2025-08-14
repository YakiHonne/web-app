import React from "react";
import ArrowUp from "@/Components/ArrowUp";
import UserMetadata from "./UserMetadata";
import UserFeed from "./UserFeed";

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
            <UserMetadata user={user} />
            <div
              className="it-container fx-centered fx-col"
              style={{ position: "relative" }}
            >
              <UserFeed pubkey={user.pubkey} user={user} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
