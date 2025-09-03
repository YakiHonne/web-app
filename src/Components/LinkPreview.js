import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getLinkPreview } from "@/Helpers/Helpers";

export default function LinkPreview({ url, minimal }) {
  const { t } = useTranslation();
  const [metadata, setMetadata] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getMetadata = async () => {
      let data = await getLinkPreview(url);
      if (data) {
        setMetadata(data);
      }
      setIsLoading(false);
    };
    if (!minimal) getMetadata();
    if (minimal) setIsLoading();
  }, []);

  if (isLoading)
    return (
      <div
        className={`fit-container sc-s-18 bg-sp fx-centered fx-start-h fx-stretch skeleton-container`}
        style={{ height: "120px", margin: ".5rem 0" }}
        onClick={(e) => e.stopPropagation()}
      ></div>
    );

  if (!isLoading && !metadata)
    return (
      <a
        style={{
          wordBreak: "break-word",
          color: "var(--orange-main)",
        }}
        href={url}
        target="_blank"
        className="btn-text-gray"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );

  return (
    <a
      className={`fit-container sc-s-18 bg-sp fx-centered fx-start-h fx-stretch pointer`}
      href={url}
      target="_blank"
      style={{ margin: ".5rem 0" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-img cover-bg "
        style={{
          backgroundImage: `url(${metadata.image || metadata.imagePP})`,
          minWidth: "180px",
          minHeight: "120px",
          backgroundColor: "var(--very-dim-gray)",
          // minHeight: "100%",
        }}
      ></div>
      <div
        className="fx-centered fx-col fx-start-v box-pad-h-m box-pad-v-m"
        style={{ gap: "4px" }}
      >
        <div className="fx-centered" style={{ gap: "6px" }}>
          {metadata.favicon && <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "4px",
              backgroundImage: `url(${metadata.favicon})`,
            
            }}
            className="cover-bg bg-img"
          ></div>}
          <p className="gray-c">{metadata.domain}</p>
        </div>
        <p className="p-two-lines">{metadata.title || "Untitled"}</p>
        {/* <p className="gray-c p-one-line">
          {metadata.description || (
            <span className="p-italic">{t("AtZrjns")}</span>
          )}
        </p> */}
      </div>
    </a>
  );
}
