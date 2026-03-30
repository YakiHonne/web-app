import { useEffect, useState } from "react";
import Overlay from "../../Overlay";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import useLightningWallets from "@/Hooks/useLightningWallets";
import { createLightningInvoice } from "@/Helpers/Helpers";
import { encodeJWT } from "@/Helpers/Encryptions";
import RedPacketPublish from "./RedPacketPublish";
import RedPacketEnvPicker from "./RedPacketEnvPicker";
import { store } from "@/Store/Store";
import { setToast } from "@/Store/Slides/Publishers";

export const RedPacketWindow = ({ exit, receipient, onSuccess }) => {
  const userMetadata = useSelector((state) => state.userMetadata);
  const {
    selectedWallet,
    wallets,
    setWallets,
    setSelectedWallet,
    sendPayment,
  } = useLightningWallets();
  const { t } = useTranslation();
  const [amount, setAmount] = useState(21);
  const [message, setMessage] = useState("");
  const [refundWallet, setRefundWallet] = useState("");
  const [img, setImg] = useState("");
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedWallet) {
      if (selectedWallet.kind !== 1) {
        setRefundWallet(selectedWallet.entitle);
      } else {
        setRefundWallet(userMetadata.lud16);
      }
    } else setRefundWallet(userMetadata.lud16);
  }, [selectedWallet, userMetadata]);

  const createRedPacket = async () => {
    if (!refundWallet) {
      store.dispatch(setToast({ type: 2, desc: t("A8eLtAr") }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(refundWallet)) {
      store.dispatch(setToast({ type: 2, desc: t("Av2t0qO") }));
      return;
    }

    if (amount <= 0 || amount > 10000) {
      store.dispatch(setToast({ type: 2, desc: t("ABUp5OM") }));
      return;
    }

    if (message.length > 32) {
      store.dispatch(setToast({ type: 2, desc: t("Ao2T9ip") }));
      return;
    }

    setIsLoading(true);
    const c_at = Math.ceil(Date.now() / 1000);
    let invoiceMemo = {
      s: userMetadata.pubkey,
      s_addr: refundWallet,
      r: receipient,
      a: amount,
      c_at,
    };
    let encodedMemo = encodeJWT(invoiceMemo);

    const invoice = await createLightningInvoice({
      amount,
      message: encodedMemo,
      recipientAddr: process.env.NEXT_PUBLIC_VAULT_ADDR,
    });

    const { preImage } = await sendPayment(invoice);
    if (!preImage) {
      setIsLoading(false);
      return;
    }
    invoiceMemo.pi = preImage;
    invoiceMemo.img = img;
    invoiceMemo.m = message;
    encodedMemo = encodeJWT(invoiceMemo);
    onSuccess(encodedMemo);
    setIsLoading(false);
  };

  return (
    <Overlay exit={exit} width={500}>
      <div className="fit-container fx-centered fx-col box-pad-h-m box-pad-v">
        <h4>{t("AeOth8r")}</h4>
        <p className="box-pad-h p-centered gray-c">{t("AQXLRui")}</p>
        {step === 0 && (
          <RedPacketEnvPicker setStep={setStep} setImg={setImg} img={img} />
        )}
        {step === 1 && (
          <RedPacketPublish
            amount={amount}
            setAmount={setAmount}
            message={message}
            setMessage={setMessage}
            refundWallet={refundWallet}
            selectedWallet={selectedWallet}
            setSelectedWallet={setSelectedWallet}
            wallets={wallets}
            setWallets={setWallets}
            isLoading={isLoading}
            createRedPacket={createRedPacket}
            setStep={setStep}
            setRefundWallet={setRefundWallet}
          />
        )}
      </div>
    </Overlay>
  );
};
