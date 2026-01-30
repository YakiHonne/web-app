import LoadingBar from "@/Components/LoadingBar";
import { setToPublish } from "@/Store/Slides/Publishers";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Wallet } from "@cashu/cashu-ts";
import bip39 from "bip39";
import useCashu from "@/Hooks/useCachu";
import { encrypt44 } from "@/Helpers/Encryptions";
import { InitEvent } from "@/Helpers/Controlers";
import successJSON from "@/JSONs/success.json";
import Lottie from "lottie-react";
import LoadingDots from "@/Components/LoadingDots";
import { useSelector } from "react-redux";

export default function WalletRestoration({ activeMint, exit }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const { cashuTokens } = useCashu();
  const [seedPhrase, setSeedPhrase] = useState(
    Array.from({ length: 12 }).map((_) => "")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [screen, setScreen] = useState(1);
  const isAllFilled = useMemo(() => {
    let count = seedPhrase.filter((word) => word).length;
    return {
      count,
      isAllFilled: count === 12,
    };
  }, [seedPhrase]);

  const handleOnPaste = (e, currentIndex) => {
    e.preventDefault();
    let data = e.clipboardData.getData("text");
    if (!data) return;
    data = data.trim().replace(/\s+/g, " ");
    let index = currentIndex;
    let allWords = data.split(" ");
    const newSeedPhrase = [...seedPhrase];
    allWords.forEach((word) => {
      if (index < 12) newSeedPhrase[index] = word;
      index++;
    });
    console.log(newSeedPhrase);
    setSeedPhrase(newSeedPhrase);
  };

  const restoreWallet = async () => {
    if (!isAllFilled.isAllFilled) return;
    setIsLoading(true);
    const seed = bip39.mnemonicToSeedSync(seedPhrase.join(" "));
    const bip39seed = new Uint8Array(seed);
    const wallet = new Wallet(activeMint, {
      unit: "sat",
      bip39seed,
    });

    await wallet.loadMint();
    const { proofs } = await wallet.batchRestore();
    let state = await wallet.checkProofsStates(proofs);
    let indexes = [];
    for (let i = 0; i < state.length; i++) {
      if (state[i].state === "UNSPENT") indexes.push(i);
    }
    let unspentProofs = proofs.filter((_, index) => indexes.includes(index));
    let toPublishProofs = filterProofs(
      unspentProofs,
      cashuTokens[activeMint]?.allProofs || []
    );
    if (toPublishProofs.length === 0) {
      setScreen(3);
      setIsLoading(false);
      return;
    }
    if (toPublishProofs.length > 0) {
      let status = await publishOnNostr(toPublishProofs);
      if (status) setScreen(2);
      setIsLoading(false);
    } else setIsLoading(false);
  };

  const filterProofs = (mintProofs, localProofs) => {
    let local = new Map();
    localProofs.forEach((proof) => {
      local.set(`${proof.C}-${proof.secret}`, proof);
    });
    return mintProofs.filter(
      (proof) => !local.has(`${proof.C}-${proof.secret}`)
    );
  };

  const publishOnNostr = async (proofs) => {
    let amount = `${proofs.reduce((acc, proof) => acc + proof.amount, 0)}`;
    let toEncrypt7375 = {
      mint: activeMint,
      unit: "sat",
      proofs,
    };
    let encryptedProofs7375 = await encrypt44(
      userKeys,
      userKeys.pub,
      JSON.stringify(toEncrypt7375)
    );
    if (!encryptedProofs7375) return false;
    const eventInitEx = await InitEvent(7375, encryptedProofs7375, []);
    if (!eventInitEx) return false;
    dispatch(setToPublish({ eventInitEx }));

    let toEncrypt7376 = [
      ["direction", "in"],
      ["amount", amount],
      ["unit", "sat"],
      ["e", eventInitEx.id, "", "created"],
    ];
    let tags = [["e", eventInitEx.id, "", "created"]];
    let encryptedProofs7376 = await encrypt44(
      userKeys,
      userKeys.pub,
      JSON.stringify(toEncrypt7376)
    );
    if (!encryptedProofs7376) return;
    const eventInitEx2 = await InitEvent(7376, encryptedProofs7376, tags);
    if (!eventInitEx2) return false;
    dispatch(setToPublish({ eventInitEx: eventInitEx2 }));
    return true;
  };

  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        !isLoading && exit();
      }}
    >
      <div
        className="box-pad-h box-pad-v sc-s bg-sp fx-centered fx-col slide-up"
        style={{ width: "min(100%, 550px)", position: "relative" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close" onClick={() => !isLoading && exit()}>
          <div></div>
        </div>
        {screen === 1 && (
          <>
            <h3>{t("ADmoKen")}</h3>
            <p className="gray-c p-centered">{t("AKYsKY8")}</p>
            <p className="p-bold p-centered">{activeMint}</p>
            <div className="fx-centered fx-wrap  box-pad-v-m box-pad-h">
              {Array.from({ length: 12 }).map((_, index) => {
                return (
                  <div
                    className="fx-centered"
                    style={{ width: "32%", gap: "16px" }}
                    key={index}
                  >
                    <p style={{ minWidth: "max-content" }} className="gray-c">
                      {index + 1}.
                    </p>
                    <input
                      type="text"
                      placeholder={"-"}
                      className="if ifs-full p-centered"
                      value={seedPhrase[index]}
                      onChange={(e) => {
                        const newSeedPhrase = [...seedPhrase];
                        newSeedPhrase[index] = e.target.value;
                        setSeedPhrase(newSeedPhrase);
                      }}
                      onPaste={(e) => handleOnPaste(e, index)}
                    />
                  </div>
                );
              })}
            </div>
            <p className="c1-c p-centered" style={{ width: "400px" }}>
              {t("ATh4N9A")}
            </p>
            {isAllFilled.count > 0 && (
              <div className="fit-container fx-centered  box-pad-h">
                <p style={{ minWidth: "max-content" }} className="c1-c p-bold">
                  {isAllFilled.count}
                  <span className="gray-c"> / 12</span>
                </p>
                <LoadingBar
                  current={isAllFilled.count}
                  total={12}
                  full={true}
                />
              </div>
            )}
            <div className="fit-container fx-centered box-pad-v-s box-pad-h-m">
              <button
                className={`btn btn-normal btn-full ${
                  isAllFilled.isAllFilled ? "" : "btn-disabled"
                }`}
                disabled={!isAllFilled.isAllFilled || isLoading}
                onClick={restoreWallet}
              >
                {isLoading ? <LoadingDots /> : t("ADmoKen")}
              </button>
            </div>
          </>
        )}
        {screen === 2 && (
          <div className="fx-centered fx-col" style={{ height: "20vh" }}>
            <div style={{ maxHeight: "70px", maxWidth: "70px" }}>
              <Lottie animationData={successJSON} loop={false} />
            </div>
            <h4>{t("AD4mshK")}</h4>
            <p className="gray-c p-centered" style={{ width: "300px" }}>
              {t("AnaRMVD")}
            </p>
          </div>
        )}
        {screen === 3 && (
          <div className="fx-centered fx-col" style={{ height: "20vh" }}>
            <h2>👌🏻</h2>
            <h4>{t("Afm03aX")}</h4>
            <p className="gray-c p-centered" style={{ width: "300px" }}>
              {t("AfsS2lG")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
