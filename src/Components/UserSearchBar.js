import React, { useState } from "react";
import { nip19 } from "nostr-tools";
import { getHex } from "@/Helpers/Encryptions";
import MentionSuggestions from "./MentionSuggestions";
import { useTranslation } from "react-i18next";

export default function UserSearchBar({
  onClick,
  getUserMetadata = false,
  full = false,
  placeholder,
  displayAbove = false,
}) {
  const [keyword, setKeyword] = useState("");
  const { t } = useTranslation();

  const handleKeyword = (e) => {
    let value = e.target.value;

    try {
      if (value.includes("nprofile")) {
        let data = nip19.decode(value);
        onClick(data.data.pubkey);

        return;
      }
      if (value.includes("npub")) {
        let hex = getHex(value);
        onClick(hex);
        return;
      }
      setKeyword(value);
    } catch (err) {
      setKeyword(value);
    }
  };

  const setSelectedMentionPubkey = (data) => {
    onClick(
      data.includes("npub") ? getHex(data) : nip19.decode(data).data?.pubkey
    );
    setKeyword("");
  };
  const setSelectedMentionMetadata = (data) => {
    getUserMetadata(data);
    setKeyword("");
  };

  return (
    <div
      className={full ? "fx-centered fit-container" : "fx-centered"}
      style={{ position: "relative", zIndex: "101" }}
    >
      <label
        className="fx-centered fx-start-h if search-if"
        htmlFor="search-input"
        style={{
          width: full ? "100%" : "450px",
          cursor: "default",
          position: "relative",
          paddingRight: "0",
        }}
      >
        <div className="search-24"></div>
        <input
          id="search-input"
          type="search"
          className="if ifs-full"
          placeholder={placeholder || t("ACVzIap")}
          value={keyword}
          style={{ paddingLeft: ".5rem" }}
          onChange={handleKeyword}
        />
        {keyword && (
          <MentionSuggestions
            mention={keyword}
            setSelectedMention={!getUserMetadata && setSelectedMentionPubkey}
            setSelectedMentionMetadata={
              getUserMetadata && setSelectedMentionMetadata
            }
            displayAbove={displayAbove}
          />
        )}
      </label>
    </div>
  );
}
