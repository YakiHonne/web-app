import React from "react";
import { timeAgo } from "@/Helpers/Encryptions";
import useNoteStats from "@/Hooks/useNoteStats";
import {
  compactContent,
  nEventEncode,
  getParsedNote,
} from "@/Helpers/ClientHelpers";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import EventOptions from "@/Components/ElementOptions/EventOptions";

export default function NoteCard({ event, refreshAfterDeletion }) {
  const { t } = useTranslation();
  const isRepost =
    event.kind === 6
      ? getParsedNote(JSON.parse(event.content))
      : getParsedNote(event);
  if (!isRepost) return null;
  const { postActions } = useNoteStats(isRepost.id, isRepost.pubkey);
  const isFlashNews = isRepost.tags.find(
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
        customHistory(`/note/${nEventEncode(isRepost.id)}`);
      }}
    >
      <div className="fx-centered fx-start-v">
        <div className="round-icon">
          <div className="note-24"></div>
        </div>
        <div className="fx-centered fx-col fx-start-h fx-start-v">
          <div className="fx-centered">
            <p className="gray-c p-medium">
              {t("A65LO6w", {
                date: timeAgo(new Date(isRepost.created_at * 1000)),
              })}{" "}
            </p>
          </div>
          <p className="p-two-lines">
            {compactContent(isRepost.content, isRepost.pubkey)}
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
          event={isRepost}
          component="dashboardNotes"
          refreshAfterDeletion={refreshAfterDeletion}
        />
      </div>
    </div>
  );
}
