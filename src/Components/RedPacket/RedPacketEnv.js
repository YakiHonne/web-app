import { useTranslation } from "react-i18next";
import NumberShrink from "../NumberShrink";
import {
  createLightningInvoice,
  formatTime,
  getDominantColor,
} from "@/Helpers/Helpers";
import { useSelector } from "react-redux";
import { store } from "@/Store/Store";
import { setToast } from "@/Store/Slides/Publishers";
import Overlay from "../Overlay";
import { useEffect, useState } from "react";
import LoadingDots from "../LoadingDots";
import useLightningWallets from "@/Hooks/useLightningWallets";
import useImageDominantColor from "@/Hooks/useImageDominantColor";

export default function RedPacketEnv({
  data,
  timeLeft,
  claimRedPacket,
  preview = false,
}) {
  const { t } = useTranslation();
  const userMetadata = useSelector((state) => state.userMetadata);
  const { selectedWallet } = useLightningWallets();
  const [showWalletBox, setShowWalletBox] = useState(false);
  const [addr, setAddr] = useState(
    selectedWallet?.kind !== 1 ? selectedWallet?.entitle : userMetadata.lud16,
  );
  const [isLoading, setIsLoading] = useState(false);
  const mainCardColor = useImageDominantColor(data.img);
  const handleClaim = async () => {
    if (preview) return;
    if (!addr) {
      setShowWalletBox(true);
      return;
    }
    setShowWalletBox(false);
    setIsLoading(true);
    const simulateClaiming = await createLightningInvoice({
      amount: 1,
      message: "",
      recipientAddr: addr,
    });
    if (simulateClaiming) {
      let res = await claimRedPacket(addr);
      if (res) {
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      store.dispatch(
        setToast({
          type: 2,
          desc: t("AKbYF9B"),
        }),
      );
      return;
    }
    setIsLoading(false);
    store.dispatch(
      setToast({
        type: 2,
        desc: t("AUeVApC"),
      }),
    );
  };

  return (
    <>
      {showWalletBox && (
        <WalletBox
          addWallet={handleClaim}
          addr={addr}
          setAddr={setAddr}
          exit={() => setShowWalletBox(false)}
        />
      )}
      <div
        style={{
          width: "300px",
          height: "500px",
          backgroundColor: mainCardColor,
          borderRadius: "24px",
          position: "relative",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          // border: "1px solid rgba(255,255,255,0.05)",
        }}
        className="slide-up"
        onClick={handleClaim}
      >
        <div
          style={{
            width: "100%",
            height: "70%",
            backgroundColor: "rgba(0,0,0,.2)",
            // backgroundColor: mainCardColor,
            backgroundImage: data.img ? `url(${data.img})` : "",
            borderBottomLeftRadius: "50% 25%",
            borderBottomRightRadius: "50% 25%",
            position: "relative",
            zIndex: 2,
          }}
          className="pointer bg-img cover-bg"
        >
          <div
            style={{
              width: "84px",
              height: "84px",
              backgroundColor: "#FFD700",
              borderRadius: "50%",
              position: "absolute",
              bottom: "-25px",
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              border: "2px solid rgba(255,255,255,0.2)",
              zIndex: 3,
            }}
            className="fx-centered"
          >
            {!preview && !isLoading && (
              <p className="p-bold c1-c">{t("Ax27FNG")}</p>
            )}
            {isLoading && <LoadingDots />}
          </div>
        </div>
        {!preview && (
          <div
            className="fx-centered fx-col box-pad-v"
            style={{ height: "30%", gap: "4px" }}
          >
            <div
              className="fx-centered"
              style={{ gap: 0, position: "relative" }}
            >
              <h3 style={{ color: "white" }}>
                <NumberShrink value={data.a} />
              </h3>
              <p style={{ color: "white" }}>sats</p>
            </div>
            <p style={{ color: "white" }}>{data.m}</p>
            <div className="fx-centered fx-col" style={{ gap: 0 }}>
              <p style={{ color: "white" }}>{formatTime(timeLeft)}</p>
            </div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "-20%",
            width: "140%",
            height: "30%",
            backgroundColor: "rgba(255,255,255,0.03)",
            borderRadius: "50%",
            transform: "rotate(-8deg)",
            zIndex: 1,
          }}
        />
      </div>
    </>
  );
}

const WalletBox = ({ exit, setAddr, addr, addWallet }) => {
  const { t } = useTranslation();
  return (
    <Overlay width={450} exit={exit}>
      <div className="fx-centered fx-col box-pad-h box-pad-v">
        <h4>{t("AVwOvl7")}</h4>
        <p className="gray-c">{t("AAqzXwW")}</p>
        <input
          type="text"
          value={addr}
          placeholder={t("A40BuYB")}
          onChange={(e) => setAddr(e.target.value)}
          className="if ifs-full"
        />
        <div className="fx-centered fit-container">
          <button className="btn btn-full btn-gst-red" onClick={exit}>
            {t("AB4BSCe")}
          </button>
          <button
            className="btn btn-full btn-normal"
            onClick={() => addr && addWallet(addr)}
          >
            {t("Adj1lgY")}
          </button>
        </div>
      </div>
    </Overlay>
  );
};
