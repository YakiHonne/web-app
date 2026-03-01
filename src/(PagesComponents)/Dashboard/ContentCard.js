import React from "react";
import DraftCard from "./DraftCard";
import DraftCardOthers from "./DraftCardOthers";
import RepCard from "./RepCard";
import NoteCard from "./NoteCard";
import BookmarkCard from "./BookmarkCard";

export default function ContentCard({
  event,
  refreshAfterDeletion,
  setPostToNote,
  handleDelete,
}) {
  return (
    <>
      {[1, 6].includes(event.kind) && (
        <NoteCard event={event} refreshAfterDeletion={refreshAfterDeletion} />
      )}
      {[11, 300331].includes(event.kind) && (
        <DraftCardOthers
          event={event}
          setPostToNote={setPostToNote}
          handleDelete={handleDelete}
        />
      )}
      {event.kind === 30024 && (
        <DraftCard event={event} refreshAfterDeletion={refreshAfterDeletion} />
      )}
      {[30004, 30005, 30023, 34235, 30033, 21, 22, 20].includes(event.kind) && (
        <RepCard event={event} refreshAfterDeletion={refreshAfterDeletion} />
      )}
      {event.kind === 30003 && <BookmarkCard event={event} />}
    </>
  );
}
