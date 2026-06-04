import React, { useEffect, useMemo, useRef, useState } from "react";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import UserProfilePic from "@/Components/UserProfilePic";
import Date_ from "@/Components/Date_";
import PagePlaceholder from "@/Components/PagePlaceholder";
import InitiConvo from "@/Components/InitConvo";
import { useSelector } from "react-redux";
import { checkAllConvo } from "@/Helpers/DB";
import { useTranslation } from "react-i18next";
import OptionsDropdown from "@/Components/OptionsDropdown";
import { handleUpdateConversation } from "@/Helpers/DMHelpers";
import useDirectMessages from "@/Hooks/useDirectMessages";
import { ConversationBox } from "@/Components/ConversationBox";
import { Virtuoso } from "react-virtuoso";
import Icon from "@/Components/Icon";
import { SelectTabs } from "@/Components/SelectTabs";
import { iconsNames } from "@/Content/IconV2URL";
import Spinner from "@/Components/Spinner";

const TABS = ["following", "known", "unknown"];

const getFilterDMByTime = (type) => {
  let filterType =
    type !== undefined ? type : localStorage?.getItem("filter-dm-by") || "0";
  let currentTime = Math.floor(new Date().getTime() / 1000);
  if (filterType == 1) return currentTime - 2592000;
  if (filterType == 2) return currentTime - 7776000;
  if (filterType == 3) return currentTime - 15552000;
  if (filterType == 4) return currentTime - 31536000;
  return 0;
};

const getFilterDMType = () => localStorage?.getItem("filter-dm-by") || "0";

