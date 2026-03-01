import EventOptions from "@/Components/ElementOptions/EventOptions";
import { compactContent } from "@/Helpers/ClientHelpers";
import React from "react";
import { useTranslation } from "react-i18next";

export default function ScheduledEventCard({ job, refreshAfterDeletion }) {
  const { t } = useTranslation();
  const event = job.notePreview;
  const isRepost = event.kind == 1 ? false : JSON.parse(event.content);
  const isFlashNews = (isRepost ? isRepost : event).tags.find(
    (tag) => tag[0] === "l" && tag[1] === "FLASH NEWS",
  )
    ? true
    : false;

  return (
    <div
      className="fit-container fx-scattered sc-s-18 box-pad-h-m box-pad-v-m  pointer"
      style={{
        backgroundColor: "transparent",
        gap: "32px",
        overflow: "visible",
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="fx-centered fx-start-v">
        <div className="round-icon">
          <div className="note-24"></div>
        </div>
        <div className="fx-centered fx-col fx-start-h fx-start-v">
          <div className="fx-centered">
            <p className="gray-c p-medium">
              {t("Al2pbNK")}{" "}
              {new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }).format(event.created_at * 1000)}
            </p>
          </div>
          <p className="p-two-lines">
            {compactContent(
              (isRepost ? isRepost : event).content,
              (isRepost ? isRepost : event).pubkey,
            )}
          </p>
          <div className="fx-centered">
            {isFlashNews && (
              <div className="sticker sticker-normal sticker-gray-black">
                {t("AAg9D6c")}
              </div>
            )}
            {event.kind === 6 && (
              <div className="sticker sticker-normal sticker-gray-black fx-centered">
                {t("AqWa0gF")} <div className="switch-arrows"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="fx-centered" style={{ minWidth: "max-content" }}>
        <EventOptions
          event={event}
          component="dashboardSchedule"
          refreshAfterDeletion={refreshAfterDeletion}
          deleteTags={[["p", process.env.NEXT_PUBLIC_SCHEDULE_DVM_PUBKEY]]}
        />
      </div>
    </div>
  );
}
