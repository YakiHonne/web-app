import React, { useEffect, useState, useRef } from "react";
import UserProfilePic from "@/Components/UserProfilePic";
import Date_ from "@/Components/Date_";
import LoadingDots from "@/Components/LoadingDots";
import UploadFile from "@/Components/UploadFile";
import { useSelector } from "react-redux";
import Emojis from "@/Components/Emojis";
import Gifs from "@/Components/Gifs";
import { useTranslation } from "react-i18next";
import { sendMessage } from "@/Helpers/DMHelpers";

export function ConversationBox({ convo, back, noHeader = false }) {
  const userKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();
  const convoContainerRef = useRef(null);
  const inputFieldRef = useRef(null);
  const [message, setMessage] = useState("");
  const [legacy, setLegacy] = useState(
    userKeys.sec || window?.nostr?.nip44
      ? localStorage?.getItem("legacy-dm")
      : true
  );
  const [replayOn, setReplayOn] = useState("");
  const [showProgress, setShowProgress] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const peerName =
    convo?.display_name?.substring(0, 10) ||
    convo?.name?.substring(0, 10) ||
    convo?.pubkey.substring(0, 10);
  useEffect(() => {
    if (convoContainerRef.current) {
      convoContainerRef.current.scrollTop =
        convoContainerRef.current.scrollHeight;
    }
    setShowProgress(false);
  }, [convo]);

  useEffect(() => {
    if (inputFieldRef.current) {
      inputFieldRef.current.style.height = "20px";
      inputFieldRef.current.style.height = `${inputFieldRef.current.scrollHeight}px`;
      inputFieldRef.current.scrollTop = inputFieldRef.current.scrollHeight;
      inputFieldRef.current.focus();
    }
  }, [message]);

  const handleSendMessage = () => {
    if (!message || !convo.pubkey) return;
    setMessage("");
    setReplayOn(false);
    setShowProgress(true);
    sendMessage(convo.pubkey, message);
  };

  const getReply = (ID) => {
    let msg = convo.convo.find((conv) => conv.id === ID);
    if (!msg) return false;
    return { content: msg.content, self: msg.pubkey === userKeys.pub };
  };

  const handleLegacyDMs = () => {
    if (legacy) {
      localStorage?.removeItem("legacy-dm");
      setLegacy(false);
    } else {
      localStorage?.setItem("legacy-dm", `${Date.now()}`);
      setLegacy(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  if (!convo) return;
  return (
    <div
      className="fit-container fx-scattered fx-col"
      style={{ height: "100%", rowGap: 0 }}
    >
      {!noHeader && (
        <div
          className="fit-container fx-scattered box-pad-h-m box-pad-v-m"
          style={{ position: "sticky", top: 0 }}
        >
          <div className="fx-centered">
            <div className="round-icon desk-hide" onClick={back}>
              <div className="arrow arrow-back"></div>
            </div>
            <UserProfilePic
              img={convo.picture}
              size={40}
              user_id={convo.pubkey}
              mainAccountUser={false}
            />
            <div>
              <p>
                {convo.display_name?.substring(0, 10) ||
                  convo.name?.substring(0, 10) ||
                  convo.pubkey.substring(0, 10)}
              </p>
              <p className="p-medium gray-c">
                @
                {convo.name?.substring(0, 10) ||
                  convo.display_name?.substring(0, 10)}
              </p>
            </div>
          </div>
          {(userKeys.sec || window?.nostr?.nip44) && (
            <div
              className="fx-centered round-icon-tooltip"
              data-tooltip={legacy ? t("Al6NH4U") : t("AfN9sMV")}
            >
              <p className="p-medium slide-left">{t("ATta6yb")}</p>
              <div
                className={`toggle ${legacy ? "toggle-dim-gray" : ""} ${
                  !legacy ? "toggle-green" : "toggle-dim-gray"
                }`}
                onClick={handleLegacyDMs}
              ></div>
            </div>
          )}
        </div>
      )}
      <div
        className="fx-centered fx-start-h fx-col box-pad-h-m box-pad-v-m fit-container"
        style={{
          height: noHeader ? "100%" : "calc(100% - 160px)",
          overflow: "auto",
          paddingTop: 0,
        }}
        ref={convoContainerRef}
      >
        {legacy && (
          <div
            className="fit-container"
            style={{ position: "sticky", zIndex: 100, top: 0 }}
          >
            <div className="fit-container">
              <div className="box-pad-h-m box-pad-v-m fx-centered fx-start-h fit-container sc-s-18">
                <div className="info-tt-24"></div>
                <div>
                  <p className="c1-c p-medium">{t("AakbxOk")}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {convo.convo.map((convo) => {
          let reply = convo.replyID ? getReply(convo.replyID) : false;
          return (
            <div
              key={convo.id}
              className="fit-container fx-centered fx-col"
              style={
                reply
                  ? {
                      borderRight: convo.peer
                        ? "2px solid var(--orange-main)"
                        : "",
                      borderLeft: !convo.peer
                        ? "2px solid var(--orange-main)"
                        : "",
                      paddingRight: convo.peer ? "1rem" : "",
                      paddingLeft: !convo.peer ? "1rem" : "",
                    }
                  : {}
              }
            >
              {reply && (
                <div
                  className={`convo-message fit-container  fx-centered fx-col ${
                    !convo.peer ? "fx-start-v" : "fx-end-v"
                  }`}
                >
                  {convo.peer && reply.self && (
                    <p className="p-italic p-medium orange-c">{t("ARPGCjx")}</p>
                  )}
                  {convo.peer && !reply.self && (
                    <p className="p-italic p-medium orange-c">
                      {t("AUvbLfk")} {peerName}
                    </p>
                  )}
                  {!convo.peer && reply.self && (
                    <p className="p-italic p-medium orange-c">
                      {peerName} {t("AyI4PnF")}
                    </p>
                  )}
                  {!convo.peer && !reply.self && (
                    <p className="p-italic p-medium orange-c">
                      {peerName} {t("AxbN1sx")} {peerName}
                    </p>
                  )}
                  <div
                    className="sc-s-18 box-pad-h-m box-pad-v-m fx-centered fx-start-h fx-start-v fx-col"
                    style={{
                      overflow: "visible",
                      maxWidth: "min(90%, 500px)",
                    }}
                  >
                    <div>{reply.content}</div>
                  </div>
                </div>
              )}
              <div
                className={`convo-message fit-container  fx-centered ${
                  !convo.peer ? "fx-start-h" : "fx-end-h"
                }`}
              >
                {convo.peer && (
                  <div>
                    <div
                      className="round-icon slide-left"
                      style={{
                        border: "none",
                        minHeight: "32px",
                        minWidth: "32px",
                        backgroundColor: "var(--dim-gray)",
                        transform: "scaleX(-1)",
                      }}
                      onClick={() => setReplayOn(convo)}
                    >
                      <p className="gray-c">&#x27A6;</p>
                    </div>
                  </div>
                )}
                <div
                  className="sc-s-18 box-pad-h-s box-pad-v-s fx-centered fx-start-h fx-start-v fx-col"
                  style={{
                    backgroundColor: convo.peer
                      ? "var(--orange-side)"
                      : "var(--c1-side)",
                    borderBottomLeftRadius: !convo.peer ? 0 : "inital",
                    borderBottomRightRadius: convo.peer ? 0 : "inital",
                    maxWidth: "min(90%, 500px)",
                    minWidth: "300px",
                    border: "none",
                    overflow: "visible",
                  }}
                >
                  {<div className="fit-container">{convo.content}</div> || (
                    <LoadingDots />
                  )}
                  <div
                    className="fx-centered fx-start-h round-icon-tooltip pointer fit-container"
                    data-tooltip={
                      convo.kind === 4 ? t("ALZCVV2") : t("ATta6yb")
                    }
                  >
                    {convo.kind === 4 && (
                      <>
                        <div>
                          <div className="unprotected"></div>
                        </div>
                        <p
                          className="gray-c p-medium"
                          style={{ fontStyle: "italic" }}
                        >
                          <Date_
                            toConvert={new Date(convo.created_at * 1000)}
                            time={true}
                          />
                        </p>
                      </>
                    )}
                    {convo.kind !== 4 && (
                      <>
                        <div>
                          <div className="protected"></div>
                        </div>
                        <p
                          className="green-c p-medium"
                          style={{ fontStyle: "italic" }}
                        >
                          <Date_
                            toConvert={new Date(convo.created_at * 1000)}
                            time={true}
                          />
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {!convo.peer && (
                  <div>
                    <div
                      className="round-icon slide-right"
                      style={{
                        border: "none",
                        minHeight: "32px",
                        minWidth: "32px",
                        backgroundColor: "var(--dim-gray)",
                        transform: "scaleX(-1)",
                      }}
                      onClick={() => setReplayOn(convo)}
                    >
                      <p className="gray-c">&#x27A6;</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showProgress && <SendingInProgress />}
      {replayOn && (
        <div
          className="fit-container box-pad-h-m box-pad-v-m fx-scattered slide-up"
          style={{
            paddingBottom: 0,
            borderTop: "1px solid var(--very-dim-gray)",
          }}
        >
          <div>
            <p className="gray-c p-medium">
              {t("AoUrRsg")}{" "}
              {replayOn.pubkey === userKeys.pub ? (
                t("Aesj4ga")
              ) : (
                <>
                  {convo.display_name?.substring(0, 10) ||
                    convo.name?.substring(0, 10) ||
                    convo.pubkey.substring(0, 10)}
                </>
              )}
            </p>
            <p className=" p-one-line" style={{ width: "min(90%, 500px)" }}>
              {replayOn.raw_content}
            </p>
          </div>
          <div
            className="close"
            style={{ position: "static" }}
            onClick={() => setReplayOn(false)}
          >
            <div></div>
          </div>
        </div>
      )}
      <div className="fit-container box-pad-h-m box-pad-v-m fx-scattered">
        <form
          className="fit-container fx-scattered fx-end-v"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <div
            className="sc-s-18 fx-centered fx-end-v fit-container"
            style={{
              overflow: "visible",
              backgroundColor: "transparent",
              gap: 0,
            }}
          >
            <textarea
              // type="text"
              className="if ifs-full if-no-border"
              placeholder={t("A7a54es")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              ref={inputFieldRef}
              disabled={showProgress}
              onKeyDown={handleKeyDown}
              autoFocus
              cols={5}
              style={{
                padding: ".75rem 0rem .75rem .75rem",
                height: "20px",
                // minHeight: "200px",
                maxHeight: "200px",
                borderRadius: 0,
                // fontSize: "1.2rem",
              }}
            />
            <div className="fx-centered" style={{ padding: ".75rem" }}>
              <Emojis
                position="right"
                setEmoji={(data) =>
                  setMessage(message ? `${message} ${data} ` : `${data} `)
                }
              />
              <div style={{ position: "relative" }}>
                <div
                  className="p-small box-pad-v-s box-pad-h-s pointer fx-centered"
                  style={{
                    padding: ".125rem .25rem",
                    border: "1px solid var(--gray)",
                    borderRadius: "6px",
                    backgroundColor: showGifs ? "var(--black)" : "transparent",
                    color: showGifs ? "var(--white)" : "",
                  }}
                  onClick={() => {
                    setShowGifs(!showGifs);
                  }}
                >
                  GIFs
                </div>
                {showGifs && (
                  <Gifs
                    setGif={(data) => {
                      setMessage(message ? `${message} ${data}` : data);
                      setShowGifs(false);
                    }}
                    exit={() => setShowGifs(false)}
                    position="right"
                  />
                )}
              </div>
              <UploadFile
                round={false}
                setImageURL={(data) => setMessage(`${message} ${data}`)}
                setIsUploadsLoading={() => null}
              />
            </div>
          </div>
          <div className="round-icon" onClick={handleSendMessage}>
            <div className="send-24"></div>
          </div>
        </form>
      </div>
    </div>
  );
}

const SendingInProgress = () => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    let tempW = 0;
    let interval = setInterval(() => {
      setWidth(tempW);
      if (tempW <= 90) tempW = tempW + 2;
    }, 5);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="fit-container">
      <div
        style={{
          width: `${width}%`,
          height: "4px",
          backgroundColor: "var(--green-main)",
          transition: ".2s ease-in-out",
        }}
      ></div>
    </div>
  );
};
