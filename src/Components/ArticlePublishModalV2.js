import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { nanoid } from "nanoid";
import { extractNip19, filterImetas } from "@/Helpers/Helpers";
import { FileUpload } from "@/Helpers/Helpers";
import Overlay from "@/Components/Overlay";
import Spinner from "@/Components/Spinner";
import Icon from "@/Components/Icon";
import Toggle from "@/Components/Toggle";
import Button from "@/Components/UI/Button";
import { InitEvent, publishEvent } from "@/Helpers/Controlers";
import { getRelayMetadata } from "@/Helpers/utils/relayMetadataCache";
import { useTranslation } from "react-i18next";

const CLIENT_TAG = [
  "client",
  "Yakihonne",
  "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
];

function wordCount(str) {
  if (!str) return 0;
  return str.trim() ? str.trim().split(/\s+/).length : 0;
}
function readTime(str) {
  return Math.max(1, Math.round(wordCount(str) / 200));
}

const ImgIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: "var(--dim-color)" }}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default function ArticlePublishModalV2({
  exit,
  initialTitle = "",
  initialSummary = "",
  initialCoverUrl = "",
  initialTags = [],
  postContent,
  imetas = [],
  editId = "",
  editEventId = "",
  editPublishedAt,
  editKind,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userRelays = useSelector((state) => state.userRelays);

  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [tagsInput, setTagsInput] = useState(initialTags.join(", "));
  const [isLoading, setIsLoading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const coverInputRef = useRef(null);

  const words = wordCount(postContent);
  const mins = readTime(postContent);

  const uploadCover = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    setIsCoverUploading(true);
    const result = await FileUpload({ file, userKeys, includeImeta: false });
    setIsCoverUploading(false);
    const url = typeof result === "string" ? result : result?.url;
    if (url) setCoverUrl(url);
    else dispatch(setToast({ type: 2, desc: t("AI5bZvP") }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadCover(file);
  };

  const publish = async (kind = 30023) => {
    if (!title?.trim()) {
      dispatch(setToast({ type: 2, desc: t("A2gbikk") }));
      return;
    }
    if (!postContent?.trim()) {
      dispatch(setToast({ type: 2, desc: t("AObcHKL") }));
      return;
    }
    setIsLoading(true);

    const created_at = Math.floor(Date.now() / 1000);
    const dTag = editId || nanoid();

    const userTags = tagsInput
      .split(",")
      .map((t_) => t_.trim().toLowerCase())
      .filter(Boolean)
      .map((t_) => ["t", t_]);

    const processedContent = extractNip19(postContent);
    const imageRegex =
      /(?<!\!\[image\]\()https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp|bmp|svg)(?!\))/g;
    const eventContent = processedContent.content.replace(
      imageRegex,
      "![image]($&)",
    );

    const cloneTag = (t_) => (Array.isArray(t_) ? t_.map(String) : t_);

    const tags = [
      CLIENT_TAG.slice(),
      [
        "published_at",
        editPublishedAt ? String(editPublishedAt) : String(created_at),
      ],
      ["d", dTag],
      ["image", coverUrl],
      ["title", title],
      ["summary", summary],
      ...(isPremium ? [["-"], ["nip63"]] : []),
      ...userTags,
      ...processedContent.tags.filter((t_) => t_[0] !== "t").map(cloneTag),
      ...imetas.map(cloneTag),
    ];

    const eventInitEx = await InitEvent(
      kind,
      eventContent,
      tags,
      created_at,
      userKeys,
    );
    if (!eventInitEx) {
      setIsLoading(false);
      return;
    }

    const premiumRelays = userRelays
      .filter((r) => {
        const metadata = getRelayMetadata(r.url);
        return metadata?.supported_nips?.includes(63) && (r.read || r.write);
      })
      .map((r) => r.url);

    const relaysToPublish = isPremium ? premiumRelays : [];
    await publishEvent(eventInitEx, relaysToPublish);

    if (kind === 30023 && editKind === 30024 && editEventId) {
      const deletionEvent = await InitEvent(
        5,
        "A draft to delete",
        [["e", editEventId]],
        created_at,
        userKeys,
      );
      if (deletionEvent) await publishEvent(deletionEvent, []);
    }

    setIsLoading(false);
    dispatch(
      setToast({
        type: 1,
        desc: kind === 30024 ? t("ARWJbjS") : t("Aem28Ji"),
      }),
    );
    exit();
  };

  const parsedTags = tagsInput
    .split(",")
    .map((t_) => t_.trim().toLowerCase())
    .filter(Boolean);

  return (
    <Overlay exit={exit} width={600}>
      <div className="fx-centered fx-col fit-container fx-gap-v-l">
        <div className="fit-container box-pad-h-m box-pad-v-m">
          <h3 style={{ margin: 0 }}>{t("Ag2ZgtO")}</h3>
          <p>
            <span className="c1-c">{words.toLocaleString()}</span>{" "}
            <span className="gray-c">{t("AFFkPRx")}</span>
            {" ~ "}
            <span className="c1-c">{mins}</span>{" "}
            <span className="gray-c">{t("AN07gUM")}</span>
          </p>
        </div>

        <div className="fit-container fx-col box-pad-h-m">
          <input
            type="text"
            className="if ifs-full"
            placeholder={t("AOGCchM")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              border: "none",
              fontSize: "2rem",
              fontWeight: 600,
              borderRadius: 0,
              paddingLeft: 0,
            }}
            autoFocus
          />
        </div>

        <div className="fit-container fx-col box-pad-h-m" style={{ gap: "8px" }}>
          <p className="gray-c">{t("AkUqJiz")}</p>

          {coverUrl ? (
            <div style={{ position: "relative" }}>
              <div
                style={{
                  height: "180px",
                  backgroundImage: `url(${coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "10px",
                  border: "1px solid var(--dim-border)",
                }}
              />
              <button
                onClick={() => setCoverUrl("")}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => coverInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? "var(--c1)" : "var(--very-dim-gray)"}`,
                borderRadius: "10px",
                padding: "2.5rem 1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                transition: "border-color 0.15s",
                backgroundColor: isDragging ? "rgba(247,88,22,0.05)" : "transparent",
              }}
            >
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadCover(f);
                }}
              />
              {isCoverUploading ? (
                <Spinner size={32} />
              ) : (
                <>
                  <ImgIcon />
                  <p style={{ margin: 0 }}>{t("AkYfILd")}</p>
                  <p className="gray-c" style={{ margin: 0 }}>{t("Am1WtFq")}</p>
                  <Button
                    label={t("ARLPyKf")}
                    size="s"
                    style={{ marginTop: "4px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      coverInputRef.current?.click();
                    }}
                  />
                </>
              )}
            </div>
          )}
        </div>

        <div className="fit-container fx-col box-pad-h-m" style={{ gap: "6px" }}>
          <p className="gray-c">{t("ApFiOFA")}</p>
          <textarea
            placeholder={t("AK1Oxyn")}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            style={{
              width: "100%",
              resize: "vertical",
              border: "none",
              borderLeft: "3px solid var(--c1)",
              borderRadius: 0,
              background: "transparent",
              paddingLeft: "12px",
              paddingTop: "4px",
              paddingBottom: "4px",
              outline: "none",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              fontFamily: "inherit",
            }}
          />
        </div>

        <div className="fit-container fx-col box-pad-h-m" style={{ gap: "8px" }}>
          <p className="gray-c">{t("AFK78FS")}</p>
          <input
            type="text"
            className="if ifs-full"
            placeholder={t("AJRQOle")}
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
          {parsedTags.length > 0 && (
            <div className="fx-centered fx-start-h fx-wrap" style={{ gap: "6px" }}>
              {parsedTags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    backgroundColor: "rgba(247,88,22,0.1)",
                    color: "var(--c1)",
                    border: "1px solid var(--c1)",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className="fit-container fx-scattered box-pad-h-m box-pad-v-m"
          style={{
            borderTop: "1px solid var(--dim-border)",
            paddingTop: "12px",
          }}
        >
          <div className="fx-centered fx-gap-h">
            {editKind !== 30023 && (
              <Button
                label={t("AjbW7pt")}
                type="gst"
                onClick={() => publish(30024)}
                disabled={isLoading}
              />
            )}
            <Button
              label={isLoading ? t("AOTJ9PF") : t("As7IjvV")}
              onClick={() => publish(30023)}
              disabled={isLoading}
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </Overlay>
  );
}
