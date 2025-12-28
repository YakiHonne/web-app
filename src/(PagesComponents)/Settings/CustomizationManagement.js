import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  getCustomSettings,
  updateCustomSettings,
} from "@/Helpers/ClientHelpers";
import Select from "@/Components/Select";
import EmojiPicker from "emoji-picker-react";
import { useTheme } from "next-themes";
import useCloseContainer from "@/Hooks/useCloseContainer";
import { DraggableComp } from "@/Components/DraggableComp";
import Toggle from "@/Components/Toggle";
import { useRouter } from "next/router";
import { localStorage_ } from "@/Helpers/utils/clientLocalStorage";
import useCustomizationSettings from "@/Hooks/useCustomizationSettings";
// import PostReactionsPreview from "@/Components/PostReactionsPreview";
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
  const { query } = useRouter();
  const customSettings = getCustomSettings();
  const [showFeedSettings, setShowFeedSettings] = useState(
    query.tab === "customization" ? true : false
  );
  const [homeContentSuggestion, setHomeContentSuggestion] = useState(
    localStorage_?.getItem("hsuggest")
  );
  const [userToFollowSuggestion, setUserToFollowSuggestion] = useState(
    localStorage_?.getItem("hsuggest1")
  );
  const [contentSuggestion, setContentSuggestion] = useState(
    localStorage_?.getItem("hsuggest2")
  );
  const [interestSuggestion, setInterestSuggestion] = useState(
    localStorage_?.getItem("hsuggest3")
  );
  const [collapsedNote, setCollapsedNote] = useState(
    customSettings.collapsedNote === undefined
      ? true
      : customSettings.collapsedNote
  );
  const [blurNonFollowedMedia, setBlurNonFollowedMedia] = useState(
    customSettings.blurNonFollowedMedia === undefined
      ? true
      : customSettings.blurNonFollowedMedia
  );
  const [userHoverPreview, setUserHoverPreview] = useState(
    customSettings.userHoverPreview
  );
  const [longPress, setLongPress] = useState(
    customSettings.longPress || "notes"
  );
  const [defaultReaction, setDefaultReaction] = useState(
    customSettings.defaultReaction || "❤️"
  );
  const [reactionsSettings, setReactionsSettings] = useState(
    customSettings.reactionsSettings || [
      { reaction: "likes", status: true },
      { reaction: "replies", status: true },
      { reaction: "repost", status: true },
      { reaction: "quote", status: true },
      { reaction: "zap", status: true },
    ]
  );
  const [oneTapReaction, setOneTapReaction] = useState(
    customSettings.oneTapReaction || false
  );
  const [linkPreview, setLinkPreview] = useState(
    customSettings.linkPreview
  );
  const [repliesView, setRepliesView] = useState(
    ["thread", "box"].includes(customSettings.repliesView)
      ? customSettings.repliesView
      : "thread"
  );

  const notification = customSettings.notification;

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
  useEffect(() => {
    if (query.tab === "customization") {
      setShowFeedSettings(true);
    }
  }, [query]);

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
    setCollapsedNote(!collapsedNote);
    updateCustomSettings({
      pubkey: userKeys.pub,
      collapsedNote: !collapsedNote,
      userHoverPreview,
      oneTapReaction,
      blurNonFollowedMedia,
      defaultReaction,
      reactionsSettings,
      repliesView,
      linkPreview,
      longPress,
      notification,
    });
  };
  const handleUserHoverPreview = () => {
    setUserHoverPreview(!userHoverPreview);
    updateCustomSettings({
      pubkey: userKeys.pub,
      userHoverPreview: !userHoverPreview,
      oneTapReaction,
      blurNonFollowedMedia,
      defaultReaction,
      reactionsSettings,
      repliesView,
      linkPreview,
      longPress,
      collapsedNote,
      notification,
    });
  };
  const handleOneTapReaction = () => {
    setOneTapReaction(!oneTapReaction);
    updateCustomSettings({
      pubkey: userKeys.pub,
      userHoverPreview,
      oneTapReaction: !oneTapReaction,
      blurNonFollowedMedia,
      defaultReaction,
      repliesView,
      linkPreview,
      reactionsSettings,
      longPress,
      collapsedNote,
      notification,
    });
  };
  const handleDefaultReaction = (emoji) => {
    setDefaultReaction(emoji);
    updateCustomSettings({
      pubkey: userKeys.pub,
      userHoverPreview,
      oneTapReaction,
      blurNonFollowedMedia,
      defaultReaction: emoji,
      reactionsSettings,
      repliesView,
      linkPreview,
      longPress,
      collapsedNote,
      notification,
    });
  };
  const handleLongPress = (data) => {
    setLongPress(data);
    updateCustomSettings({
      pubkey: userKeys.pub,
      userHoverPreview,
      oneTapReaction,
      blurNonFollowedMedia,
      defaultReaction,
      reactionsSettings,
      repliesView,
      linkPreview,
      longPress: data,
      collapsedNote,
      notification,
    });
  };
  const handleReactionsSettings = (data) => {
    setReactionsSettings(data);
    updateCustomSettings({
      pubkey: userKeys.pub,
      userHoverPreview,
      oneTapReaction,
      blurNonFollowedMedia,
      defaultReaction,
      reactionsSettings: data,
      longPress,
      repliesView,
      linkPreview,
      collapsedNote,
      notification,
    });
  };
  const handleChangeReactionStatus = (index, status) => {
    let newList = structuredClone(reactionsSettings);
    newList[index].status = status;
    setReactionsSettings(newList);
    updateCustomSettings({
      pubkey: userKeys.pub,
      userHoverPreview,
      oneTapReaction,
      blurNonFollowedMedia,
      defaultReaction,
      reactionsSettings: newList,
      longPress,
      repliesView,
      linkPreview,
      collapsedNote,
      notification,
    });
  };
  const handleBlurNonFollowedMedia = () => {
    setBlurNonFollowedMedia(!blurNonFollowedMedia);
    updateCustomSettings({
      pubkey: userKeys.pub,
      userHoverPreview,
      oneTapReaction,
      blurNonFollowedMedia: !blurNonFollowedMedia,
      defaultReaction,
      repliesView,
      linkPreview,
      reactionsSettings,
      longPress,
      collapsedNote,
      notification,
    });
  };

  const handleRepliesView = (value) => {
    setRepliesView(value);
    updateCustomSettings({
      pubkey: userKeys.pub,
      userHoverPreview,
      oneTapReaction,
      blurNonFollowedMedia,
      repliesView: value,
      defaultReaction,
      linkPreview,
      reactionsSettings,
      longPress,
      collapsedNote,
      notification,
    });
  };
  const handleLinkPreview = (value) => {
    setLinkPreview(value);
    updateCustomSettings({
      pubkey: userKeys.pub,
      userHoverPreview,
      oneTapReaction,
      blurNonFollowedMedia,
      repliesView,
      linkPreview: value,
      defaultReaction,
      reactionsSettings,
      longPress,
      collapsedNote,
      notification,
    });
  };

  return (
    <>
      {showFeedSettings && (
        <FeedSettings
          exit={() => setShowFeedSettings(false)}
          collapsedNote={collapsedNote}
          repliesView={repliesView}
          homeContentSuggestion={homeContentSuggestion}
          userToFollowSuggestion={userToFollowSuggestion}
          contentSuggestion={contentSuggestion}
          interestSuggestion={interestSuggestion}
          reactionsSettings={reactionsSettings}
          blurNonFollowedMedia={blurNonFollowedMedia}
          linkPreview={linkPreview}
          handleCollapedNote={handleCollapedNote}
          handleRepliesView={handleRepliesView}
          handleHomeContentSuggestion={handleHomeContentSuggestion}
          handleUserToFollowSuggestion={handleUserToFollowSuggestion}
          handleContentSuggestion={handleContentSuggestion}
          handleInterestSuggestion={handleInterestSuggestion}
          handleReactionsSettings={handleReactionsSettings}
          handleBlurNonFollowedMedia={handleBlurNonFollowedMedia}
          handleChangeReactionStatus={handleChangeReactionStatus}
          handleLinkPreview={handleLinkPreview}
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
          overflow: "visible",
          borderRadius: 0,
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
              <Select
                options={longPressOptions}
                value={longPress}
                setSelectedValue={handleLongPress}
              />
            </div>
            <hr />
            <div className="fx-scattered fit-container">
              <div>
                <p>{t("AFVPHti")}</p>
                <p className="p-medium gray-c">{t("A864200")}</p>
              </div>
              <Toggle
                status={userHoverPreview}
                setStatus={handleUserHoverPreview}
              />
            </div>
            <hr />
            <div className="fx-scattered fit-container">
              <div>
                <p>{t("AKa9x4m")}</p>
                <p className="p-medium gray-c">{t("AndOZE9")}</p>
              </div>
              <Reaction
                defaultReaction={defaultReaction}
                handleDefaultReaction={handleDefaultReaction}
              />
            </div>
            <hr />
            <div className="fx-scattered fit-container">
              <div>
                <p>{t("A06GNpE")}</p>
                <p className="p-medium gray-c">{t("AibLlqg")}</p>
              </div>
              <Toggle
                status={oneTapReaction}
                setStatus={handleOneTapReaction}
              />
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
  repliesView,
  homeContentSuggestion,
  userToFollowSuggestion,
  contentSuggestion,
  interestSuggestion,
  reactionsSettings,
  linkPreview,
  handleLinkPreview,
  handleReactionsSettings,
  blurNonFollowedMedia,
  handleBlurNonFollowedMedia,
  handleChangeReactionStatus,
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
                borderColor:
                  repliesView !== "thread" ? "" : "var(--c1)",
              }}
              onClick={() => handleRepliesView("thread")}
            >
              <img src={threadView} style={{ width: "100%" }} alt="" />
              <p className="gray-c box-pad-v-s">{t("AlwU99D")}</p>
            </div>
            <div
              className="fx fx-centered fx-col sc-s-18 bg-sp "
              style={{
                borderColor: repliesView !== "box" ? "" : "var(--c1)",
              }}
              onClick={() => handleRepliesView("box")}
            >
              <img src={boxView} style={{ width: "100%" }} alt="" />
              <p className="gray-c box-pad-v-s">{t("ACz8zwo")}</p>
            </div>
          </div>
        </div>
        <div className="fx-scattered fit-container">
          <div>
            <p>{t("AozzmTY")}</p>
            <p className="p-medium gray-c">{t("A3nTKfp")}</p>
          </div>
          <Toggle status={collapsedNote} setStatus={handleCollapedNote} />
        </div>
        <div className="fx-scattered fit-container">
          <div>
            <p>{t("AOEEyh3")}</p>
            <p className="p-medium gray-c">{t("AfkaQwa")}</p>
          </div>
          <Toggle
            status={blurNonFollowedMedia}
            setStatus={handleBlurNonFollowedMedia}
          />
        </div>
        <div className="fx-scattered fit-container">
          <div>
            <p>{t("AOk5664")}</p>
            <p className="p-medium gray-c">{t("Adyp37d")}</p>
          </div>
          <Toggle
            status={linkPreview}
            setStatus={handleLinkPreview}
          />
        </div>
        <div className="fx-centered fx-col fx-start-h fx-start-v fit-container">
          <div>
            <p>{t("AsxiVow")}</p>
            <p className="p-medium gray-c">{t("AZiqDAt")}</p>
          </div>
          <DraggableComp
            children={reactionsSettings.map((_) => {
              return {
                ..._,
                id: _.reaction,
              };
            })}
            setNewOrderedList={handleReactionsSettings}
            props={{
              handleChangeReactionStatus,
            }}
            component={ReactionItem}
            background={false}
          />
          <p className="gray-c p-medium">{t("Ao1TlO5")}</p>
          <PostReactionsPreview />
        </div>
        <div className="fit-container">
          <p className="c1-c p-big">{t("Av6mqrU")}</p>
        </div>
        <div className="fx-scattered fit-container">
          <div>
            <p>{t("AZZ4XLg")}</p>
            <p className="p-medium gray-c">{t("AgBOrIx")}</p>
          </div>
          <Toggle
            status={homeContentSuggestion}
            setStatus={handleHomeContentSuggestion}
          />
        </div>
        <hr />
        <div className="fx-scattered fit-container">
          <div>
            <p>{t("AE7aj4C")}</p>
            <p className="p-medium gray-c">{t("AyBFzxq")}</p>
          </div>
          <Toggle
            status={userToFollowSuggestion}
            setStatus={handleUserToFollowSuggestion}
          />
        </div>
        <hr />
        <div className="fx-scattered fit-container">
          <div>
            <p>{t("Ax8NFUb")}</p>
            <p className="p-medium gray-c">{t("ARDBNh7")}</p>
          </div>
          <Toggle
            status={contentSuggestion}
            setStatus={handleContentSuggestion}
          />
        </div>
        <hr />
        <div className="fx-scattered fit-container">
          <div>
            <p>{t("ANiWe9M")}</p>
            <p className="p-medium gray-c">{t("AXgwD7C")}</p>
          </div>
          <Toggle
            status={interestSuggestion}
            setStatus={handleInterestSuggestion}
          />
        </div>
      </div>
    </div>
  );
};

