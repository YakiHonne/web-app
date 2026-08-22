import React, { useEffect, useState } from "react";
import { getEventStatAfterEOSE } from "@/Helpers/Controlers";
import { saveEventStats } from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import WriteNote from "@/Components/WriteNote";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import LoginSignup from "@/Components/LoginSignup";
import Icon from "@/Components/Icon";
import { iconsNames } from "@/Content/IconV2URL";
import Overlay from "@/Components/Overlay";

export default function Quote({ isQuoted, event, actions }) {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [eventID, setEventID] = useState(false);
  const [showQuoteBox, setShowQuoteBox] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    const updateDb = async () => {
      let subscription = ndkInstance.subscribe([{ ids: [eventID] }], {
        groupable: false,
      });
      subscription.on("event", (event_) => {
        let stats = getEventStatAfterEOSE(event_, "quotes", actions, undefined);
        saveEventStats(event.aTag || event.id, stats);
        subscription.stop();
        setEventID(false);
      });
    };
    if (eventID) updateDb();
  }, [eventID]);

  return (
    <>
      {showQuoteBox && (
        <Overlay exit={() => setShowQuoteBox(false)} width={600}>
          <div>
            <WriteNote
              exit={() => setShowQuoteBox(false)}
              linkedEvent={event}
              isQuote={true}
              content={""}
            />
          </div>
        </Overlay>
      )}
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
      <div
        className={"round-icon-tooltip"}
        data-tooltip={t("A5XLJln")}
        onClick={() => (userKeys ? setShowQuoteBox(true) : setIsLogin(true))}
      >
        <Icon
          // name={isQuoted ? "quote-bold" : "quote"}
          v={2}
          name={iconsNames.double_quotes_r}
          size={24}
          opacity={!isQuoted ? 0.4 : "initial"}
          isColored={isQuoted}
          className={"pointer"}
          isBoldThemeColor={isQuoted}
        />
      </div>
    </>
  );
}
