import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPublishedEvent } from "@/Store/Slides/Publishers";
import PublishResultOverlay from "@/Components/PublishResultOverlay";

export default function PublishResultHost() {
  const dispatch = useDispatch();
  const publishedEvent = useSelector((state) => state.publishedEvent);

  if (!publishedEvent) return null;

  return (
    <PublishResultOverlay
      event={publishedEvent.event}
      kind={publishedEvent.kind}
      article={publishedEvent.article}
      isPaid={publishedEvent.isPaid}
      exit={() => dispatch(setPublishedEvent(null))}
    />
  );
}
