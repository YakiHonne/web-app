import React, { useEffect, useState } from "react";
import { getLinkFromAddr } from "@/Helpers/Helpers";
import ZapTip from "@/Components/ZapTip";
import { getEmptyuserMetadata, getHex } from "@/Helpers/Encryptions";
import { useSelector } from "react-redux";
import { getUser } from "@/Helpers/Controlers";

const getPubkey = (pubkey, url) => {
  if (!url || url.startsWith("lnbc")) return false;
  try {
    if (pubkey.startsWith("npub")) return getHex(pubkey);
    return pubkey;
  } catch (err) {
    return pubkey;
  }
};

export default function ButtonComp({
  content,
  textColor,
  url,
  backgroundColor,
  recipientPubkey,
  type,
}) {
  const userKeys = useSelector((state) => state.userKeys);
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  let pubkey = getPubkey(recipientPubkey, url);
  const [author, setAuthor] = useState(
    pubkey ? getEmptyuserMetadata(pubkey) : false
  );

  useEffect(() => {
    if (pubkey) {
      try {
        let auth = getUser(pubkey);
        if (auth) {
          setAuthor(auth);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }, [nostrAuthors]);

  const getUrl = () => {
    if (!type) return "/";
    if (["regular", "youtube", "discord", "x", "telegram"].includes(type))
      return url;
    if (type === "zap") return false;
    if (type === "nostr") {
      return getLinkFromAddr(url);
    }
    return "/";
  };

  const getButtonColor = () => {
    if (!type || type === "regular" || type === "zap")
      return { color: textColor, backgroundColor };
    if (type === "youtube")
      return { color: "white", backgroundColor: "#FF0000" };
    if (type === "discord")
      return { color: "white", backgroundColor: "#7785cc" };
    if (type === "x") return { color: "white", backgroundColor: "#000000" };
    if (type === "telegram")
      return { color: "white", backgroundColor: "#24A1DE" };
    if (type === "nostr") return { color: "white", backgroundColor: "" };
    return { color: "white", backgroundColor: "" };
  };

  const [buttonUrl, setButtonUrl] = useState(getUrl());
  const [buttonColor, setButtonColor] = useState(getButtonColor());

  useEffect(() => {
    setButtonColor(getButtonColor());
    setButtonUrl(getUrl());
  }, [type, backgroundColor, textColor]);

  if (buttonUrl !== false)
    return (
      <a className="fit-container" href={buttonUrl} target="_blank">
        <button
          className="btn btn-normal btn-full fx-centered"
          style={buttonColor}
        >
          {type === "youtube" && <div className="youtube-logo"></div>}
          {type === "nostr" && <div className="nostr-icon"></div>}
          {type === "discord" && <div className="discord-logo"></div>}
          {type === "x" && <div className="twitter-w-logo"></div>}
          {type === "telegram" && <div className="telegram-b-logo"></div>}
          {content}
        </button>
      </a>
    );

  return (
    <ZapTip
      recipientLNURL={url}
      recipientPubkey={pubkey}
      senderPubkey={userKeys.pub}
      recipientInfo={{
        name: author.display_name || author.name,
        img: author.picture,
      }}
      custom={{
        textColor,
        backgroundColor,
        content,
      }}
    />
  );
}
