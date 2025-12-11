import React from "react";
import ArrowUp from "@/Components/ArrowUp";
import NotificationCenterMain from "@/Components/NotificationCenterMain";
import { useSelector } from "react-redux";
import PagePlaceholder from "@/Components/PagePlaceholder";

export default function Notification() {
  const userKeys = useSelector((state) => state.userKeys);
  return (
    <div >
      <ArrowUp />
      <div className="fit-container fx-centered fx-start-h fx-start-v">
        <div
          className="fit-container fx-centered fx-start-v "
          style={{ gap: 0 }}
        >
          <div
            style={{ gap: 0 }}
            className={`fx-centered  fx-wrap fit-container`}
          >
            {userKeys && <NotificationCenterMain />}
            {!userKeys && <PagePlaceholder page={"nostr-not-connected"} />}
          </div>
        </div>
      </div>
    </div>
  );
}
