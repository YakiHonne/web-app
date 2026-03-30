import React, { useMemo, useState } from "react";
import LoginSignup from "@/Components/LoginSignup";
import PaymentGateway from "@/Components/PaymentGateway";
import { nip19 } from "nostr-tools";
import Icon from "@/Components/Icon";

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
  zapLabel = false,
  setReceivedEvent = () => null,
  isZapped = false,
}) {
  const [showCashier, setCashier] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const nostrEventIDEncode = useMemo(
    () => getNostrEventIDEncode(aTag, eTag),
    [aTag, eTag],
  );

  if (custom) {
    if (
      !recipientLNURL ||
      // (!recipientPubkey && !recipientLNURL.startsWith("lnbc")) ||
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
        {onlyIcon && !zapLabel && (
          <Icon
            name="bolt"
            size={smallIcon ? 18 : 24}
            className="opacity-4"
            style={{ opacity: ".2" }}
          />
        )}
        {zapLabel && (
          <div>
            <Icon
              name="bolt"
              size={smallIcon ? 18 : 24}
              className="opacity-4"
            />
            <p className="p-medium">Zap</p>
          </div>
        )}
        {!onlyIcon && !zapLabel && (
          <div
            className={`${
              smallIcon ? "round-icon-small" : "round-icon"
            }  round-icon-tooltip if-disabled`}
            data-tooltip="Zap"
          >
            <Icon
              name="lightning"
              size={smallIcon ? 18 : 24}
              style={{ cursor: "not-allowed" }}
            />
          </div>
        )}
      </>
    );
  if (!senderPubkey)
    return (
      <>
        {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
        {onlyIcon && !zapLabel && (
          <Icon
            name="bolt"
            size={smallIcon ? 18 : 24}
            className="opacity-4"
            onClick={() => setIsLogin(true)}
          />
        )}
        {zapLabel && (
          <div onClick={() => setIsLogin(true)}>
            <Icon
              name={
                smallIcon
                  ? isZapped
                    ? "bolt-bold"
                    : "bolt"
                  : isZapped
                    ? "bolt-bold"
                    : "bolt"
              }
              isColored={isZapped}
              isBoldThemeColor={isZapped}
              size={smallIcon ? 18 : 24}
            />
            <p className="p-medium">Zap</p>
          </div>
        )}
        {!onlyIcon && !zapLabel && (
          <div
            className={`${
              smallIcon ? "round-icon-small" : "round-icon"
            }  round-icon-tooltip`}
            onClick={() => setIsLogin(true)}
            data-tooltip="Zap"
          >
            <Icon name="lightning" size={smallIcon ? 18 : 24} />
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
      {onlyIcon && !zapLabel && (
        <Icon
          name={isZapped ? "bolt-bold" : "bolt"}
          isColored={isZapped}
          isBoldThemeColor={isZapped}
          size={smallIcon ? 18 : 24}
          className={!isZapped ? "opacity-4" : ""}
          onClick={() => setCashier(true)}
        />
      )}
      {!onlyIcon && !zapLabel && (
        <div
          className={`${
            smallIcon ? "round-icon-small" : "round-icon"
          }  round-icon-tooltip`}
          data-tooltip="Zap"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setCashier(true);
          }}
        >
          <Icon name="lightning" size={smallIcon ? 18 : 24} />
        </div>
      )}
      {zapLabel && (
        <div onClick={() => setCashier(true)}>
          <Icon
            name={isZapped ? "bolt-bold" : "bolt"}
            size={smallIcon ? 18 : 24}
            isColored={isZapped}
            isBoldThemeColor={isZapped}
          />
          <p className="p-medium">Zap</p>
        </div>
      )}
    </>
  );
}
