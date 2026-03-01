import React from "react";
import { timeAgo } from "@/Helpers/Encryptions";
import { getLinkFromAddr } from "@/Helpers/Helpers";
import useRepEventStats from "@/Hooks/useRepEventStats";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import EventOptions from "@/Components/ElementOptions/EventOptions";

export default function RepCard({ event, refreshAfterDeletion }) {
  const { t } = useTranslation();
  const { postActions } = useRepEventStats(event.aTag, event.pubkey);

  const eventKindsDisplayName = {
    1: t("Az5ftet"),
    11: t("Az5ftet"),
    7: t("Alz0E9Y"),
    6: t("Aai65RJ"),
    30023: t("AyYkCrS"),
    30024: t("AsQyoY0"),
    30004: t("Ac6UnVb"),
    30005: t("Ac6UnVb"),
    34235: t("AVdmifm"),
    22: t("AVdmifm"),
    21: t("AVdmifm"),
    20: t("Aa73Zgk"),
    34236: t("AVdmifm"),
    300331: t("AkvXmyz"),
    30033: t("AkvXmyz"),
  };

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
        customHistory(getLinkFromAddr(event.naddr || event.nEvent, event.kind));
      }}
    >
      <div className="fx-centered fx-start-v">
        {!event.image && event.kind !== 20 && (
          <div className="round-icon">
            {[30004, 30005].includes(event.kind) && (
              <div className="curation-24"></div>
            )}
            {[30023].includes(event.kind) && <div className="posts-24"></div>}
            {[34235, 21, 22].includes(event.kind) && (
              <div className="play-24"></div>
            )}
            {[30033].includes(event.kind) && (
              <div className="smart-widget-24"></div>
            )}
          </div>
        )}
        {event.image && event.kind !== 20 && (
          <div
            className="sc-s-18 bg-img cover-bg"
            style={{
              backgroundImage: `url(${event.image})`,
              minWidth: "48px",
              aspectRatio: "1/1",
            }}
          ></div>
        )}
        {event.kind === 20 && (
          <div
            className="sc-s-18 bg-img cover-bg"
            style={{
              backgroundImage: `url(${event.vUrl})`,
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
          <p className="p-two-lines">
            {event.title || (
              <span className="p-italic gray-c">{t("AaWkOl3")}</span>
            )}
          </p>
          <div className="fx-centered">
            <div className="fx-centered">
              <div className="heart"></div>
              <div className="gray-c">{postActions.likes.likes.length}</div>
            </div>
            <div className="fx-centered">
              <div className="comment-icon"></div>
              <p className="gray-c">{postActions.replies.replies.length}</p>
            </div>
            <div className="fx-centered">
              <div className="bolt"></div>
              <p className="gray-c">{postActions.zaps.total}</p>
            </div>
            <div className="box-pad-h-s">
              <div className="sticker sticker-normal sticker-gray-black">
                {eventKindsDisplayName[event.kind]}
              </div>
            </div>
          </div>
        </div>
      </div>
      {!event.local && (
        <div
          className="fx-centered"
          onClick={(e) => e.stopPropagation()}
          style={{ minWidth: "max-content" }}
        >
          {event.kind === 30033 && (
            <EventOptions
              event={event}
              component="dashboardSW"
              refreshAfterDeletion={refreshAfterDeletion}
            />
          )}
          {[30023, 30024].includes(event.kind) && (
            <EventOptions
              event={event}
              component="dashboardArticles"
              refreshAfterDeletion={refreshAfterDeletion}
            />
          )}
          {[34235, 34236, 21, 22].includes(event.kind) && (
            <EventOptions
              event={event}
              component="dashboardVideos"
              refreshAfterDeletion={refreshAfterDeletion}
            />
          )}
          {[20].includes(event.kind) && (
            <EventOptions
              event={event}
              component="dashboardPictures"
              refreshAfterDeletion={refreshAfterDeletion}
            />
          )}
          {[30004, 30005].includes(event.kind) && (
            <EventOptions
              event={event}
              component="dashboardCuration"
              refreshAfterDeletion={refreshAfterDeletion}
            />
          )}
        </div>
      )}
    </div>
  );
}
