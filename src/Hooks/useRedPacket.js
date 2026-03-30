import axiosInstance from "@/Helpers/HTTP_Client";
import React, { useState, useEffect } from "react";
import { getRedPacket, setRedPacket } from "@/Helpers/utils/redpacketCache";
import { encrypt44 } from "@/Helpers/Encryptions";
import { useSelector } from "react-redux";

export default function useRedPacket({ preimage, created_at }) {
  const userKeys = useSelector((state) => state.userKeys);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isRefunded, setIsRefunded] = useState(false);
  const [isRedPacketChecking, setIsRedPacketChecking] = useState(true);

  useEffect(() => {
    if (!preimage) return;

    const cached = getRedPacket(preimage);
    if (cached) {
      setIsRedeemed(cached.isRedeemed);
      setIsExpired(cached.isExpired);
      setIsRefunded(cached.isRefunded);
      setIsRedPacketChecking(false);
      return;
    }

    axiosInstance
      .get("/check-redpacket", { params: { preimage } })
      .then((res) => {
        const data = res.data || res;
        setIsRedeemed(data.isRedeemed);
        setIsExpired(data.isExpired);
        setIsRefunded(data.isRefunded);
        setIsRedPacketChecking(false);
        setRedPacket(preimage, {
          isRedeemed: data.isRedeemed,
          isExpired: data.isExpired,
          isRefunded: data.isRefunded,
          created_at,
        });
      })
      .catch((err) => {
        setIsInvalid(true);
        setIsRedPacketChecking(false);
      });
  }, [preimage, created_at]);

  const claimRedPacket = async (addr) => {
    let payload = JSON.stringify({
      pubkey: userKeys.pub,
      preimage: preimage,
      addr,
    });
    let encodedSecret = await encrypt44(
      userKeys,
      process.env.NEXT_PUBLIC_CHECKER_PUBKEY,
      payload,
    );
    try {
      let res = await axiosInstance.post("/claim-redpacket", {
        token: encodedSecret,
        pubkey: userKeys.pub,
      });
      if (res.data) {
        setIsRedeemed(true);
        setRedPacket(preimage, {
          isRedeemed: true,
          isExpired,
          isRefunded,
          created_at,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  return {
    isRedeemed,
    isExpired,
    isRefunded,
    isInvalid,
    isRedPacketChecking,
    claimRedPacket,
  };
}
