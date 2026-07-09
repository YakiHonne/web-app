import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getEventStatAfterEOSE,
  updateYakiChestStats,
} from "@/Helpers/Controlers";
import { saveEventStats } from "@/Helpers/DB";
import { checkForLUDS, getZapper } from "@/Helpers/Encryptions";
import ZapTip from "@/Components/ZapTip";
import { ndkInstance } from "@/Helpers/NDKInstance";
import axiosInstance from "@/Helpers/HTTP_Client";
import { setUpdatedActionFromYakiChest } from "@/Store/Slides/YakiChest";
import LoginSignup from "@/Components/LoginSignup";
import dynamic from "next/dynamic";
import { nip19 } from "nostr-tools";

const PaymentGateway = dynamic(() => import("@/Components/PaymentGateway"), {
  ssr: false,
});
import Icon from "@/Components/Icon";
import NumberShrink from "../NumberShrink";

const getNostrEventIDEncode = (aTag, eTag) => {
  try {
    if (eTag) return nip19.noteEncode(eTag);
    if (aTag) {
      return nip19.naddrEncode({
        identifier: aTag.split(":").splice(2, aTag.split(":").length - 1).join(""),
        kind: aTag.split(":")[0],
        pubkey: aTag.split(":")[1],
      });
    }
    return "";
  } catch {
    return "";
  }
};

const Zap = forwardRef(function Zap({ event, user, actions, isZapped, amount }, ref) {
  const dispatch = useDispatch();
  const userMetadata = useSelector((state) => state.userMetadata);
  const [showCashier, setCashier] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const recipientLNURL = checkForLUDS(user.lud06, user.lud16);
  const recipientPubkey = event.pubkey;
  const senderPubkey = userMetadata?.pubkey;
  const eTag = event.aTag ? "" : event.id;
  const aTag = event.aTag ? event.aTag : "";
  const nostrEventIDEncode = useMemo(() => getNostrEventIDEncode(aTag, eTag), [aTag, eTag]);

  const forContent = useMemo(() => {
    if (event.title) return event.title?.substring(0, 40);
    if (event.content) return event.content?.substring(0, 40);
    return "";
  }, []);

  useImperativeHandle(ref, () => ({
    open() {
      if (!recipientLNURL || !recipientPubkey || senderPubkey === recipientPubkey) return;
      if (!senderPubkey) { setIsLogin(true); return; }
      setCashier(true);
    },
  }));

  const reactToNote = async (filter) => {
    let event_ = await getEvent(filter);
    let zapper = getZapper(event_);
    let amount = zapper.amount;
    let content = zapper.message;
    let stats = getEventStatAfterEOSE(
      zapper,
      "zaps",
      actions,
      { amount, content },
      event_.created_at,
    );
    saveEventStats(event.aTag || event.id, stats);
    updateYakiChest(amount);
  };

  const getEvent = async (filter) => {
    return new Promise((resolve) => {
      let sub = ndkInstance.subscribe(filter, { groupable: false, cacheUsage: "ONLY_RELAY" });
      sub.on("event", (event) => { resolve(event.rawEvent()); sub.stop(); });
    });
  };

  const updateYakiChest = async (amount) => {
    try {
      let action_key = getActionKey(amount);
      if (action_key) {
        let data = await axiosInstance.post("/api/v1/yaki-chest", { action_key });
        let { user_stats, is_updated } = data.data;
        if (is_updated) {
          dispatch(setUpdatedActionFromYakiChest(is_updated));
          updateYakiChestStats(user_stats);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getActionKey = (amount) => {
    if (amount > 0 && amount <= 20) return "zap-1";
    if (amount <= 60) return "zap-20";
    if (amount <= 100) return "zap-60";
    if (amount > 100) return "zap-100";
    return false;
  };

  const canZap = recipientLNURL && recipientPubkey && senderPubkey !== recipientPubkey;

  return (
    <>
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
      {showCashier && (
        <PaymentGateway
          recipientAddr={recipientLNURL}
          recipientPubkey={recipientPubkey}
          paymentAmount={0}
          nostrEventIDEncode={nostrEventIDEncode}
          setReceivedEvent={reactToNote}
          exit={() => setCashier(false)}
        />
      )}
      <Icon
        name={isZapped ? "bolt-bold" : "bolt"}
        isColored={isZapped && canZap}
        isBoldThemeColor={isZapped && canZap}
        size={20}
        opacity={!isZapped || !canZap ? 0.4 : "initial"}
      />
      <span
        className={`p-medium ${isZapped ? "orange-c" : "opacity-4"}`}
      >
        <NumberShrink value={amount} />
      </span>
    </>
  );
});

export default Zap;