export default function Messages() {
  const userKeys = useSelector((state) => state.userKeys);
  const userChatrooms = useSelector((state) => state.userChatrooms);
  const initDMS = useSelector((state) => state.initDMS);
  const userInboxRelays = useSelector((state) => state.userInboxRelays);
  const { sortedInbox, msgsCount } = useDirectMessages();
  const { t } = useTranslation();

  const [selectedConvo, setSelectedConvo] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchedConvos, setSearchedConvo] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [initConv, setInitConv] = useState(false);
  const [filterBytime, setFilterBytime] = useState(getFilterDMByTime());
  const [filterByTimeType, setFilterByTimeType] = useState(getFilterDMType());
  const [showConvo, setShowConvo] = useState(false);

  const virtuosoRef = useRef();
  const searchInputRef = useRef();

  const contentType = TABS[tabIndex];

  const filterByTimeTypes = [
    { display_name: t("AeVTLPz"), value: "0" },
    { display_name: t("ARlh8Zx"), value: "1" },
    { display_name: t("AjBLEFD"), value: "2" },
    { display_name: t("AIXtxrz"), value: "3" },
    { display_name: t("AVevC63"), value: "4" },
  ];

  const tabLabels = [
    t("AdugC5z", { count: msgsCount.followings }),
    t("AkMu1GE", { count: msgsCount.known }),
    t("ANAOuTj", { count: msgsCount.unknown }),
  ];

  const sortedAndFilteredInbox = useMemo(() => {
    return sortedInbox.filter(
      (convo) =>
        convo.type === contentType && convo.last_message > filterBytime
    );
  }, [sortedInbox, contentType, filterBytime]);

  useEffect(() => {
    if (selectedConvo) {
      const updatedConvo = userChatrooms.find(
        (inbox) => inbox.pubkey === selectedConvo.pubkey
      );
      if (updatedConvo) {
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
    }
    setInitConv(false);
  }, [userChatrooms]);

  useEffect(() => {
    setSelectedConvo(false);
    setShowConvo(false);
  }, [userKeys]);

  const handleSelectedConversation = (conversation, ignoreLoading = false) => {
    try {
      handleUpdateConversation(conversation);

      if (!ignoreLoading) {
        setShowConvo(true);
        setTimeout(() => {
          const tempConvo = conversation.convo.map((convo) => {
            const content = getNoteTree(
              convo.content,
              undefined,
              undefined,
              undefined,
              convo.pubkey
            );
            return { ...convo, content, raw_content: convo.content };
          });
          setSelectedConvo({ ...conversation, convo: tempConvo });
        }, 350);
      } else {
        const tempConvo = conversation.convo.map((convo) => {
          const content = getNoteTree(
            convo.content,
            undefined,
            undefined,
            undefined,
            convo.pubkey
          );
          return { ...convo, content, raw_content: convo.content };
        });
        setSelectedConvo({ ...conversation, convo: tempConvo });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    if (!value) {
      setKeyword("");
      setSearchedConvo([]);
      return;
    }
    setKeyword(value);
    setSearchedConvo(
      sortedInbox.filter(
        (convo) =>
          convo.display_name?.toLowerCase().includes(value.toLowerCase()) ||
          convo.name?.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleShowSearch = () => {
    if (showSearch) {
      setShowSearch(false);
      setKeyword("");
      setSearchedConvo([]);
    } else {
      setShowSearch(true);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  };

  const handleReadAll = () => {
    const unread = userChatrooms
      .filter((_) => !_.checked)
      .map((_) => ({ ..._, checked: true }));
    if (unread.length) checkAllConvo(unread, userKeys.pub);
  };

  const handleDMFilter = (type) => {
    localStorage?.setItem("filter-dm-by", type);
    setFilterBytime(getFilterDMByTime(type));
    setFilterByTimeType(type);
  };

  const handleBack = () => {
    setShowConvo(false);
    setTimeout(() => setSelectedConvo(false), 360);
  };

  if (!userKeys)
    return <div><PagePlaceholder page={"nostr-not-connected"} /></div>;
  if (userKeys.bunker)
    return <div><PagePlaceholder page={"nostr-bunker-dms"} /></div>;
  if (!(userKeys.sec || userKeys.ext))
    return <div><PagePlaceholder page={"nostr-unauthorized-messages"} /></div>;

  const displayList = keyword ? searchedConvos : sortedAndFilteredInbox;

  return (
    <>
      {initConv && <InitiConvo exit={() => setInitConv(false)} />}

      <div
        className="fx-centered fx-start-v"
        style={{
          position: "fixed",
          top: "84px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(100%, 800px)",
          bottom: 0,
          padding: "1rem",
        }}
      >
        <div
          className="bg-dropdown"
          style={{
            width: "100%",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            borderRadius: "30px"
          }}
        >
          <div
            style={{
              display: "flex",
              width: "200%",
              height: "100%",
              transform: showConvo ? "translateX(-50%)" : "translateX(0)",
              transition: "transform 0.34s cubic-bezier(0.4, 0, 0.2, 1)",
              willChange: "transform",
            }}
          >
            <div
              style={{
                width: "50%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              <div
                className="fx-scattered box-pad-h-m box-pad-v-m"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  flexShrink: 0,
                }}
              >
                <h4 style={{ fontWeight: 700 }}>{t("As2zi6P")}</h4>
                <div className="fx-centered" style={{ gap: "4px" }}>
                  <div
                    className="round-icon"
                    style={{ minWidth: "36px", minHeight: "36px" }}
                    onClick={handleShowSearch}
                    title={t("AUdNamU")}
                  >
                    <Icon name={iconsNames.search_magnifying_glass} v={2} size={20} />
                  </div>
                  <div
                    className="round-icon"
                    style={{ minWidth: "36px", minHeight: "36px" }}
                    onClick={() => setInitConv(true)}
                    title={t("AMsg001")}
                  >
                    <Icon v={2} name={iconsNames.chat_add} size={20} />
                  </div>
                  <OptionsDropdown
                    options={[
                      <div
                        className="pointer option-no-scale box-pad-h-s box-pad-v-s fit-container"
                        onClick={handleReadAll}
                        style={{ minWidth: "160px" }}
                      >
                        <p>{t("A0qY0bf")}</p>
                      </div>,
                      <div className="fit-container">
                        <hr style={{ margin: "4px 0" }} />
                        {filterByTimeTypes.map((type) => (
                          <div
                            key={type.value}
                            className="pointer fit-container fx-scattered box-pad-h-s box-pad-v-s option-no-scale"
                            onClick={() => handleDMFilter(type.value)}
                          >
                            <span
                              className={
                                filterByTimeType == type.value ? "c1-c" : ""
                              }
                            >
                              {type.display_name}
                            </span>
                            {filterByTimeType == type.value && (
                              <Icon name="check" size={18} />
                            )}
                          </div>
                        ))}
                      </div>,
                    ]}
                  />
                </div>
              </div>

              {showSearch && (
                <div
                  className="fx-scattered box-pad-h-m slide-down"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    padding: "6px 12px",
                    flexShrink: 0,
                  }}
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="if ifs-full if-no-border"
                    placeholder={t("AUdNamU")}
                    value={keyword}
                    onChange={handleSearch}
                  />
                  <div
                    className="close"
                    style={{ position: "static" }}
                    onClick={handleShowSearch}
                  >
                    <div></div>
                  </div>
                </div>
              )}

              {!showSearch && (
                <div
                  className="fx-centered fit-container box-pad-h-s box-pad-v-s"
                  style={{ flexShrink: 0, position: "relative" }}
                >
                  <div>
                    <SelectTabs
                      selectedTab={tabIndex}
                      tabs={tabLabels}
                      setSelectedTab={(i) => {
                        setTabIndex(i);
                        virtuosoRef?.current?.scrollToIndex({
                          index: 0,
                          behavior: "smooth",
                        });
                      }}

                    />
                  </div>
                  {initDMS && (
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        left: 0,
                        bottom: 0,
                        width: "100%",
                        height: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{ height: "3px", backgroundColor: "var(--c1)" }}
                        className="v-bounce"
                      />
                    </div>
                  )}
                </div>
              )}

              {userInboxRelays.length === 0 && (
                <div
                  className="box-pad-h-s box-pad-v-s"
                  style={{ flexShrink: 0 }}
                >
                  <div className="fit-container box-pad-h-s box-pad-v-s sc-s-18">
                    <p className="p-medium">{t("ArApykS")}</p>
                  </div>
                </div>
              )}

              <div className="box-pad-h-s" style={{ flex: 1, overflow: "hidden" }}>
                {displayList.length > 0 && (
                  <Virtuoso
                    style={{ width: "100%", height: "100%" }}
                    ref={virtuosoRef}
                    skipAnimationFrameInResizeObserver={true}
                    overscan={600}
                    data={displayList}
                    increaseViewportBy={600}
                    itemContent={(_, convo) => (
                      <ConvoRow
                        key={convo.pubkey}
                        convo={convo}
                        isActive={selectedConvo?.pubkey === convo.pubkey}
                        onSelect={() =>
                          handleSelectedConversation({ ...convo })
                        }
                        t={t}
                      />
                    )}
                  />
                )}

                {keyword && !searchedConvos.length && (
                  <div
                    className="fx-centered fx-col box-pad-h box-pad-v-m"
                    style={{ height: "100%" }}
                  >
                    <h4>{t("A52Tdsw")}</h4>
                    <p className="gray-c p-centered">{t("As03HYz")}</p>
                  </div>
                )}

                {!keyword && !initDMS && sortedInbox.length === 0 && (
                  <div
                    className="fx-centered fx-col box-pad-h box-pad-v-m"
                    style={{ height: "100%" }}
                  >
                    <Icon name="env-edit" size={32} />
                    <div className="p-centered box-pad-v-s">
                      <p>{t("A1jvSxI")}</p>
                      <p className="gray-c">{t("ALgHcrS")}</p>
                    </div>
                    <button
                      className="btn btn-normal btn-small"
                      onClick={() => setInitConv(true)}
                    >
                      {t("AuUoz1R")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                width: "50%",
                height: "100%",
                flexShrink: 0,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {!selectedConvo && !showConvo && (
                <div
                  className="fit-container fx-centered fx-col"
                  style={{ height: "100%" }}
                >
                  <PagePlaceholder page={"nostr-DMS"} />
                </div>
              )}
              {!selectedConvo && showConvo && (
                <div className="fit-container fx-centered" style={{ height: "100%" }}>
                  <Spinner />
                </div>
              )}
              {selectedConvo && (
                <ConversationBox
                  convo={selectedConvo}
                  back={handleBack}
                  showBack
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ConvoRow({ convo, isActive, onSelect, t }) {
  const lastMsg = convo.convo[convo.convo.length - 1];
  const preview =
    typeof lastMsg?.content === "string"
      ? lastMsg.content
      : lastMsg?.raw_content || "";

  return (
    <div
      role="button"
      tabIndex={0}
      className="fit-container fx-scattered box-pad-h-m box-pad-v-s pointer option-no-scale"
      style={{
        backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "",
        minHeight: "44px",
        borderRadius: isActive ? "10px" : undefined,

      }}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      <div className="fx-centered" style={{ gap: "10px", minWidth: 0 }}>
        <div style={{ flexShrink: 0 }}>
          <UserProfilePic
            img={convo.picture}
            size={48}
            user_id={convo.pubkey}
            mainAccountUser={false}
            allowClick={false}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="p-one-line">
            {convo.display_name || convo.name || convo.pubkey.substring(0, 10)}
          </p>
          <div className="fx-centered fx-start-h" style={{ gap: "4px" }}>
            {lastMsg?.peer === false && (
              <p className="p-medium orange-c" style={{ flexShrink: 0 }}>
                {t("ARrkukw")}
              </p>
            )}
            <p
              className="gray-c p-medium p-one-line"
              style={{ maxWidth: "160px" }}
            >
              {preview}
            </p>
          </div>
        </div>
      </div>

      <div
        className="fx-centered fx-col"
        style={{ gap: "4px", flexShrink: 0, alignItems: "flex-end" }}
      >
        <p className="orange-c p-medium" style={{ whiteSpace: "nowrap" }}>
          <Date_ toConvert={new Date(convo.last_message * 1000)} />
        </p>
        {!convo.checked && (
          <div
            style={{
              minWidth: "8px",
              aspectRatio: "1/1",
              backgroundColor: "var(--red-main)",
              borderRadius: "var(--border-r-50)",
            }}
          />
        )}
      </div>
    </div>
  );
}
