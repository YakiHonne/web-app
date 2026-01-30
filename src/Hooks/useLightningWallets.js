import { setToast } from "@/Store/Slides/Publishers";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import axios from "axios";

export default function () {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [wallets, setWallets] = useState(getWallets());
  const [selectedWallet, setSelectedWallet] = useState(
    wallets.find((wallet) => wallet.active),
  );

  const sendPayment = async (addr) => {
    if (selectedWallet.kind === 1) {
      let res = await sendWithWebLN(addr);
      return res;
    }
    if (selectedWallet.kind === 2) {
      let checkTokens = await checkAlbyToken(wallets, selectedWallet);
      setWallets(checkTokens.wallets);
      let res = await sendWithAlby(
        addr,
        checkTokens.activeWallet.data.access_token,
      );
      return res;
    }
    if (selectedWallet.kind === 3) {
      let res = await sendWithNWC(addr);
      return res;
    }
  };

  const sendWithWebLN = async (addr_) => {
    try {
      await window.webln?.enable();
      let res = await window.webln.sendPayment(addr_);
      return {
        status: res.preimage ? true : false,
        preImage: res.preimage,
      };
    } catch (err) {
      if (err.includes("User rejected")) return;
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        }),
      );
      return {
        status: false,
        preImage: "",
      };
    }
  };

  const sendWithNWC = async (addr_) => {
    try {
      const nwc = new webln.NWC({ nostrWalletConnectUrl: selectedWallet.data });
      await nwc.enable();
      const res = await nwc.sendPayment(addr_);
      nwc.close();
      return {
        status: res.preimage ? true : false,
        preImage: res.preimage,
      };
    } catch (err) {
      console.log(err);
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        }),
      );
      return {
        status: false,
        preImage: "",
      };
    }
  };

  const sendWithAlby = async (addr_, code) => {
    try {
      const res = await axios.post(
        "https://api.getalby.com/payments/bolt11",
        { invoice: addr_ },
        {
          headers: {
            Authorization: `Bearer ${code}`,
          },
        },
      );
      return {
        status: res.data.preimage ? true : false,
        preImage: res.data.preimage,
      };
    } catch (err) {
      console.log(err);
      return {
        status: false,
        preImage: "",
      };
    }
  };

  const generateWithWebLN = async (amount, comment) => {
    try {
      await window.webln.enable();
      let invoice = await window.webln.makeInvoice({
        defaultMemo: comment,
        amount,
      });
      return invoice.paymentRequest;
    } catch (err) {
      console.log(err);
      if (err.includes("User rejected")) return;
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        }),
      );
    }
  };
  const generateWithNWC = async (amount, comment) => {
    try {
      const nwc = new webln.NWC({ nostrWalletConnectUrl: selectedWallet.data });
      await nwc.enable();
      const invoice = await nwc.makeInvoice({
        defaultMemo: comment,
        amount,
      });
      nwc.close();
      return invoice.paymentRequest;
    } catch (err) {
      console.log(err);
      if (err.includes("User rejected")) return;
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        }),
      );
    }
  };

  const generateWithAlby = async (code, amount, comment) => {
    try {
      const data = await axios.post(
        "https://api.getalby.com/invoices",
        { amount, comment, description: comment, memo: comment },
        {
          headers: {
            Authorization: `Bearer ${code}`,
          },
        },
      );
      return data.data.payment_request;
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const generateInvoice = async (amount, comment) => {
    let invoice = "";
    if (selectedWallet.kind === 1) {
      invoice = await generateWithWebLN(amount, comment);
    }
    if (selectedWallet.kind === 2) {
      let checkTokens = await checkAlbyToken(wallets, selectedWallet);
      setWallets(checkTokens.wallets);
      invoice = await generateWithAlby(
        checkTokens.activeWallet.data.access_token,
        amount,
        comment,
      );
    }
    if (selectedWallet.kind === 3) {
      invoice = await generateWithNWC(amount, comment);
    }
    return invoice;
  };

  const checkAlbyToken = async (wallets, activeWallet) => {
    let tokenExpiry =
      activeWallet.data.created_at + activeWallet.data.expires_in;
    let currentTime = Math.floor(Date.now() / 1000);
    if (tokenExpiry > currentTime)
      return {
        wallets,
        activeWallet,
      };
    try {
      let fd = new FormData();
      fd.append("refresh_token", activeWallet.data.refresh_token);
      fd.append("grant_type", "refresh_token");
      const access_token = await axios.post(
        "https://api.getalby.com/oauth/token",
        fd,
        {
          auth: {
            username: process.env.NEXT_PUBLIC_ALBY_CLIENT_ID,
            password: process.env.NEXT_PUBLIC_ALBY_SECRET_ID,
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      let tempWallet = { ...activeWallet };
      tempWallet.data = {
        ...access_token.data,
        created_at: Math.floor(Date.now() / 1000),
      };
      let tempWallets = Array.from(wallets);
      let index = wallets.findIndex((item) => item.id === activeWallet.id);
      tempWallets[index] = tempWallet;
      updateWallets(tempWallets);
      return {
        wallets: tempWallets,
        activeWallet: tempWallet,
      };
    } catch (err) {
      console.log(err);
      return {
        wallets,
        activeWallet,
      };
    }
  };

  return {
    selectedWallet,
    wallets,
    setWallets,
    setSelectedWallet,
    sendPayment,
    generateInvoice,
  };
}
