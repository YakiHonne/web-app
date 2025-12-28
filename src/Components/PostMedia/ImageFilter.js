import React from "react";
import { IMAGE_FILTERS, imageFiltersList } from "@/Content/ImageFilterConfig";
import { useTranslation } from "react-i18next";

export default function ImageFilter({
  img,
  selectedFilter,
  setSelectedFilter,
}) {
  const { t } = useTranslation();

  return (
    <div className="fit-container fx-centered fx-start-v fx-start-h fx-col">
      <p className="gray-c">{t("A7hzwqG")}</p>

      <div
        className="fit-container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "6px",
        }}
      >
        {imageFiltersList.map((item, index) => (
          <div
            key={index}
            className="pointer fx-col option sc-s-18 bg-sp"
            style={{
              borderRadius: "16px",
              border:
                selectedFilter === item.value
                  ? "1px solid var(--c1)"
                  : "1px solid var(--very-dim-gray)",
            }}
            onClick={() => setSelectedFilter(item.value)}
          >
            <div
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                aspectRatio: "1 / 1",
                filter: IMAGE_FILTERS[item.value],
              }}
            ></div>

            <div className="gray-c p-medium box-pad-v-s box-pad-h-s">
              {item.display_name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
