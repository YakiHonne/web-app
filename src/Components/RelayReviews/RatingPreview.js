import React from "react";
import { RatingStar } from "./RatingStar";
import { useTranslation } from "react-i18next";

export default function RatingPreview({
  rating,
  count,
  onClick,
  enableHovering,
  small = false,
}) {
  const { t } = useTranslation();
  let roundedRating = Math.ceil(rating);
  return (
    <div className="fx-centered">
      <div>
        <p className={small ? "" : "p-big"}>{rating}</p>
      </div>
      {Array.from({ length: 5 }, (_, i) => {
        return (
          <RatingStar
            key={i}
            size={small ? 16 : 20}
            fill={i < roundedRating}
            onClick={() => onClick(i + 1)}
            enableHovering={enableHovering}
          />
        );
      })}
      {count !== undefined && (
        <p className="gray-c">{t("AMCLbYr", { count })}</p>
      )}
    </div>
  );
}
