import MediaOverlay from "@/Components/MediaOverlay";
import useNoteStats from "@/Hooks/useNoteStats";
import React from "react";

export default function Image({ event }) {
  const { postActions } = useNoteStats(event.id, event.pubkey);
  return (
    <div>
      <MediaOverlay item={event} postActions={postActions} full={true} />
    </div>
  );
}
