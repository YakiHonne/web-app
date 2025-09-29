import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import useDirectMessages from "@/Hooks/useDirectMessages";
import UserProfilePic from "./UserProfilePic";
import Date_ from "./Date_";
import useCloseContainer from "@/Hooks/useCloseContainer";
import { useRouter } from "next/router";
import { ConversationBox } from "./ConversationBox";
import { handleUpdateConversation } from "@/Helpers/DMHelpers";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import InitiConvo from "./InitConvo";
import LoadingDots from "./LoadingDots";

export default function FloatingDMs() {
  const { t } = useTranslation();
  const router = useRouter();
  const userKeys = useSelector((state) => state.userKeys);
  const initDMS = useSelector((state) => state.initDMS);
  const { sortedInbox, userChatrooms, isNewMsg } = useDirectMessages();
  const { containerRef, open, setOpen } = useCloseContainer();
  const [selectedConvo, setSelectedConvo] = useState(false);
  const [isConvoLoading, setIsConvoLoading] = useState(false);
  const [initConv, setInitConv] = useState(false);
  const convoBoxRef = useRef();

  const handleSelectedConversation = (conversation, ignoreLoading = false) => {
    try {
      if (!ignoreLoading) {
        setIsConvoLoading(true);
        setSelectedConvo(false);
      }
      let tempConvo = conversation.convo.map((convo) => {
        let content = getNoteTree(
          convo.content,
          undefined,
          undefined,
          undefined,
          convo.pubkey
        );
        return {
          ...convo,
          content,
          raw_content: convo.content,
        };
      });
      setSelectedConvo({
        ...conversation,
        convo: tempConvo,
      });
      handleUpdateConversation(conversation);
      if (!ignoreLoading) {
        setIsConvoLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (selectedConvo && open) {
      let updatedConvo = userChatrooms.find(
        (inbox) => inbox.pubkey === selectedConvo.pubkey
      );
      handleSelectedConversation(
        {
          ...updatedConvo,
          picture: selectedConvo.picture,
          display_name: selectedConvo.display_name,
          name: selectedConvo.name,
        },
        true
      );
    }
    if (convoBoxRef.current) {
      let timer = setTimeout(() => {
        convoBoxRef.current.classList.remove("slide-up");
        clearTimeout(timer);
      }, 500);
    }
  }, [userChatrooms, open]);

  useEffect(() => {
    if (selectedConvo) {
      setSelectedConvo(false);
      setOpen(false)
    }
  }, [userKeys])

  if (router.pathname.includes("/messages")) return null;
  if (!userKeys.sec && !userKeys?.ext) return null;
  return (
    <>
      {initConv && <InitiConvo exit={() => setInitConv(false)} />}
      <div
        style={{
          position: "fixed",
          right: "74px",
          bottom: "16px",
          zIndex: "10001",
        }}
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
      >
        {!open && !selectedConvo && (
          <div
            className="sc-s fx-centered fx-start-h box-pad-h-m box-pad-v-m option slide-right"
            onClick={() => setOpen(true)}
          >
            <div className="send-24"></div>
            <p className="box-pad-h-s">{t("As2zi6P")}</p>
            {isNewMsg && (
              <div
                style={{
                  minWidth: "8px",
                  aspectRatio: "1/1",
                  backgroundColor: "var(--red-main)",
                  borderRadius: "var(--border-r-50)",
                }}
              ></div>
            )}
          </div>
        )}
        {!open && selectedConvo && (
          <div
            className="sc-s fx-centered fx-start-h box-pad-h-s box-pad-v-s option slide-right"
            onClick={() => setOpen(true)}
          >
            <div className="box-pad-h-s">
              <UserProfilePic
                img={selectedConvo.picture}
                size={30}
                user_id={selectedConvo.pubkey}
                mainAccountUser={false}
                allowClick={false}
              />
            </div>
            <div>
              <p className="gray-c p-medium">{t("A2wbv5d")}</p>
              <p>
                {selectedConvo.display_name ||
                  selectedConvo.name ||
                  selectedConvo.pubkey.substring(0, 10)}
              </p>
            </div>
            <div
              className="round-icon-small box-pad-h-s fx-col fx-centered"
              style={{ border: "none" }}
            >
              <div
                className="arrow"
                style={{ transform: "rotate(180deg)" }}
              ></div>
              {isNewMsg && (
                <div
                  style={{
                    minWidth: "8px",
                    aspectRatio: "1/1",
                    backgroundColor: "var(--red-main)",
                    borderRadius: "var(--border-r-50)",
                  }}
                ></div>
              )}
            </div>
          </div>
        )}
        {open && (
          <div
            className="sc-s slide-up"
            ref={convoBoxRef}
            style={{
              [selectedConvo ? "height" : "maxHeight"]: "60vh",
              overflowY: "scroll",
              width: selectedConvo ? "450px" : "350px",
            }}
          >
            <div
              className="sticky fx-scattered fit-container box-pad-h-m box-pad-v-m pointer"
              style={{
                borderBottom: "1px solid var(--dim-gray)",
                padding: "1rem",
                backgroundColor: "var(--c1-side)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            >
              {selectedConvo && (
                <div
                  className="fx-centered"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedConvo(false);
                  }}
                >
                  <div
                    className="arrow-24"
                    style={{ transform: "rotate(90deg)" }}
                  ></div>
                  <div>
                    <UserProfilePic
                      img={selectedConvo.picture}
                      size={40}
                      user_id={selectedConvo.pubkey}
                      mainAccountUser={false}
                      allowClick={false}
                      allowPropagation={true}
                    />
                  </div>
                  <div>
                    <p className="gray-c p-medium">{t("A2wbv5d")}</p>
                    <p>
                      {selectedConvo.display_name ||
                        selectedConvo.name ||
                        selectedConvo.pubkey.substring(0, 10)}
                    </p>
                  </div>
                </div>
              )}
              {!selectedConvo && <p className="p-big">{t("As2zi6P")}</p>}
              <div className="fx-centered">
                {!selectedConvo && (
                  <div
                    className="env-edit-24"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInitConv(true);
                    }}
                  ></div>
                )}
                <div
                  className="close"
                  style={{ position: "static" }}
                  onClick={() => setOpen(false)}
                >
                  <div></div>
                </div>
              </div>
            </div>
            <div
              className="fit-container fx-scattered fx-col fx-start-h fx-start-v fit-container box-pad-h-s box-pad-v-s bg-sp"
              style={{ height: selectedConvo ? "calc(100% - 75px)" : "auto" }}
            >
              {!initDMS && (
                <>
                  {!selectedConvo &&
                    !isConvoLoading &&
                    sortedInbox.map((convo) => {
                      return (
                        <div
                          className="fit-container box-pad-h-s box-pad-v-s fx-scattered option-no-scale pointer slide-up"
                          key={convo.id}
                          onClick={() =>
                            handleSelectedConversation({ ...convo })
                          }
                        >
                          <div className="fx-centered">
                            <div>
                              <UserProfilePic
                                img={convo.picture}
                                size={40}
                                user_id={convo.pubkey}
                                mainAccountUser={false}
                                allowClick={false}
                              />
                            </div>
                            <div>
                              <p>
                                {convo.display_name ||
                                  convo.name ||
                                  convo.pubkey.substring(0, 10)}
                              </p>
                              <div className="fx-centered fx-start-h">
                                {convo.convo[convo.convo.length - 1].peer && (
                                  <p className="p-medium p-one-line">
                                    {t("ARrkukw")}
                                  </p>
                                )}
                                <p
                                  className="gray-c p-medium p-one-line"
                                  style={{ maxWidth: "100px" }}
                                >
                                  {convo.convo[convo.convo.length - 1].content}
                                </p>
                                <p className="orange-c p-medium">
                                  <Date_
                                    toConvert={
                                      new Date(convo.last_message * 1000)
                                    }
                                  />
                                </p>
                              </div>
                            </div>
                          </div>
                          {!convo.checked && (
                            <div
                              style={{
                                minWidth: "8px",
                                aspectRatio: "1/1",
                                backgroundColor: "var(--red-main)",
                                borderRadius: "var(--border-r-50)",
                              }}
                            ></div>
                          )}
                        </div>
                      );
                    })}
                  {isConvoLoading && (
                    <div
                      className="fit-container fx-centered"
                      style={{ height: "100%" }}
                    >
                      <span className="loader"></span>
                    </div>
                  )}

                  {selectedConvo && (
                    <ConversationBox
                      convo={selectedConvo}
                      back={() => setSelectedConvo(false)}
                      noHeader={true}
                    />
                  )}
                </>
              )}
              {!initDMS && sortedInbox.length === 0 && (
                <div
                  className="fit-container fx-centered fx-col"
                  style={{ height: "300px" }}
                >
                  <div
                    className="env-edit-24"
                    style={{ minHeight: "32px", minWidth: "32px" }}
                  ></div>
                  <div className="p-centered box-pad-h box-pad-v-s">
                    <p>{t("A1jvSxI")}</p>
                    <p className="gray-c box-pad-h-m">{t("ALgHcrS")}</p>
                  </div>
                  <button
                    className="btn btn-normal btn-small"
                    onClick={() => setInitConv(true)}
                  >
                    {t("AuUoz1R")}
                  </button>
                </div>
              )}
              {initDMS && (
                <div
                  className="fit-container fx-centered"
                  style={{ height: "300px" }}
                >
                  <LoadingDots />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
