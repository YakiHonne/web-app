import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import {
  SimplePool,
  nip44,
  getEventHash,
  generateSecretKey,
  finalizeEvent,
} from "nostr-tools";
import {
  bytesTohex,
  encrypt04,
  encrypt44,
  getBech32,
  getWOTScoreForPubkeyLegacy,
} from "@/Helpers/Encryptions";
import { getNoteTree, getWotConfig } from "@/Helpers/ClientHelpers";
import UserProfilePic from "@/Components/UserProfilePic";
import Date_ from "@/Components/Date_";
import LoadingDots from "@/Components/LoadingDots";
import PagePlaceholder from "@/Components/PagePlaceholder";
import UploadFile from "@/Components/UploadFile";
import InitiConvo from "@/Components/InitConvo";
import axiosInstance from "@/Helpers/HTTP_Client";
import {
  getUser,
  InitEvent,
  updateYakiChestStats,
} from "@/Helpers/Controlers";
import { useDispatch, useSelector } from "react-redux";
import { setToPublish } from "@/Store/Slides/Publishers";
import { setUpdatedActionFromYakiChest } from "@/Store/Slides/YakiChest";
import {
  checkAllConvo,
  checkCurrentConvo,
  getInboxRelaysForUser,
} from "@/Helpers/DB";
import Emojis from "@/Components/Emojis";
import Gifs from "@/Components/Gifs";
import { useTranslation } from "react-i18next";
import OptionsDropdown from "@/Components/OptionsDropdown";
import relaysOnPlatform from "@/Content/Relays";
import Link from "next/link";

const getFilterDMByTime = (type) => {
  let filterType =
    type !== undefined ? type : localStorage?.getItem("filter-dm-by") || "0";
  let currentTime = Math.floor(new Date().getTime() / 1000);
  let month = currentTime - 2592000;
  let threeMonths = currentTime - 7776000;
  let sixMonths = currentTime - 15552000;
  let year = currentTime - 31536000;

  if (filterType == 0) return 0;
  if (filterType == 1) return month;
  if (filterType == 2) return threeMonths;
  if (filterType == 3) return sixMonths;
  if (filterType == 4) return year;
};

const getFilterDMType = () => {
  let filterType = localStorage?.getItem("filter-dm-by") || "0";
  return filterType;
};

