import React, { useMemo, useState } from "react";
import LoginSignup from "@/Components/LoginSignup";
import PaymentGateway from "@/Components/PaymentGateway";
import { nip19 } from "nostr-tools";

const getNostrEventIDEncode = (aTag, eTag) => {
  try {
    if (eTag) return nip19.noteEncode(eTag);
    if (aTag) {
      return nip19.naddrEncode({
        identifier: aTag
          .split(":")
          .splice(2, aTag.split(":").length - 1)
          .join(""),
        kind: aTag.split(":")[0],
        pubkey: aTag.split(":")[1],
      });
    }
    return "";
  } catch (err) {
    return "";
  }
};

export default function ZapTip({
  recipientLNURL,
  recipientPubkey,
  senderPubkey,
  aTag = "",
  eTag = "",
  onlyIcon = false,
  smallIcon = false,
  custom = false,
  setReceivedEvent = () => null,
  isZapped = false,
}) {
  const [showCashier, setCashier] = useState(false);
  const [lnbcAmount, setLnbcAmount] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const nostrEventIDEncode = useMemo(
    () => getNostrEventIDEncode(aTag, eTag),
    [aTag, eTag]
  );

  if (custom) {
    if (
      !recipientLNURL ||
      (!recipientPubkey && !recipientLNURL.startsWith("lnbc")) ||
      senderPubkey === recipientPubkey
    )
      return (
        <button
          className="btn btn-normal btn-full if-disabled"
          style={{
            color: custom.textColor,
            backgroundColor: custom.backgroundColor,
          }}
        >
          {custom.content}
        </button>
      );
    return (
      <>
        {showCashier && (
          <PaymentGateway
            recipientAddr={recipientLNURL}
            recipientPubkey={recipientPubkey}
            paymentAmount={0}
            nostrEventIDEncode={nostrEventIDEncode}
            setReceivedEvent={setReceivedEvent}
            exit={() => setCashier(false)}
          />
        )}
        <button
          className="btn btn-normal btn-full"
          style={{
            color: custom.textColor,
            backgroundColor: custom.backgroundColor,
          }}
          onClick={() => setCashier(true)}
        >
          {custom.content}
        </button>
      </>
    );
  }

  if (
    !recipientLNURL ||
    !recipientPubkey ||
    // !callback ||
    senderPubkey === recipientPubkey
  )
    return (
      <>
        {onlyIcon && (
          <div
            className={smallIcon ? "bolt" : "bolt-24 opacity-4"}
            style={{ opacity: ".2" }}
          ></div>
        )}
        {!onlyIcon && (
          <div
            className={`${
              smallIcon ? "round-icon-small" : "round-icon"
            }  round-icon-tooltip if-disabled`}
            data-tooltip="Zap"
          >
            <div
              className={smallIcon ? "lightning" : "lightning-24 opacity-4"}
              style={{ cursor: "not-allowed" }}
            ></div>
          </div>
        )}
      </>
    );
  if (!senderPubkey)
    return (
      <>
        {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
        {onlyIcon && (
          <div
            className={smallIcon ? "bolt" : "bolt-24 opacity-4"}
            onClick={() => setIsLogin(true)}
          ></div>
        )}
        {!onlyIcon && (
          <div
            className={`${
              smallIcon ? "round-icon-small" : "round-icon"
            }  round-icon-tooltip`}
            onClick={() => setIsLogin(true)}
            data-tooltip="Zap"
          >
            <div className={smallIcon ? "lightning" : "lightning-24 opacity-4"}></div>
          </div>
        )}
      </>
    );

  return (
    <>
      {showCashier && (
        <PaymentGateway
          recipientAddr={recipientLNURL}
          recipientPubkey={recipientPubkey}
          paymentAmount={0}
          nostrEventIDEncode={nostrEventIDEncode}
          setReceivedEvent={setReceivedEvent}
          exit={() => setCashier(false)}
        />
      )}
      {onlyIcon && (
        <div
          className={
            smallIcon
              ? isZapped
                ? "bolt-bold"
                : "bolt opacity-4"
              : isZapped
              ? "bolt-bold-24"
              : "bolt-24 opacity-4"
          }
          onClick={() => setCashier(true)}
        ></div>
      )}
      {!onlyIcon && (
        <div
          className={`${
            smallIcon ? "round-icon-small" : "round-icon"
          }  round-icon-tooltip`}
          data-tooltip="Zap"
          onClick={(e) => {
            e.stopPropagation();
            setCashier(true);
          }}
        >
          <div className={smallIcon ? "lightning" : "lightning-24 opacity-4"}></div>
        </div>
      )}
    </>
  );
}
