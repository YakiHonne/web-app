import { useCallback, useState } from "react";
import { getSubData } from "@/Helpers/Controlers";
import { getParsedNote } from "@/Helpers/ClientHelpers";
import {
  getPaidNotesSeenCounts,
  incrementPaidNoteSeenCount,
  getPaidNotesLastFetchedAt,
  setPaidNotesLastFetchedAt,
} from "@/Helpers/DB";
import {
  getPaidNotesRotation,
  setPaidNotesPool,
  getAssignedPaidNote,
  assignNextPaidNote,
} from "@/Helpers/utils/paidNotesCache";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const queryPaidNotes = async ({ since } = {}) => {
  const { data } = await getSubData(
    [{ kinds: [1], "#l": ["FLASH NEWS"], limit: 20, since }],
    250,
  );
  return data.map((event) => getParsedNote(event, true)).filter(Boolean);
};

export default function usePaidNotes() {
  const [paidNotes, setPaidNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchIfStale = useCallback(async () => {
    const lastFetchedAt = await getPaidNotesLastFetchedAt();
    const rotation = getPaidNotesRotation();
    if (Date.now() - lastFetchedAt < ONE_DAY_MS && rotation.length > 0) {
      setPaidNotes(rotation);
      return;
    }
    setLoading(true);
    try {
      const seenCounts = await getPaidNotesSeenCounts();
      const sinceThreeDays = Math.floor((Date.now() - THREE_DAYS_MS) / 1000);
      let notes = await queryPaidNotes({ since: sinceThreeDays });
      if (notes.length < 10) {
        notes = await queryPaidNotes({});
      }
      await setPaidNotesLastFetchedAt(Date.now());
      const newRotation = setPaidNotesPool(notes, seenCounts);
      setPaidNotes(newRotation);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { paidNotes, loading, fetchIfStale };
}

export const getPaidNoteForIndex = (index) => {
  const assigned = getAssignedPaidNote(index);
  if (assigned !== undefined) return assigned;

  const note = assignNextPaidNote(index);
  if (note) incrementPaidNoteSeenCount(note.id);
  return note;
};
