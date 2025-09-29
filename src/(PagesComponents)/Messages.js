import React, { useEffect, useState } from "react";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import UserProfilePic from "@/Components/UserProfilePic";
import Date_ from "@/Components/Date_";
import PagePlaceholder from "@/Components/PagePlaceholder";
import InitiConvo from "@/Components/InitConvo";
import {  useSelector } from "react-redux";
import {
  checkAllConvo,
} from "@/Helpers/DB";
import { useTranslation } from "react-i18next";
import OptionsDropdown from "@/Components/OptionsDropdown";
import Link from "next/link";
import { handleUpdateConversation, sendMessage } from "@/Helpers/DMHelpers";
import useDirectMessages from "@/Hooks/useDirectMessages";
import { ConversationBox } from "@/Components/ConversationBox";

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
  const initDMS = useSelector((state) => state.initDMS);
  const userInboxRelays = useSelector((state) => state.userInboxRelays);
  const { sortedInbox, msgsCount } = useDirectMessages();
  const { t } = useTranslation();
  const [selectedConvo, setSelectedConvo] = useState(false);
  const [isConvoLoading, setIsConvoLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [searchedConvos, setSearchedConvo] = useState([]);
  const [contentType, setContentType] = useState("following");
  const [showSearch, setShowSearch] = useState("");
  const [initConv, setInitConv] = useState(false);
  const [filterBytime, setFilterBytime] = useState(getFilterDMByTime());
  const [filterByTimeType, setFilterByTimeType] = useState(getFilterDMType());

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
  }, [userChatrooms]);

  useEffect(() => {
    setSelectedConvo(false);
    setIsConvoLoading(false);
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
        <PagePlaceholder page={"nostr-not-connected"} />
      </div>
    );
  if (userKeys.bunker)
    return (
      <div>
        <PagePlaceholder page={"nostr-bunker-dms"} />
      </div>
    );

  if (!(userKeys.sec || userKeys.ext))
    return (
      <div>
        <PagePlaceholder page={"nostr-unauthorized-messages"} />
      </div>
    );

  if (initDMS)
    return (
      <div>
        <PagePlaceholder page={"nostr-DMS-waiting"} />
      </div>
    );

  return (
    <div>
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
                  <div
                    className="pointer option-no-scale box-pad-h-s box-pad-v-s fit-container"
                    onClick={handleReadAll}
                    style={{ width: "150px" }}
                  >
                    <p>{t("A0qY0bf")}</p>
                  </div>,
                  <div className="fit-container">
                    <hr style={{ margin: "4px 0", padding: "0 5px" }} />
                    {/* <p
                      className="p-medium gray-c"
                      style={{ marginBottom: ".25rem" }}
                    >
                      {t("ATpzz5G")}
                    </p> */}
                    <div className="fit-container">
                      {filterByTimeTypes.map((type) => {
                        return (
                          <div
                            className="pointer fit-container fx-scattered box-pad-h-s box-pad-v-s option-no-scale"
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
