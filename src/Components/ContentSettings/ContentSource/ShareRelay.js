import React from "react";
import { useTranslation } from "react-i18next";
import RelayImage from "@/Components/RelayImage";
import { copyText } from "@/Helpers/Helpers";

export default function ShareRelay({ relay, exit, type = 1 }) {
    const { t } = useTranslation();
    const types = {
      1: "discover",
      2: "notes",
      3: "media",
    }
    let fullURL = `${window.location.protocol}//${window.location.host}/r/${
      types[type]
    }?r=${relay}`;
    return (
      <div className="fixed-container fx-centered box-pad-h">
        <div
          className="sc-s bg-sp box-pad-h box-pad-v fx-centered fx-col fx-start-h slide-up"
          style={{ width: "min(100%, 400px)", position: "relative" }}
        >
            <div className="close" onClick={exit}>
              <div></div>
            </div>
          <div className="fit-container fx-scattered">
            <div className="fx-centered fx-col">
              <RelayImage url={relay} size={40} />
              <p className="p-centered box-pad-h-m p-big">{relay}</p>
            </div>
          </div>
          <p className="c1-c box-pad-h-s">{t("A5DDopE")}</p>
          <div className="fit-container fx-centered fx-col">
            <div
              className="sc-s-d fit-container fx-scattered box-pad-h-m box-pad-v-s pointer"
              style={{ borderRadius: "var(--border-r-18)" }}
              onClick={() => copyText(fullURL, "URL is copied")}
            >
              <div>
                <p className="gray-c p-medium">{t("AhWzd8L")}</p>
                <p className="p-two-lines">{fullURL}</p>
              </div>
              <div className="copy"></div>
            </div>
            <div
              className="sc-s-d fit-container fx-scattered box-pad-h-m box-pad-v-s pointer"
              style={{ borderRadius: "var(--border-r-18)" }}
              onClick={() => copyText(relay, "URL is copied")}
            >
              <div>
                <p className="gray-c p-medium">{t("A6JlaiX")}</p>
                <p className="p-two-lines">{relay}</p>
              </div>
              <div className="copy"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  