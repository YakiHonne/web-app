import React, { useEffect, useState } from "react";
import Mintslist from "../../MintsList";
import useCashu from "@/Hooks/useCachu";
import { useTranslation } from "react-i18next";
import useLightningWallets from "@/Hooks/useLightningWallets";
import LoadingDots from "@/Components/LoadingDots";
import { Wallet } from "@cashu/cashu-ts";
import { publishProofs } from "@/Helpers/CashuHelpers";
import Invoice from "../Invoice";
import LightningWalletsSelect from "@/Components/LightningWalletsSelect";

export default function Lightning({ exit }) {
  const { t } = useTranslation();
  const {
    selectedWallet,
    wallets,
    setWallets,
    setSelectedWallet,
    sendPayment,
  } = useLightningWallets();

  const { cashuTokens, cashuWalletMints } = useCashu();
  const [mintTo, setMintTo] = useState(null);
  const [amount, setAmount] = useState(21);
  const [message, setMessage] = useState("");
  const [invoice, setInvoice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (cashuWalletMints.length > 0) {
      setMintTo(cashuWalletMints[0]);
    }
  }, [cashuWalletMints]);

  const initiateReceving = async (isInvoice) => {
    if (isLoading) return;
    if (amount <= 0) return;
    setIsLoading(true);
    const walletTo = new Wallet(mintTo.url);
    await walletTo.loadMint();

    let quote = await walletTo.createMintQuoteBolt11(amount);
    if (isInvoice) {
      setInvoice(quote.request);
      setIsLoading(false);
      return;
    }
    await sendPayment(quote.request);
    walletTo.on.mintQuotePaid(quote.quote, async (data) => {
      const receivedProofs = await walletTo.mintProofsBolt11(
        data.amount,
        data.quote,
      );
      await publishProofs({
        proofsToSpend: [],
        proofsToKeep: [],
        receivedProofs: receivedProofs,
        mintTo: mintTo.url,
        baseAmount: data.amount,
      });
      setIsLoading(false);
      exit();
    });
  };

  return (
    <>
      {invoice && <Invoice invoice={invoice} exit={() => setInvoice("")} />}
      <div className="fit-container fx-centered fx-col fx-start-h fx-start-v">
        <div className="fit-container fx-centered fx-start-h" onClick={exit}>
          <div className="round-icon-small">
            <div className="arrow" style={{ rotate: "90deg" }}></div>
          </div>
          <p>{t("AykhAgD")}</p>
        </div>
        {cashuWalletMints.length > 0 && mintTo && (
          <div className="fit-container fx-centered fx-start-h fx-col">
            <LightningWalletsSelect
              selectedWallet={selectedWallet}
              setSelectedWallet={setSelectedWallet}
              wallets={wallets}
              setWallets={setWallets}
              label={t("AZFMiVf")}
            />
            <Mintslist
              list={cashuWalletMints}
              label={t("AWUmU6P")}
              selectedMint={mintTo}
              setSelectedMint={setMintTo}
              cashuTokens={cashuTokens}
              balancePosition="right"
            />
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
            <div className="fit-container fx-centered" style={{ gap: "16px" }}>
              <div
                className="fx-centered fx-col option pointer fx"
                style={{
                  height: "95px",
                  borderRadius: "24px",
                  border: "1px solid var(--red-main)",
                }}
                onClick={isLoading ? null : exit}
              >
                {isLoading ? (
                  <LoadingDots />
                ) : (
                  <>
                    <p className="red-c p-big" style={{ height: "20px" }}>
                      &#10005;
                    </p>
                    <p className="red-c">{t("AB4BSCe")}</p>
                  </>
                )}
              </div>
              <div
                className="fx-centered fx-col option pointer fx"
                style={{
                  height: "95px",
                  borderRadius: "24px",
                  border: "1px solid var(--pale-gray)",
                }}
                onClick={() => {
                  !isLoading && initiateReceving(true);
                }}
              >
                {isLoading ? (
                  <LoadingDots />
                ) : (
                  <>
                    <div className="qrcode-24"></div>
                    <p>{t("AvEHTiP")}</p>
                  </>
                )}
              </div>
              <div
                className="fx-centered fx-col option pointer fx"
                style={{
                  height: "95px",
                  borderRadius: "24px",
                  backgroundColor: "var(--c1)",
                }}
                onClick={() => (isLoading ? null : initiateReceving())}
              >
                {isLoading ? (
                  <LoadingDots />
                ) : (
                  <>
                    <p className="p-big" style={{ height: "20px" }}>
                      &#8593;
                    </p>
                    <p>{t("A14LwWS")}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
