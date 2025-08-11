import React, { useEffect, useState } from "react";
import { getLinkFromAddr } from "@/Helpers/Helpers";
import { customHistory } from "@/Helpers/History";
import KindOne from "@/Components/KindOne";
import { useTranslation } from "react-i18next";
import DynamicIndicator from "@/Components/DynamicIndicator";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import { useSelector } from "react-redux";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { getUser } from "@/Helpers/Controlers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import UserProfilePic from "@/Components/UserProfilePic";
import { saveUsers } from "@/Helpers/DB";
import MinimalPreviewWidget from "@/Components/SmartWidget/MinimalPreviewWidget";

export default function LinkRepEventPreview({ event, allowClick = true }) {
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  let url = getLinkFromAddr(event.naddr || event.nEvent);

  const { t } = useTranslation();
  const [user, setUser] = useState(getEmptyuserMetadata(event.pubkey));
  const [userFirstCheck, setUserFirstcheck] = useState(false);
  const [isNip05Verified, setIsNip05Verified] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let tempPubkey = event.pubkey;
        let auth = getUser(tempPubkey);

        if (auth) {
          setUser(auth);
          let ndkUser = new NDKUser({ pubkey: event.pubkey });
          ndkUser.ndk = ndkInstance;
          let checknip05 = auth.nip05
            ? await ndkUser.validateNip05(auth.nip05)
            : false;

          if (checknip05) setIsNip05Verified(true);
        } else if (!userFirstCheck) {
          saveUsers([event.pubkey]);
          setUserFirstcheck(true);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (event.kind !== 1) fetchData();
  }, [nostrAuthors]);

  const onClick = (e) => {
    e.stopPropagation();
    if (allowClick) {
      if (isNip05Verified) {
        let nip05Url = `/${url.split("/")[1]}/${user.nip05}/${event.d}`;
        customHistory(nip05Url);
      }
      if (!isNip05Verified) {
        customHistory(url);
      }
    }
  };

  if (event.kind === 1)
    return <KindOne event={event} reactions={false} minimal={true} />;

  if (event.kind === 30031) return <MinimalPreviewWidget widget={event} />;
  return (
    <div
      className={`fit-container sc-s-18 fx-centered fx-start-h fx-stretch ${
        allowClick ? "pointer" : ""
      }`}
      onClick={onClick}
    >
      <div
        className="bg-img cover-bg fx-centered"
        style={{
          backgroundImage: `url(${event.image || user.picture || event.imagePP})`,
          minWidth: "150px",
          aspectRatio: "16/9",
        }}
      >
        {event.kind === 34235 && <div className="play-vid-58"></div>}
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
          <UserProfilePic size={20} user_id={event.pubkey} img={user.picture} />
          <div className="fx-centered" style={{ gap: "3px" }}>
            <p className="p-one-line">{user.display_name || user.name}</p>
            {isNip05Verified && <div className="checkmark-c1"></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
