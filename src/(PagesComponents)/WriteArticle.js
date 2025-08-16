import React, { useEffect, useState } from "react";
import MDEditorWrapper from "@/Components/MDEditorWrapper";
import PagePlaceholder from "@/Components/PagePlaceholder";
import ToPublish from "@/Components/ToPublish";
import LoadingScreen from "@/Components/LoadingScreen";
import ToPublishDrafts from "@/Components/ToPublishDrafts";
import katex from "katex";
import axiosInstance from "@/Helpers/HTTP_Client";
import { getAppLang } from "@/Helpers/Helpers";
import {
  getArticleDraft,
  getComponent,
  updateArticleDraft,
} from "@/Helpers/ClientHelpers";
import UserProfilePic from "@/Components/UserProfilePic";
import LoadingDots from "@/Components/LoadingDots";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";
import ProfilesPicker from "@/Components/ProfilesPicker";
import Router from "next/router";

const getUploadsHistory = () => {
  let history = localStorage?.getItem("YakihonneUploadsHistory");
  if (history) {
    return JSON.parse(history);
  }
  return [];
};

export default function WritingArticle() {
  const {
    post_pubkey,
    post_id,
    post_kind,
    post_title,
    post_desc,
    post_thumbnail,
    post_tags,
    post_d,
    post_content,
    post_published_at,
  } = {};
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const isDarkMode = useSelector((state) => state.isDarkMode);
  const [draftData, setDraftData] = useState({});

  const [content, setContent] = useState(post_content);
  const [title, setTitle] = useState(post_title);
  const [showPublishingScreen, setShowPublishingScreen] = useState(false);
  const [showPublishingDraftScreen, setShowPublishingDraftScreen] =
    useState(false);
  const [seenOn, setSeenOn] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadsHistory, setUploadsHistory] = useState(getUploadsHistory());
  const [showUploadsHistory, setShowUploadsHistory] = useState(false);
  const [showClearEditPopup, setShowClearEditPopup] = useState(false);
  const [selectedTab, setSelectedTab] = useState(
    ["ar", "he", "fa", "ur"].includes(getAppLang()) ? 1 : 0
  );
  const [isEdit, setIsEdit] = useState(true);
  const [triggerHTMLWarning, setTriggerHTMLWarning] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(false);

  useEffect(() => {
    if (userKeys) setSelectedProfile(userKeys);
  }, [userKeys]);

  useEffect(() => {
    if (userKeys && !post_id) {
      let draft = getArticleDraft();
      setDraftData(draft);
      setTitle(draft.title);
      setContent(draft.content);
    }
  }, [userKeys]);

  useEffect(() => {
    if (!title && !content) return;
    setIsSaving(true);
    let timeout = setTimeout(() => {
      setIsSaving(false);
    }, 600);
    return () => {
      clearTimeout(timeout);
    };
  }, [title, content]);

  const handleChange = (e) => {
    let value = e.target.value;
    let element = e.target;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
    updateArticleDraft({ title: value, content });
    setTitle(value);
    if (!value || value === "\n") {
      setTitle("");
      return;
    }
  };

  const execute = () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.click();
      input.onchange = async (e) => {
        if (e.target.files[0]) {
          setIsLoading(true);
          let imgPath = await uploadToS3(e.target.files[0]);
          setIsLoading(false);
          resolve(imgPath);
        } else {
          resolve(false);
        }
      };
    });
  };

  const uploadToS3 = async (img) => {
    if (img) {
      try {
        let fd = new FormData();
        fd.append("file", img);
        fd.append("pubkey", userKeys.pub);
        let data = await axiosInstance.post("/api/v1/file-upload", fd, {
          headers: { "Content-Type": "multipart/formdata" },
        });
        localStorage?.setItem(
          "YakihonneUploadsHistory",
          JSON.stringify([...uploadsHistory, data.data.image_path])
        );
        setUploadsHistory([...uploadsHistory, data.data.image_path]);
        return data.data.image_path;
      } catch {
        dispatch(
          setToast({
            type: 2,
            desc: t("ANFYp9V"),
          })
        );
        return false;
      }
    }
  };

  const hasHTMLOutsideCodeblocks = () => {
    const codeblockPatterns = /```([^`]+)```|``([^`]+)``|`([^`]+)`/g;
    const excludedTags =
      /(<iframe[^>]*>(?:.|\n)*?<\/iframe>)|(<video[^>]*>(?:.|\n)*?<\/video>)|(<source[^>]*>)|(<img[^>]*>)|(<>)|<\/>/g;

    let tempContent = content;
    const sanitizedText = tempContent
      .replace(new RegExp(codeblockPatterns, "g"), "")
      .replace(excludedTags, "");

    let res = /<[^>]*>/.test(sanitizedText);

    if (res) {
      setTriggerHTMLWarning(true);
    } else {
      setTriggerHTMLWarning(false);
    }
    return false;
  };

  const handleSetContent = (data) => {
    updateArticleDraft({ title, content: data });
    setContent(data);
  };

  const clearContent = () => {
    setTitle("");
    setContent("");
    updateArticleDraft({ title: "", content: "" });
  };

  const handleClearOptions = (data) => {
    if (data) {
      clearContent();
    }
    setShowClearEditPopup(false);
  };

  return (
    <>
      {showPublishingScreen && (
        <ToPublish
          warning={triggerHTMLWarning}
          exit={() => setShowPublishingScreen(false)}
          postContent={content}
          postTitle={title}
          postDesc={post_desc || ""}
          postThumbnail={post_thumbnail || ""}
          edit={post_d || ""}
          tags={post_tags || []}
          seenOn={seenOn || []}
          postId={post_id}
          postKind={post_kind}
          postPublishedAt={post_published_at}
          userKeys={selectedProfile}
        />
      )}
      {showPublishingDraftScreen && (
        <ToPublishDrafts
          warning={triggerHTMLWarning}
          exit={() => setShowPublishingDraftScreen(false)}
          postContent={content}
          postTitle={title}
          postDesc={post_desc || ""}
          postThumbnail={post_thumbnail || ""}
          edit={post_d || ""}
          tags={post_tags || []}
          seenOn={seenOn || []}
          postId={post_id}
          postKind={post_kind}
          userKeys={selectedProfile}
        />
      )}
      {isLoading && <LoadingScreen />}
      {showUploadsHistory && (
        <UploadHistoryList
          exit={() => setShowUploadsHistory(false)}
          list={uploadsHistory}
        />
      )}
      {showClearEditPopup && (
        <ClearEditPopup handleClearOptions={handleClearOptions} />
      )}
      <div>
        {/* <Helmet>
          <title>Yakihonne | Write an article</title>
          <meta
            name="description"
            content={
              "Create beautiful long-form content with our powerful yet intuitive editor. Publish directly to the decentralized Nostr network with Bitcoin rewards enabled."
            }
          />
          <meta
            property="og:description"
            content={
              "Create beautiful long-form content with our powerful yet intuitive editor. Publish directly to the decentralized Nostr network with Bitcoin rewards enabled."
            }
          />
          <meta
            property="og:image"
            content="https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"
          />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="700" />
          <meta property="og:url" content={`https://yakihonne.com/write`} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Yakihonne" />
          <meta property="og:title" content="Yakihonne | Write an article" />
          <meta
            property="twitter:title"
            content="Yakihonne | Write an article"
          />
          <meta
            property="twitter:description"
            content={
              "Create beautiful long-form content with our powerful yet intuitive editor. Publish directly to the decentralized Nostr network with Bitcoin rewards enabled."
            }
          />
          <meta
            property="twitter:image"
            content="https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"
          />
        </Helmet> */}
        <div className="fit-container fx-centered">
          <div
            className="main-container"
            style={{ width: !userKeys ? "unset" : "min(100%, 1700px)" }}
          >
            <main
              className="main-page-nostr-container fit-container"
              style={{ overflow: "visible" }}
            >
              <div className="fx-centered fit-container fx-start-h fx-start-v">
                <div className="box-pad-h-m fit-container">
                  {userKeys && (
                    <>
                      {(userKeys.sec || userKeys.ext || userKeys.bunker) && (
                        <>
                          <div className="fit-container">
                            <div className="fx-scattered fit-container sticky">
                              <div className="fx-centered">
                                <button
                                  className="btn btn-normal btn-gray"
                                  style={{ padding: "0 1rem" }}
                                  onClick={() => Router.back()}
                                >
                                  <div className="arrow arrow-back"></div>
                                </button>
                                {!isSaving && (
                                  <button
                                    className="btn btn-normal fx-centered"
                                    onClick={() => setIsEdit(!isEdit)}
                                  >
                                    {isEdit ? t("Ao1TlO5") : t("AsXohpb")}
                                  </button>
                                )}
                                {isSaving && (
                                  <button
                                    className="btn btn-disabled fx-centered"
                                    onClick={() => setIsEdit(!isEdit)}
                                  >
                                    <div
                                      style={{ filter: "invert()" }}
                                      className="fx-centered"
                                    >
                                      {t("AiUwe3v")}
                                      <LoadingDots />
                                    </div>
                                  </button>
                                )}
                                {(title || content) && (
                                  <button
                                    className="btn btn-gst"
                                    onClick={() => setShowClearEditPopup(true)}
                                  >
                                    {t("AUdbtv8")}
                                  </button>
                                )}
                                {/* <SelectTabs
                                  selectedTab={selectedTab}
                                  tabs={["LTR", "RTL"]}
                                  setSelectedTab={setSelectedTab}
                                /> */}
                              </div>
                              <div className="fx-centered">
                                {uploadsHistory.length > 0 && (
                                  <div className="fx-centered ">
                                    <div
                                      className="round-icon round-icon-tooltip fx-centered"
                                      onClick={() =>
                                        setShowUploadsHistory(true)
                                      }
                                      data-tooltip={t("AP17LmU")}
                                    >
                                      <div
                                        className="posts"
                                        style={{ filter: "invert()" }}
                                      ></div>
                                      {/* <p>Uploads history</p> */}
                                    </div>
                                  </div>
                                )}
                                <div
                                  className="round-icon-tooltip"
                                  data-tooltip={
                                    !(title && content) ? t("AziSA3n") : ""
                                  }
                                >
                                  <button
                                    className={`btn ${
                                      title && content
                                        ? "btn-gst"
                                        : "btn-disabled"
                                    }`}
                                    disabled={!(title && content)}
                                    onClick={() =>
                                      title &&
                                      content &&
                                      !hasHTMLOutsideCodeblocks()
                                        ? setShowPublishingDraftScreen(true)
                                        : null
                                    }
                                    style={{ width: "max-content" }}
                                  >
                                    {t("ABg9vzA")}
                                  </button>
                                </div>
                                <div
                                  className="round-icon-tooltip"
                                  data-tooltip={
                                    !(title && content)
                                      ? t("AziSA3n")
                                      : t("ALuUhWG")
                                  }
                                >
                                  <button
                                    className={`btn  ${
                                      title && content
                                        ? "btn-normal"
                                        : "btn-disabled"
                                    }`}
                                    disabled={!(title && content)}
                                    onClick={() =>
                                      title &&
                                      content &&
                                      !hasHTMLOutsideCodeblocks()
                                        ? setShowPublishingScreen(true)
                                        : null
                                    }
                                    style={{ width: "max-content" }}
                                  >
                                    {t("AgGi8rh")}
                                  </button>
                                </div>
                                {/* <UserProfilePic
                                  size={40}
                                  mainAccountUser={true}
                                  allowClick={false}
                                /> */}
                                <ProfilesPicker
                                  setSelectedProfile={setSelectedProfile}
                                />
                              </div>
                            </div>
                            <div>
                              <textarea
                                className="h2-txt fit-container"
                                onChange={handleChange}
                                value={title}
                                placeholder={t("Atr3rjD")}
                                dir={selectedTab === 0 ? "ltr" : "rtl"}
                              />
                            </div>
                            <div
                              className="article fit-container"
                              style={{ position: "relative" }}
                            >
                              <MDEditorWrapper
                                direction={selectedTab === 0 ? "ltr" : "rtl"}
                                dataColorMode={
                                  isDarkMode === "0" ? "dark" : "light"
                                }
                                preview={!isEdit ? "preview" : "live"}
                                height={"80vh"}
                                width={"100%"}
                                value={content}
                                onChange={handleSetContent}
                                selectedTab={selectedTab}
                                setSelectedTab={setSelectedTab}
                                execute={execute}
                              />
                            </div>
                          </div>
                        </>
                      )}
                      {!userKeys.sec && !userKeys.ext && !userKeys.bunker && (
                        <PagePlaceholder page={"nostr-unauthorized"} />
                      )}
                    </>
                  )}
                  {!userKeys && (
                    <PagePlaceholder page={"nostr-not-connected"} />
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

const UploadHistoryList = ({ exit, list = [] }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    dispatch(
      setToast({
        type: 1,
        desc: `${t("AfnTOQk")} 👏`,
      })
    );
  };
  return (
    <div
      className="fixed-container fx-centered fx-end-h box-pad-h box-pad-v"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <section
        className="box-pad-v box-pad-h sc-s fx-centered fx-col fx-start-h fx-start-v"
        style={{
          position: "relative",
          width: "min(100%, 400px)",
          height: "100%",
          overflow: "scroll",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <div className="fit-container fx-centered fx-col box-marg-s">
          <h4>{t("AP17LmU")}</h4>
          <p className="c1-c">{t("A6Mjx8g", { count: list.length })}</p>
        </div>
        {list.map((item) => {
          return (
            <div
              className="sc-s bg-img cover-bg fit-container fx-centered fx-end-h fx-start-v box-pad-h-m box-pad-v-m"
              style={{
                position: "relative",
                aspectRatio: "16 / 9",
                backgroundImage: `url(${item})`,
              }}
            >
              <div
                style={{
                  aspectRatio: "1/1",
                  minWidth: "48px",
                  backgroundColor: "var(--dim-gray)",
                  borderRadius: "var(--border-r-50)",
                }}
                className="fx-centered pointer"
                onClick={() => copyLink(item)}
              >
                <div className="copy-24"></div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

const ChatGPTConvo = () => {
  const dummy = [
    {
      user: true,
      context: "A question from the user",
    },
    {
      user: false,
      context: "Context from AI",
    },
  ];
  return (
    <div
      className="sc-s-18 fx-centered "
      style={{
        backgroundColor: "var(--white)",
        position: "absolute",
        right: 0,
        bottom: "-100%",
        width: "min(90vw, 500px)",
        height: "min(70vh, 800px)",
        border: "none",
      }}
    >
      <div
        className=" fx-scattered fit-container fx-col"
        style={{ backgroundColor: "var(--c1-side)", height: "100%" }}
      >
        <div className="fx-centered fx-start-h fit-container box-pad-h box-pad-v">
          <h4>How can we help you today?</h4>
        </div>
        <div
          style={{ height: "calc(100% - 130px)", overflow: "scroll" }}
          className="fit-container box-pad-h-m fx-centered fx-col fx-start-h fx-start-v"
        >
          {dummy.map((msg) => {
            return (
              <div
                className={`fx-centered fit-container ${
                  msg.user ? "fx-end-h" : "fx-start-h"
                }`}
              >
                <div className="fx-centered fx-start-v">
                  <div className="box-pad-h-m box-pad-v-m sc-s-18">
                    {msg.context}
                  </div>
                  {msg.user && (
                    <div className="fx-centered box-pad-v-s">
                      <UserProfilePic mainAccountUser={true} size={32} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="fx-centered fit-container box-pad-h-m box-pad-v-m">
          <input
            type="text"
            placeholder="type a question"
            className="if ifs-full"
          />
          <div className="round-icon">
            <p style={{ rotate: "-45deg" }}>&#x27A4;</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClearEditPopup = ({ handleClearOptions }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed-container fx-centered box-pad-h">
      <div
        className="fx-centered fx-col sc-s-18 bg-sp box-pad-h box-pad-v slide-up"
        style={{ width: "450px" }}
      >
        <div
          className="fx-centered box-marg-s"
          style={{
            minWidth: "54px",
            minHeight: "54px",
            borderRadius: "var(--border-r-50)",
            backgroundColor: "var(--red-main)",
          }}
        >
          <div className="warning"></div>
        </div>
        <h3 className="p-centered" style={{ wordBreak: "break-word" }}>
          {t("AirKalq")}
        </h3>

        <p className="p-centered gray-c box-pad-v-m">{t("ASGtOLO")}</p>
        <div className="fx-centered fit-container">
          <button
            className="fx btn btn-gst-red"
            onClick={() => handleClearOptions(true)}
          >
            {t("AUdbtv8")}
          </button>
          <button
            className="fx btn btn-red"
            onClick={() => handleClearOptions(false)}
          >
            {t("AB4BSCe")}
          </button>
        </div>
      </div>
    </div>
  );
};
