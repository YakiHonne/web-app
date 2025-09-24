import React, { useEffect, useRef, useState } from "react";
import ActionTools from "@/Components/ActionTools";
import { useDispatch, useSelector } from "react-redux";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { getEventStatAfterEOSE, InitEvent } from "@/Helpers/Controlers";
import { saveEventStats } from "@/Helpers/DB";
import { extractNip19 } from "@/Helpers/Helpers";
import { setToPublish } from "@/Store/Slides/Publishers";
import LoadingDots from "@/Components/LoadingDots";
import UploadFile from "@/Components/UploadFile";
import MentionSuggestions from "@/Components/MentionSuggestions";
import Gifs from "@/Components/Gifs";
import Emojis from "@/Components/Emojis";
import NotePreview from "@/Components/NotePreview";
import { useTranslation } from "react-i18next";
import LoginSignup from "@/Components/LoginSignup";
import ProfilesPicker from "@/Components/ProfilesPicker";
import { getNoteDraft, updateNoteDraft } from "@/Helpers/ClientHelpers";
import { SelectTabs } from "../SelectTabs";

export default function Comments({
  noteTags = false,
  replyId,
  replyPubkey,
  exit,
  actions,
  tagKind = "e",
  kind = "note",
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [comment, setComment] = useState("");
  const [showWarningBox, setShowWarningBox] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventID, setEventID] = useState(false);
  const [imgsSet, setImgsSet] = useState([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [showGIFs, setShowGIFs] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [mention, setMention] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const textareaRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    if (userKeys) {
      let draft_ = getNoteDraft(replyId);
      setComment(draft_);
    }
  }, [userKeys]);

  useEffect(() => {
    const updateDb = async () => {
      let subscription = ndkInstance.subscribe([{ ids: [eventID] }], {
        groupable: false,
        skipVerification: true,
        skipValidation: true,
      });
      subscription.on("event", (event_) => {
        let stats = getEventStatAfterEOSE(
          event_,
          "replies",
          actions,
          undefined
        );
        updateNoteDraft(replyId, "");
        saveEventStats(replyId, stats);
        setEventID(false);
        subscription.stop();
        exit();
      });
    };
    if (eventID) updateDb();
  }, [eventID]);

  const commentNote = async (e) => {
    e.stopPropagation();
    if (isLoading || !comment) return;

    try {
      setIsLoading(true);
      let extracted = extractNip19(comment);
      let content = extracted.content;
      let tags = [];

      if (noteTags) {
        tags = [
          ...tags,
          ...noteTags.filter(
            (tag) => tag[0] === "p" || (tag.length > 3 && tag[3] === "root")
          ),
        ];
        let checkIsRoot = tags.find(
          (tag) => tag.length > 3 && tag[3] === "root"
        );
        if (checkIsRoot) tags.push(["e", replyId, "", "reply"]);
        else tags.push([tagKind, replyId, "", "root"]);
        if (!tags.find((tag) => tag[0] === "p" && tag[1] === replyPubkey))
          tags.push(["p", replyPubkey]);
      }
      if (!noteTags) {
        tags.push([tagKind, replyId, "", "root"]);
        tags.push(["p", replyPubkey]);
      }

      tags = [...tags, ...extracted.tags];
      let eventInitEx = await InitEvent(
        1,
        content,
        tags,
        undefined,
        selectedProfile
      );
      if (!eventInitEx) {
        setIsLoading(false);
        return;
      }
      dispatch(
        setToPublish({
          eventInitEx,
          allRelays: [],
        })
      );

      setIsLoading(false);
      setEventID(eventInitEx.id);
      // exit();
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateNoteDraft(replyId, comment);
    adjustHeight();
  }, [comment, selectedTab]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      textareaRef.current.focus();
    }
  };

  const handleSelectingMention = (data) => {
    setComment((prev) => prev.replace(`@${mention}`, data));
    setShowMentionSuggestions(false);
    setMention("");
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleInsertTextInPosition = (keyword) => {
    let cursorPosition = 0;
    if (textareaRef.current) {
      cursorPosition = textareaRef.current.selectionStart;
    }
    const updatedText =
      comment.slice(0, cursorPosition) +
      ` ${keyword}` +
      comment.slice(cursorPosition);
    if (comment) setComment(updatedText);
    else setComment(keyword);
    let timeout = setTimeout(() => {
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
        cursorPosition + keyword.length + 1;
      textareaRef.current.focus();
      setTimeout(timeout);
    }, 0);
  };

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      if (ref.current && !ref.current.contains(e.target) && !showWarningBox) {
        if (!comment) {
          exit();
        } else {
          setShowWarningBox(true);
        }
      }
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [ref, showWarningBox, comment]);

  const handleDiscard = (isSave) => {
    if (isSave) {
      exit();
    } else {
      updateNoteDraft(replyId, "");
      exit();
    }
  };

  const handleAddImage = (data) => {
    handleInsertTextInPosition(data);
    setImgsSet((prev) => [...prev, data]);
  };

  const handleOnChange = (event) => {
    let value = event.target.value;
    let cursorPosition = event.target.selectionStart;
    const textUpToCursor = value.slice(0, cursorPosition);
    const match = textUpToCursor.match(/@(\w*)$/);
    setMention(match ? match[1] : "");
    if (match && !showMentionSuggestions) setShowMentionSuggestions(true);
    if (!match) setShowMentionSuggestions(false);
    setComment(value);
  };

  if (!userKeys)
    return (
      <>
        {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
        <div className="fit-container fx-centered box-pad-v fx-col slide-up">
          <h4>{t("ASt0wnG")}</h4>
          <p className="gray-c">{t("AAWFsjt")}</p>
          <button
            className="btn btn-normal btn-small"
            onClick={() => setIsLogin(true)}
          >
            {t("AmOtzoL")}
          </button>
        </div>
      </>
    );
  return (
    <>
      {showWarningBox && (
        <div className="fixed-container fx-centered box-pad-h">
          <div
            className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
            style={{ width: "min(100%, 500px)" }}
          >
            <div className="fx-centered fx-col">
              <h4>{t("AGNjoi1")}</h4>
              <p className="gray-c p-centered box-pad-v-m">{t("AdeLRrz")}</p>
              <div className="fit-container fx-centered">
                <div className="fx-centered">
                  <button
                    className="btn btn-gst-red"
                    onClick={() => handleDiscard(false)}
                  >
                    {t("AT7NTrQ")}
                  </button>
                  <button
                    className="btn btn-gst"
                    onClick={() => handleDiscard(true)}
                  >
                    {t("ACLAlFM")}
                  </button>
                </div>
                <div>
                  <button
                    className="btn btn-normal"
                    onClick={() => setShowWarningBox(false)}
                  >
                    {t("A7hAlr2")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        className="fit-container fx-centered fx-start-v sc-s-18 bg-sp box-pad-h-m box-pad-v-m"
        // style={{ paddingTop: ".5rem" }}
        style={{
          overflow: "visible",
          zIndex: "10",
          position: "relative",
          height: "300px",
        }}
        ref={ref}
      >
        {/* <UserProfilePic size={48} mainAccountUser={true} allowClick={false} /> */}
        <ProfilesPicker setSelectedProfile={setSelectedProfile} />
        <div
          className="fit-container fx-centered fx-wrap fit-height"
          style={{ maxWidth: "calc(100% - 48px)" }}
        >
          <div
            className="fit-container fx-scattered fx-col"
            style={{
              position: "relative",
              height: "calc(100% - 60px)",
            }}
          >
            <div
              className="fit-container fx-scattered fx-col fx-start-h fx-start-v"
              style={{ height: "100%" }}
            >
              <div>
                <SelectTabs
                  tabs={[t("AsXohpb"), t("Ao1TlO5")]}
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                />
              </div>
              {selectedTab === 0 && (
                <div
                  className="fit-container  box-pad-h-s box-pad-v-s"
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
                      maxHeight: "100%",
                      minHeight: "100%",
                      borderRadius: 0,
                    }}
                    className="txt-area ifs-full if if-no-border"
                    placeholder={t("AOmRQKF")}
                    value={comment}
                    onChange={handleOnChange}
                    disabled={isLoading}
                    autoFocus
                    ref={textareaRef}
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
                <NotePreview content={comment} viewPort={true} />
              )}
            </div>
          </div>
          <div className="fit-container fx-scattered">
            <div className="fx-centered" style={{ gap: "12px" }}>
              <UploadFile
                round={false}
                small={false}
                setImageURL={handleAddImage}
                setIsUploadsLoading={() => null}
              />
              <Emojis setEmoji={(data) => handleInsertTextInPosition(data)} />
              <div style={{ position: "relative" }}>
                <div
                  className="p-small box-pad-v-s box-pad-h-s pointer fx-centered"
                  style={{
                    padding: ".125rem .25rem",
                    border: "1px solid var(--gray)",
                    borderRadius: "6px",
                    backgroundColor: showGIFs ? "var(--black)" : "transparent",
                    color: showGIFs ? "var(--white)" : "",
                  }}
                  onClick={() => {
                    setShowGIFs(!showGIFs);
                    setShowMentionSuggestions(false);
                  }}
                >
                  GIFs
                </div>
                {showGIFs && (
                  <Gifs
                    setGif={handleAddImage}
                    exit={() => setShowGIFs(false)}
                  />
                )}
              </div>
              <ActionTools
                setData={(data) => handleInsertTextInPosition(data)}
              />
            </div>
            <div className="fx-centered fit-container fx-end-h">
              <button
                className="btn btn-gst btn-small"
                onClick={() => (comment ? setShowWarningBox(true) : exit())}
                disabled={isLoading}
              >
                {isLoading ? <LoadingDots /> : t("AB4BSCe")}
              </button>
              <button
                className="btn btn-normal btn-small"
                onClick={commentNote}
                disabled={isLoading}
              >
                {isLoading ? <LoadingDots /> : t("AT4tygn")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
