import useCashu from "@/Hooks/useCachu";
import React, { useEffect, useMemo, useState } from "react";
import Mintslist from "../../MintsList";
import { useTranslation } from "react-i18next";
import useLightningWallets from "@/Hooks/useLightningWallets";
import LoadingDots from "@/Components/LoadingDots";
import LightningWalletsSelect from "@/Components/LightningWalletsSelect";
import Toggle from "@/Components/Toggle";
import { createLightningInvoice } from "@/Helpers/Helpers";
import { getInvoiceDetails } from "@/Helpers/Encryptions";
import { setToast } from "@/Store/Slides/Publishers";
import { useDispatch } from "react-redux";
import { swapTokensInvoiceFromMint } from "@/Helpers/CashuHelpers";

export default function Lightning({ exit }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [lightningAddr, setLightningAddr] = useState("");
  const [mintFrom, setMintFrom] = useState(null);
  const [isSelf, setIsSelf] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const { cashuTokens, cashuWalletMints } = useCashu();
  const {
    selectedWallet,
    wallets,
    setWallets,
    setSelectedWallet,
    generateInvoice,
  } = useLightningWallets();
  const isAddrInvoice = useMemo(() => {
    return (
      lightningAddr &&
      lightningAddr.startsWith("lnbc") &&
      lightningAddr.length > 30 &&
      !lightningAddr.includes("@")
    );
  }, [lightningAddr]);
  const invoiceDetails = useMemo(() => {
    if (isAddrInvoice) {
      let details = getInvoiceDetails(lightningAddr);
      return details;
    }
    return false;
  }, [lightningAddr, isAddrInvoice]);
  useEffect(() => {
    if (cashuWalletMints.length > 0) {
      setMintFrom(cashuWalletMints[0]);
    }
  }, [cashuWalletMints]);

  const handleSend = async () => {
    try {
      setIsLoading(true);
      let invoice = "";

      if (isSelf) {
        if (!amount) {
          dispatch(
            setToast({
              type: 2,
              desc: t("AuuZLbl"),
            }),
          );
          setIsLoading(false);
          return;
        }
        invoice = await generateInvoice(amount, message);
      }
      if (!isSelf) {
        invoice = isAddrInvoice
          ? lightningAddr
          : await createLightningInvoice({
              amount,
              message,
              recipientAddr: lightningAddr,
            });
      }
      if (invoice) {
        let status = await swapTokensInvoiceFromMint({
          mintFrom: mintFrom.url,
          invoice,
          cashuTokens,
        });
        if (status.status) {
          exit();
        }
      }
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const handleChangeMethod = (status) => {
    setIsSelf(status);
    setLightningAddr("");
  };

  return (
    <div className="fit-container fx-centered fx-col fx-sart-h fx-start-v">
      <div className="fit-container fx-centered fx-start-h" onClick={exit}>
        <div className="round-icon-small">
          <div className="arrow" style={{ rotate: "90deg" }}></div>
        </div>
        <p>{t("ALTSkY5")}</p>
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
        {wallets.length > 0 && (
          <div
            className="fit-container fx-centered fx-col sc-s-18 bg-sp box-pad-h-m box-pad-v-m"
            style={{ overflow: "visible" }}
          >
            <div className="fit-container fx-scattered">
              <p>{t("AbXzMeW")}</p>
              <Toggle status={isSelf} setStatus={handleChangeMethod} />
            </div>
            {isSelf && (
              <LightningWalletsSelect
                label={false}
                selectedWallet={selectedWallet}
                setSelectedWallet={setSelectedWallet}
                wallets={wallets}
                setWallets={setWallets}
              />
            )}
            {!isSelf && (
              <input
                type="text"
                className="if ifs-full"
                placeholder={t("AGIKpyq")}
                value={lightningAddr}
                onChange={(e) =>
                  setLightningAddr(e.target.value?.toLowerCase())
                }
              />
            )}
          </div>
        )}
        {wallets.length === 0 && (
          <input
            type="text"
            className="if ifs-full"
            placeholder={t("AGIKpyq")}
            value={lightningAddr}
            onChange={(e) => setLightningAddr(e.target.value?.toLowerCase())}
          />
        )}

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
            value={invoiceDetails?.amount || amount}
            onChange={(e) =>
              !isAddrInvoice && setAmount(parseInt(e.target.value))
            }
            autoFocus
            disabled={isAddrInvoice}
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
          value={invoiceDetails?.description || message}
          onChange={(e) => !isAddrInvoice && setMessage(e.target.value)}
          placeholder={t("Ark6BLW")}
          disabled={isAddrInvoice}
        />

        <button
          className={`btn btn-full btn-normal `}
          disabled={isLoading}
          onClick={handleSend}
        >
          {isLoading ? <LoadingDots /> : t("A14LwWS")}
        </button>
      </div>
    </div>
  );
}
