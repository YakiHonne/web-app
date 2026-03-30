import React from "react";
import LightningWalletsSelect from "../../LightningWalletsSelect";
import LoadingDots from "../../LoadingDots";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

export default function RedPacketPublish({
  amount,
  setAmount,
  message,
  setMessage,
  refundWallet,
  selectedWallet,
  setSelectedWallet,
  wallets,
  setWallets,
  isLoading,
  createRedPacket,
  setStep,
  setRefundWallet,
}) {
  const { t } = useTranslation();
  const userMetadata = useSelector((state) => state.userMetadata);
  return (
    <div className="fx-centered fx-col box-pad-v-m box-pad-h-s">
      <div className="fx-centered fx-col">
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
        className={"if ifs-full  p-centered"}
        style={{
          height: "50px",
          color: message.length > 32 ? "var(--red-main)" : "",
        }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t("Ark6BLW")}
      />
      {message.length > 32 && <p className="red-c p-italic">{t("Ao2T9ip")}</p>}
      <LightningWalletsSelect
        label={t("AvKyR4k")}
        selectedWallet={selectedWallet}
        setSelectedWallet={setSelectedWallet}
        wallets={wallets}
        setWallets={setWallets}
      />
      {selectedWallet.kind === 1 && userMetadata.lud16 && (
        <div className="fit-container sc-s-18 bg-sp box-pad-h-m box-pad-v-s">
          <p className="gray-c">{t("AK99Mra")}</p>
          <p>{refundWallet || "N/A"}</p>
        </div>
      )}
      {!userMetadata.lud16 && selectedWallet.kind === 1 && (
        <div className="fit-container fx-centered fx-col fx-start-h fx-start-v">
          <p className="gray-c box-pad-h-s">{t("AK99Mra")}</p>
          <input
            type="text"
            placeholder={t("A40BuYB")}
            className="ifs-full if"
            value={refundWallet}
            onChange={(e) => setRefundWallet(e.target.value)}
          />
        </div>
      )}
      <div className="fx-scattered fit-container">
        <button className="btn btn-gray" onClick={() => setStep(0)}>
          {t("AF7iGeG")}
        </button>
        <button className="btn btn-normal btn-full" onClick={createRedPacket}>
          {isLoading ? <LoadingDots /> : t("AeOth8r")}
        </button>
      </div>
    </div>
  );
}
