import React, { useState } from "react";
import RelayImage from "@/Components/RelayImage";
import { useTranslation } from "react-i18next";
import useRelaysMetadata from "@/Hooks/useRelaysMetadata";
import useRelaysStats from "@/Hooks/useRelayStats";
import UsersGroupProfilePicture from "@/Components/UsersGroupProfilePicture";
import RelayMetadataPreview from "@/Components/RelayMetadataPreview";
import { copyText } from "@/Helpers/Helpers";
import { customHistory } from "@/Helpers/History";
import RelayStatus from "./RelayStatus";
import RelayRtt from "./RelayRtt";
import AddToFavList from "./AddToFavList";
import useCloseContainer from "@/Hooks/useCloseContainer";

export default function RelayPreview({
  url,
  favoredList = [],
  addToFavList = false,
}) {
  const { t } = useTranslation();
  const { relayMetadata } = useRelaysMetadata(url);
  const { relayStats } = useRelaysStats(url);
  // const [showPreview, setShowPreview] = useState(false);
  const { containerRef, open, setOpen } = useCloseContainer();
  return (
    <div
      className="fit-container fx-scattered fx-col box-pad-h-m box-pad-v-m sc-s-18 bg-sp pointer"
      style={{ overflow: "visible" }}
      onClick={() => {
        setOpen(!open);
      }}
      ref={containerRef}
    >
      <div className="fit-container fx-scattered">
        <div className="fx-centered">
          <RelayImage url={relayMetadata.url} size={58} />
          <div>
            <p className="p-maj">{relayMetadata.name}</p>

            <p
              className="gray-c p-one-line slide-left"
              style={{ display: open ? "none" : "block" }}
            >
              {relayMetadata.description}
            </p>

            {open && (
              <div
                className="fx-centered slide-right fx-start-h"
                style={{ gap: "5px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  copyText(relayMetadata.url, t("AxBmdge"));
                }}
              >
                <p className="c1-c p-one-line ">{relayMetadata.url}</p>
                <div className="copy"></div>
              </div>
            )}
          </div>
        </div>
        <div
          className="box-pad-h-s fx-centered"
          style={{ gap: "16px", minWidth: "max-content" }}
        >
          {!addToFavList && (
            <>
              <RelayStatus status={relayStats.monitor.rttOpen} />
              <div
                className="round-icon-tooltip"
                data-tooltip={t("AlQx13z")}
                onClick={(e) => {
                  e.stopPropagation();
                  customHistory("/r/notes?r=" + url);
                }}
              >
                <div className="share-icon"></div>
              </div>
            </>
          )}
          {addToFavList && <AddToFavList url={url} />}
          <div className="arrow"></div>
        </div>
      </div>
      {open && <RelayMetadataPreview metadata={relayMetadata} />}
      {(relayStats.followings.pubkeys.length > 0 ||
        relayStats.monitor.rttOpen ||
        favoredList.length > 0) && (
        <>
          <hr style={{ margin: ".5rem 0" }} />
          <div className="fit-container fx-scattered slide-up">
            <div className="fx-centered" style={{ gap: "0" }}>
              <div
                className="fx-centered round-icon-tooltip"
                data-tooltip={t("A9TqNxQ")}
              >
                {relayStats.followings.pubkeys.length > 0 && (
                  <>
                    <p className="gray-c p-medium p-maj">{t("A0eIk2z")}</p>
                    <p>
                      {relayStats.followings.pubkeys.length > 1000
                        ? "+1k"
                        : relayStats.followings.pubkeys.length}
                    </p>
                    <UsersGroupProfilePicture
                      pubkeys={relayStats.followings.pubkeys}
                      number={3}
                      imgSize={20}
                    />
                  </>
                )}
                {relayStats.followings.pubkeys.length === 0 && (
                  <p className="gray-c p-medium p-maj">{t("A0dZ5MX")}</p>
                )}
              </div>
              {favoredList.length > 0 && (
                <>
                  <p className="gray-c box-pad-h-s">|</p>
                  <div
                    className="fx-centered round-icon-tooltip"
                    data-tooltip={t("AFfSn3R")}
                  >
                    <p className="gray-c p-medium p-maj">{t("AFfSn3R")}</p>
                    <p>
                      {favoredList.length > 1000 ? "+1k" : favoredList.length}
                    </p>
                    <UsersGroupProfilePicture
                      pubkeys={favoredList}
                      number={3}
                      imgSize={20}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="fx-centered " style={{ gap: "26px" }}>
              {(relayStats.monitor.isAuthRequired ||
                relayMetadata.limitation?.auth_required) && (
                <div
                  className="round-icon-small round-icon-tooltip"
                  data-tooltip={t("AuCcYnT")}
                >
                  <div className="protected-2"></div>
                </div>
              )}
              {(relayStats.monitor.isPaymentRequired ||
                relayMetadata.limitation?.payment_required) && (
                <div
                  className="round-icon-small round-icon-tooltip"
                  data-tooltip={t("AAg9D6c")}
                >
                  <p>₿</p>
                </div>
              )}
              <RelayRtt rtt={relayStats.monitor.rttOpen} />
              {relayStats.monitor.countryFlag && (
                <div
                  className="fx-centered round-icon-tooltip"
                  data-tooltip={t("ACWLa4B")}
                >
                  <p>{relayStats.monitor.countryFlag}</p>
                  <p className="p-medium">{relayStats.monitor.countryCode}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
