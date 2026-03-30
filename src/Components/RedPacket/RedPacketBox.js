import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { formatTime } from "@/Helpers/Helpers";
import { RedPacketIcon } from "./RedPacketIcon";
import RedPacketEnv from "./RedPacketEnv";
import useRedPacket from "@/Hooks/useRedPacket";
import LoadingDots from "../LoadingDots";
import { useMemo } from "react";
import Icon from "../Icon";

export default function RedPacketBox({ data }) {
  const userKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();
  let { s, img, r, m, a, c_at, pi } = data;
  const expiryTime = c_at + 3 * 24 * 60 * 60; // 3 days in seconds
  const [timeLeft, setTimeLeft] = useState(
    expiryTime - Math.floor(Date.now() / 1000),
  );
  const [isExpiredRealTime, setIsExpiredRealTime] = useState(timeLeft <= 0);
  const [isOpen, setIsOpen] = useState(false);
  const {
    isRedeemed,
    isExpired,
    isRefunded,
    isInvalid,
    isRedPacketChecking,
    claimRedPacket,
  } = useRedPacket({ preimage: pi, created_at: c_at });
  const isOwner = userKeys.pub === s;
  const enableClick = useMemo(() => {
    return (
      !isExpiredRealTime &&
      !isOwner &&
      !isRedeemed &&
      !isInvalid &&
      !isExpired &&
      !isRefunded
    );
  }, [
    isExpiredRealTime,
    isOwner,
    isRedeemed,
    isInvalid,
    isExpired,
    isRefunded,
  ]);

  useEffect(() => {
    if (isExpiredRealTime || isExpired || isOwner || isRedeemed || isInvalid)
      return;

    const interval = setInterval(() => {
      const remaining = expiryTime - Math.floor(Date.now() / 1000);
      if (remaining <= 0) {
        setIsExpiredRealTime(true);
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime, isExpiredRealTime, isRedeemed, isInvalid, isExpired]);

  if (isRedPacketChecking)
    return (
      <div className="fit-container sc-s-18 bg-sp box-pad-v">
        <LoadingDots />
      </div>
    );

  if (!isOpen || isRedeemed)
    return (
      <div
        className="fit-container sc-s-18 bg-sp "
        style={{
          opacity: !enableClick && !isOwner ? ".7" : 1,
          cursor: enableClick ? "pointer" : "not-allowed",
        }}
        onClick={() => enableClick && setIsOpen(true)}
      >
        <div className="fit-container fx-scattered box-pad-h-s box-pad-v-s">
          <RedPacketIcon isOwner={isOwner} enableClick={enableClick} />
          <div
            className="fit-container fx-centered fx-col fx-start-h fx-start-v"
            style={{ gap: "4px" }}
          >
            <p className="p-two-lines">{m || t("Awhkh2I")}</p>
            {isRedeemed && (
              <div className="fx-centered">
                <p className="green-c">{t("A87KTMh")}</p>
                <Icon name={"checkmark-tt"} size={20} isColored />
              </div>
            )}
            {!isRedeemed && isExpired && !isRefunded && (
              <div className="fx-centered">
                <p className="red-c">{t("A3QmDp9")}</p>
                <Icon name="crossmark-tt" isColored />
              </div>
            )}
            {isRefunded && (
              <div className="fx-centered">
                <p className="gray-c p-italic">{t("AyaahNF")}</p>
              </div>
            )}
          </div>
        </div>
        <hr />
        {!isExpiredRealTime &&
          !isOwner &&
          !isRedeemed &&
          !isExpired &&
          !isRefunded && (
            <div
              className="fit-container fx-scattered box-pad-h-s box-pad-v-s"
              style={{ backgroundColor: "var(--c1-side)" }}
            >
              {isExpiredRealTime ? (
                <p className="p-medium gray-c p-italic">{t("AgR3uT4")}</p>
              ) : (
                <div className="fit-container">
                  <p className="gray-c p-medium">{t("AfqSscA")}</p>
                  <p className="p-medium">{formatTime(timeLeft)}</p>
                </div>
              )}
            </div>
          )}
      </div>
    );
  return (
    <RedPacketEnv
      data={data}
      timeLeft={timeLeft}
      claimRedPacket={claimRedPacket}
    />
  );
}