export default function Messages() {
  const userKeys = useSelector((state) => state.userKeys);
  const userChatrooms = useSelector((state) => state.userChatrooms);
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const initDMS = useSelector((state) => state.initDMS);
  const userFollowings = useSelector((state) => state.userFollowings);
  const userInboxRelays = useSelector((state) => state.userInboxRelays);

  const { t } = useTranslation();
  const [selectedConvo, setSelectedConvo] = useState(false);
  const [isConvoLoading, setIsConvoLoading] = useState(false);
  const [sortedInbox, setSortedInbox] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [searchedConvos, setSearchedConvo] = useState([]);
  const [contentType, setContentType] = useState("following");
  const [showSearch, setShowSearch] = useState("");
  const [initConv, setInitConv] = useState(false);
  const [filterBytime, setFilterBytime] = useState(getFilterDMByTime());
  const [filterByTimeType, setFilterByTimeType] = useState(getFilterDMType());

  const [msgsCount, setMsgsCount] = useState({
    followings: 0,
    known: 0,
    unknown: 0,
  });

  const [mbHide, setMbHide] = useState(true);

  const filterByTimeTypes = [
    {
      display_name: t("AeVTLPz"),
      value: "0",
    },
    {
      display_name: t("ARlh8Zx"),
      value: "1",
    },
    {
      display_name: t("AjBLEFD"),
      value: "2",
    },
    {
      display_name: t("AIXtxrz"),
      value: "3",
    },
    {
      display_name: t("AVevC63"),
      value: "4",
    },
  ];

  useEffect(() => {
    let followings = 0;
    let known = 0;
    let unknown = 0;
    let { score, dms } = getWotConfig();
    let tempChatrooms = userChatrooms
      .filter((_) => {
        if (getWOTScoreForPubkeyLegacy(_.pubkey, dms, score).status)
          return true;
      })
      .map((chatroom) => {
        let contact = getUser(chatroom.pubkey);

        let isFollowing = userFollowings?.includes(chatroom.pubkey)
          ? "following"
          : false;
        let isUnknown = false;
        let isKnown = false;
        if (!isFollowing) {
          isUnknown = chatroom.convo.find(
            (conv) => conv.pubkey === userKeys.pub
          )
            ? false
            : "unknown";

          if (!isUnknown) isKnown = "known";
        }
        if (isFollowing) followings = followings + 1;
        if (isUnknown) unknown = unknown + 1;
        if (isKnown) known = known + 1;
        if (contact)
          return {
            ...contact,
            ...chatroom,
            type: isFollowing || isUnknown || isKnown,
          };
        return {
          ...chatroom,
          picture: "",
          display_name: getBech32("npub", chatroom.pubkey).substring(0, 10),
          name: getBech32("npub", chatroom.pubkey).substring(0, 10),
          type: isFollowing || isUnknown || isKnown,
        };
      });

    setMsgsCount({ followings, known, unknown });
    setSortedInbox(tempChatrooms);
    if (selectedConvo) {
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
    setInitConv(false);
  }, [userChatrooms, nostrAuthors, userFollowings]);

  useEffect(() => {
    // if (!userKeys) {
    if (!userKeys) setSortedInbox([]);
    setSelectedConvo(false);
    setIsConvoLoading(false);
    // }
  }, [userKeys]);

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
      setMbHide(false);
      if (!ignoreLoading) {
        setIsConvoLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearch = (e) => {
    let value = e.target.value;

    if (!value) {
      setKeyword("");
      setSearchedConvo([]);
      return;
    }

    let tempConvo = sortedInbox.filter((convo) => {
      if (
        convo.display_name?.toLowerCase().includes(value.toLowerCase()) ||
        convo.name?.toLowerCase().includes(value.toLowerCase())
      )
        return convo;
    });

    setKeyword(value);
    setSearchedConvo(tempConvo);
  };

  const handleContentType = (type) => {
    if (type === contentType) return;
    setContentType(type);
  };

  const handleShowSearch = () => {
    if (showSearch) {
      setShowSearch(false);
      setKeyword("");
      setSearchedConvo([]);
      if (selectedConvo) setContentType(selectedConvo.type);
      return;
    }

    setShowSearch(true);
  };

  const handleUpdateConversation = (event) => {
    if (event.checked) return;
    let tempEvent = {
      pubkey: event.pubkey,
      convo: event.convo,
      id: event.id,
      last_message: event.last_message,
      checked: true,
    };
    checkCurrentConvo(tempEvent, userKeys.pub);
  };

  const handleReadAll = () => {
    let unreadChatroom = userChatrooms
      .filter((_) => !_.checked)
      .map((_) => {
        return { ..._, checked: true };
      });
    if (unreadChatroom.length) checkAllConvo(unreadChatroom, userKeys.pub);
  };

  const handleDMFilter = (type) => {
    localStorage?.setItem("filter-dm-by", type);
    setFilterBytime(getFilterDMByTime(type));
    setFilterByTimeType(type);
  };

  if (!userKeys)
    return (
      <div>
        <Helmet>
          <title>Yakihonne | Messages</title>
          <meta
            name="description"
            content={"Your end-to-end encrypted inbox"}
          />
          <meta
            property="og:description"
            content={"Your end-to-end encrypted inbox"}
          />

          <meta property="og:url" content={`https://yakihonne.com/messages`} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Yakihonne" />
          <meta property="og:title" content="Yakihonne | Messages" />
          <meta property="twitter:title" content="Yakihonne | Messages" />
          <meta
            property="twitter:description"
            content={"Your end-to-end encrypted inbox"}
          />
        </Helmet>

        <PagePlaceholder page={"nostr-not-connected"} />
      </div>
    );
  if (userKeys.bunker)
    return (
      <div>
        <Helmet>
          <title>Yakihonne | Messages</title>
          <meta
            name="description"
            content={
              "Connect directly with other Nostr users through end-to-end encrypted messaging. Build relationships in a private communication channel free from surveillance."
            }
          />
          <meta
            property="og:description"
            content={
              "Connect directly with other Nostr users through end-to-end encrypted messaging. Build relationships in a private communication channel free from surveillance."
            }
          />
          <meta
            property="og:image"
            content={
              "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"
            }
          />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="700" />
          <meta property="og:url" content={`https://yakihonne.com/messages`} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Yakihonne" />
          <meta property="og:title" content="Yakihonne | Messages" />
          <meta property="twitter:title" content="Yakihonne | Messages" />
          <meta
            property="twitter:description"
            content={
              "Connect directly with other Nostr users through end-to-end encrypted messaging. Build relationships in a private communication channel free from surveillance."
            }
          />
          <meta
            property="twitter:image"
            content={
              "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"
            }
          />
        </Helmet>

        <PagePlaceholder page={"nostr-bunker-dms"} />
      </div>
    );

  if (!(userKeys.sec || userKeys.ext))
    return (
      <div>
        <Helmet>
          <title>Yakihonne | Messages</title>
          <meta
            name="description"
            content={
              "Connect directly with other Nostr users through end-to-end encrypted messaging. Build relationships in a private communication channel free from surveillance."
            }
          />
          <meta
            property="og:description"
            content={
              "Connect directly with other Nostr users through end-to-end encrypted messaging. Build relationships in a private communication channel free from surveillance."
            }
          />
          <meta
            property="og:image"
            content="https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"
          />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="700" />
          <meta property="og:url" content={`https://yakihonne.com/messages`} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Yakihonne" />
          <meta property="og:title" content="Yakihonne | Messages" />
          <meta property="twitter:title" content="Yakihonne | Messages" />
          <meta
            property="twitter:description"
            content={
              "Connect directly with other Nostr users through end-to-end encrypted messaging. Build relationships in a private communication channel free from surveillance."
            }
          />
          <meta
            property="twitter:image"
            content="https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"
          />
        </Helmet>

        <PagePlaceholder page={"nostr-unauthorized-messages"} />
      </div>
    );

  if (initDMS)
    return (
      <div>
        <Helmet>
          <title>Yakihonne | Messages</title>
          <meta
            name="description"
            content={
              "Connect directly with other Nostr users through end-to-end encrypted messaging. Build relationships in a private communication channel free from surveillance."
            }
          />
          <meta
            property="og:description"
            content={
              "Connect directly with other Nostr users through end-to-end encrypted messaging. Build relationships in a private communication channel free from surveillance."
            }
          />
          <meta
            property="og:image"
            content={
              "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"
            }
          />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="700" />
          <meta property="og:url" content={`https://yakihonne.com/messages`} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Yakihonne" />
          <meta property="og:title" content="Yakihonne | Messages" />
          <meta property="twitter:title" content="Yakihonne | Messages" />
          <meta
            property="twitter:description"
            content={
              "Connect directly with other Nostr users through end-to-end encrypted messaging. Build relationships in a private communication channel free from surveillance."
            }
          />
          <meta
            property="twitter:image"
            content="https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"
          />
        </Helmet>

        <PagePlaceholder page={"nostr-DMS-waiting"} />
      </div>
    );

  return (
    <div>
      <Helmet>
        <title>Yakihonne | Messages</title>
        <meta name="description" content={"Your end-to-end encrypted inbox"} />
        <meta
          property="og:description"
          content={"Your end-to-end encrypted inbox"}
        />

        <meta property="og:url" content={`https://yakihonne.com/messages`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Yakihonne" />
        <meta property="og:title" content="Yakihonne | Messages" />
        <meta property="twitter:title" content="Yakihonne | Messages" />
        <meta
          property="twitter:description"
          content={"Your end-to-end encrypted inbox"}
        />
      </Helmet>
      {initConv && <InitiConvo exit={() => setInitConv(false)} />}
      <div
        className="fit-container fx-centered fx-start-h fx-stretch DM-container"
        style={{
          columnGap: 0,
          width: "min(100%,1200px)",
        }}
      >
        <div
          style={{
            // width: "450px",
            flex: "1 1 400px",
            border: "1px solid var(--dim-gray)",

            overflowY: "scroll",
          }}
          className={!mbHide ? "mb-hide-800" : ""}
        >
          <div className="box-pad-h-m box-pad-v-m fit-container fx-scattered">
            <h4>{t("As2zi6P")}</h4>
            <div className="fx-centered">
              {!showSearch && (
                <div onClick={handleShowSearch}>
                  <div className="search-24"></div>
                </div>
              )}
              <div onClick={() => setInitConv(true)}>
                <div className="env-edit-24"></div>
              </div>
              <OptionsDropdown
                options={[
                  <div className="pointer" onClick={handleReadAll}>
                    <p>{t("A0qY0bf")}</p>
                  </div>,
                  <div className="fit-container">
                    <hr
                      style={{
                        borderColor: "#555555",
                        width: "30px",
                        marginBottom: ".5rem",
                      }}
                    />
                    <p
                      className="p-medium gray-c"
                      style={{ marginBottom: ".25rem" }}
                    >
                      {t("ATpzz5G")}
                    </p>
                    <div className="fit-container">
                      {filterByTimeTypes.map((type) => {
                        return (
                          <div
                            className="pointer fit-container fx-scattered"
                            onClick={() => handleDMFilter(type.value)}
                          >
                            <span
                              className={
                                filterByTimeType == type.value ? "green-c" : ""
                              }
                            >
                              {type.display_name}
                            </span>
                            {filterByTimeType == type.value && (
                              <div className="check-24"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>,
                ]}
              />
            </div>
          </div>
          {showSearch && (
            <div
              style={{
                borderTop: "1px solid var(--very-dim-gray)",
                borderBottom: "1px solid var(--very-dim-gray)",
              }}
              className="slide-down fx-scattered box-pad-h-m"
            >
              <input
                type="text"
                className="if ifs-full if-no-border"
                placeholder={t("AUdNamU")}
                value={keyword}
                onChange={handleSearch}
                autoFocus
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
              className="fx-centered fit-container box-marg-s slide-up"
              style={{ columnGap: 0 }}
            >
              <div
                style={{
                  padding: ".5rem .5rem",
                  borderBottom: `2px solid ${
                    contentType == "following" ? "var(--c1)" : "var(--dim-gray)"
                  }`,
                }}
                onClick={() => handleContentType("following")}
                className="pointer fx fx-centered"
              >
                <span
                  className={contentType === "following" ? "c1-c" : "gray-c"}
                >
                  {t("AdugC5z", { count: msgsCount.followings })}
                </span>
              </div>
              <div
                style={{
                  padding: ".5rem .5rem",
                  borderBottom: `2px solid ${
                    contentType == "known" ? "var(--c1)" : "var(--dim-gray)"
                  }`,
                }}
                onClick={() => handleContentType("known")}
                className="pointer fx fx-centered"
              >
                <span className={contentType === "known" ? "c1-c" : "gray-c"}>
                  {t("AkMu1GE", { count: msgsCount.known })}
                </span>
              </div>
              <div
                style={{
                  padding: ".5rem .5rem",
                  borderBottom: `2px solid ${
                    contentType == "unknown" ? "var(--c1)" : "var(--dim-gray)"
                  }`,
                }}
                onClick={() => handleContentType("unknown")}
                className="pointer fx fx-centered"
              >
                <span className={contentType === "unknown" ? "c1-c" : "gray-c"}>
                  {t("ANAOuTj", { count: msgsCount.unknown })}
                </span>
              </div>
            </div>
          )}
          {userInboxRelays.length === 0 && (
            <div className="fit-container box-pad-h-m box-marg-s">
              <div className="fit-container box-pad-h-s box-pad-v-s sc-s-18">
                <p className="p-medium">{t("ArApykS")}</p>
                <p className="gray-c p-medium">
                  {t("Alxsg82")}{" "}
                  <span className="c1-c">
                    <Link
                      href={"/settings"}
                      state={{ relaysTab: 1, tab: "relays" }}
                    >
                      {t("ABtsLBp")}
                    </Link>
                  </span>
                </p>
              </div>
            </div>
          )}
          <div
            className="fit-container fx-centered fx-wrap"
            style={{ rowGap: 0, overflow: "auto" }}
          >
            {!showSearch &&
              sortedInbox.map((convo) => {
                if (
                  convo.type === contentType &&
                  convo.last_message > filterBytime
                )
                  return (
                    <div
                      className="fit-container fx-scattered  box-pad-h option box-pad-v-s pointer slide-up"
                      key={convo.id}
                      style={{
                        backgroundColor:
                          selectedConvo.id === convo.id
                            ? "var(--very-dim-gray)"
                            : "",
                      }}
                      onClick={() => handleSelectedConversation({ ...convo })}
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
                                toConvert={new Date(convo.last_message * 1000)}
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
            {keyword &&
              searchedConvos.map((convo) => {
                return (
                  <div
                    className="fit-container fx-scattered box-pad-h option box-pad-v-s pointer"
                    key={convo.id}
                    onClick={() => handleSelectedConversation({ ...convo })}
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
                              toConvert={new Date(convo.last_message * 1000)}
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
            {keyword && !searchedConvos.length && (
              <div
                style={{ height: "50vh" }}
                className="box-pad-h fx-centered fx-col"
              >
                <h4>{t("A52Tdsw")}</h4>
                <p className="gray-c p-centered">{t("As03HYz")}</p>
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            flex: "1 1 600px",
            // width: "min(100%, calc(100% - 350px))",
            border: "1px solid var(--dim-gray)",
          }}
          className={mbHide ? "mb-hide-800" : ""}
        >
          {isConvoLoading && (
            <div
              className="fit-container fx-centered"
              style={{ height: "100%" }}
            >
              <span className="loader"></span>
            </div>
          )}
          {!selectedConvo && !isConvoLoading && (
            <PagePlaceholder page={"nostr-DMS"} />
          )}
          {selectedConvo && (
            <ConversationBox
              convo={selectedConvo}
              back={() => setMbHide(!mbHide)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const ConversationBox = ({ convo, back }) => {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userRelays = useSelector((state) => state.userRelays);
  const userInboxRelays = useSelector((state) => state.userInboxRelays);

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
  const [showEmojisList, setShowEmojisList] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [peerName, setPeerName] = useState(
    convo.display_name?.substring(0, 10) ||
      convo.name?.substring(0, 10) ||
      convo.pubkey.substring(0, 10)
  );
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

  const handleSendMessage = async () => {
    if (
      !message ||
      !userKeys ||
      (userKeys && !(userKeys.ext || userKeys.sec || userKeys.bunker))
    )
      return;
    let otherPartyRelays = await getInboxRelaysForUser(convo.pubkey);
    let relaysToPublish = [
      ...new Set([
        ...userInboxRelays,
        ...relaysOnPlatform,
        ...otherPartyRelays,
      ]),
    ];
    // setMessage("");
    // setReplayOn(false);
    // setShowProgress(true);
    if (legacy) {
      let encryptedMessage = await encrypt04(userKeys, convo.pubkey, message);

      setMessage("");
      setReplayOn(false);
      setShowProgress(true);
      let tags = [];
      tags.push(["p", convo.pubkey, convo.display_name || convo.name || ""]);
      if (replayOn) tags.push(["e", replayOn.id]);
      let created_at = Math.floor(Date.now() / 1000);
      // let tempEvent = {
      //   created_at,
      //   kind: 4,
      //   content: encryptedMessage,
      //   tags,
      // };

      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 4,
          content: encryptedMessage,
          tags,
          allRelays: relaysToPublish,
        })
      );
    }
    if (!legacy) {
      let { sender_event, receiver_event } = await getGiftWrap();
      setMessage("");
      setReplayOn(false);
      setShowProgress(true);
      let response = await initPublishing(
        relaysToPublish,
        sender_event,
        receiver_event
      );

      if (response) {
        let action_key =
          convo.pubkey ===
          "20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3"
            ? "dms-10"
            : "dms-5";
        updateYakiChest(action_key);
      }
    }
  };

  const updateYakiChest = async (action_key) => {
    try {
      let data = await axiosInstance.post("/api/v1/yaki-chest", {
        action_key,
      });
      let { user_stats, is_updated } = data.data;

      if (is_updated) {
        dispatch(setUpdatedActionFromYakiChest(is_updated));
        updateYakiChestStats(user_stats);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getGiftWrap = async () => {
    let g_sk_1 = bytesTohex(generateSecretKey());
    let g_sk_2 = bytesTohex(generateSecretKey());

    let [signedKind13_1, signedKind13_2] = await Promise.all([
      getEventKind13(convo.pubkey),
      getEventKind13(userKeys.pub),
    ]);

    let content_1 = nip44.v2.encrypt(
      JSON.stringify(signedKind13_1),
      nip44.v2.utils.getConversationKey(g_sk_1, convo.pubkey)
    );
    let content_2 = nip44.v2.encrypt(
      JSON.stringify(signedKind13_2),
      nip44.v2.utils.getConversationKey(g_sk_2, userKeys.pub)
    );
    let event_1 = {
      created_at: Math.floor(Date.now() / 1000) - 432000,
      kind: 1059,
      tags: [["p", convo.pubkey]],
      content: content_1,
    };
    let event_2 = {
      created_at: Math.floor(Date.now() / 1000) - 432000,
      kind: 1059,
      tags: [["p", userKeys.pub]],
      content: content_2,
    };
    event_1 = finalizeEvent(event_1, g_sk_1);
    event_2 = finalizeEvent(event_2, g_sk_2);
    return { sender_event: event_2, receiver_event: event_1 };
  };

  const getEventKind14 = () => {
    let event = {
      pubkey: userKeys.pub,
      created_at: Math.floor(Date.now() / 1000),
      kind: 14,
      tags: [
        ["p", convo.pubkey],
        ["p", userKeys.pub],
      ],
      content: message,
    };

    if (replayOn) event.tags.push(["e", replayOn.id]);
    event.id = getEventHash(event);
    return event;
  };

  const getEventKind13 = async (pubkey) => {
    let unsignedKind14 = getEventKind14();
    let content = await encrypt44(
      userKeys,
      pubkey,
      JSON.stringify(unsignedKind14)
    );

    let event = {
      created_at: Math.floor(Date.now() / 1000) - 172800,
      kind: 13,
      tags: [],
      content,
    };
    event = await InitEvent(
      event.kind,
      event.content,
      event.tags,
      event.created_at
    );
    return event;
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
      onClick={() => {
        setShowEmojisList(false);
      }}
    >
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
      <div
        className="fx-centered fx-start-h fx-col box-pad-h-m box-pad-v-m fit-container"
        style={{
          height: "calc(100% - 160px)",
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
            <div
              className="fit-container"
            >
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
                  className="sc-s-18 box-pad-h-m box-pad-v-m fx-centered fx-start-h fx-start-v fx-col"
                  style={{
                    backgroundColor: convo.peer
                      ? "var(--c1-side)"
                      : "var(--dim-gray)",
                    borderBottomLeftRadius: !convo.peer ? 0 : "inital",
                    borderBottomRightRadius: convo.peer ? 0 : "inital",
                    maxWidth: "min(90%, 500px)",
                    minWidth: "300px",
                    border: "none",
                    overflow: "visible",
                  }}
                >
                  {<div className="fit-container">{convo.content}</div> || <LoadingDots />}
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
                padding: "1rem 0rem 1rem 1rem",
                height: "20px",
                // minHeight: "200px",
                maxHeight: "250px",
                borderRadius: 0,
                // fontSize: "1.2rem",
              }}
            />
            <div className="fx-centered box-pad-h-m box-pad-v-m">
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
          <button className="round-icon">
            <p style={{ rotate: "-45deg" }}>&#x27A4;</p>
          </button>
        </form>
      </div>
    </div>
  );
};

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

const initPublishing = async (relays, event1, event2) => {
  try {
    let pool_ev1 = new SimplePool();
    let pool_ev2 = new SimplePool();

    let [res1, res2] = await Promise.race([
      Promise.allSettled(pool_ev1.publish(relays, event1)),
      Promise.allSettled(pool_ev2.publish(relays, event2)),
    ]);

    return true;
  } catch (err) {
    console.log(err);
  }
};

const base64ToArrayBuffer = (base64) => {
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer;
};
