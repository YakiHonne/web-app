import { decodeUrlOrAddress } from "@/Helpers/Encryptions";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ZapTip from "./ZapTip";
import { useSelector } from "react-redux";
import { copyText } from "@/Helpers/Helpers";

const getAddressFromLNURL = async (lnurl) => {
  try {
    let data = await axios.get(decodeUrlOrAddress(lnurl));

    let metadata = JSON.parse(data.data.metadata);
    metadata = metadata.find((_) => _[0].includes("identifier"));

    if (metadata) return metadata[1];
    return false;
  } catch (err) {
    return false;
  }
};

export default function LNURLParsing({ lnurl }) {
  const { t } = useTranslation();

  const userKeys = useSelector((state) => state.userKeys);
  let [address, setAddress] = useState(false);
  let [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddress = async () => {
      let address = await getAddressFromLNURL(lnurl);
      setAddress(address);
      setIsLoading(false);
    };
    fetchAddress();
  }, [lnurl]);

  if (isLoading)
    return (
      <div
        className="box-pad-h-m box-pad-v-m sc-s-18 bg-sp fx-centered fx-col fit-container skeleton-container"
        style={{ height: "70px" }}
      ></div>
    );
  if (!address) return <p>{lnurl}</p>;
  return (
    <div className="box-pad-h-m box-pad-v-m sc-s-18 bg-sp fx-centered fx-col fit-container">
      <div className="fit-container fx-scattered">
        <div>
          <p className="gray-c p-medium">{t("A40BuYB")}</p>
          <p>{address}</p>
        </div>
        <div
          className="copy-24"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            copyText(address, t("ALR84Tq"))
          }}
        ></div>
      </div>
      <ZapTip
        recipientLNURL={lnurl}
        custom={{
          content: "Zap",
          backgroundColor: "var(--orange-main)",
          textColor: "var(--white)",
        }}
        senderPubkey={userKeys?.pub}
      />
    </div>
  );
}
