import { decode } from "light-bolt11-decoder";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "react-redux";
import ZapTip from "@/Components/ZapTip";
import { convertDate } from "@/Helpers/Encryptions";

export default function LNBCInvoice({ lnbc }) {
  const { t } = useTranslation();
  const userKeys = useStore((state) => state.userKeys);
  const [amount, setAmount] = useState(0);
  const [expiry, setExpiry] = useState(0);
  const [isDecoded, setIsDecoded] = useState(false);

  useEffect(() => {
    try {
      let decoded = decode(lnbc);
      let a = decoded.sections.find((_) => _.name === "amount");
      let e = decoded.expiry;
      a = a ? Math.floor(parseInt(a.value) / 1000) : "N/A";
      setAmount(a);
      setExpiry(e * 1000 + new Date().getTime());
      setIsDecoded(true);
    } catch (err) {
      console.log(err);
    }
  }, []);

  if (!isDecoded)
    return (
      <span
        style={{
          wordBreak: "break-word",
          color: "var(--dark-gray)",
        }}
      >
        {lnbc}{" "}
      </span>
    );

  return (
    <div
      className="fit-container sc-s-18 box-pad-h-m box-pad-v-m bg-sp fx-centered"
      style={{ marginTop: ".5rem" }}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      <div style={{ minWidth: "50%" }}>
        <p className="gray-c">{t("AvEHTiP")}</p>
        <div className="fx-centered fx-start-h">
          <div className="bolt-bold-24"></div>
          <h3>{amount} Sats</h3>
        </div>
        <p className="gray-c">
          {t("AYlOMYB", { date: convertDate(new Date(expiry)) })}
        </p>
      </div>
      <ZapTip
        recipientLNURL={lnbc}
        recipientPubkey={""}
        senderPubkey={userKeys.pub}
        recipientInfo={{
          name: "",
          img: "",
        }}
        custom={{
          textColor: "",
          backgroundColor: "",
          content: t("AloNXcI", { amount }),
        }}
      />
    </div>
  );
}
