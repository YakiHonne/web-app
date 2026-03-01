import React from "react";
import { timeAgo } from "@/Helpers/Encryptions";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import EventOptions from "@/Components/ElementOptions/EventOptions";

export default function DraftCard({ event, refreshAfterDeletion }) {
  const { t } = useTranslation();
  return (
    <div
      className="fit-container fx-scattered sc-s-18 box-pad-h-m box-pad-v-m pointer"
      style={{
        backgroundColor: "transparent",
        gap: "32px",
        overflow: "visible",
        borderColor: event.local ? "var(--c1)" : "",
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (event.local) {
          customHistory("/write-article");
        } else {
          localStorage.setItem(
            event.naddr,
            JSON.stringify({
              post_pubkey: event.pubkey,
              post_id: event.id,
              post_kind: event.kind,
              post_title: event.title,
              post_desc: event.description,
              post_thumbnail: event.image,
              post_tags: event.items,
              post_d: event.d,
              post_content: event.content,
              post_published_at: event.published_at,
            }),
          );
          customHistory("/write-article?edit=" + event.naddr);
        }
      }}
    >
      <div className="fx-centered fx-start-v">
        <div className="round-icon">
          <div className="posts-24"></div>
        </div>

        <div className="fx-centered fx-col fx-start-h fx-start-v">
          <div className="fx-centered">
            <p className="gray-c p-medium">
              {t("AcKscQl", {
                date: timeAgo(new Date(event.created_at * 1000)),
              })}
            </p>
            {event.local && (
              <div className="sticker sticker-normal sticker-gray-black">
                {t("AyYkCrS")}
              </div>
            )}
          </div>
          <p className="p-two-lines">
            {event.title || (
              <span className="p-italic gray-c">{t("AaWkOl3")}</span>
            )}
          </p>
        </div>
      </div>
      {!event.local && (
        <EventOptions
          event={event}
          component="dashboardArticlesDraft"
          refreshAfterDeletion={refreshAfterDeletion}
        />
      )}
    </div>
  );
}
