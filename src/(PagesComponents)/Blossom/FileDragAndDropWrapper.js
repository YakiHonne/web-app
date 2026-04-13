import Icon from "@/Components/Icon";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FileSelectorWrapper from "./FileSelectorWrapper";
import LoadingDots from "@/Components/LoadingDots";
let id = "file-selector-" + Math.random().toString(36).substring(2, 9);

export default function FileDragAndDropWrapper({
  onChange,
  title,
  description,
  isLoading,
  fileUrl,
  label,
  stretchPreview = false,
}) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;

      if (items) {
        for (const item of items) {
          if (
            item.type.startsWith("image/") ||
            item.type.startsWith("video/")
          ) {
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (e) => {
              onChange(file);
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  if (fileUrl)
    return (
      <div className=" sc-s-18 bg-sp fx-centered fx-start-h  fit-container pointer box-pad-h-m box-pad-v-m">
        <div
          style={{
            width: stretchPreview ? "100%" : "120px",
            height: stretchPreview ? "200px" : "120px",
            backgroundImage: `url(${fileUrl})`,
          }}
          className="sc-s-18 bg-sp bg-img bg-cover"
        ></div>
        <div className="fx-centered fx-col fx-start-h fx-start-v fx-gap-v-m">
          <p className="gray-c">{label || t("AsXohpb")}</p>
          <button className="btn btn-gray">
            {isLoading ? <LoadingDots /> : t("AkzjyNm")}
          </button>
        </div>
      </div>
    );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onChange(file);
      }}
      className="sc-s-d bg-sp fx-centered fx-col fit-container pointer"
      style={{
        backgroundColor: dragging ? "var(--c1-side)" : "",
        height: "300px",
        gap: "16px",
        position: "relative",
      }}
      htmlFor={id}
    >
      <input
        type="file"
        id={id}
        accept="image/*,video/*"
        multiple={false}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
        style={{
          opacity: 0,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
        }}
      />
      <Icon name={"media"} size={48} />
      <div className="fx-centered fx-col">
        <p className="p-centered">{title || t("A7Mh9O6")}</p>
        <p className="gray-c p-centered box-marg-s">
          {description || t("ARJICtS")}
        </p>
        <FileSelectorWrapper onChange={onChange}>
          <button className="btn btn-normal">
            {isLoading ? <LoadingDots /> : t("AiINSld")}
          </button>
        </FileSelectorWrapper>
      </div>
    </label>
  );
}
