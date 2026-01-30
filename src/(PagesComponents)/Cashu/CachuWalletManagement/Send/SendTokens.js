import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ECash from "./ECash";
import NutZap from "./NutZap";
import Lightning from "./Lightning";

export default function SendTokens({ exit, cashuTokens }) {
  const { t } = useTranslation();
  const [method, setMethod] = useState("");

  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="sc-s bg-sp"
        style={{
          width: "min(100%, 650px)",
          position: "relative",
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          className="box-pad-h box-pad-v fx-centered fx-col fx-start-h fx-start-v"
          style={{
            gap: "24px",
          }}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <h4>{t("A14LwWS")}</h4>
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
                  <div className="send-ecash-24"></div>
                </div>
                <div>
                  <p>{t("AW28wCE")}</p>
                  <p className="gray-c p-medium">{t("AiOmgD9")}</p>
                </div>
              </div>
              <div
                className="fit-container fx-centered fx-start-h box-pad-v-m box-pad-h-m sc-s-18 bg-sp option"
                onClick={() => {
                  setMethod("nutzap");
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
                  <div className="nut-zap-24"></div>
                </div>
                <div>
                  <p>NutZap</p>
                  <p className="gray-c p-medium">{t("AmEVEmD")}</p>
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
                  <div className="bolt-24"></div>
                </div>
                <div>
                  <p>{t("ALTSkY5")}</p>
                  <p className="gray-c p-medium">{t("Ae5TwBc")}</p>
                </div>
              </div>
            </div>
          )}
          {method === "ecash" && (
            <ECash exit={() => setMethod("")} cashuTokens={cashuTokens} />
          )}
          {method === "nutzap" && <NutZap exit={() => setMethod("")} />}
          {method === "lightning" && <Lightning exit={() => setMethod("")} />}
        </div>
      </div>
    </div>
  );
}
