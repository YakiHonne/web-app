import { shortenKey } from "@/Helpers/Encryptions";
import { copyText } from "@/Helpers/Helpers";
import { t } from "i18next";
import React, { useState } from "react";

export default function MintDetails({ mintInfo, exit }) {
  const [showAbout, setShowabout] = useState(false);
  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="box-pad-h-m box-pad-v sc-s bg-sp slide-up"
        style={{
          position: "relative",
          width: "min(100%,550px)",
          maxHeight: "80vh",
          overflow: "scroll",
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <div className="fx-centered fx-col">
          <div
            style={{
              backgroundImage: `url(${mintInfo.icon_url})`,
              minWidth: "60px",
              minHeight: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--pale-gray)",
            }}
            className="bg-img cover-bg"
          ></div>
          <div className="fx-centered fx-col box-pad-h" style={{ gap: 0 }}>
            <p className="p-caps p-centered p-big">{mintInfo.name}</p>
            <p
              className={`pointer gray-c p-centered ${
                showAbout ? "" : "p-six-lines"
              }`}
              onClick={() => setShowabout(!showAbout)}
            >
              {mintInfo.description_long || mintInfo.description}
            </p>
          </div>
          {mintInfo.contact?.length > 0 && (
            <>
              <div className="fit-container box-pad-v-m fx-centered box-pad-h">
                <hr />
                <p
                  className="gray-c p-bold"
                  style={{ minWidth: "max-content" }}
                >
                  {t("ADSorr1")}
                </p>
                <hr />
                <hr />
              </div>
              <div
                className="fit-container box-pad-h fx-centered fx-col"
                style={{ gap: "20px" }}
              >
                {mintInfo.contact.map((contact, index) => {
                  return (
                    <div className="fit-container fx-scattered" key={index}>
                      <div className="fx-centered">
                        {["x", "twitter"].includes(
                          contact.method.toLowerCase()
                        ) && <div className="twitter-w-logo-24"></div>}
                        {["email"].includes(contact.method.toLowerCase()) && (
                          <div className="env-24"></div>
                        )}
                        {["nostr"].includes(contact.method.toLowerCase()) && (
                          <div className="nostr-icon-24"></div>
                        )}
                        <p className="p-one-line">{contact.info}</p>
                      </div>
                      <div
                        className="copy pointer"
                        onClick={() => copyText(contact.info, t("AbzzoKP"))}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          <div className="fit-container box-pad-v-m fx-centered box-pad-h">
            <hr />
            <p className="gray-c p-bold" style={{ minWidth: "max-content" }}>
              {t("AoBHMdn")}
            </p>
            <hr />
            <hr />
          </div>
          <div className="fit-container box-pad-h fx-centered fx-col">
            <div className="fit-container fx-scattered">
              <p className="gray-c">URL</p>
              <div className="fx-centered">
                <p className="p-one-line">{mintInfo.url}</p>
                <div
                  className="copy pointer"
                  onClick={() => copyText(mintInfo.url, t("AxBmdge"))}
                ></div>
              </div>
            </div>
            <div className="fit-container fx-scattered">
              <p className="gray-c">Mint pubkey</p>
              <div className="fx-centered">
                <p className="p-one-line">{shortenKey(mintInfo.pubkey, 10)}</p>
                <div
                  className="copy pointer"
                  onClick={() => copyText(mintInfo.pubkey, t("AzSXXQm"))}
                ></div>
              </div>
            </div>
            <div className="fit-container fx-scattered">
              <p className="gray-c">{t("ARDY1XM")}</p>
              <p>{mintInfo.version}</p>
            </div>
            <div className="fit-container fx-scattered fx-start-v">
              <p className="gray-c">{t("AlY4mXg")}</p>
              <div className="fx-centered fx-wrap">
                {mintInfo.nuts[4].methods.map((_, index) => {
                  return (
                    <div
                      className="sticker sticker-normal sticker-green-side p-caps"
                      key={index}
                    >
                      {_.unit}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="fit-container fx-scattered fx-start-v">
              <p className="gray-c" style={{ minWidth: "100px" }}>
                NUTs
              </p>
              <div className="fx-centered fx-wrap fx-end-h">
                {Object.entries(mintInfo.nuts).map((_, index) => {
                  return (
                    <div
                      className="sticker sticker-normal sticker-orange-side p-caps"
                      key={index}
                    >
                      {_[0]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
