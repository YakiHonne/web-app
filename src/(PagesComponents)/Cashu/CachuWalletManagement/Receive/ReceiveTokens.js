import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ECash from "./ECash";
import Lightning from "./Lightning";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";

export default function ReceiveTokens({ exit }) {
  const { t } = useTranslation();
  const [method, setMethod] = useState("");

  return (
    <Overlay exit={exit} width={650}>
      <div>
        <div
          className="box-pad-h box-pad-v fx-centered fx-col fx-start-h fx-start-v"
          style={{
            gap: "24px",
          }}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <h4>{t("A8SflFr")}</h4>
          {!method && (
            <div className="fit-container fx-centered fx-col">
              <div
                className="fit-container fx-centered fx-start-h box-pad-v-m box-pad-h-m sc-s-18 bg-sp option"
                onClick={() => {
                  setMethod("ecash");
                }}
              >
                <div
                  className="fx-centered"
                  style={{
                    minWidth: "48px",
                    minHeight: "48px",
                    backgroundColor: "var(--c1-side)",
                    borderRadius: "50%",
                  }}
                >
                  <Icon name="redeem-ecash" size={24} />
                </div>
                <div>
                  <p>{t("AUmPqw7")}</p>
                  <p className="gray-c p-medium">{t("ARxFLeL")}</p>
                </div>
              </div>
              <div
                className="fit-container fx-centered fx-start-h box-pad-v-m box-pad-h-m sc-s-18 bg-sp option"
                onClick={() => {
                  setMethod("lightning");
                }}
              >
                <div
                  className="fx-centered"
                  style={{
                    minWidth: "48px",
                    minHeight: "48px",
                    backgroundColor: "var(--c1-side)",
                    borderRadius: "50%",
                  }}
                >
                  <Icon name="deposit-sats" size={24} />
                </div>
                <div>
                  <p>{t("AykhAgD")}</p>
                  <p className="gray-c p-medium">{t("AxTWr5U")}</p>
                </div>
              </div>
            </div>
          )}
          {method === "ecash" && <ECash exit={() => setMethod("")} />}
          {method === "lightning" && <Lightning exit={() => setMethod("")} />}
        </div>
      </div>
    </Overlay>
  );
}
