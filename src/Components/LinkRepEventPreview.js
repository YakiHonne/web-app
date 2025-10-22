import React from "react";
import { getLinkFromAddr } from "@/Helpers/Helpers";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import DynamicIndicator from "@/Components/DynamicIndicator";
import UserProfilePic from "@/Components/UserProfilePic";
import MinimalPreviewWidget from "@/Components/SmartWidget/MinimalPreviewWidget";
import useUserProfile from "@/Hooks/useUsersProfile";
import Date_ from "./Date_";

export default function LinkRepEventPreview({ event, allowClick = true }) {
  const { isNip05Verified, userProfile } = useUserProfile(event.pubkey);
  let url = getLinkFromAddr(event.naddr || event.nEvent);

  const { t } = useTranslation();
  const onClick = (e) => {
    e.stopPropagation();
    if (allowClick) {
      if (isNip05Verified) {
        let nip05Url = `/${url.split("/")[1]}/s/${userProfile.nip05}/${
          event.d
        }`;
        customHistory(nip05Url);
      }
      if (!isNip05Verified) {
        customHistory(url);
      }
    }
  };

  if (event.kind === 1)
    return (
      <div
        className="sc-s-18 bg-sp fit-container pointer box-pad-h-m box-pad-v-m"
        style={{
          transition: ".2s ease-in-out",
          overflow: "visible",
          maxHeight: "120px",
        }}
        onClick={onClick}
      >
        <div className="fit-container fx-centered fx-start-h fx-start-v">
          <div>
            <UserProfilePic
              size={40}
              mainAccountUser={false}
              user_id={userProfile.pubkey}
              img={userProfile.picture}
            />
          </div>
          <div
            className={"fit-container fx-centered fx-start-h fx-start-v fx-col"}
            style={{ gap: "6px" }}
            onClick={onClick}
          >
            <div className="fx-scattered fit-container">
              <div className="fx-centered" style={{ gap: "3px" }}>
                <div className="fx-centered" style={{ gap: "3px" }}>
                  <p className="p-bold p-one-line">
                    {userProfile.display_name || userProfile.name}
                  </p>
                  {isNip05Verified && <div className="checkmark-c1"></div>}
                </div>
                <p className="gray-c p-medium">&#8226;</p>
                <p className="gray-c p-medium">
                  <Date_
                    toConvert={new Date(event.created_at * 1000)}
                    time={true}
                  />
                </p>
              </div>
              <div className="fx-centered">
                {event.isPaidNote && (
                  <div className="sticker sticker-c1">{t("AAg9D6c")}</div>
                )}
              </div>
            </div>

            <div className="fx-centered fx-col fit-container">
              <div className="fit-container" onClick={onClick} dir="auto">
                <div
                  className="p-two-lines"
                  style={{ wordBreak: "break-word" }}
                >
                  {event.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  // return <KindOne event={event} reactions={false} minimal={true} />;

  if (event.kind === 30031) return <MinimalPreviewWidget widget={event} />;
  return (
    <div
      className={`fit-container sc-s-18 bg-sp fx-centered fx-start-h fx-stretch ${
        allowClick ? "pointer" : ""
      }`}
      onClick={onClick}
    >
      <div
        className="bg-img cover-bg fx-centered"
        style={{
          backgroundImage: `url(${
            event.image || userProfile.picture || event.imagePP
          })`,
          minWidth: "150px",
          aspectRatio: "16/9",
        }}
      >
        {(event.kind === 34235 || event.kind === 21 || event.kind === 22) && (
          <div className="play-vid-58"></div>
        )}
      </div>
      <div
        className="fx-centered fx-col fx-start-h fx-start-v box-pad-h-m box-pad-v-m"
        style={{ gap: "0" }}
      >
        <DynamicIndicator item={event} />
        <p className="p-two-lines">{event.title || "Untitled"}</p>
        {/* <p className="gray-c p-one-line">
          {event.description || (
            <span className="p-italic">{t("AtZrjns")}</span>
          )}
        </p> */}
        <div className="box-pad-v-s"></div>
        <div className="fx-centered">
          <UserProfilePic
            size={20}
            user_id={event.pubkey}
            img={userProfile.picture}
          />
          <div className="fx-centered" style={{ gap: "3px" }}>
            <p className="p-one-line">
              {userProfile.display_name || userProfile.name}
            </p>
            {isNip05Verified && <div className="checkmark-c1"></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
