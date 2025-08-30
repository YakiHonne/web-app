import React, { useEffect, useRef, useState } from "react";
import UploadFile from "@/Components/UploadFile";
import LoadingDots from "@/Components/LoadingDots";
import MentionSuggestions from "@/Components/MentionSuggestions";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import {
  extractNip19,
} from "@/Helpers/Helpers";
import {getNoteDraft, updateNoteDraft} from "@/Helpers/ClientHelpers";
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

export default function WriteNote({
  widget,
  exit,
  border = true,
  borderBottom = false,
  content,
  linkedEvent,
  isQuote = false,
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
  const [invoice, setInvoice] = useState(false);
  const [imgsSet, setImgsSet] = useState([]);
  const [widgetsSet, setWidgetsSet] = useState([]);
  const [showWarningBox, setShowWarningBox] = useState(false);
  const textareaRef = useRef(null);
  const ref = useRef();
  const lowerSectionRef = useRef(null);
  const [lowerSectionHeight, setLowerSectionHeight] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState(false);

  useEffect(() => {
    if (lowerSectionRef.current) {
      setLowerSectionHeight(lowerSectionRef.current.offsetHeight);
    }
  }, [lowerSectionRef.current]);

  useEffect(() => {
    adjustHeight();
  }, [note]);

  useEffect(() => {
    if (userKeys && !content && !linkedEvent) {
      setNote(getNoteDraft("root"));
    }
  }, [userKeys]);

  useEffect(() => {
    if (widget) {
      handleAddWidget(widget);
    }
  }, []);

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

      if (isPaid) {
        publishAsPaid(processedContent.content, [...tags, ...processedTags]);
      } else {
        publishAsFree(processedContent.content, [...tags, ...processedTags]);
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

  const publishAsFree = async (content, tags) => {
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
        allRelays: [],
      })
    );
    updateNoteDraft("root", "");
    navigateTo.push("/dashboard", { state: { tabNumber: 1, filter: "notes" } });
    exit();
    setIsLoading(false);
  };

  const publishAsPaid = async (content, tags_) => {
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
        `${userMetadata.name} paid for a flash news note.`,
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
            allRelays: [],
          })
        );
        sub.stop();
        updateNoteDraft("root", "");
        navigateTo.push("/dashboard", { state: { tabNumber: 1, filter: "notes" } });
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
    setImgsSet((prev) => [...prev, data]);
  };

  const handleAddWidget = (data) => {
    if (note)
      setNote(
        note + " " + `https://yakihonne.com/smart-widget-checker?naddr=${data} `
      );
    if (!note)
      setNote(`https://yakihonne.com/smart-widget-checker?naddr=${data} `);
    setWidgetsSet((prev) => [...prev, data]);
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
            className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
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
            className="fx-centered fx-col fit-container sc-s-18 box-pad-h-s box-pad-v-s"
            style={{ width: "400px" }}
          >
            <QRCode
              style={{ width: "100%", aspectRatio: "1/1" }}
              size={400}
              value={invoice}
            />
            <div
              className="fx-scattered if pointer dashed-onH fit-container box-marg-s"
              style={{ borderStyle: "dashed" }}
              onClick={() => copyKey(invoice)}
            >
              <p>{shortenKey(invoice)}</p>
              <div className="copy-24"></div>
            </div>
            <div className="fit-container fx-centered box-marg-s">
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
        className="fit-container fx-centered fx-start-v fx-stretch sc-s-18 box-pad-h-m box-pad-v-m bg-sp"
        style={{
          overflow: "visible",
          maxHeight: "90vh",
          height: "90vh",
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
        <div>
          {/* <UserProfilePic size={34} mainAccountUser={true} allowClick={false} /> */}
          <ProfilesPicker setSelectedProfile={setSelectedProfile} />
        </div>
        <div
          className="fit-container fx-scattered fx-col fx-wrap fit-height"
          style={{ maxWidth: "calc(100% - 36px)" }}
        >
          <div
            className="fit-container fx-scattered fx-col"
            style={{ position: "relative", height: "calc(95% - 98px)" }}
          >
            <div
              className="fit-container"
              style={{ position: "relative", maxHeight: "50%" }}
            >
              <textarea
                type="text"
                style={{
                  padding: 0,
                  height: "auto",
                  maxHeight: "100%",
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
            <NotePreview content={note} linkedEvent={linkedEvent} />
          </div>
          <div
            className="fit-container fx-centered fx-start-v fx-wrap"
            ref={lowerSectionRef}
          >
            <div className="fit-container fx-scattered">
              <div className="fx-centered" style={{ gap: "12px" }}>
                {/* <div
                  className="p-big pointer"
                  onClick={() => {
                    handleInsertTextInPosition("@");
                    setShowGIFs(false);
                  }}
                >
                  @
                </div> */}
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
                {/* <div onClick={() => setShowSmartWidgets(true)}>
                  <div className="smart-widget-24"></div>
                </div> */}
                <ActionTools
                  setData={(data) => handleInsertTextInPosition(data)}
                />
              </div>
              <div className="fx-centered">
                {exit && (
                  <button
                    className="btn btn-gst btn-small"
                    disabled={isLoading}
                    onClick={() => (note ? setShowWarningBox(true) : exit())}
                  >
                    {isLoading ? <LoadingDots /> : t("AB4BSCe")}
                  </button>
                )}
                <button
                  className="btn btn-normal btn-small"
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

            <div className="fx-scattered fit-container box-pad-h-s box-pad-v-s sc-s-18">
              <div className="box-pad-h-s">
                <p>{t("AfkY3WI")}</p>
                <p className="p-medium gray-c">{t("A0EIM4m")}</p>
              </div>
              <div
                className={`toggle ${isPaid === -1 ? "toggle-dim-gray" : ""} ${
                  isPaid !== -1 && isPaid ? "toggle-c1" : "toggle-dim-gray"
                }`}
                onClick={() => setIsPaid(!isPaid)}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
