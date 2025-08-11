import React, { useState } from "react";
import { useSelector } from "react-redux";
import UserProfilePic from "@/Components/UserProfilePic";
import QRSharing from "@/Components/QRSharing";
import { useTranslation } from "react-i18next";
let bg = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/leaves-bg.svg";
let bg2 = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/dots-bg.png";

export default function ProfileShareSuggestionCards() {
  const { t } = useTranslation();
  const userMetadata = useSelector((state) => state.userMetadata);
  const userKeys = useSelector((state) => state.userKeys);
  const [showQR, setShowQR] = useState(false);
  if (!userKeys) return;

  return (
    <>
      {showQR && (
        <QRSharing user={userMetadata} exit={() => setShowQR(false)} />
      )}
      <div
        className="fit-container fx-centered box-pad-h box-pad-v-m"
        style={{ borderBottom: "1px solid var(--very-dim-gray)" }}
      >
        <div
          className="fit-container sc-s-18 fx-centered fx-col bg-img cover-bg"
          style={{
            gap: 0,
            backgroundImage: `url(${bg})`,
            position: "relative",
          }}
        >
          <div
            style={{
              backgroundImage: `url(${bg2})`,
              position: "absolute",
              left: 0,
              top: 0,
            }}
            className="fit-container fit-height bg-img cover-bg"
          ></div>
          <div
            className="box-pad-h box-pad-v fx-centered fx-col"
            style={{ position: "relative", zIndex: 1 }}
          >
            <UserProfilePic mainAccountUser={true} size={94} />
            <h4 className="box-pad-v-s">
              @{userMetadata.display_name || userMetadata.name}
            </h4>
            <p className="gray-c p-centered" style={{ maxWidth: "350px" }}>
              {t("AjLZOWy")}
            </p>
            <div className="fit-container box-pad-h">
              <button
                className="btn btn-normal btn-full"
                onClick={() => setShowQR(true)}
              >
                {t("AawXy2A")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
