import { getSubData } from "@/Helpers/Controlers";
import { getMasterKey } from "@/Helpers/EventSchedulerHelper";
import { nip44 } from "nostr-tools";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function useScheduledEvents() {
  const userKeys = useSelector((state) => state.userKeys);
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [isScheduledEventsLoading, setIsScheduledEventsLoading] =
    useState(true);
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsScheduledEventsLoading(true);
      let DVM_PUBKEY = process.env.NEXT_PUBLIC_SCHEDULE_DVM_PUBKEY;
      let keys = await getMasterKey();
      let globalIndexDTag = `pidgeon:v3:mb:${keys.mb}:index`;
      let globalIndexEvents = await getSubData(
        [{ kinds: [30078], authors: [DVM_PUBKEY], "#d": [globalIndexDTag] }],
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      );
      if (globalIndexEvents.data.length === 0) {
        setIsScheduledEventsLoading(false);
        return;
      }
      let globalIndex = globalIndexEvents.data[0];
      let metadata = nip44.v2.decrypt(globalIndex.content, keys.mbox);
      metadata = JSON.parse(metadata);

      let pendingDTags =
        metadata.pending_pages.length > 0
          ? metadata.pending_pages.map((_) => _.d)
          : [];
      if (pendingDTags.length === 0) {
        setIsScheduledEventsLoading(false);
        return;
      }
      let pendingEvents = await getSubData(
        [{ kinds: [30078], authors: [DVM_PUBKEY], "#d": pendingDTags }],
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      );
      if (pendingEvents.data.length === 0) {
        setIsScheduledEventsLoading(false);
        return;
      }
      let pending = pendingEvents.data;
      let pendingList = pending
        .map((_) => nip44.v2.decrypt(_.content, keys.mbox))
        .flat();
      pendingList = pendingList
        .map((_) => JSON.parse(_))
        .map((_) => _.pending)
        .flat();
      setScheduledEvents(
        pendingList
          .map((_) => {
            return {
              notePreview: {
                created_at: _.scheduledAt,
                kind: _.jobType === "note" ? 1 : 6,
                ..._.notePreview,
                pubkey: userKeys.pub,
                id: _.jobId,
                relays: _.relays,
              },
              noteId: _.noteId,
              jobId: _.jobId,
            };
          })
          .filter(
            (_, index, arr) =>
              arr.findIndex((e) => e.noteId === _.noteId) === index,
          ),
      );
      setIsScheduledEventsLoading(false);
    };
    if (userKeys) fetchData();
  }, [userKeys, refreshData]);

  return { isScheduledEventsLoading, scheduledEvents, setRefreshData };
}
