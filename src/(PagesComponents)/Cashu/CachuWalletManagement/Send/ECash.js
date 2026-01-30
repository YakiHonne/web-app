import React, { useEffect, useState } from "react";
import Mintslist from "../../MintsList";
import { useTranslation } from "react-i18next";
import useCashu from "@/Hooks/useCachu";
import { generateToken, publishProofs } from "@/Helpers/CashuHelpers";
import LoadingDots from "@/Components/LoadingDots";
import Invoice from "../Invoice";
import useSentTokensAsHash from "@/Hooks/useSentTokensAsHash";

export default function ECash({ exit }) {
  const { t } = useTranslation();
  const { cashuTokens, cashuWalletMints } = useCashu();
  const { addToken } = useSentTokensAsHash();
  const [mintFrom, setMintFrom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [tokenHash, setTokenHash] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (cashuWalletMints.length > 0) {
      setMintFrom(cashuWalletMints[0]);
    }
  }, [cashuWalletMints]);

  const createToken = async () => {
    if (isLoading || amount > cashuTokens[mintFrom.url]?.total) return;
    setIsLoading(true);
    let generatedToken = await generateToken({
      mint: mintFrom.url,
      proofs: cashuTokens[mintFrom.url]?.allProofs,
      amount,
      memo: message,
    });
    if (generatedToken) {
      let { token, keep, send } = generatedToken;
      setTokenHash(token);
      addToken(token);
      await publishProofs({
        proofsToSpend: send,
        proofsToKeep: keep,
        mintFrom: mintFrom.url,
        cashuTokens,
        amountToSend: amount,
        baseAmount: amount,
      });
    }
    setIsLoading(false);
  };

  if (!mintFrom) return null;
  return (
    <>
      {tokenHash && (
        <Invoice
          invoice={tokenHash}
          exit={() => {
            setTokenHash("");
            exit();
          }}
          title={t("AbSKmFw")}
          description={t("AMhGvtc")}
          message={t("Ar0bwCO")}
        />
      )}

      <div className="fit-container fx-centered fx-col fx-sart-h fx-start-v">
        <div className="fit-container fx-centered fx-start-h" onClick={exit}>
          <div className="round-icon-small">
            <div className="arrow" style={{ rotate: "90deg" }}></div>
          </div>
          <p>{t("AW28wCE")}</p>
        </div>
        <div className="fit-container fx-centered fx-start-h fx-col">
          {cashuWalletMints.length > 0 && mintFrom && (
            <Mintslist
              list={cashuWalletMints}
              label={t("AirVYTX")}
              selectedMint={mintFrom}
              setSelectedMint={setMintFrom}
              cashuTokens={cashuTokens}
              balancePosition="right"
            />
          )}
          <div className="fx-centered fx-col box-pad-v-m box-pad-h-s">
            <div className="fx-centered fx-col">
              <p className="gray-c p-big">{t("AcDgXKI")}</p>
              <input
                type="number"
                className="if p-bold if-no-border ifs-full p-centered"
                placeholder={t("AcDgXKI")}
                style={{
                  fontSize: `max(${
                    amount.toString().length > 5
                      ? `${80 - (amount.toString().length - 6) * 10}px`
                      : "80px"
                  },50px)`,
                  height: "80px",
                }}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                autoFocus
              />
              <p className="gray-c p-big">Sats</p>
            </div>
            <input
              type="text"
              className="if ifs-full if-no-border p-centered"
              style={{
                borderTop: "1px solid var(--pale-gray)",
                borderBottom: "1px solid var(--pale-gray)",
                borderRadius: "0",
                height: "50px",
              }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("Ark6BLW")}
            />
          </div>
          <button
            className={`btn btn-normal btn-full ${
              amount > cashuTokens[mintFrom.url]?.total ? "btn-disabled" : ""
            }`}
            onClick={createToken}
            disabled={isLoading || amount > cashuTokens[mintFrom.url]?.total}
          >
            {isLoading ? <LoadingDots /> : t("AhOFjL5")}
          </button>
        </div>
      </div>
    </>
  );
}
