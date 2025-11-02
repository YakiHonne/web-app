import React, { useEffect, useState } from "react";
import { getEventStatAfterEOSE } from "@/Helpers/Controlers";
import { saveEventStats } from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import WriteNote from "@/Components/WriteNote";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import LoginSignup from "@/Components/LoginSignup";

export default function Quote({ isQuoted, event, actions }) {
  const { t } = useTranslation();
  const userKeys = useSelector(state => state.userKeys)
  const [eventID, setEventID] = useState(false);
  const [showQuoteBox, setShowQuoteBox] = useState(false);
const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    const updateDb = async () => {
      let subscription = ndkInstance.subscribe([{ ids: [eventID] }], {
        groupable: false,
        // skipVerification: true,
        // skipValidation: true,
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
        <div className="fixed-container fx-centered box-pad-h">
          <div style={{ width: "min(100%, 600px)" }}>
            <WriteNote
              exit={() => setShowQuoteBox(false)}
              linkedEvent={event}
              isQuote={true}
              content={""}
            />
          </div>
        </div>
      )}
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
      <div
        className={"round-icon-tooltip"}
        data-tooltip={t("A5XLJln")}
        onClick={() => userKeys ? setShowQuoteBox(true) : setIsLogin(true)}
      >
        <div
          className={isQuoted ? "quote-bold-24 pointer" : "quote-24 opacity-4 pointer"}
        ></div>
      </div>
    </>
  );
}
