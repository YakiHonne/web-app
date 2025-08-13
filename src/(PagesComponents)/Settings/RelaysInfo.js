import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { getUser } from "@/Helpers/Controlers";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import LoadingDots from "@/Components/LoadingDots";
import RelayImage from "@/Components/RelayImage";
import UserProfilePic from "@/Components/UserProfilePic";

export function RelaysInfo({ url, exit }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [relayInfo, setRelayInfo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const info = await axios.get(url.replace("wss", "https"), {
          headers: {
            Accept: "application/nostr+json",
          },
        });

        let owner = info.data.pubkey
          ? getUser(info.data.pubkey) || getEmptyuserMetadata(info.data.pubkey)
          : false;

        setRelayInfo({ ...info.data, owner });
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="fixed-container box-pad-h fx-centered">
      <div
        className="sc-s-18 bg-sp box-pad-h box-pad-v"
        style={{
          width: "min(100%,500px)",
          position: "relative",
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        {isLoading && (
          <div
            className="fx-centered fit-container"
            style={{ height: "300px" }}
          >
            <LoadingDots />
          </div>
        )}
        {!isLoading && (
          <div className="fx-centered fx-col">
            <div className="fit-container fx-centered">
              {!relayInfo.icon && <RelayImage url={url} size={64} />}
            </div>
            <h4>{relayInfo.name}</h4>
            <p className="gray-c p-centered">{relayInfo.description}</p>
            <div
              className="box-pad-v fit-container fx-centered fx-col"
              style={{
                borderTop: "1px solid var(--very-dim-gray)",
                borderBottom: "1px solid var(--very-dim-gray)",
              }}
            >
              <div className="fx-scattered fit-container">
                <p>{t("AD6LbxW")}</p>
                <div className="fx-centered">
                  {relayInfo.owner && (
                    <p>
                      {relayInfo.owner.display_name || relayInfo.owner.name}
                    </p>
                  )}
                  {!relayInfo.owner && <p>N/A</p>}
                  {relayInfo.owner && (
                    <UserProfilePic
                      img={relayInfo.owner.picture}
                      size={24}
                      mainAccountUser={false}
                      user_id={relayInfo.pubkey}
                    />
                  )}
                </div>
              </div>
              <hr />
              <div className="fx-scattered fit-container">
                <p style={{ minWidth: "max-content" }}>{t("ADSorr1")}</p>
                <p className="p-one-line">{relayInfo.contact || "N/A"}</p>
              </div>
              <hr />
              <div className="fx-scattered fit-container">
                <p>{t("AY2x8jS")}</p>
                <p>{relayInfo.software.split("/")[4]}</p>
              </div>
              <hr />
              <div className="fx-scattered fit-container">
                <p>{t("ARDY1XM")}</p>
                <p>{relayInfo.version}</p>
              </div>
              <hr />
            </div>
            <div className="box-pad-v-m fx-centered fx-col">
              <p className="gray-c p-centered p-medium box-marg-s">
                {t("AVabTbf")}
              </p>
              <div className="fx-centered fx-wrap ">
                {relayInfo.supported_nips.map((nip) => {
                  return (
                    <div key={nip} className="fx-centered round-icon">
                      {nip}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelaysInfo;
