import React, { useEffect, useState } from "react";
import NotesComment from "@/Components/NotesComment";
import { getSubData } from "@/Helpers/Controlers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { saveUsers } from "@/Helpers/DB";
import LoadingDots from "@/Components/LoadingDots";
import LinkRepEventPreview from "@/Components/LinkRepEventPreview";
import { useTranslation } from "react-i18next";
import { getParsedNote } from "@/Helpers/ClientHelpers";
import { getParsedRepEvent } from "@/Helpers/Encryptions";

const traceEventPath = (id, all, mainEventID, tagKind) => {
  const path = [];
  let currentId = id;
  while (currentId) {
    const event = all.find((comment) => comment.id === currentId);
    if (!event) break;

    let parsedEvent = getParsedNote(event, true);

    path.unshift(parsedEvent);
    const parentRoot = event.tags.find(
      (tag) => tag.length > 3 && tag[3] === "root"
    );
    const parentReply = event.tags.find(
      (tag) => tag.length > 3 && tag[3] === "reply"
    );

    if (!(parentRoot && parentReply)) break;
    currentId =
      (parentReply && parentReply[1]) || (parentRoot && parentRoot[1]);
  }
  if (tagKind === "e") {
    let mainEvent = all.find((comment) => comment.id === mainEventID);
    if (mainEvent) {
      let parsedEvent = getParsedNote(mainEvent, true);
      path.unshift(parsedEvent);
    }
  }
  if (tagKind !== "e") {
    let mainEvent = all.find((comment) => comment.kind !== 1);
    if (mainEvent) {
      let parsedEvent = getParsedRepEvent(mainEvent);
      path.unshift(parsedEvent);
    }
  }
  if (path.length > 0 && path[path.length - 1].id === id) path.pop();

  return path;
};

export default function HistorySection({
  id,
  targetedEventID,
  isRoot,
  tagKind = "e",
  showHistory = false,
}) {
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [netComments, setNetComments] = useState([]);

  useEffect(() => {
    let parsedCom = () => {
      let res = traceEventPath(targetedEventID, comments, id, tagKind);
      setNetComments(res);
      if (res.length !== 0) setIsLoading(false);
    };
    parsedCom();
  }, [comments]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let filter = isRoot
        ? []
        : [
            {
              kinds: [1],
              [`#${tagKind}`]: [id],
            },
          ];
      let checkEventKind = id.split(":");
      if (checkEventKind.length > 2) {
        filter.push({
          kinds: [parseInt(checkEventKind[0])],
          authors: [checkEventKind[1]],
          "#d": [checkEventKind[2]],
        });
      } else {
        filter.push({
          // kinds: [1],
          ids: [id],
        });
      }
      const events = await getSubData(filter, 500);
      let tempEvents = events.data;

      if (tempEvents.length === 0) setIsLoading(false);
      setComments(tempEvents);
      saveUsers(events.pubkeys);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (isLoading) return;
    const sub = ndkInstance.subscribe(
      [
        {
          kinds: [1],
          [`#${tagKind}`]: [id],
          since: Math.floor(Date.now() / 1000),
        },
      ],
      { cacheUsage: "CACHE_FIRST", groupable: false }
    );

    sub.on("event", (event) => {
      let is_un = event.tags.find((tag) => tag[0] === "l");
      let is_quote = event.tags.find((tag) => tag[0] === "q");
      if (!((is_un && is_un[1] === "UNCENSORED NOTE") || is_quote)) {
        setComments((prev) => {
          let newCom = [...prev, event.rawEvent()];
          return newCom.sort(
            (item_1, item_2) => item_2.created_at - item_1.created_at
          );
        });
        saveUsers([event.pubkey]);
      }
    });

    return () => {
      if (sub) sub.stop();
    };
  }, [isLoading]);

  if (!showHistory) return null;
  if (isLoading)
    return (
      <div
        style={{ height: "5vh" }}
        className="fit-container box-pad-h-m fx-centered"
      >
        <LoadingDots />
      </div>
    );
  if (netComments.length === 0)
    return (
      <div className="fit-container box-pad-h-m box-pad-v fx-centered sc-s-18 box-marg-s">
        <p className="orange-c">{t("AyGWRcA")}</p>
      </div>
    );
  return (
    <div
      className="fit-container fx-centered fx-col box-marg-s"
      style={{ gap: 0 }}
    >
      {netComments.length > 0 && netComments[0].kind !== 1 && (
        <div className="box-pad-h fit-container box-marg-s">
          <LinkRepEventPreview event={netComments[0]} />
        </div>
      )}
      {netComments.map((comment, index) => {
        if (comment.kind === 1)
          return (
            <NotesComment
              event={comment}
              key={comment.id}
              hasReplies={true}
              isHistory={true}
            />
          );
      })}
    </div>
  );
}
