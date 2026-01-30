import Lottie from "lottie-react";
import React, { useEffect, useState } from "react";
import successJSON from "@/JSONs/success.json";
import { checkProofsStatus, publishProofs } from "@/Helpers/CashuHelpers";
import LoadingDots from "@/Components/LoadingDots";
import { useTranslation } from "react-i18next";

export default function SyncTokens({ tokens = [], exit, cashuTokens, mint }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingFinished, setIsSyncingFinished] = useState(false);
  const [faultyTokens, setFaultyTokens] = useState(tokens);

  useEffect(() => {
    if (tokens.length === 0) {
      let allProofs = cashuTokens[mint]?.allProofs || [];
      checkProofsStatus(mint, allProofs).then((res) => {
        if (res.spentTokens.length > 0) {
          setFaultyTokens(res.spentTokens);
        } else setIsSyncingFinished(true);
      });
    }
  }, []);

  const syncTokens = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setIsSyncingFinished(false);
    let amountToSend = faultyTokens.reduce(
      (total, proof) => total + proof.amount,
      0,
    );
    await publishProofs({
      proofsToSpend: faultyTokens,
      proofsToKeep: [],
      cashuTokens,
      mintFrom: mint,
      amountToSend,
    });
    setIsLoading(false);
    setIsSyncingFinished(true);
  };

  if (faultyTokens.length === 0)
    return (
      <div
        className="fixed-container fx-centered box-pad-h"
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <div
          className="box-pad-h box-pad-v sc-s bg-sp fx-centered fx-col slide-up"
          style={{
            width: "min(100%, 550px)",
            position: "relative",
            height: "20vh",
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          {!isSyncingFinished && <LoadingDots />}
          {isSyncingFinished && (
            <div className="fx-centered fx-col" style={{ height: "20vh" }}>
              <h2>👌🏻</h2>
              <h4>{t("Afm03aX")}</h4>
              <p className="gray-c p-centered" style={{ width: "300px" }}>
                {t("AaZHSDb")}
              </p>
            </div>
          )}
        </div>
      </div>
    );

  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="box-pad-h box-pad-v sc-s bg-sp fx-centered fx-col slide-up"
        style={{
          width: "min(100%, 550px)",
          position: "relative",
          height: "20vh",
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        {!isSyncingFinished && (
          <>
            <div
              className="warning-24"
              style={{ minWidth: "48px", minHeight: "48px" }}
            ></div>
            <div className="box-pad-v-s"></div>
            <h4>{t("AlhlIR1")}</h4>
            <p className="gray-c p-centered box-pad-v-s">{t("A2cAhc6")}</p>
            <div className="fx-centered">
              <button
                className="btn btn-normal "
                onClick={syncTokens}
                disabled={isLoading}
              >
                {isLoading ? <LoadingDots /> : t("A7hStNv")}
              </button>
              <button
                className="btn btn-gst-red "
                onClick={exit}
                disabled={isLoading}
              >
                {isLoading ? <LoadingDots /> : t("AB4BSCe")}
              </button>
            </div>
          </>
        )}
        {isSyncingFinished && (
          <div className="fx-centered fx-col" style={{ height: "20vh" }}>
            <div style={{ maxHeight: "70px", maxWidth: "70px" }}>
              <Lottie animationData={successJSON} loop={false} />
            </div>
            <h4>{t("AuaF1hN")}</h4>
            <p className="gray-c p-centered" style={{ width: "300px" }}>
              {t("AaZHSDb")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
