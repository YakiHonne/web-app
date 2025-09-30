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
import Select from "@/Components/Select";
let boxView =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/box-view.png";
let threadView =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thread-view.png";

export function CustomizationManagement({
  selectedTab,
  setSelectedTab,
  userKeys,
  state,
}) {
  const { t } = useTranslation();
  const [showFeedSettings, setShowFeedSettings] = useState(false);
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

  const [selectedRepliesView, setSelectedRepliesView] = useState(
    getRepliesViewSettings() ? "thread" : "box"
  );
  const [homeContentSuggestion, setHomeContentSuggestion] = useState(
    localStorage?.getItem("hsuggest")
  );

  const longPressOptions = [
    {
      display_name: t("AYIXG83"),
      value: "notes",
    },
    {
      display_name: t("AesMg52"),
      value: "articles",
    },
    {
      display_name: t("A2mdxcf"),
      value: "sw",
    },
  ];

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

  const handleRepliesView = (value) => {
    setRepliesViewSettings(value);
    setSelectedRepliesView(value);
  };

  return (
    <>
      {showFeedSettings && (
        <FeedSettings
          exit={() => setShowFeedSettings(false)}
          handleCollapedNote={handleCollapedNote}
          handleRepliesView={handleRepliesView}
          collapsedNote={collapsedNote}
          selectedRepliesView={selectedRepliesView}
          homeContentSuggestion={homeContentSuggestion}
          handleHomeContentSuggestion={handleHomeContentSuggestion}
          userToFollowSuggestion={userToFollowSuggestion}
          contentSuggestion={contentSuggestion}
          interestSuggestion={interestSuggestion}
          handleUserToFollowSuggestion={handleUserToFollowSuggestion}
          handleContentSuggestion={handleContentSuggestion}
          handleInterestSuggestion={handleInterestSuggestion}
        />
      )}

      <div
        className={`fit-container fx-scattered fx-col pointer ${
          selectedTab === "customization" ? "sc-s box-pad-h-s box-pad-v-s" : ""
        }`}
        style={{
          borderBottom: "1px solid var(--very-dim-gray)",
          gap: 0,
          borderColor: "var(--very-dim-gray)",
          transition: "0.2s ease-in-out",
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
            <div className="fit-container fx-scattered">
              <div>
                <p>{t("AKjfaA8")}</p>
                <p className="p-medium gray-c">{t("AaaXNqB")}</p>
              </div>
              <div
                className="btn-text-gray"
                style={{ marginRight: ".75rem" }}
                onClick={() => setShowFeedSettings(true)}
              >
                {t("AsXohpb")}
              </div>
            </div>
            <hr />
            <div className="fx-scattered fit-container">
              <div>
                <p>{t("AnFVDo1")}</p>
                <p className="p-medium gray-c">{t("A0MTAAN")}</p>
              </div>
              <Select options={longPressOptions} value={"notes"} />
            </div>
            <hr />
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
            <div className="fx-scattered fit-container">
              <div>
                <p>{t("AKa9x4m")}</p>
                <p className="p-medium gray-c">{t("AndOZE9")}</p>
              </div>
              <div
                className="sc-s-18 fx-centered option"
                style={{ width: "45px", aspectRatio: "1/1" }}
              >
                <div className="p-big">❤️️</div>
              </div>
            </div>
            <hr />
            <div className="fx-scattered fit-container">
              <div>
                <p>{t("A06GNpE")}</p>
                <p className="p-medium gray-c">{t("AibLlqg")}</p>
              </div>
              <div
                className={`toggle ${
                  !userHoverPreview ? "toggle-dim-gray" : ""
                } ${userHoverPreview ? "toggle-c1" : "toggle-dim-gray"}`}
                onClick={handleUserHoverPreview}
              ></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CustomizationManagement;

const FeedSettings = ({
  exit,
  handleCollapedNote,
  handleRepliesView,
  handleHomeContentSuggestion,
  handleUserToFollowSuggestion,
  handleContentSuggestion,
  handleInterestSuggestion,
  collapsedNote,
  selectedRepliesView,
  homeContentSuggestion,
  userToFollowSuggestion,
  contentSuggestion,
  interestSuggestion,
}) => {
  const { t } = useTranslation();
  return (
    <div
      className="fixed-container box-pad-h fx-centered"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="box-pad-h box-pad-v sc-s bg-sp slide-up fx-centered fx-col fx-start-h fx-start-v"
        style={{
          width: "min(100%, 500px)",
          maxHeight: "90vh",
          overflowY: "scroll",
          position: "relative",
          padding: "2rem",
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4>{t("AKjfaA8")}</h4>
        <div className="fit-container">
          <p className="c1-c p-big">{t("AzII4H9")}</p>
        </div>
        <div className="fx-scattered fit-container fx-start-v fx-col">
          <div>
            <p>{t("ADAM3FJ")}</p>
            <p className="p-medium gray-c">{t("Ai5Sb3k")}</p>
          </div>
          <div className="fit-container fx-centered box-pad-v-s">
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
        <div className="fit-container">
          <p className="c1-c p-big">{t("Av6mqrU")}</p>
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
            className={`toggle ${contentSuggestion ? "toggle-dim-gray" : ""} ${
              !contentSuggestion ? "toggle-c1" : "toggle-dim-gray"
            }`}
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
            className={`toggle ${interestSuggestion ? "toggle-dim-gray" : ""} ${
              !interestSuggestion ? "toggle-c1" : "toggle-dim-gray"
            }`}
            onClick={handleInterestSuggestion}
          ></div>
        </div>
      </div>
    </div>
  );
};
