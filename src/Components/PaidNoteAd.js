import React from "react";
import KindOne from "@/Components/KindOne";
import { getPaidNoteForIndex } from "@/Hooks/usePaidNotes";

export default function PaidNoteAd({ index, gap }) {
  if (index === 0 || index % gap !== 0) return null;

  const note = getPaidNoteForIndex(index);
  if (!note) return null;

  return (
    <div className="paid-note-ad-border">
      <div className="paid-note-ad-border-spinner" />
      <div className="paid-note-ad-border-content">
        <KindOne event={note} border={false} />
      </div>
    </div>
  );
}
