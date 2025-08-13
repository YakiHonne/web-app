import React, { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setToast } from "../../Store/Slides/Publishers";
import {
  getCustomSettings,
  getDefaultSettings,
  getRepliesViewSettings,
  setRepliesViewSettings,
  updateCustomSettings,
} from "@/Helpers/ClientHelpers";
let boxView = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/box-view.png";
let threadView = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thread-view.png";

export function CustomizationManagement({
  selectedTab,
  setSelectedTab,
  userKeys,
  state,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [userToFollowSuggestion, setUserToFollowSuggestion] = useState(
    localStorage?.getItem("hsuggest1")
  );
  const [contentSuggestion, setContentSuggestion] = useState(
    localStorage?.getItem("hsuggest2")
  );
  const [interestSuggestion, setInterestSuggestion] = useState(
    localStorage?.getItem("hsuggest3")
  );
  const [collapsedNote, setCollapsedNote] = useState(
    getCustomSettings().collapsedNote === undefined
      ? true
      : getCustomSettings().collapsedNote
  );
  const [userHoverPreview, setUserHoverPreview] = useState(
    getCustomSettings().userHoverPreview
  );
  const contentList = getCustomSettings().contentList;
  const [notification, setNotification] = useState(
    getCustomSettings().notification || getDefaultSettings("").notification
  );
  const [selectedRepliesView, setSelectedRepliesView] = useState(
    getRepliesViewSettings() ? "thread" : "box"
  );
  const [homeContentSuggestion, setHomeContentSuggestion] = useState(
    localStorage?.getItem("hsuggest")
  );
  const notificationDN = {
    mentions: `${t("A8Da0of")} / ${t("AENEcn9")}`,
    reactions: t("Alz0E9Y"),
    reposts: t("Aai65RJ"),
    zaps: "Zaps",
    following: t("A9TqNxQ"),
  };
  const notificationDesc = {
    mentions: t("AyF6bJf"),
    reactions: t("AjlJkCH"),
    reposts: t("A9sfGZo"),
    zaps: t("Ae82ooM"),
    following: t("A5HyxxL"),
  };

  useEffect(() => {
    if (state && state.tab === "customization") {
      const target = document.querySelector(".main-page-nostr-container");
      if (target) {
        target.scrollTop = target.scrollHeight;
      }
    }
  }, [state]);

  const handleHomeContentSuggestion = () => {
    if (homeContentSuggestion) {
      localStorage?.removeItem("hsuggest");
      setHomeContentSuggestion(false);
    }
    if (!homeContentSuggestion) {
      let dateNow = `${Date.now()}`;
      localStorage?.setItem("hsuggest", dateNow);
      setHomeContentSuggestion(dateNow);
    }
  };

  const handleUserToFollowSuggestion = () => {
    if (userToFollowSuggestion) {
      localStorage?.removeItem("hsuggest1");
      setUserToFollowSuggestion(false);
    }
    if (!userToFollowSuggestion) {
      let dateNow = `${Date.now()}`;
      localStorage?.setItem("hsuggest1", dateNow);
      setUserToFollowSuggestion(dateNow);
    }
  };
  const handleContentSuggestion = () => {
    if (contentSuggestion) {
      localStorage?.removeItem("hsuggest2");
      setContentSuggestion(false);
    }
    if (!contentSuggestion) {
      let dateNow = `${Date.now()}`;
      localStorage?.setItem("hsuggest2", dateNow);
      setContentSuggestion(dateNow);
    }
  };
  const handleInterestSuggestion = () => {
    if (interestSuggestion) {
      localStorage?.removeItem("hsuggest3");
      setInterestSuggestion(false);
    }
    if (!interestSuggestion) {
      let dateNow = `${Date.now()}`;
      localStorage?.setItem("hsuggest3", dateNow);
      setInterestSuggestion(dateNow);
    }
  };
  const handleCollapedNote = () => {
    if (collapsedNote) {
      setCollapsedNote(false);
      updateCustomSettings({
        pubkey: userKeys.pub,
        collapsedNote: false,
        userHoverPreview,
        notification,
        contentList,
      });
    }
    if (!collapsedNote) {
      setCollapsedNote(true);
      updateCustomSettings({
        pubkey: userKeys.pub,
        collapsedNote: true,
        userHoverPreview,
        notification,
        contentList,
      });
    }
  };

  const handleUserHoverPreview = () => {
    if (userHoverPreview) {
      setUserHoverPreview(false);
      updateCustomSettings({
        pubkey: userKeys.pub,
        userHoverPreview: false,
        collapsedNote,
        notification,
        contentList,
      });
    }
    if (!userHoverPreview) {
      setUserHoverPreview(true);
      updateCustomSettings({
        pubkey: userKeys.pub,
        userHoverPreview: true,
        collapsedNote,
        notification,
        contentList,
      });
    }
  };

  const handleNotification = (index, status) => {
    let tempArr = structuredClone(notification);
    tempArr[index].isHidden = status;
    if (!tempArr.find((item) => !item.isHidden)) {
      dispatch(
        setToast({
          type: 2,
          desc: t("AHfFgQL"),
        })
      );
      return;
    }
    setNotification(tempArr);
    updateCustomSettings({
      pubkey: userKeys.pub,
      userHoverPreview,
      contentList,
      collapsedNote,
      notification: tempArr,
    });
  };

  const handleRepliesView = (value) => {
    setRepliesViewSettings(value);
    setSelectedRepliesView(value);
  };

  return (
    <div
      className="fit-container fx-scattered fx-col pointer"
      style={{
        borderBottom: "1px solid var(--very-dim-gray)",
        gap: 0,
      }}
    >
      <div
        className="fx-scattered fit-container  box-pad-h-m box-pad-v-m "
        onClick={() =>
          selectedTab === "customization"
            ? setSelectedTab("")
            : setSelectedTab("customization")
        }
      >
        <div className="fx-centered fx-start-h fx-start-v">
          <div className="box-pad-v-s">
            <div className="custom-24"></div>
          </div>
          <div>
            <p>{t("ARS24Cc")}</p>
            <p className="p-medium gray-c">{t("AvNq0fB")}</p>
          </div>
        </div>
        <div className="arrow"></div>
      </div>
      {selectedTab === "customization" && (
        <div className="fit-container fx-col fx-centered  box-pad-h-m box-pad-v-m ">
          <div className="fit-container">
            <p className="gray-c">{t("Amm6e0Z")}</p>
          </div>
          <div className="fx-scattered fit-container">
            <div>
              <p>{t("AozzmTY")}</p>
              <p className="p-medium gray-c">{t("A3nTKfp")}</p>
            </div>
            <div
              className={`toggle ${!collapsedNote ? "toggle-dim-gray" : ""} ${
                collapsedNote ? "toggle-c1" : "toggle-dim-gray"
              }`}
              onClick={handleCollapedNote}
            ></div>
          </div>
          <div className="fx-scattered fit-container fx-start-v fx-col">
            <div>
              <p>{t("ADAM3FJ")}</p>
              <p className="p-medium gray-c">{t("Ai5Sb3k")}</p>
            </div>
            <div className="fit-container fx-centered">
              <div
                className="fx fx-centered fx-col sc-s-18 bg-sp "
                style={{
                  borderColor: selectedRepliesView !== "box" ? "" : "var(--c1)",
                }}
                onClick={() => handleRepliesView("box")}
              >
                <img src={boxView} style={{ width: "100%" }} alt="" />
                <p className="gray-c box-pad-v-s">{t("ACz8zwo")}</p>
              </div>
              <div
                className="fx fx-centered fx-col sc-s-18 bg-sp "
                style={{
                  borderColor:
                    selectedRepliesView !== "thread" ? "" : "var(--c1)",
                }}
                onClick={() => handleRepliesView("thread")}
              >
                <img src={threadView} style={{ width: "100%" }} alt="" />
                <p className="gray-c box-pad-v-s">{t("AlwU99D")}</p>
              </div>
            </div>
          </div>
          <div className="fx-scattered fit-container">
            <div>
              <p>{t("AFVPHti")}</p>
              <p className="p-medium gray-c">{t("A864200")}</p>
            </div>
            <div
              className={`toggle ${
                !userHoverPreview ? "toggle-dim-gray" : ""
              } ${userHoverPreview ? "toggle-c1" : "toggle-dim-gray"}`}
              onClick={handleUserHoverPreview}
            ></div>
          </div>
          <hr />
          <div className="fit-container">
            <p className="gray-c">{t("AKjfaA8")}</p>
            <p className="p-medium gray-c">{t("Am0PvQX")}</p>
          </div>
          <div className="fx-scattered fit-container">
            <div>
              <p>{t("AZZ4XLg")}</p>
              <p className="p-medium gray-c">{t("AgBOrIx")}</p>
            </div>
            <div
              className={`toggle ${
                homeContentSuggestion ? "toggle-dim-gray" : ""
              } ${!homeContentSuggestion ? "toggle-c1" : "toggle-dim-gray"}`}
              onClick={handleHomeContentSuggestion}
            ></div>
          </div>
          <hr />
          <div className="fx-scattered fit-container">
            <div>
              <p>{t("AE7aj4C")}</p>
              <p className="p-medium gray-c">{t("AyBFzxq")}</p>
            </div>
            <div
              className={`toggle ${
                userToFollowSuggestion ? "toggle-dim-gray" : ""
              } ${!userToFollowSuggestion ? "toggle-c1" : "toggle-dim-gray"}`}
              onClick={handleUserToFollowSuggestion}
            ></div>
          </div>
          <hr />
          <div className="fx-scattered fit-container">
            <div>
              <p>{t("Ax8NFUb")}</p>
              <p className="p-medium gray-c">{t("ARDBNh7")}</p>
            </div>
            <div
              className={`toggle ${
                contentSuggestion ? "toggle-dim-gray" : ""
              } ${!contentSuggestion ? "toggle-c1" : "toggle-dim-gray"}`}
              onClick={handleContentSuggestion}
            ></div>
          </div>
          <hr />
          <div className="fx-scattered fit-container">
            <div>
              <p>{t("ANiWe9M")}</p>
              <p className="p-medium gray-c">{t("AXgwD7C")}</p>
            </div>
            <div
              className={`toggle ${
                interestSuggestion ? "toggle-dim-gray" : ""
              } ${!interestSuggestion ? "toggle-c1" : "toggle-dim-gray"}`}
              onClick={handleInterestSuggestion}
            ></div>
          </div>
          <hr />
          <div className="fx-scattered fit-container fx-col fx-start-v">
            <div>
              <p className="gray-c">{t("ASSFfFZ")}</p>
              <p className="p-medium gray-c">{t("Aaa8NMg")}</p>
            </div>
            <div className="fit-container fx-centered fx-col">
              {notification.map((item, index) => {
                return (
                  <Fragment key={index}>
                    <div className="fx-scattered fit-container">
                      <div>
                        <p className="p-maj">{notificationDN[item.tab]}</p>
                        <p className="p-medium gray-c">
                          {notificationDesc[item.tab]}
                        </p>
                      </div>
                      <div className="fx-centered">
                        <div
                          className={`toggle ${
                            item.isHidden ? "toggle-dim-gray" : ""
                          } ${
                            !item.isHidden ? "toggle-c1" : "toggle-dim-gray"
                          }`}
                          onClick={() =>
                            handleNotification(index, !item.isHidden)
                          }
                        ></div>
                      </div>
                    </div>
                    <hr />
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizationManagement;
