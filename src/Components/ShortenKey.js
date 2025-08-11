import React from "react";
import { useDispatch } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";

export default function ShortenID({ id }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  if (!id) return;
  let firstHalf = id.substring(0, 10);
  const copyID = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    dispatch(
      setToast({
        type: 1,
        desc: `${t("AzSXXQm")} 👏`,
      })
    );
  };
  return (
    <span
      className="to-copy pointer sticker sticker-small sticker-c1"
      style={{ position: "relative", overflow: "hidden" }}
      onClick={copyID}
    >
      {firstHalf}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: "100%",
          width: "32px",
          backgroundColor: "var(--c1)",
        }}
        className="copy-icon fx-centered"
      >
        <div
          className="copy-24"
          style={{ filter: "invert()", minWidth: "18px", minHeight: "18px" }}
        ></div>
      </div>
    </span>
  );
}
