import React from "react";
import { useTranslation } from "react-i18next";
import RelayImage from "@/Components/RelayImage";
import { copyText } from "@/Helpers/Helpers";
import Link from "next/link";

export default function SharePackLink({ d, exit, type = 1 }) {
  const { t } = useTranslation();
  const types = {
    1: "s",
    2: "s",
    3: "m",
  };
  let fullURL = `${window.location.protocol}//${window.location.host}/pack/${
    types[type]
  }?d=${d}`;
  return (
    <div className="fixed-container fx-centered box-pad-h">
      <div
        className="sc-s bg-sp box-pad-h box-pad-v fx-centered fx-col fx-start-h slide-up"
        style={{ width: "min(100%, 400px)", position: "relative" }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4 className="box-pad-h-s">{t("A6enIP3")}</h4>
        <div className="fit-container fx-centered fx-col">
          <div
            className="sc-s-d fit-container fx-scattered box-pad-h-m box-pad-v-s pointer"
            style={{ borderRadius: "var(--border-r-18)" }}
            onClick={() => copyText(fullURL, "URL is copied")}
          >
            <div>
              <p className="p-two-lines">{fullURL}</p>
            </div>
            <div className="copy"></div>
          </div>
        </div>
        <Link href={fullURL} target="_blank" className="fit-container">
          <button className="btn btn-normal btn-full">{t("AER5KJi")}</button>
        </Link>
      </div>
    </div>
  );
}
