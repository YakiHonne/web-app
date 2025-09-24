import useUserProfile from "@/Hooks/useUsersProfile";
import React from "react";
import { useTranslation } from "react-i18next";
import UserProfilePic from "./UserProfilePic";

export default function RelayMetadataPreview({ metadata }) {
  const { userProfile } = useUserProfile(metadata?.pubkey);
  const { t } = useTranslation();

  return (
    <div
      className="fit-container fx-centered fx-start-v fx-col slide-up"
      onClick={(e) => e.stopPropagation()}
    >
      <hr />
      <p className="gray-c">{metadata.description}</p>
      <hr />
      <div className="box-pad-v-s fit-container fx-centered fx-col">
        <div className="fx-scattered fit-container">
          <p>{t("AD6LbxW")}</p>
          <div className="fx-centered">
            {userProfile && (
              <p>{userProfile.display_name || userProfile.name}</p>
            )}
            {!userProfile && <p>N/A</p>}
            {userProfile && (
              <UserProfilePic
                img={userProfile.picture}
                size={24}
                mainAccountUser={false}
                user_id={metadata.pubkey}
              />
            )}
          </div>
        </div>
        <hr />
        <div className="fx-scattered fit-container">
          <p style={{ minWidth: "max-content" }}>{t("ADSorr1")}</p>
          <p className="p-one-line">{metadata.contact || "N/A"}</p>
        </div>
        <hr />
        <div className="fx-scattered fit-container">
          <p>{t("AY2x8jS")}</p>
          <p>{metadata.software.split("/")[4]}</p>
        </div>
        <hr />
        <div className="fx-scattered fit-container">
          <p>{t("ARDY1XM")}</p>
          <p>{metadata.version}</p>
        </div>
        <hr />
      </div>
      <hr />
      <div className="fit-container fx-scattered fx-start-v">
        <p
          className="gray-c p-medium box-pad-v-s"
          style={{ minWidth: "max-content" }}
        >
          {t("AVabTbf")}
        </p>
        <div className="fx-centered fx-end-h fx-wrap ">
          {Array.isArray(metadata.supported_nips) ? (
            metadata.supported_nips?.map((nip) => {
              return (
                <div key={nip} className="fx-centered round-icon-small">
                  <p className="p-medium gray-c">{nip}</p>
                </div>
              );
            })
          ) : (
            <div className="fx-centered round-icon-small">
              <p className="p-medium gray-c">{metadata.supported_nips}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
