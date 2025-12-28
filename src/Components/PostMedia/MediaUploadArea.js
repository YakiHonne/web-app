import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function MediaUploadArea({ setFile }) {
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
              setFile(file);
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
        if (file) setFile(file);
      }}
      className="sc-s-d fx-centered fx-col fit-container pointer"
      style={{
        backgroundColor: dragging ? "var(--c1-side)" : "",
        height: "300px",
        gap: "16px",
        position: "relative",
      }}
      htmlFor="media-input"
    >
      <input
        type="file"
        id="media-input"
        accept="image/*,video/*"
        multiple={false}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setFile(file);
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
      <div
        className="media-24"
        style={{ minHeight: "48px", minWidth: "48px" }}
      ></div>
      <p className="gray-c p-centered">{t("Au51R0k")}</p>
      <button className="btn btn-normal btn-small">{t("AgG9rzS")}</button>
    </label>
  );
}
