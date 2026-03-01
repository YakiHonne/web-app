import React from "react";
import { timeAgo } from "@/Helpers/Encryptions";
import OptionsDropdown from "@/Components/OptionsDropdown";
import { useTranslation } from "react-i18next";

export default function BookmarkCard({
  event,
  showDetails,
  deleteEvent,
  editEvent,
}) {
  const { t } = useTranslation();
  return (
    <div
      className="fit-container fx-scattered sc-s-18 box-pad-h-m box-pad-v-m pointer"
      style={{
        backgroundColor: "transparent",
        gap: "32px",
        overflow: "visible",
      }}
      onClick={(e) => {
        e.stopPropagation();
        showDetails(event);
      }}
    >
      <div className="fx-centered fx-start-v">
        {!event.image && (
          <div className="round-icon">
            <div className="bookmark-24"></div>
          </div>
        )}
        {event.image && (
          <div
            className="sc-s-18 bg-img cover-bg"
            style={{
              backgroundImage: `url(${event.image})`,
              minWidth: "48px",
              aspectRatio: "1/1",
            }}
          ></div>
        )}

        <div className="fx-centered fx-col fx-start-h fx-start-v">
          <p className="gray-c p-medium">
            {t("AcKscQl", {
              date: timeAgo(new Date(event.created_at * 1000)),
            })}{" "}
          </p>
          <div className="fx-centered">
            <p className="p-two-lines">
              {event.title || (
                <span className="p-italic gray-c">{t("AaWkOl3")}</span>
              )}
            </p>
            <span className="sticker sticker-gray-black sticker-small">
              {t("A04okTg", { count: event.items.length })}
            </span>
          </div>
        </div>
      </div>

      <div className="fx-centered" style={{ minWidth: "max-content" }}>
        <OptionsDropdown
          options={[
            <div
              className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
              onClick={(e) => {
                e.stopPropagation();
                editEvent(event);
              }}
              style={{ width: "100px" }}
            >
              <p>{t("AsXohpb")}</p>
            </div>,
            <div
              className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
              onClick={(e) => {
                e.stopPropagation();
                deleteEvent(event);
              }}
              style={{ width: "100px" }}
            >
              <p className="red-c">{t("Almq94P")}</p>
            </div>,
          ]}
        />
      </div>
    </div>
  );
}
