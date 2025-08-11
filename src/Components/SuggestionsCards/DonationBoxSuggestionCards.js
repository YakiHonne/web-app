import React from "react";
import ZapTip from "@/Components/ZapTip";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
let bg = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/bolts-bg.svg";

export default function DonationBoxSuggestionCards({ padding = true }) {
  const userKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();
  if (!userKeys) return;

  return (
    <div
      className={`fit-container fx-centered ${
        padding ? "box-pad-h box-pad-v-m" : ""
      }`}
      style={{ borderBottom: padding ? "1px solid var(--very-dim-gray)" : "" }}
    >
      <div
        className="fit-container sc-s-18 fx-centered fx-col"
        style={{ gap: 0 }}
      >
        <div
          style={{
            backgroundImage: `url(${bg})`,
            backgroundPosition: "center bottom",
            height: "120px",
          }}
          className="fit-container bg-img cover-bg"
        ></div>
        <div className="box-pad-h box-marg-s fx-centered fx-col">
          <h4>{t("AjQoY5d")}</h4>
          <p className="gray-c p-centered" style={{ maxWidth: "400px" }}>
            {t("Alny3yt")}
          </p>

          <ZapTip
            recipientLNURL={process.env.REACT_APP_YAKI_LUD16}
            recipientPubkey={process.env.REACT_APP_YAKI_PUBKEY}
            senderPubkey={userKeys.pub}
            recipientInfo={{
              name: "Yakihonne",
              img: "https://yakihonne.s3.ap-east-1.amazonaws.com/media/icons/20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3/files/1691722198488-YAKIHONNES3.png",
            }}
            custom={{
              textColor: "",
              backgroundColor: "",
              content: t("A1lDFjz"),
            }}
            setReceivedEvent={() => null}
          />
        </div>
      </div>
    </div>
  );
}
