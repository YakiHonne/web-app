import React from "react";
import { useTranslation } from "react-i18next";
import { getBech32, downloadAsFile, shortenKey } from "../../Helpers/Encryptions";
import { copyText } from "../../Helpers/Helpers";

export function KeysManagement({ selectedTab, setSelectedTab, userKeys }) {
  const { t } = useTranslation();
  const exportKeys = () => {
    let keys = {
      sec: userKeys.sec ? getBech32("nsec", userKeys.sec) : "N/A",
      pub: getBech32("npub", userKeys.pub),
    };
    let toSave = [
      "Important: Store this information securely. If you lose it, recovery may not be possible. Keep it private and protected at all times",
      "---",
      "Account credentials",
      `Private key: ${keys.sec}`,
      `Public key: ${keys.pub}`,
    ];

    downloadAsFile(
      toSave.join("\n"),
      "text/plain",
      "account-credentials.txt",
      t("AdoWp0E")
    );
  };
  return (
    <div
    className={`fit-container fx-scattered fx-col pointer ${selectedTab === "keys" ? "sc-s box-pad-h-s box-pad-v-s" : ""}`}
      style={{
        borderBottom: "1px solid var(--very-dim-gray)",
        gap: 0,
        borderColor: "var(--very-dim-gray)",
        transition: "0.2s ease-in-out",
      }}
    >
      <div
        className="fx-scattered fit-container  box-pad-h-m box-pad-v-m "
        onClick={() =>
          selectedTab === "keys" ? setSelectedTab("") : setSelectedTab("keys")
        }
      >
        <div className="fx-centered fx-start-h fx-start-v">
          <div className="box-pad-v-s">
            <div className="key-icon-24"></div>
          </div>
          <div>
            <p>{t("Adl0miS")}</p>
            <p className="p-medium gray-c">{t("AXq8Vb3")}</p>
          </div>
        </div>
        <div className="arrow"></div>
      </div>

      {selectedTab === "keys" && (
        <div className="fit-container fx-col fx-centered fx-start-v box-pad-h-m box-pad-v-m ">
          <div>
            <p className="c1-c p-left fit-container">{t("Az0mazr")}</p>
            <p className="p-medium gray-c">{t("AnQpdZ9")}</p>
          </div>
          <div
            className={`fx-scattered if pointer fit-container ${
              userKeys.sec ? "dashed-onH" : "if-disabled"
            }`}
            style={{ borderStyle: "dashed" }}
            onClick={() =>
              userKeys.sec
                ? copyText(getBech32("nsec", userKeys.sec), t("AStACDI"))
                : null
            }
          >
            <p>
              {userKeys.sec ? (
                shortenKey(getBech32("nsec", userKeys.sec))
              ) : (
                <span className="italic-txt gray-c">
                  {userKeys.ext ? t("ApmycvH") : t("Au372KY")}
                </span>
              )}
            </p>
            {userKeys.sec && <div className="copy-24"></div>}
          </div>
          <div>
            <p className="c1-c p-left fit-container">{t("AZRwERj")}</p>
            <p className="p-medium gray-c">{t("A9pRbqh")}</p>
          </div>
          <div
            className="fx-scattered if pointer dashed-onH fit-container"
            style={{ borderStyle: "dashed" }}
            onClick={() =>
              copyText(getBech32("npub", userKeys.pub), t("AzSXXQm"))
            }
          >
            <p>{shortenKey(getBech32("npub", userKeys.pub))}</p>
            <div className="copy-24"></div>
          </div>
          <div className="fit-container fx-end-h" onClick={exportKeys}>
            <div className="fx-centered">
              <p className="btn-text-gray">{t("ADv1bgl")}</p>
              <div className="export"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeysManagement;
