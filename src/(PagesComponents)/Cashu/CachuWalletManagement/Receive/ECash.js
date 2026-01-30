import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { getDecodedToken } from "@cashu/cashu-ts";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import useMints from "@/Hooks/useMints";
import Mintslist from "../../MintsList";
import useCashu from "@/Hooks/useCachu";
import LoadingDots from "@/Components/LoadingDots";
import {
  checkProofsStatus,
  swapTokensMinToOtherMint,
  swapTokensSameMint,
} from "@/Helpers/CashuHelpers";
import { useSelector } from "react-redux";
import { encrypt44 } from "@/Helpers/Encryptions";
import { InitEvent } from "@/Helpers/Controlers";
import { getPublicKey } from "nostr-tools";
import { getEncodedTokenV4 } from "@cashu/cashu-ts";

export default function ECash({ exit }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const { cashuTokens, cashuWalletMints, cashuWallet } = useCashu();
  const { getCustomMints } = useMints();
  const [token, setToken] = useState("");
  const [decodedToken, setDecodedToken] = useState(null);
  const [mintTo, setMintTo] = useState(null);
  const [fees, setFees] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const tokenMintOnList = useMemo(() => {
    if (cashuWalletMints.length === 0 || !decodedToken) return false;
    return cashuWalletMints.some((_) => _.url === decodedToken?.mint);
  }, [cashuWalletMints, decodedToken]);

  useEffect(() => {
    if (cashuWalletMints.length > 0) {
      setMintTo(cashuWalletMints[0]);
    }
  }, [cashuWalletMints]);

  const decodeToken = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      let dToken = getDecodedToken(token);
      const mintMetadata = await getCustomMints([dToken.mint]);
      const proofsStatus = await checkProofsStatus(dToken.mint, dToken.proofs);

      let fullToken = {
        mintMetadata: {
          ...mintMetadata[0],
        },
        ...dToken,
        amount: proofsStatus?.unspentProofs.reduce(
          (acc, proof) => (acc = acc + proof.amount),
          0,
        ),
        unspentProofs: proofsStatus?.unspentProofs,
        spentProofs: proofsStatus?.spentProofs,
        isSpent: proofsStatus?.allSpent,
      };
      setDecodedToken(fullToken);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      dispatch(
        setToast({
          type: 2,
          desc: t("AHT8ADq"),
        }),
      );
    }
  };

  const handlePaste = async () => {
    try {
      if (isLoading) return;
      const text = await navigator.clipboard.readText();
      setToken(text);
    } catch (err) {
      console.error("Clipboard access denied", err);
    }
  };

  const addMint = async () => {
    if (tokenMintOnList) return;
    setIsLoading(true);
    const pivatekeys = cashuWallet.privkey;
    const pubkey = getPublicKey(pivatekeys);

    let mintsListTags = [...cashuWallet.mints, decodedToken.mint].map(
      (mint) => {
        return ["mint", mint];
      },
    );
    const content = JSON.stringify([["privkey", pivatekeys], ...mintsListTags]);
    const encryptedContent = await encrypt44(userKeys, userKeys.pub, content);
    if (!encryptedContent) {
      setIsLoading(false);
      return;
    }
    const eventInitEx = await InitEvent(17375, encryptedContent, []);

    if (!eventInitEx) {
      setIsLoading(false);
      return;
    }
    dispatch(setToPublish({ eventInitEx }));

    let tags = [["pubkey", pubkey], ...mintsListTags];
    const eventInitEx2 = await InitEvent(10019, "", tags);
    if (!eventInitEx2) {
      setIsLoading(false);
      return;
    }
    dispatch(setToPublish({ eventInitEx: eventInitEx2 }));
    setIsLoading(false);
  };

  const redeemToken = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      let token_ = getEncodedTokenV4({
        mint: decodedToken.mint,
        proofs: decodedToken.unspentProofs,
      });
      let status =
        decodedToken.mint === mintTo.url
          ? await swapTokensSameMint({
              amount: decodedToken.amount,
              mint: mintTo.url,
              token: token_,
              cashuTokens,
            })
          : await swapTokensMinToOtherMint({
              amount: decodedToken.amount,
              mintFrom: decodedToken.mint,
              mintTo: mintTo.url,
              cashuTokens,
              externalProofs: decodedToken.unspentProofs,
              includeFees: true,
              cb: (fees) => {
                setFees(fees);
              },
            });
      if (status.status) {
        setIsLoading(false);
        dispatch(
          setToast({
            type: 1,
            desc: t("AuIhLnA"),
          }),
        );
        exit();
        return;
      }
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="fit-container fx-centered fx-col fx-sart-h fx-start-v">
      <div className="fit-container fx-centered fx-start-h" onClick={exit}>
        <div className="round-icon-small">
          <div className="arrow" style={{ rotate: "90deg" }}></div>
        </div>
        <p>{t("AUmPqw7")}</p>
      </div>
      {!decodedToken && (
        <div className="fit-container fx-centered fx-start-h fx-col">
          <div
            className="fit-container fx-centered fx-start-h"
            style={{ position: "relative" }}
          >
            <textarea
              type="text"
              placeholder={t("AD5fCOZ")}
              value={token}
              className="txt-area ifs-full"
              onChange={(e) => setToken(e.target.value)}
            />
            <div style={{ position: "absolute", right: "0px", bottom: "0px" }}>
              <div
                className="round-icon round-icon-tooltip"
                style={{ border: "none" }}
                data-tooltip={t("AD5fCOZ")}
                onClick={handlePaste}
              >
                <div className="copy-24"></div>
              </div>
            </div>
          </div>
          <button onClick={decodeToken} className="btn btn-normal btn-full">
            {isLoading ? <LoadingDots /> : t("AMcfy2X")}
          </button>
        </div>
      )}
      {decodedToken && (
        <div className="fit-container fx-centered fx-start-h fx-col">
          {cashuWalletMints.length > 0 && mintTo && (
            <Mintslist
              list={cashuWalletMints}
              label={t("AWUmU6P")}
              selectedMint={mintTo}
              setSelectedMint={setMintTo}
              cashuTokens={cashuTokens}
              balancePosition="right"
            />
          )}
          <div className="fit-container box-pad-h-s box-pad-v-s">
            <h4>Token</h4>
          </div>
          <div className="fit-container fx-centered fx-start-h fx-start-v fx-col box-pad-h-m box-pad-v-m sc-s-18 bg-sp">
            <p>{t("AiGzSPU")}</p>
            <div className="fit-container fx-scattered">
              <div className="fx-centered">
                <div
                  style={{
                    backgroundImage: `url(${decodedToken.mintMetadata.data.icon_url})`,
                    minWidth: "32px",
                    minHeight: "32px",
                    borderRadius: "50%",
                    backgroundColor: "var(--pale-gray)",
                  }}
                  className="bg-img cover-bg"
                ></div>
                <div>
                  <p className="p-caps p-one-line">
                    {decodedToken.mintMetadata.data.name}
                  </p>
                  <p className="gray-c p-medium p-one-line">
                    {decodedToken.mintMetadata.url}
                  </p>
                </div>
              </div>
              {!tokenMintOnList && (
                <button
                  className="btn btn-small btn-gray"
                  disabled={isLoading}
                  onClick={addMint}
                >
                  {isLoading ? <LoadingDots /> : t("ApnhCB8")}
                </button>
              )}
            </div>
          </div>
          <div className="fit-container fx-centered">
            <div className="fx fx-centered fx-start-h fx-start-v fx-col box-pad-h-m box-pad-v-m sc-s-18 bg-sp">
              <p>{t("AnbDJKX")}</p>
              <p className="gray-c p-one-line">{decodedToken?.memo || "N/A"}</p>
            </div>
            <div
              className="fx-centered fx-start-h fx-start-v fx-col box-pad-h-m box-pad-v-m sc-s-18 bg-sp"
              style={{ width: "max-content" }}
            >
              <p>{t("AqdtfGK")}</p>
              <p className="gray-c">{decodedToken?.proofs.length || "0"}</p>
            </div>
          </div>
          <div className="fit-container fx-centered fx-start-h fx-start-v fx-col box-pad-h-m box-pad-v-m sc-s-18 bg-sp">
            <p>{t("AcDgXKI")}</p>
            <div className="fx-centered">
              <h3>{decodedToken?.amount}</h3>
              <sup className="gray-c">{decodedToken?.unit}</sup>
            </div>
            {fees > 0 && (
              <p className="gray-c p-one-line">{t("AwizFPi", { fees })}</p>
            )}
          </div>
          {!decodedToken?.isSpent && (
            <button
              className="btn btn-normal btn-full"
              onClick={redeemToken}
              disabled={isLoading}
            >
              {isLoading ? <LoadingDots /> : t("AU6S4ek")}
            </button>
          )}
          {decodedToken?.isSpent && (
            <div
              className="fit-container fx-centered box-pad-h-m box-pad-v-m sc-s-18 bg-sp"
              style={{ borderColor: "var(--green-main)" }}
            >
              <div className="checkmark-24"></div>
              <p className="green-c">{t("A3Dn0HW")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
