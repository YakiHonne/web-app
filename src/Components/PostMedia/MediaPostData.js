import React, { useEffect, useRef } from "react";
import Toggle from "../Toggle";
import MentionSuggestions from "../MentionSuggestions";
import NotePreview from "../NotePreview";
import { SelectTabs } from "../SelectTabs";
import ProfilesPicker from "../ProfilesPicker";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function MediaPostData({
  description,
  setDescription,
  isSensitive,
  setSensitive,
  setSelectedProfile,
}) {
  const { t } = useTranslation();
  const [mention, setMention] = useState("");
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const textareaRef = useRef(null);
  const ref = useRef();

  useEffect(() => {
    adjustHeight();
  }, [description, selectedTab]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      let cursorPosition = textareaRef.current.selectionStart;
      if (description.charAt(cursorPosition - 1) === "@")
        setShowMentionSuggestions(true);
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      textareaRef.current.focus();
    }
  };

  const handleChange = (event) => {
    let value = event.target.value;
    let cursorPosition = event.target.selectionStart;
    const textUpToCursor = value.slice(0, cursorPosition);

    const match = textUpToCursor.match(/@(\w*)$/);

    setMention(match ? match[1] : "");
    if (match && !showMentionSuggestions) setShowMentionSuggestions(true);
    if (!match) setShowMentionSuggestions(false);
    setDescription(value);
  };

  const handleSelectingMention = (data) => {
    setDescription((prev) => prev.replace(`@${mention}`, `${data} `));
    setShowMentionSuggestions(false);
    setMention("");
    if (textareaRef.current) textareaRef.current.focus();
  };

  return (
    <div className="fit-container fx-centered fx-start-v fx-start-h fx-col">
      <div
        className="fit-container fx-centered fx-start-v fx-stretch sc-s-18 bg-sp"
        style={{
          overflow: "visible",
          border: "none",
          borderBottom: "1px solid var(--dim-gray)",
        }}
        ref={ref}
        onClick={() => {
          textareaRef?.current?.focus();
        }}
      >
        <div style={{ paddingTop: ".2rem" }}>
          <ProfilesPicker setSelectedProfile={setSelectedProfile} />
        </div>
        <div
          className="fit-container fx-scattered fx-col fx-wrap fit-height"
          style={{ maxWidth: "calc(100% - 36px)" }}
        >
          <div
            className="fit-container fx-scattered fx-col"
            style={{
              position: "relative",
              height: "100%",
            }}
          >
            <div
              className="fit-container fx-scattered fx-col fx-start-h fx-start-v"
              style={{
                height: "100%",
              }}
            >
              <div
                className="fit-container fx-centered fx-start-h"
                style={{ gap: "16px" }}
              >
                <div className="fx-centered">
                  <SelectTabs
                    tabs={[t("AsXohpb"), t("Ao1TlO5")]}
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                    small={true}
                  />
                </div>
              </div>
              {selectedTab === 0 && (
                <div
                  className="fit-container box-pad-h-s box-pad-v-s"
                  style={{
                    position: "relative",
                    height: "auto",
                    maxHeight: "100%",
                    minHeight: "45px",
                  }}
                >
                  <textarea
                    type="text"
                    style={{
                      padding: 0,
                      maxHeight: "200px",
                      minHeight: "100%",
                      borderRadius: 0,
                      fontSize: "1.1rem",
                    }}
                    value={description}
                    className="ifs-full if if-no-border"
                    placeholder={t("AGAXMQ3")}
                    ref={textareaRef}
                    onChange={handleChange}
                    autoFocus
                    dir="auto"
                  />
                  {showMentionSuggestions && (
                    <MentionSuggestions
                      mention={mention}
                      setSelectedMention={handleSelectingMention}
                    />
                  )}
                </div>
              )}
              {selectedTab === 1 && (
                <NotePreview content={description} viewPort={true} />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="fx-scattered fit-container sc-s-18 box-pad-h-m box-pad-v-s bg-sp">
        <p>{t("AtRAswG")}</p>
        <Toggle setStatus={setSensitive} status={isSensitive} />
      </div>
    </div>
  );
}
