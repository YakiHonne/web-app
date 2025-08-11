import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingDots from "@/Components/LoadingDots";
import relaysOnPlatform from "@/Content/Relays";
import axiosInstance from "@/Helpers/HTTP_Client";
import { nanoid } from "nanoid";
import TopicsTags from "@/Content/TopicsTags";
import UserSearchBar from "@/Components/UserSearchBar";
import NProfilePreviewer from "@/Components/NProfilePreviewer";
import { useDispatch } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { extractNip19, removeArticleDraft } from "@/Helpers/Helpers";
import UploadFile from "@/Components/UploadFile";
import { useTranslation } from "react-i18next";
import { InitEvent } from "@/Helpers/Controlers";

const getSuggestions = (custom) => {
  if (!custom) return [];
  let list = TopicsTags.map((item) => [item.main_tag, ...item.sub_tags]).flat();
  return list.filter((item) =>
    item.toLowerCase().includes(custom.toLowerCase())
  );
};

export default function ToPublish({
  postId = "",
  postKind,
  postContent = "",
  postTitle = "",
  postThumbnail,
  postDesc,
  postPublishedAt,
  tags,
  edit = false,
  exit,
  warning = false,
  userKeys,
}) {
  const dispatch = useDispatch();
  // const userKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();
  const navigateTo = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState(
    tags.length > 0
      ? tags
      : extractNip19(postContent)
          .tags.filter((_) => _[0] === "t" && _[1])
          .map((_) => _[1])
  );
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailPrev, setThumbnailPrev] = useState(postThumbnail || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(postThumbnail || "");
  const [desc, setDesc] = useState(postDesc || "");
  const [tempTag, setTempTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contentSensitive, setContentSensitive] = useState(false);
  const [zapSplit, setZapSplit] = useState([["zap", userKeys.pub, "", "100"]]);
  const [zapSplitEnabled, setZapSplitEnabled] = useState(false);
  const [relaysToPublish, setRelaysToPublish] = useState([...relaysOnPlatform]);
  const [deleteDraft, setDeleteDraft] = useState(
    postKind === 30024 ? true : false
  );
  const topicSuggestions = useMemo(() => {
    return getSuggestions(tempTag);
  }, [tempTag]);

  const initThumbnail = async () => {
    setThumbnail("");
    setThumbnailPrev("");
    setThumbnailUrl("");
  };

  const Submit = async (kind = 30023) => {
    try {
      setIsLoading(true);
      if (postThumbnail && thumbnail) deleteFromS3(postThumbnail);
      let created_at = Math.floor(Date.now() / 1000);
      let cover = thumbnailUrl;

      let tags = [
        [
          "client",
          "Yakihonne",
          "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
        ],
        [
          "published_at",
          edit
            ? `${postPublishedAt}` || `${Math.floor(Date.now() / 1000)}`
            : `${Math.floor(Date.now() / 1000)}`,
        ],
        ["d", edit || nanoid()],
        ["image", cover],
        ["title", postTitle],
        ["summary", desc],
      ];
      if (zapSplit) tags = [...tags, ...zapSplit];
      for (let cat of selectedCategories) {
        tags.push(["t", cat]);
      }
      if (contentSensitive) {
        tags.push(["L", "content-warning"]);
      }
      let processedContent = extractNip19(postContent);
      const imageRegex =
        /(?<!\!\[image\]\()https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp|bmp|svg)(?!\))/g;

      let tempEvent = {
        created_at,
        kind: kind,
        content: processedContent.content.replace(imageRegex, "!(image)[$&]"),
        tags: [...tags, ...processedContent.tags.filter((_) => _[0] !== "t")],
      };

      let eventInitEx = await InitEvent(
        tempEvent.kind,
        tempEvent.content,
        tempEvent.tags,
        tempEvent.created_at,
        userKeys
      );
      if (!eventInitEx) {
        setIsLoading(false);
        return;
      }
      dispatch(
        setToPublish({
          eventInitEx,
          allRelays: [],
        })
      );

      if (deleteDraft) {
        setTimeout(async () => {
          let tempEvent = {
            created_at,
            kind: 5,
            content: "A draft to delete",
            tags: [["e", postId]],
          };

          let eventInitEx = await InitEvent(
            tempEvent.kind,
            tempEvent.content,
            tempEvent.tags,
            tempEvent.created_at,
            userKeys
          );
          if (!eventInitEx) {
            navigateTo("/dashboard", {
              state: { tabNumber: 1, filter: "articles" },
            });
            exit();
            setIsLoading(false);
            return;
          }
          dispatch(
            setToPublish({
              eventInitEx,
              allRelays: [],
            })
          );
          setIsLoading(false);
          navigateTo("/dashboard", {
            state: { tabNumber: 1, filter: "articles" },
          });
          exit();
        }, 5000);
        return;
      }
      removeArticleDraft();
      navigateTo("/dashboard", { state: { tabNumber: 1, filter: "articles" } });
      exit();
      return;
    } catch (err) {
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        })
      );
      setIsLoading(false);
    }
  };
  const removeCategory = (cat) => {
    let index = selectedCategories.findIndex((item) => item === cat);
    let tempArray = Array.from(selectedCategories);
    tempArray.splice(index, 1);
    setSelectedCategories(tempArray);
  };

  const deleteFromS3 = async (img) => {
    if (img.includes("yakihonne.s3")) {
      let data = await axiosInstance.delete("/api/v1/file-upload", {
        params: { image_path: img },
      });
      return true;
    }
    return false;
  };

  const handleThumbnailValue = (data) => {
    setThumbnailUrl(data);
  };

  const handleAddZapSplit = (pubkey, action) => {
    if (action === "add") {
      let findPubkey = zapSplit.find((item) => item[1] === pubkey);
      if (!findPubkey)
        setZapSplit((prev) => [...prev, ["zap", pubkey, "", "1"]]);
    }
    if (action === "remove") {
      let findPubkeyIndex = zapSplit.findIndex((item) => item[1] === pubkey);
      if (findPubkeyIndex !== -1) {
        let tempZapSplit = Array.from(zapSplit);
        tempZapSplit.splice(findPubkeyIndex, 1);
        setZapSplit(tempZapSplit);
      }
    }
  };

  const handleZapAmount = (amount, pubkey) => {
    let tempAmount = amount ? Math.abs(amount) : 0;
    let findPubkeyIndex = zapSplit.findIndex((item) => item[1] === pubkey);
    if (findPubkeyIndex !== -1) {
      let tempZapSplit = Array.from(zapSplit);
      tempZapSplit[findPubkeyIndex][3] = `${amount}`;
      setZapSplit(tempZapSplit);
    }
  };
  const calculatePercentage = (amount) => {
    let allAmount =
      zapSplit.reduce((total, item) => (total += parseInt(item[3])), 0) || 1;
    return Math.floor((amount * 100) / allAmount);
  };
  return (
    <section className="fixed-container fx-centered box-pad-h">
      <div
        style={{
          width: "min(100%, 700px)",
          height: "100vh",
          overflow: "scroll",
          borderRadius: 0,
        }}
        className="sc-s-18 fx-col fx-centered fx-start-h fx-start-v bg-sp"
      >
        <div className="box-pad-h-m fit-container fx-centered fx-col">
          <div
            className="fit-container box-pad-v-m box-pad-h-m fx-centered fx-start-h pointer"
            style={{ borderBottom: "1px solid var(--very-dim-gray)" }}
            onClick={exit}
          >
            <div className="round-icon-small">
              <div
                className="arrow-12"
                style={{ transform: "rotate(90deg)" }}
              ></div>
            </div>
            <p className="gray-c">{t("ATB2h6T")}</p>
          </div>

          <div className="box-pad-v-m fx-centered fx-col fx-start-h fit-container">
            <h4 className="p-centered">{t("ATPUIv2")}</h4>
          </div>
          {warning && (
            <div className="sc-s-18 box-pad-v-s box-pad-h-s">
              <p className="orange-c p-medium p-centered">{t("APW25Bv")}</p>
              <p className="gray-c p-medium p-centered">{t("AsaVjqG")}</p>
            </div>
          )}

          <div className="fx-centered fx-col fit-container">
            <div
              className="fit-container fx-centered fx-col sc-s-18 box-pad-h bg-img cover-bg"
              style={{
                position: "relative",
                height: "200px",
                backgroundImage: `url(${thumbnailUrl})`,
                backgroundColor: "var(--dim-gray)",
              }}
            >
              {thumbnailUrl && (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    position: "absolute",
                    right: "16px",
                    top: "16px",
                    backgroundColor: "var(--dim-gray)",
                    borderRadius: "var(--border-r-50)",
                    zIndex: 10,
                  }}
                  className="fx-centered pointer"
                  onClick={initThumbnail}
                >
                  <div className="trash"></div>
                </div>
              )}

              {!thumbnailUrl && (
                <>
                  <p className="gray-c p-medium">({t("At5dj7a")})</p>
                </>
              )}
            </div>
            <div className="fit-container fx-centered">
              <input
                type="text"
                className="if ifs-full"
                placeholder={t("AA8XLSe")}
                value={thumbnailUrl}
                onChange={(e) => handleThumbnailValue(e.target.value)}
              />

              <UploadFile round={true} setImageURL={handleThumbnailValue} />
            </div>
            <textarea
              className="txt-area fit-container"
              placeholder={t("Ascc4eS")}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            ></textarea>

            <div style={{ position: "relative" }} className="fit-container">
              {topicSuggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    left: 0,
                    width: "100%",
                    maxHeight: "200px",
                    transform: "translateY(-100%)",
                    overflow: "scroll",
                  }}
                  className="sc-s-18 fx-centered fx-start-v fx-start-h fx-col box-pad-h-m box-pad-v-m"
                >
                  <h5>{t("A9r2PLE")}</h5>
                  {topicSuggestions.map((item, index) => {
                    return (
                      <button
                        key={`${item}-${index}`}
                        className={`btn-text-gray pointer fit-container`}
                        style={{
                          textAlign: "left",
                          width: "100%",
                          paddingLeft: 0,
                          fontSize: "1rem",
                          textDecoration: "none",
                          transition: ".4s ease-in-out",
                        }}
                        onClick={(e) => {
                          item.replace(/\s/g, "").length
                            ? setSelectedCategories([
                                ...selectedCategories,
                                item.trim(),
                              ])
                            : dispatch(
                                setToast({
                                  type: 3,
                                  desc: t("Axk4fkj"),
                                })
                              );

                          setTempTag("");
                          e.stopPropagation();
                        }}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              )}
              <form
                className="fit-container fx-scattered"
                onSubmit={(e) => {
                  e.preventDefault();
                  tempTag.replace(/\s/g, "").length
                    ? setSelectedCategories([
                        ...selectedCategories,
                        tempTag.trim(),
                      ])
                    : dispatch(
                        setToast({
                          type: 3,
                          desc: t("Axk4fkj"),
                        })
                      );
                  setTempTag("");
                }}
                style={{ position: "relative" }}
              >
                <input
                  type="text"
                  className="if ifs-full"
                  placeholder={t("AWdcSzG")}
                  value={tempTag}
                  onChange={(e) => setTempTag(e.target.value)}
                />
                {tempTag && (
                  <button
                    className="btn btn-normal"
                    style={{ minWidth: "max-content" }}
                  >
                    {t("A3yqwwq")}
                  </button>
                )}
              </form>
            </div>
            {selectedCategories.length > 0 && (
              <div className="fit-container box-pad-v-m fx-centered fx-col fx-start-h">
                <p className="p-medium gray-c fit-container p-left">
                  {t("ANyX947")}
                </p>
                <div className="fit-container  fx-scattered fx-wrap fx-start-h">
                  {selectedCategories.map((item, index) => {
                    return (
                      <div
                        key={`${item}-${index}`}
                        className="sticker sticker-gray-c1"
                        style={{ columnGap: "8px" }}
                      >
                        <span>{item}</span>
                        <p
                          className="p-medium pointer"
                          onClick={() => removeCategory(item)}
                        >
                          &#10005;
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <label
            className="fx-centered fx-start-h fit-container if"
            htmlFor={"content-sensitive-checkbox"}
          >
            <input
              type="checkbox"
              id={"content-sensitive-checkbox"}
              checked={contentSensitive}
              onChange={() => setContentSensitive(!contentSensitive)}
            />
            <p className={contentSensitive ? "" : "gray-c"}>{t("AtRAswG")}</p>
          </label>
          <label
            htmlFor="zap-split"
            className="if ifs-full fx-centered fx-start-h"
            style={{
              borderColor: zapSplitEnabled ? "var(--blue-main)" : "",
            }}
          >
            <input
              type="checkbox"
              id="zap-split"
              checked={zapSplitEnabled}
              onChange={() =>
                !isLoading && setZapSplitEnabled(!zapSplitEnabled)
              }
            />
            <p className={zapSplitEnabled ? "" : "gray-c"}>{t("A07MMRw")}</p>
          </label>

          {zapSplitEnabled && (
            <>
              <UserSearchBar
                onClick={(pubkey) => handleAddZapSplit(pubkey, "add")}
                full={true}
              />

              <div
                className="fit-container fx-wrap fx-centered"
                style={{ gap: "8px" }}
              >
                {zapSplit.map((item, index) => {
                  const percentage = calculatePercentage(item[3]) || 0;
                  return (
                    <div
                      className="fit-container fx-scattered fx-stretch"
                      key={item[1]}
                    >
                      <NProfilePreviewer
                        pubkey={item[1]}
                        margin={false}
                        close={true}
                        onClose={() =>
                          zapSplit.length > 1 &&
                          handleAddZapSplit(item[1], "remove")
                        }
                      />
                      <div
                        style={{ width: "35%" }}
                        className="sc-s-18 fx-centered fx-col fx-start-v"
                      >
                        <div
                          style={{
                            position: "relative",
                          }}
                        >
                          <input
                            type="number"
                            className="if ifs-full if-no-border"
                            placeholder={t("AnnuNdL")}
                            value={item[3]}
                            max={100}
                            style={{ height: "100%" }}
                            onChange={(e) =>
                              handleZapAmount(e.target.value, item[1])
                            }
                          />
                        </div>
                        <hr />
                        <p className="orange-c p-medium box-pad-h-m">
                          {percentage}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {postKind === 30024 && (
            <>
              <hr className="box-marg-s" />
              <label
                htmlFor="check-draft"
                className="if ifs-full fx-centered"
                style={{ borderColor: deleteDraft ? "var(--blue-main)" : "" }}
              >
                <input
                  type="checkbox"
                  id="check-draft"
                  checked={deleteDraft}
                  onChange={() => !isLoading && setDeleteDraft(!deleteDraft)}
                />
                <p className={deleteDraft ? "" : "gray-c"}>{t("AjJWULI")}</p>
              </label>
            </>
          )}
        </div>
        <div className="fit-container box-pad-v-m fx-scattered  pointer box-pad-h-m">
          {postKind !== 30024 && (
            <button
              className="btn btn-full  btn-gst-red"
              onClick={() => !isLoading && Submit(30024)}
            >
              {isLoading ? <LoadingDots /> : t("ABg9vzA")}
            </button>
          )}
          <button
            className="btn btn-full  btn-normal"
            onClick={() => !isLoading && Submit(30023)}
          >
            {isLoading ? <LoadingDots /> : t("As7IjvV")}
          </button>
        </div>
      </div>
    </section>
  );
}
