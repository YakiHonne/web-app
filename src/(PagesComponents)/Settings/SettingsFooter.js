import ZapTip from "@/Components/ZapTip";
import React from "react";
import { useTranslation } from "react-i18next";


export function SettingsFooter({ userKeys }) {
  const { t } = useTranslation();
  return (
    <div
      className="fit-container fx-centered fx-col"
      style={{ height: "350px" }}
    >
      <div className="yakihonne-logo-128"></div>
      <p className="p-centered gray-c" style={{ maxWidth: "400px" }}>
        {t("AFZ1jAD")}
      </p>
      <p className="c1-c">v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
      <div className="fx-centered">
        <ZapTip
          recipientLNURL={process.env.NEXT_PUBLIC_YAKI_LUD16}
          recipientPubkey={process.env.NEXT_PUBLIC_YAKI_PUBKEY}
          senderPubkey={userKeys.pub}
          recipientInfo={{
            name: "Yakihonne",
            picture:
              "https://yakihonne.s3.ap-east-1.amazonaws.com/media/icons-mono/20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3/files/1691722198488-YAKIHONNES3.png",
          }}
        />
        <a href="mailto:info@yakihonne.com">
          <div
            className="round-icon round-icon-tooltip"
            data-tooltip={t("AheSXrs")}
          >
            <div className="env"></div>
          </div>
        </a>
        <a
          href="https://github.com/orgs/YakiHonne/repositories"
          target="_blank"
        >
          <div
            className="round-icon round-icon-tooltip"
            data-tooltip={"Github repos"}
          >
            <div className="github-logo"></div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default SettingsFooter;
