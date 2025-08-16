import React, { useEffect } from "react";
import MDEditor, {
  commands,
  bold,
  italic,
  strikethrough,
  hr,
  link,
  quote,
  code,
  codeBlock,
  unorderedListCommand,
  orderedListCommand,
  checkedListCommand,
  comment,
  divider,
} from "@uiw/react-md-editor";
import { useState } from "react";
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
                              <MDEditor
                                direction={selectedTab === 0 ? "ltr" : "rtl"}
                                data-color-mode={
                                  isDarkMode === "0" ? "dark" : "light"
                                }
                                preview={!isEdit ? "preview" : "live"}
                                height={"80vh"}
                                width={"100%"}
                                value={content}
                                onChange={handleSetContent}
                                commands={[
                                  commands.group([], {
                                    name: "ltr",
                                    icon: (
                                      <svg
                                        // class="icon icon-tabler icon-tabler-text-direction-ltr"
                                        fill="none"
                                        height="18"
                                        width="18"
                                        stroke={
                                          selectedTab === 0
                                            ? "var(--c1)"
                                            : "currentColor"
                                        }
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M0 0h24v24H0z"
                                          fill="none"
                                          stroke="none"
                                        />
                                        <path d="M5 19h14" />
                                        <path d="M17 21l2 -2l-2 -2" />
                                        <path d="M16 4h-6.5a3.5 3.5 0 0 0 0 7h.5" />
                                        <path d="M14 15v-11" />
                                        <path d="M10 15v-11" />
                                      </svg>
                                    ),
                                    execute: async (state, api) => {
                                      setSelectedTab(0);
                                    },
                                    buttonProps: {
                                      "aria-label": "LTR",
                                      title: "LTR",
                                    },
                                  }),
                                  commands.group([], {
                                    name: "ltr",
                                    icon: (
                                      <svg
                                        fill="none"
                                        height="18"
                                        width="18"
                                        stroke={
                                          selectedTab === 1
                                            ? "var(--c1)"
                                            : "currentColor"
                                        }
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M0 0h24v24H0z"
                                          fill="none"
                                          stroke="none"
                                        />
                                        <path d="M16 4h-6.5a3.5 3.5 0 0 0 0 7h.5" />
                                        <path d="M14 15v-11" />
                                        <path d="M10 15v-11" />
                                        <path d="M5 19h14" />
                                        <path d="M7 21l-2 -2l2 -2" />
                                      </svg>
                                    ),
                                    execute: async (state, api) => {
                                      setSelectedTab(1);
                                    },
                                    buttonProps: {
                                      "aria-label": "RTL",
                                      title: "RTL",
                                    },
                                  }),
                                  divider,
                                  bold,
                                  italic,
                                  strikethrough,
                                  hr,
                                  commands.group(
                                    [
                                      commands.title1,
                                      commands.title2,
                                      commands.title3,
                                      commands.title4,
                                      commands.title5,
                                      commands.title6,
                                    ],
                                    {
                                      name: "title",
                                      groupName: "title",
                                      buttonProps: {
                                        "aria-label": "Insert title",
                                        title: "Insert title",
                                      },
                                    }
                                  ),

                                  {
                                    ...link,
                                    execute: (state, api) => {
                                      const linkText = "URL here";
                                      let modifyText = `[](${linkText})`;
                                      if (state.selectedText) {
                                        modifyText = `[](${state.selectedText})`; // Replace with selected text if any
                                      }
                                      let cursorPosition =
                                        api.textArea.selectionStart + 3;

                                      api.replaceSelection(modifyText);
                                      api.setSelectionRange({
                                        start: cursorPosition,
                                        end: state.selectedText
                                          ? state.selectedText.length +
                                            cursorPosition
                                          : cursorPosition + 8,
                                      });
                                    },
                                  },
                                  quote,
                                  code,
                                  codeBlock,
                                  commands.group([], {
                                    name: "functions",
                                    icon: (
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M11.9912 7.54323C12.1318 7.3645 12.197 7.13946 12.3125 6.94634C12.4288 6.75208 12.3625 6.71678 12.1662 6.7182C11.3901 6.72469 10.6136 6.71509 9.83741 6.72384C9.63044 6.72638 9.55957 6.68093 9.5991 6.45476C9.77105 5.47331 9.93623 4.49072 10.1864 3.52564C10.3343 2.95416 10.4925 2.3824 10.8084 1.87332C11.1232 1.36565 11.5617 1.23379 12.1016 1.49638C12.5528 1.71548 12.9198 2.04301 13.2228 2.44085C13.3552 2.61478 13.5294 2.75115 13.7313 2.6351C14.1201 2.41148 14.4615 2.13873 14.6594 1.69939C14.7738 1.44527 14.8381 1.16038 14.7052 0.900052C14.5205 0.539207 14.1791 0.287631 13.8042 0.148996C13.1813 -0.0811203 12.5082 -0.0269088 11.8907 0.19022C11.178 0.440666 10.4939 0.854594 9.90037 1.31878C9.68127 1.49017 9.46866 1.67144 9.26819 1.86485C8.53096 2.57553 7.98236 3.42117 7.5961 4.3679C7.32165 5.04102 7.10255 5.7277 6.99215 6.44742C6.9721 6.57984 6.92918 6.69843 6.78292 6.72102C6.6025 6.74897 6.38961 6.72158 6.20636 6.72215C5.79611 6.72328 5.37117 6.63547 5.06735 6.99095C4.93211 7.14906 4.78952 7.33344 4.67376 7.5068C4.5594 7.67876 4.56816 7.84676 4.77004 7.92299C4.99168 8.00629 5.28279 7.95264 5.50952 7.9453C5.80909 7.9357 6.10867 7.95094 6.40824 7.94445C6.61436 7.94021 6.68156 7.9789 6.64203 8.21155C6.6042 8.43715 6.55987 8.65287 6.52683 8.87621C6.41361 9.64393 6.28486 10.4097 6.15554 11.1751C5.97568 12.2368 5.79836 13.2993 5.60411 14.3592C5.4186 15.3717 5.28702 16.3935 5.05775 17.3996C4.87874 18.1868 4.76439 18.9892 4.5738 19.7733C4.41399 20.4306 4.27733 21.1026 3.9131 21.6939C3.64797 22.1242 3.26059 22.306 2.77409 22.1911C2.33419 22.0863 1.91941 21.9209 1.56111 21.6292C1.3245 21.4363 1.054 21.2926 0.764877 21.4587C0.492972 21.6148 0.297302 21.9045 0.147091 22.1722C-0.335166 23.0325 0.451748 23.8502 1.30106 23.9798C1.87141 24.0665 2.43414 23.8618 2.93532 23.6079C3.60449 23.2688 4.18275 22.7919 4.66783 22.2295C5.06538 21.7684 5.48185 21.3288 5.81305 20.8155C6.03384 20.473 6.23629 20.1189 6.42067 19.7561C7.07431 18.4683 7.48062 17.0785 7.81605 15.6795C7.97727 15.0066 8.1529 14.338 8.3017 13.6621C8.50442 12.7425 8.67129 11.8073 8.8232 10.8781C8.89859 10.417 8.96212 9.95677 9.0584 9.49936C9.13774 9.12214 9.20353 8.73136 9.25435 8.34962C9.31364 7.90548 9.59543 7.93316 9.97971 7.8908C10.3039 7.85494 10.6303 7.83829 10.9555 7.81429C11.2164 7.79537 11.516 7.8188 11.7616 7.71461C11.8494 7.67734 11.9288 7.62313 11.9912 7.54323Z"
                                          fill="currentColor"
                                        />
                                        <path
                                          d="M23.7316 7.17956C23.6785 7.00196 23.5822 6.84215 23.4571 6.70549C23.3428 6.58069 23.1813 6.41721 23.0274 6.34352C22.5287 6.10465 21.8559 6.31415 21.4242 6.60667C21.1946 6.76253 20.9896 6.95735 20.7844 7.14399C20.5808 7.32921 20.3834 7.52008 20.2024 7.72761C19.8263 8.15876 19.4861 8.62097 19.1597 9.09024C19.001 9.31894 18.5541 10.151 18.4177 10.0692C18.274 9.98303 18.0941 9.15264 18.0258 8.91913C17.9309 8.59471 17.8677 8.25928 17.7163 7.95434C17.5096 7.53758 17.3806 7.08243 17.0904 6.70691C16.7699 6.29157 16.402 6.17213 15.9014 6.32375C15.4095 6.47255 15.0128 6.78229 14.6234 7.09599C14.0528 7.55537 13.6276 8.14492 13.2001 8.73109C12.8805 9.16986 12.8777 9.16788 13.2509 9.56685C13.4847 9.81729 13.4805 9.81419 13.6917 9.55725C13.9932 9.18906 14.286 8.81043 14.6909 8.54558C14.9868 8.3516 15.1642 8.39057 15.3471 8.69579C15.4369 8.846 15.5134 9.00751 15.5738 9.1724C15.9539 10.2075 16.2422 11.272 16.5838 12.3186C16.627 12.4519 16.5711 12.5383 16.5079 12.634C16.1041 13.2442 15.6933 13.8504 15.2362 14.4216C14.8733 14.8759 14.5077 15.3319 14.0201 15.6645C13.8075 15.8105 13.5584 15.911 13.3001 15.8421C13.0352 15.771 12.8768 15.531 12.6348 15.4192C12.6281 15.4158 12.6204 15.4132 12.6134 15.4101C12.5004 15.3641 12.3305 15.3661 12.2136 15.3923C11.6994 15.5084 11.4236 16.0878 11.3188 16.5517C11.2239 16.9727 11.3174 17.4329 11.6147 17.7548C11.8739 18.0354 12.2627 18.1526 12.6357 18.1583C12.8497 18.1614 13.0886 18.1055 13.2874 18.0287C14.0463 17.7319 14.6254 17.024 15.1049 16.3961C15.4282 15.972 15.7283 15.531 16.0442 15.1012C16.3054 14.746 16.821 13.6883 16.9681 13.6849C17.057 13.683 17.0805 13.8953 17.0974 13.958C17.1353 14.098 17.1728 14.2381 17.2132 14.3773C17.4029 15.0323 17.6025 15.6868 17.8078 16.3368C17.9448 16.7719 18.1656 17.2231 18.4428 17.5862C18.527 17.6966 18.6323 17.8022 18.7407 17.8883C19.1611 18.2246 19.6905 18.1992 20.1745 18.0278C20.3913 17.9513 20.5935 17.8431 20.7852 17.7158C21.6707 17.1271 22.3034 16.3069 22.9012 15.4482C23.0421 15.2458 23.0229 15.1326 22.8622 14.9634C22.4463 14.5261 22.4579 14.5221 22.0637 14.986C21.7681 15.333 21.4668 15.6798 21.0678 15.9133C20.7894 16.077 20.5997 16.0302 20.3967 15.7792C20.2284 15.5713 20.1177 15.3299 20.0215 15.0829C19.6253 14.0625 19.3545 13.0008 19.0191 11.9603C18.7729 11.1969 18.7661 11.1898 19.2563 10.5463C19.7631 9.88082 20.2479 9.19104 20.912 8.66502C21.4002 8.27819 21.7407 8.29965 22.1905 8.73193C22.2797 8.81777 22.4254 8.8892 22.5493 8.89908C22.9681 8.93268 23.332 8.55659 23.5469 8.24318C23.7598 7.93429 23.8405 7.54295 23.7316 7.17956Z"
                                          fill="currentColor"
                                        />
                                      </svg>
                                    ),
                                    execute: async (state, api) => {
                                      let modifyText =
                                        "`$$" + state.selectedText + "$$`";
                                      if (!state.selectedText) {
                                        modifyText = "`$$f(x) = 1^1_2$$`";
                                      }
                                      api.replaceSelection(modifyText);
                                    },
                                    buttonProps: {
                                      "aria-label": "Insert function",
                                      title: "Insert function",
                                    },
                                  }),
                                  comment,
                                  commands.group([], {
                                    name: "image",
                                    icon: (
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M13 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V10"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M2.66992 18.9501L7.59992 15.6401C8.38992 15.1101 9.52992 15.1701 10.2399 15.7801L10.5699 16.0701C11.3499 16.7401 12.6099 16.7401 13.3899 16.0701L17.5499 12.5001C18.3299 11.8301 19.5899 11.8301 20.3699 12.5001L21.9999 13.9001"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M18.5138 4.72471C19.2362 5.67443 19.0524 7.02699 18.1031 7.74568C17.1539 8.46437 15.8009 8.28423 15.0822 7.33502C14.3635 6.38581 14.5436 5.03275 15.4928 4.31405"
                                          stroke="currentColor"
                                          strokeWidth="1.1"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M17.4704 5.518C16.7191 4.5303 16.911 3.11828 17.8992 2.36326C18.8874 1.60824 20.2989 1.8039 21.054 2.79211C21.809 3.78031 21.6133 5.19182 20.6251 5.94684"
                                          stroke="currentColor"
                                          strokeWidth="1.1"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    ),
                                    execute: async (state, api) => {
                                      api.replaceSelection(
                                        `![image](${state.selectedText})`
                                      );
                                    },
                                    buttonProps: {
                                      "aria-label": "Insert image",
                                      title: "Insert image",
                                    },
                                  }),
                                  commands.group([], {
                                    name: "update",
                                    icon: (
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M13 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V10"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M18 8V2L20 4"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M18 2L16 4"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M2.66992 18.9501L7.59992 15.6401C8.38992 15.1101 9.52992 15.1701 10.2399 15.7801L10.5699 16.0701C11.3499 16.7401 12.6099 16.7401 13.3899 16.0701L17.5499 12.5001C18.3299 11.8301 19.5899 11.8301 20.3699 12.5001L21.9999 13.9001"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    ),
                                    execute: async (state, api) => {
                                      let file = await execute();
                                      if (
                                        file &&
                                        /(https?:\/\/[^ ]*\.(?:gif|png|jpg|jpeg|webp|tiff))/i.test(
                                          file
                                        )
                                      )
                                        api.replaceSelection(
                                          `![image](${file})`
                                        );
                                      else if (
                                        /(https?:\/\/[^ ]*\.(?:mp4|mov))/i.test(
                                          file
                                        )
                                      )
                                        api.replaceSelection(
                                          `<video src="${file}" controls></video>`
                                        );
                                      else api.replaceSelection(file);
                                    },
                                    buttonProps: {
                                      "aria-label": "Upload image",
                                      title: "Upload image",
                                    },
                                  }),
                                  unorderedListCommand,
                                  orderedListCommand,
                                  checkedListCommand,
                                ]}
                                previewOptions={{
                                  components: {
                                    p: ({ children }) => {
                                      return <p>{getComponent(children)}</p>;
                                    },
                                    h1: ({ children }) => {
                                      return <h1 dir="auto">{children}</h1>;
                                    },
                                    h2: ({ children }) => {
                                      return <h2 dir="auto">{children}</h2>;
                                    },
                                    h3: ({ children }) => {
                                      return <h3 dir="auto">{children}</h3>;
                                    },
                                    h4: ({ children }) => {
                                      return <h4 dir="auto">{children}</h4>;
                                    },
                                    h5: ({ children }) => {
                                      return <h5 dir="auto">{children}</h5>;
                                    },
                                    h6: ({ children }) => {
                                      return <h6 dir="auto">{children}</h6>;
                                    },
                                    li: ({ children }) => {
                                      return <li dir="auto">{children}</li>;
                                    },
                                    code: ({
                                      inline,
                                      children,
                                      className,
                                      ...props
                                    }) => {
                                      if (!children) return;
                                      const txt = children[0] || "";

                                      if (inline) {
                                        if (
                                          typeof txt === "string" &&
                                          /^\$\$(.*)\$\$/.test(txt)
                                        ) {
                                          const html = katex.renderToString(
                                            txt.replace(/^\$\$(.*)\$\$/, "$1"),
                                            {
                                              throwOnError: false,
                                            }
                                          );
                                          return (
                                            <code
                                              dangerouslySetInnerHTML={{
                                                __html: html,
                                              }}
                                            />
                                          );
                                        }
                                        return <code>{txt}</code>;
                                      }
                                      if (
                                        typeof txt === "string" &&
                                        typeof className === "string" &&
                                        /^language-katex/.test(
                                          className.toLocaleLowerCase()
                                        )
                                      ) {
                                        const html = katex.renderToString(txt, {
                                          throwOnError: false,
                                        });
                                        return (
                                          <code
                                            dangerouslySetInnerHTML={{
                                              __html: html,
                                            }}
                                          />
                                        );
                                      }
                                      // let tempText = "";
                                      // for (let child of children)
                                      //   tempText = tempText + child.props.children[0];
                                      return (
                                        <code className={String(className)}>
                                          {children}
                                        </code>
                                      );
                                    },
                                  },
                                }}
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
