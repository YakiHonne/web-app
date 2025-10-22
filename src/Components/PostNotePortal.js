import React, { useState } from "react";
import PostAsNote from "./PostAsNote";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import UserProfilePic from "./UserProfilePic";

export default function PostNotePortal({ protectedRelay, label }) {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [showWriteNote, setShowWriteNote] = useState(false);

  return (
    <>
      {userKeys && !showWriteNote && (
        <div
          className="fit-container fx-centered fx-start-h  box-pad-h-m box-pad-v-m pointer"
          style={{
            overflow: "visible",
          }}
          onClick={() => setShowWriteNote(true)}
        >
          <UserProfilePic size={40} mainAccountUser={true} />
          <div className="sc-s-18 box-pad-h-s box-pad-v-s fit-container">
            <p className="gray-c p-big">{label || t("AGAXMQ3")}</p>
          </div>
        </div>
      )}

      {userKeys && showWriteNote && (
        <PostAsNote
          content={""}
          exit={() => setShowWriteNote(false)}
          protectedRelay={protectedRelay}
        />
      )}
    </>
  );
}
