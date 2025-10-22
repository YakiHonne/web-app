import React, { useEffect, useRef, useState } from "react";
import UploadFile from "@/Components/UploadFile";
import LoadingDots from "@/Components/LoadingDots";
import MentionSuggestions from "@/Components/MentionSuggestions";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { extractNip19 } from "@/Helpers/Helpers";
import { getNoteDraft, updateNoteDraft } from "@/Helpers/ClientHelpers";
import { InitEvent } from "@/Helpers/Controlers";
import { getZapEventRequest } from "@/Helpers/NostrPublisher";
import { encryptEventData, shortenKey } from "@/Helpers/Encryptions";
import axios from "axios";
import { ndkInstance } from "@/Helpers/NDKInstance";
import QRCode from "react-qr-code";
import Gifs from "@/Components/Gifs";
import Emojis from "@/Components/Emojis";
import NotePreview from "@/Components/NotePreview";
import { useTranslation } from "react-i18next";
import ActionTools from "@/Components/ActionTools";
import BrowseSmartWidgetsV2 from "@/Components/BrowseSmartWidgetsV2";
import ProfilesPicker from "@/Components/ProfilesPicker";
import { useRouter } from "next/navigation";
import Toggle from "./Toggle";
import RelayImage from "./RelayImage";
import { SelectTabs } from "./SelectTabs";
import LinkRepEventPreview from "./LinkRepEventPreview";
import { customHistory } from "@/Helpers/History";
import { getNDKInstance } from "@/Helpers/utils";

