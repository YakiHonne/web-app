import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useMints from "@/Hooks/useMints";
import LoadingDots from "@/Components/LoadingDots";
import { swapTokensMinToOtherMint } from "@/Helpers/CashuHelpers";
import Mintslist from "./MintsList";
import SyncTokens from "./SyncTokens";

export default function SwapTokens({ cashuWallet, cashuTokens, exit }) {
  const { t } = useTranslation();
  const { getCustomMints } = useMints();
  const [mintFrom, setMintFrom] = useState("");
  const [mintTo, setMintTo] = useState("");
  const [mints, setMints] = useState([]);
  const [amount, setAmount] = useState(0);
  const [fees, setFees] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const isEnabled = useMemo(() => {
    let checkAmount =
      (amount > 0 && amount <= cashuTokens[mintFrom.url]?.total) || 0;
    let checkMint = mintFrom.url !== mintTo.url;
    return checkAmount && checkMint;
  }, [amount, mintFrom, cashuTokens, mintTo, mintFrom]);
  const [faultyTokens, setFaultyTokens] = useState([]);

  useEffect(() => {
    if (cashuWallet.mints.length === 0) return;
    getCustomMints(cashuWallet.mints, setMints);
  }, [cashuWallet]);

  useEffect(() => {
    if (mints.length === 0) return;
    setMintFrom(mints[0]);
    setMintTo(mints[1]);
  }, [mints]);

  useEffect(() => {
    if (!mintFrom) return;
    setFees(0);
    setAmount(cashuTokens[mintFrom.url]?.total || 0);
  }, [mintFrom]);

  const switchMints = () => {
    if (isLoading) return;
    const temp = mintFrom;
    setMintFrom(mintTo);
    setMintTo(temp);
  };

  const swapTokens = async () => {
    if (!isEnabled || isLoading) return;
    setIsLoading(true);
    let toSwap = await swapTokensMinToOtherMint({
      amount,
      mintFrom: mintFrom.url,
      mintTo: mintTo.url,
      cashuTokens,
      cb: (fees) => setFees(fees),
    });

    if (!toSwap.status && toSwap.spentTokens?.length > 0) {
      setFaultyTokens(toSwap.spentTokens);
      setIsLoading(false);
      return;
    }
    if (!toSwap.status) {
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    exit();
  };

  if (faultyTokens.length > 0) {
    return (
      <SyncTokens
        tokens={faultyTokens}
        exit={exit}
        cashuTokens={cashuTokens}
        mint={mintFrom.url}
      />
    );
  }

  if (mints.length === 0 || mintFrom === "" || mintTo === "")
    return (
      <div
        className="fixed-container fx-centered box-pad-h"
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <LoadingDots />
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
          width: "min(100%, 650px)",
          position: "relative",
          overflow: "visible",
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h3>{t("AZE0w8d")}</h3>
        <p className="box-pad-h gray-c box-marg-s">{t("AUPrMtJ")}</p>
        <div
          className="fit-container fx-centered"
          style={{ position: "relative" }}
        >
          <div
            className="fx-centered round-icon-small"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              rotate: "90deg",
              transform: "translate(-50%,50%)",
              backgroundColor: "var(--white)",
              zIndex: 10000,
            }}
            onClick={switchMints}
          >
            <span className="p-big">&#8593;</span>
          </div>
          <Mintslist
            list={mints}
            label={t("AirVYTX")}
            selectedMint={mintFrom}
            setSelectedMint={setMintFrom}
            cashuTokens={cashuTokens}
          />
          <Mintslist
            list={mints}
            label={t("A1KAaIM")}
            selectedMint={mintTo}
            setSelectedMint={setMintTo}
            cashuTokens={cashuTokens}
          />
        </div>
        <div className="box-pad-v-s"></div>
        <div className="box-pad-h-m box-pad-v-m sc-s-18 bg-sp fit-container fx-scattered">
          <div className="fit-container fx-centered fx-col fx-start-h fx-start-v">
            <p className=" p-bold">{t("A14LwWS")}</p>
            <div className="fit-container fx-scattered">
              <input
                autoFocus
                type="number"
                className="if ifs-full if-no-border p-bold"
                placeholder={t("AcDgXKI")}
                style={{
                  fontSize: "2rem",
                  paddingLeft: 0,
                }}
                value={amount}
                max={cashuTokens[mintFrom.url]?.total || 0}
                onChange={(e) => {
                  setAmount(parseInt(e.target.value));
                  setFees(0);
                }}
              />
              <p className="gray-c" style={{ minWidth: "max-content" }}>
                Sats
              </p>
            </div>
            {fees > 0 && (
              <p className="gray-c p-one-line">{t("AQ0MPQv", { fees })}</p>
            )}
          </div>
        </div>
        <div className="fx-centered fit-container">
          <button
            className={`btn ${
              isEnabled ? "btn-normal" : "btn-disabled"
            } btn-full`}
            disabled={!isEnabled}
            onClick={swapTokens}
          >
            {isLoading ? <LoadingDots /> : t("AZE0w8d")}
          </button>
        </div>
      </div>
    </div>
  );
}
