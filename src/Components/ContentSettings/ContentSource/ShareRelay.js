import React from "react";
import { useTranslation } from "react-i18next";
import RelayImage from "@/Components/RelayImage";
import { copyText } from "@/Helpers/Helpers";
import Link from "next/link";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";

export default function ShareRelay({ relay, exit, type = 1 }) {
  const { t } = useTranslation();

  let fullURL = `${window.location.protocol}//${window.location.host}/r/${"content"}?r=${relay}`;
  return (
    <Overlay exit={exit} width={400}>
      <div className="box-pad-h box-pad-v fx-centered fx-col fx-start-h">
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <div className="fit-container fx-centered">
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
            <Icon name="copy" />
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
            <Icon name="copy" />
          </div>
        </div>
        <Link href={fullURL} target="_blank" className="fit-container">
          <button className="btn btn-normal btn-full">{t("AlQx13z")}</button>
        </Link>
      </div>
    </Overlay>
  );
}