const Reaction = ({ defaultReaction, handleDefaultReaction }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = ["dark", "gray", "system"].includes(resolvedTheme);
  const { open, setOpen, containerRef } = useCloseContainer();
  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      {open && (
        <div
          className={"drop-down-r"}
          style={{
            position: "absolute",
            top: "50%",
            left: "0",
            transform: "translateX(-100%) translateY(-50%)",
            zIndex: 102,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sc-s fx-centered">
            <EmojiPicker
              reactionsDefaultOpen={true}
              theme={isDarkMode ? "dark" : "light"}
              previewConfig={{ showPreview: false }}
              suggestedEmojisMode="recent"
              skinTonesDisabled={false}
              searchDisabled={false}
              height={300}
              onEmojiClick={(data) => {
                setOpen(false);
                handleDefaultReaction(data.emoji);
              }}
            />
          </div>
        </div>
      )}
      <div
        className="sc-s-18 fx-centered option"
        style={{ width: "45px", aspectRatio: "1/1" }}
        onClick={() => setOpen(!open)}
      >
        <div className="p-big">{defaultReaction}</div>
      </div>
    </div>
  );
};

const ReactionItem = ({ item, index, handleChangeReactionStatus }) => {
  const { t } = useTranslation();
  const elements = {
    likes: (
      <div className="fx-centered">
        <div className="heart"></div>
        <p>{t("Alz0E9Y")}</p>
      </div>
    ),
    replies: (
      <div className="fx-centered">
        <div className="comment-icon"></div>
        <p>{t("AENEcn9")}</p>
      </div>
    ),
    repost: (
      <div className="fx-centered">
        <div className="switch-arrows"></div>
        <p>{t("Aai65RJ")}</p>
      </div>
    ),
    quote: (
      <div className="fx-centered">
        <div className="quote"></div>
        <p>{t("AuafJAx")}</p>
      </div>
    ),
    zap: (
      <div className="fx-centered">
        <div className="bolt"></div>
        <p>Zaps</p>
      </div>
    ),
  };
  if (!elements[item.reaction]) return null;
  return (
    <div
      className="sc-s-18 fx-scattered box-pad-v-s box-pad-h-s"
      style={{ cursor: "grab" }}
    >
      {elements[item.reaction]}
      <div className="fx-centered">
        <Toggle
          status={item.status}
          setStatus={(status) => handleChangeReactionStatus(index, status)}
        />
        <div
          className="drag-el"
          style={{
            minWidth: "16px",
            aspectRatio: "1/1",
          }}
        ></div>
      </div>
    </div>
  );
};

const PostReactionsPreview = () => {
  const { reactionsSettings } = useCustomizationSettings();
  const order = useMemo(() => {
    const reactionsOrder = reactionsSettings.reduce(
      (acc, { reaction, status }, index) => {
        acc[reaction] = { index, status };
        return acc;
      },
      {}
    );
    return {
      likes: reactionsOrder.likes.status ? reactionsOrder.likes.index + 1 : -1,
      replies: reactionsOrder.replies.status
        ? reactionsOrder.replies.index + 1
        : -1,
      repost: reactionsOrder.repost.status
        ? reactionsOrder.repost.index + 1
        : -1,
      quote: reactionsOrder.quote.status ? reactionsOrder.quote.index + 1 : -1,
      zap: reactionsOrder.zap.status ? reactionsOrder.zap.index + 1 : -1,
    };
  }, [reactionsSettings]);
  return (
    <div className="fit-container fx-scattered box-pad-h-m box-pad-v-m sc-s-18">
      <div className="fx-centered" style={{ gap: "20px" }}>
        {order.likes > -1 && (
          <div className="fx-centered" style={{ order: order.likes }}>
            <div className="heart opacity-4"></div>
            <p className="gray-c">0</p>
          </div>
        )}
        {order.replies > -1 && (
          <div className="fx-centered" style={{ order: order.replies }}>
            <div className="comment-icon opacity-4"></div>
            <p className="gray-c">0</p>
          </div>
        )}
        {order.repost > -1 && (
          <div className="fx-centered" style={{ order: order.repost }}>
            <div className="switch-arrows opacity-4"></div>
            <p className="gray-c">0</p>
          </div>
        )}
        {order.quote > -1 && (
          <div className="fx-centered" style={{ order: order.quote }}>
            <div className="quote opacity-4"></div>
            <p className="gray-c">0</p>
          </div>
        )}
        {order.zap > -1 && (
          <div className="fx-centered" style={{ order: order.zap }}>
            <div className="bolt opacity-4"></div>
            <p className="gray-c">0</p>
          </div>
        )}
      </div>
      <div className="fx-centered">
        <div className="translate-24 opacity-4"></div>
      </div>
    </div>
  );
};