export default function WriteNote({
  exit,
  border = true,
  borderBottom = false,
  content,
  linkedEvent,
  isQuote = false,
  protectedRelay = false,
}) {
  const navigateTo = useRouter();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const userRelays = useSelector((state) => state.userRelays);
  const { t } = useTranslation();

  const [note, setNote] = useState(content);
  const [mention, setMention] = useState("");
  const [showGIFs, setShowGIFs] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [showSmartWidgets, setShowSmartWidgets] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isProtected, setIsProtected] = useState(protectedRelay);
  const [invoice, setInvoice] = useState(false);
  const [showWarningBox, setShowWarningBox] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const textareaRef = useRef(null);
  const [selectedProfile, setSelectedProfile] = useState(false);
  const ref = useRef();

  useEffect(() => {
    adjustHeight();
  }, [note, selectedTab]);

  useEffect(() => {
    if (userKeys && !content && !linkedEvent) {
      setNote(getNoteDraft("root"));
    }
  }, [userKeys]);

  useEffect(() => {
    if (!content && !linkedEvent) updateNoteDraft("root", note);
  }, [note]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      let cursorPosition = textareaRef.current.selectionStart;
      if (note.charAt(cursorPosition - 1) === "@")
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
    setNote(value);
  };

  const handleSelectingMention = (data) => {
    setNote((prev) => prev.replace(`@${mention}`, `${data} `));
    setShowMentionSuggestions(false);
    setMention("");
    if (textareaRef.current) textareaRef.current.focus();
  };

  const publishNote = async () => {
    try {
      if (isLoading) return;
      if (!userKeys) return;
      if (!note && !linkedEvent) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AXwG7Rx"),
          })
        );
        return;
      }
      let tags = [
        [
          "client",
          "Yakihonne",
          "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
        ],
      ];

      let processedContent = extractNip19(
        linkedEvent
          ? `${note} nostr:${linkedEvent.naddr || linkedEvent.nEvent}`
          : note
      );

      let processedTags = Array.from(processedContent.tags);

      if (isQuote && linkedEvent) {
        tags.push(["q", linkedEvent.aTag || linkedEvent.id]);
        tags.push(["p", linkedEvent.pubkey]);
        processedTags = processedTags.filter(
          (_) => _[1] !== (linkedEvent.aTag || linkedEvent.id)
        );
      }

      if (isProtected && protectedRelay) {
        tags.push(["-"]);
      }

      if (isPaid) {
        publishAsPaid(
          processedContent.content,
          [...tags, ...processedTags],
          isProtected && protectedRelay ? protectedRelay : false
        );
      } else {
        publishAsFree(
          processedContent.content,
          [...tags, ...processedTags],
          isProtected && protectedRelay ? protectedRelay : false
        );
      }
    } catch (err) {
      console.log(err);
      dispatch(
        setToast({
          type: 2,
          desc: t("AXNt63U"),
        })
      );
    }
  };

  const publishAsFree = async (content, tags, relay) => {
    setIsLoading(true);
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
        allRelays: relay ? [relay] : [],
        isFavRelay: relay ? relay : false,
      })
    );
    updateNoteDraft("root", "");
    let timer = setTimeout(() => {
      if (window.location.pathname !== "/") customHistory("/");
      // navigateTo.push("/dashboard", { state: { tabNumber: 1, filter: "notes" } });
      exit();
      setIsLoading(false);
      clearTimeout(timer);
    }, 1000);
  };

  const publishAsPaid = async (content, tags_, relay) => {
    try {
      setIsLoading(true);

      let tags = structuredClone(tags_);
      let created_at = Math.floor(Date.now() / 1000);

      tags.push(["l", "FLASH NEWS"]);
      tags.push(["yaki_flash_news", encryptEventData(`${created_at}`)]);

      let eventInitEx = await InitEvent(
        1,
        content,
        tags,
        created_at,
        selectedProfile
      );

      if (!eventInitEx) {
        setIsLoading(false);
        return;
      }
      let sats = 800 * 1000;

      let zapTags = [
        ["relays", ...userRelays],
        ["amount", sats.toString()],
        ["lnurl", process.env.NEXT_PUBLIC_YAKI_FUNDS_ADDR],
        ["p", process.env.NEXT_PUBLIC_YAKI_PUBKEY],
        ["e", eventInitEx.id],
      ];

      var zapEvent = await getZapEventRequest(
        userKeys,
        `${userMetadata.name} paid for a paid note.`,
        zapTags
      );
      if (!zapEvent) {
        setIsLoading(false);
        return;
      }

      const res = await axios(
        `${process.env.NEXT_PUBLIC_YAKI_FUNDS_ADDR_CALLBACK}?amount=${sats}&nostr=${zapEvent}&lnurl=${process.env.NEXT_PUBLIC_YAKI_FUNDS_ADDR}`
      );

      if (res.data.status === "ERROR") {
        setIsLoading(false);
        dispatch(
          setToast({
            type: 2,
            desc: t("AZ43zpG"),
          })
        );
        return;
      }

      setInvoice(res.data.pr);

      const { webln } = window;
      if (webln) {
        try {
          await webln.enable();
          await webln.sendPayment(res.data.pr);
        } catch (err) {
          console.log(err);
          setIsLoading(false);
          setInvoice("");
        }
      }

      let sub = ndkInstance.subscribe(
        [
          {
            kinds: [9735],
            "#p": [process.env.NEXT_PUBLIC_YAKI_PUBKEY],
            "#e": [eventInitEx.id],
          },
        ],
        { groupable: false, cacheUsage: "ONLY_RELAY" }
      );

      sub.on("event", () => {
        setInvoice("");
        dispatch(
          setToPublish({
            eventInitEx,
            allRelays: relay ? [relay] : [],
          })
        );
        sub.stop();
        updateNoteDraft("root", "");
        navigateTo.push("/dashboard", {
          state: { tabNumber: 1, filter: "notes" },
        });
        exit();
        setIsLoading(false);
      });
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      dispatch(
        setToast({
          type: 2,
          desc: t("AXNt63U"),
        })
      );
    }
  };

  const handleAddImage = (data) => {
    handleInsertTextInPosition(data);
  };

  const handleAddWidget = (data) => {
    if (note)
      setNote(
        note + " " + `https://yakihonne.com/smart-widget-checker?naddr=${data} `
      );
    if (!note)
      setNote(`https://yakihonne.com/smart-widget-checker?naddr=${data} `);
    setShowSmartWidgets(false);
  };

  const handleInsertTextInPosition = (keyword) => {
    let cursorPosition = 0;
    if (textareaRef.current) {
      cursorPosition = textareaRef.current.selectionStart;
    }
    const updatedText =
      note.slice(0, cursorPosition) +
      ` ${keyword}` +
      note.slice(cursorPosition);
    if (note) setNote(updatedText);
    else setNote(keyword);
    let timeout = setTimeout(() => {
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
        cursorPosition + keyword.length + 1;
      textareaRef.current.focus();
      setTimeout(timeout);
    }, 0);
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    dispatch(
      setToast({
        type: 1,
        desc: `${t("AS0m8W5")} 👏`,
      })
    );
  };

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      let swbrowser = document.getElementById("sw-browser");
      if (
        ref.current &&
        !ref.current.contains(e.target) &&
        !swbrowser?.contains(e.target) &&
        !invoice
      ) {
        if (!note) {
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
  }, [ref, invoice, note]);

  const handleDiscard = (isSave) => {
    if (isSave) {
      exit();
    } else {
      updateNoteDraft("root", "");
      exit();
    }
  };

  return (
    <>
      {showWarningBox && (
        <div className="fixed-container fx-centered box-pad-h">
          <div
            className="sc-s bg-sp box-pad-h box-pad-v fx-centered"
            style={{ width: "min(100%, 500px)" }}
          >
            <div className="fx-centered fx-col">
              <h4>{linkedEvent ? "Heads up!" : "Save draft?"}</h4>
              <p className="gray-c p-centered box-pad-v-m">
                {t(linkedEvent ? "AwNtfnu" : "ATjCUcj")}
              </p>
              <div className="fit-container fx-centered">
                <div className="fx-centered">
                  <button
                    className="btn btn-gst-red"
                    onClick={() => handleDiscard(false)}
                  >
                    {t("AT7NTrQ")}
                  </button>
                  {!linkedEvent && (
                    <button
                      className="btn btn-gst"
                      onClick={() => handleDiscard(true)}
                    >
                      {t("ACLAlFM")}
                    </button>
                  )}
                </div>
                <div>
                  <button
                    className="btn btn-normal"
                    onClick={() => setShowWarningBox(false)}
                  >
                    {t("AB4BSCe")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSmartWidgets && (
        <BrowseSmartWidgetsV2
          exit={() => setShowSmartWidgets(false)}
          setWidget={handleAddWidget}
        />
      )}
      {invoice && (
        <div
          className="fixed-container fx-centered box-pad-h fx-col"
          style={{ zIndex: 10001 }}
        >
          <div
            className="fx-centered fx-col fit-container sc-s bg-sp box-pad-h box-pad-v"
            style={{ width: "420px", gap: "1rem" }}
          >
            <div
              style={{
                width: "100%",
                backgroundColor: "white",
                borderRadius: "18px",
              }}
              className="fx-centered box-pad-h-m box-pad-v-m"
            >
              <QRCode
                style={{ width: "100%", aspectRatio: "1/1" }}
                size={340}
                value={invoice}
              />
            </div>
            <div
              className="fx-scattered if pointer dashed-onH fit-container "
              style={{ borderStyle: "dashed" }}
              onClick={() => copyKey(invoice)}
            >
              <p>{shortenKey(invoice)}</p>
              <div className="copy-24"></div>
            </div>
            <div className="fit-container fx-centered ">
              <p className="gray-c p-medium">{t("A1ufjMM")}</p>
              <LoadingDots />
            </div>
          </div>
          <div className="round-icon-tooltip" data-tooltip={t("AIuHDQy")}>
            <div
              style={{ position: "static" }}
              className="close"
              onClick={() => setInvoice("")}
            >
              <div></div>
            </div>
          </div>
        </div>
      )}
      <div
        className="fit-container fx-centered fx-start-v fx-stretch sc-s box-pad-h box-pad-v bg-sp"
        style={{
          overflow: "visible",
          height: linkedEvent ? "65vh" : "55vh",
          backgroundColor: !border ? "transparent" : "",
          border: border ? "1px solid var(--very-dim-gray)" : "none",
          borderBottom: borderBottom
            ? "1px solid var(--very-dim-gray)"
            : "none",
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
            className="fit-container fx-scattered fx-col note-txtarea"
            style={{
              position: "relative",
            }}
          >
            <div
              className="fit-container fx-scattered fx-col fx-start-h fx-start-v"
              style={{
                height:
                  linkedEvent && selectedTab === 0
                    ? "calc(100% - 138px)"
                    : "100%",
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
                  />
                </div>
                {protectedRelay && (
                  <div className="fx fx-centered fx-start-h">
                    <div
                      className="fx-centered  box-pad-h-m"
                      style={{ borderLeft: "1px solid var(--dim-gray)" }}
                    >
                      <div
                        className="fx-centered fx-col fx-start-v"
                        style={{ gap: "0px" }}
                      >
                        <p
                          className="gray-c p-medium p-one-line"
                          style={{ minWidth: "max-content" }}
                        >
                          {t("A0qEczF")}
                        </p>
                        <div className="fx-centered" style={{ gap: "3px" }}>
                          <RelayImage url={protectedRelay} size={16} />
                          <span className="p-one-line">
                            {protectedRelay.substring(0, 25)}
                            {protectedRelay.length > 25 ? "..." : ""}
                          </span>
                          {/* <span className="p-one-line">{protectedRelay.replace("wss://", "").replace("ws://", "")}</span> */}
                        </div>
                      </div>
                      <Toggle
                        status={isProtected}
                        setStatus={setIsProtected}
                        small={true}
                      />
                    </div>
                  </div>
                )}
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
                      maxHeight: "100%",
                      minHeight: "100%",
                      borderRadius: 0,
                      fontSize: "1.2rem",
                    }}
                    value={note}
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
                <NotePreview
                  content={note}
                  linkedEvent={linkedEvent}
                  viewPort={true}
                />
              )}
            </div>
            {linkedEvent && selectedTab === 0 && (
              <div className="fit-container">
                <LinkRepEventPreview event={linkedEvent} />
              </div>
            )}
          </div>
          <div className="fit-container fx-centered fx-start-v">
            <div className="fit-container fx-scattered fx-wrap">
              <div className="fx-centered" style={{ gap: "12px" }}>
                <UploadFile
                  setImageURL={handleAddImage}
                  setIsUploadsLoading={() => null}
                />
                <Emojis setEmoji={(data) => handleInsertTextInPosition(data)} />
                <div style={{ position: "relative" }}>
                  <div
                    className="p-small box-pad-v-s box-pad-h-s pointer fx-centered"
                    style={{
                      padding: ".125rem .25rem",
                      border: "1.5px solid var(--gray)",
                      borderRadius: "6px",
                      backgroundColor: showGIFs
                        ? "var(--black)"
                        : "transparent",
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
                <div className="fx-centered sc-s-18 bg-sp box-pad-h-s ">
                  <p
                    className="gray-c p-medium"
                    style={{ minWidth: "max-content" }}
                  >
                    {t("AfkY3WI")}
                  </p>
                  <Toggle status={isPaid} setStatus={setIsPaid} small={true} />
                </div>
              </div>
              <div className="fx-centered" style={{ flex: "1 1 100px" }}>
                {exit && (
                  <button
                    className="btn btn-gst btn-small fx"
                    disabled={isLoading}
                    onClick={() => (note ? setShowWarningBox(true) : exit())}
                  >
                    {isLoading ? <LoadingDots /> : t("AB4BSCe")}
                  </button>
                )}
                <button
                  className="btn btn-normal btn-small fx"
                  onClick={publishNote}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingDots />
                  ) : isPaid ? (
                    t("A559jVY")
                  ) : (
                    t("AT4tygn")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
