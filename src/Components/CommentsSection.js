import React, { useEffect, useMemo, useState } from "react";
import NotesComment from "@/Components/NotesComment";
import { getWOTScoreForPubkeyLegacy } from "@/Helpers/Encryptions";
import { useSelector } from "react-redux";
import { getSubData } from "@/Helpers/Controlers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { getEventStats, saveEventStats, saveUsers } from "@/Helpers/DB";
import UserProfilePic from "@/Components/UserProfilePic";
import Comments from "@/Components/Reactions/Comments";
import Spinner from "@/Components/Spinner";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import LoginSignup from "@/Components/LoginSignup";
import { getParsedNote, getWotConfig } from "@/Helpers/ClientHelpers";
import {
  buildCommentsTree,
  flattenCommentsTree,
  getMissingParents,
  getRefType,
  getThreadRefs,
} from "@/Helpers/Threads";
import { relaysOnPlatform, SSGRelays } from "@/Content/Relays";
import Icon from "@/Components/Icon";

const COMMENT_KINDS = [1, 1111];
const MAX_ROUNDS = 4;
const MAX_IDS_PER_QUERY = 100;
const FETCH_TIMEOUT = 1000;
const THREAD_RELAYS = [...new Set([...relaysOnPlatform, ...SSGRelays])];

const getUserReadRelays = (userAllRelays) => {
  if (!Array.isArray(userAllRelays)) return [];
  return userAllRelays
    .filter((relay) => relay?.url && relay.read !== false)
    .map((relay) => relay.url);
};

const buildThreadFilters = (refs, since) => {
  const grouped = {};
  for (const ref of refs) {
    if (!ref?.value) continue;
    if (!grouped[ref.type]) grouped[ref.type] = new Set();
    grouped[ref.type].add(ref.value);
  }
  const filters = [];
  for (const [type, values] of Object.entries(grouped)) {
    const list = [...values];
    const extra = since ? { since } : {};
    filters.push({ kinds: COMMENT_KINDS, [`#${type}`]: list, ...extra });
    filters.push({ kinds: [1111], [`#${type.toUpperCase()}`]: list, ...extra });
  }
  return filters;
};

const isAcceptedComment = (event, wot) => {
  if (!event?.id || !Array.isArray(event.tags)) return false;
  const label = event.tags.find((tag) => tag[0] === "l");
  if (label && label[1] === "UNCENSORED NOTE") return false;
  const refs = getThreadRefs(event);
  if (!refs) return false;
  const isQuote = event.tags.some((tag) => tag[0] === "q");
  if (isQuote && !refs.marked) return false;
  return getWOTScoreForPubkeyLegacy(event.pubkey, wot.reactions, wot.score)
    .status;
};

const toNode = (node) => {
  const parsed = getParsedNote(node.event, true);
  if (!parsed) return null;
  return {
    ...parsed,
    replies: node.replies.map(toNode).filter(Boolean),
  };
};

const flattenNodes = (nodes, out = []) => {
  for (const node of nodes) {
    out.push(node);
    flattenNodes(node.replies, out);
  }
  return out;
};

const repliesCount = (comment) => {
  let count = 0;
  if (comment.replies.length === 0) return 0;
  count += comment.replies.length;
  for (let reply of comment.replies) count += repliesCount(reply);
  return count;
};

export default function CommentsSection({
  id,
  noteTags = false,
  eventPubkey,
  postActions,
  author,
  tagKind = "e",
  leaveComment = false,
  rootData,
  rootKind = null,
  parentKind = null,
  relays = [],
}) {
  const userKeys = useSelector((state) => state.userKeys);
  const userAllRelays = useSelector((state) => state.userAllRelays);
  const { userMutedList } = useSelector((state) => state.userMutedList);
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWriteNote, setShowWriteNote] = useState(leaveComment);
  const [netComments, setNetComments] = useState([]);
  const [isLogin, setIsLogin] = useState(false);
  const isCommentsMuted = useMemo(() => {
    return !netComments.find((_) => !userMutedList?.includes(_.pubkey));
  }, [netComments, userMutedList]);

  const threadRoot = useMemo(() => {
    if (rootData && rootData[1] && rootData[1] !== id)
      return { type: getRefType(rootData[1], rootData[0]), value: rootData[1] };
    if (Array.isArray(noteTags)) {
      const refs = getThreadRefs({
        kind: Number(parentKind) || 1,
        tags: noteTags,
      });
      if (refs?.root?.value && refs.root.value !== id) return refs.root;
    }
    return null;
  }, [id, rootData, noteTags, parentKind]);

  const targetRefs = useMemo(() => {
    const refs = [{ type: getRefType(id, tagKind), value: id }];
    if (threadRoot) refs.push(threadRoot);
    return refs;
  }, [id, tagKind, threadRoot]);

  const relayUrls = useMemo(
    () => [
      ...new Set([
        ...THREAD_RELAYS,
        ...getUserReadRelays(userAllRelays),
        ...(relays || []),
      ]),
    ],
    [userAllRelays, JSON.stringify(relays || [])],
  );

  useEffect(() => {
    const tree = buildCommentsTree(comments, id);
    setNetComments(tree.map(toNode).filter(Boolean));
  }, [comments, id]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      const wot = getWotConfig();
      const accepted = new Map();
      const pubkeys = new Set();
      const ingest = (list) => {
        let added = 0;
        for (const event of list || []) {
          if (!event?.id || accepted.has(event.id)) continue;
          if (!isAcceptedComment(event, wot)) continue;
          accepted.set(event.id, event);
          pubkeys.add(event.pubkey);
          added++;
        }
        return added;
      };

      const publish = () => {
        if (cancelled) return;
        setComments([...accepted.values()]);
        setIsLoading(false);
        saveUsers([...pubkeys]);
      };

      const initial = await getSubData(
        buildThreadFilters(targetRefs),
        FETCH_TIMEOUT,
        relayUrls,
      );
      ingest(initial.data);
      publish();

      const requested = new Set();
      const expanded = new Set(targetRefs.map((ref) => ref.value));
      for (let round = 0; round < MAX_ROUNDS; round++) {
        if (cancelled) return;
        let added = 0;

        const missing = getMissingParents([...accepted.values()], id)
          .filter((parent) => !requested.has(parent.id))
          .slice(0, MAX_IDS_PER_QUERY);
        if (missing.length > 0) {
          const hints = new Set(relayUrls);
          for (const parent of missing) {
            requested.add(parent.id);
            parent.relays.forEach((url) => hints.add(url));
          }
          const parents = await getSubData(
            [{ ids: missing.map((parent) => parent.id) }],
            FETCH_TIMEOUT,
            [...hints],
          );
          added += ingest(parents.data);
        }

        const branchIds = flattenCommentsTree(
          buildCommentsTree([...accepted.values()], id),
        )
          .map((event) => event.id)
          .filter((eventId) => !expanded.has(eventId))
          .slice(0, MAX_IDS_PER_QUERY);
        if (branchIds.length > 0) {
          branchIds.forEach((eventId) => expanded.add(eventId));
          const branches = await getSubData(
            buildThreadFilters(
              branchIds.map((value) => ({ type: "e", value })),
            ),
            FETCH_TIMEOUT,
            relayUrls,
          );
          added += ingest(branches.data);
        }

        if (added > 0) publish();
        if (added === 0 || (missing.length === 0 && branchIds.length === 0))
          break;
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (isLoading || netComments.length === 0) return;
    let cancelled = false;
    const syncStats = async () => {
      const stats = await getEventStats(id);
      if (cancelled || !stats?.replies?.replies) return;
      const known = new Set(stats.replies.replies.map((reply) => reply.id));
      const additions = flattenNodes(netComments)
        .filter((node) => !known.has(node.id))
        .map((node) => ({
          id: node.id,
          pubkey: node.pubkey,
          created_at: node.created_at,
        }));
      if (additions.length === 0) return;
      saveEventStats(id, {
        ...stats,
        replies: {
          ...stats.replies,
          replies: [...stats.replies.replies, ...additions],
        },
      });
    };
    syncStats();
    return () => {
      cancelled = true;
    };
  }, [netComments, isLoading, postActions]);

  useEffect(() => {
    if (isLoading) return;
    const wot = getWotConfig();
    const sub = ndkInstance.subscribe(
      buildThreadFilters(targetRefs, Math.floor(Date.now() / 1000)),
      { cacheUsage: "ONLY_RELAY", groupable: false },
    );

    sub.on("event", (event) => {
      if (!isAcceptedComment(event, wot)) return;
      setComments((prev) => {
        if (prev.some((item) => item.id === event.id)) return prev;
        return [...prev, event];
      });
      saveUsers([event.pubkey]);
    });
    return () => {
      if (sub) sub.stop();
    };
  }, [isLoading, id]);

  useEffect(() => {
    setShowWriteNote(leaveComment);
  }, [leaveComment]);

  return (
    <>
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
      <div className="fit-container fx-centered fx-col box-marg-s">
        {userKeys && (
          <>
            {!showWriteNote && (
              <div
                className="fit-container fx-centered fx-start-h  box-pad-h-m box-pad-v-m pointer"
                style={{
                  overflow: "visible",
                }}
                onClick={() => setShowWriteNote(true)}
              >
                <UserProfilePic size={40} mainAccountUser={true} />
                <div className="sc-s-18 box-pad-h-m box-pad-v-s fit-container">
                  <p className="gray-c">
                    {t("AABwCJX")}
                  </p>
                </div>
              </div>
            )}
            {showWriteNote && (
              <div className="box-pad-v-m box-pad-h-m fit-container">
                <Comments
                  exit={() => setShowWriteNote(false)}
                  noteTags={noteTags}
                  replyId={id}
                  replyPubkey={eventPubkey}
                  actions={postActions}
                  tagKind={tagKind}
                  rootKind={rootKind}
                  parentKind={parentKind}
                  label={t("AABwCJX")}
                />
              </div>
            )}
          </>
        )}
        {!userKeys && (
          <>
            <div className="fit-container fx-centered box-pad-v fx-col slide-up">
              <h4>{t("ASt0wnG")}</h4>
              <p className="gray-c">{t("AAWFsjt")}</p>

              <button
                className="btn btn-normal btn-small"
                onClick={() => setIsLogin(true)}
              >
                {t("AmOtzoL")}
              </button>
            </div>
          </>
        )}

        <div
          className="fit-container fx-centered fx-col fx-start-h fx-start-v"
          style={{ gap: 0 }}
        >
          {isLoading && (
            <div
              style={{ height: "40vh" }}
              className="fit-container box-pad-h-m fit-height fx-centered"
            >
              <Spinner size={32} />
            </div>
          )}
          {netComments.length > 0 && !isCommentsMuted && (
            <div
              className="fit-container fx-centered fx-start-h box-pad-h-m"
              style={{ paddingTop: "1rem" }}
            >
              <h4>{t("AENEcn9")}</h4>
            </div>
          )}
          {netComments.map((comment) => {
            return (
              <Comment
                comment={comment}
                key={comment.id}
                noteID={id}
                eventPubkey={author.pubkey}
                kind={"article"}
                tagKind={tagKind}
                rootKind={rootKind}
              />
            );
          })}
          {(netComments.length == 0 || isCommentsMuted) && !isLoading && (
            <div
              className="fit-container fx-centered fx-col"
              style={{ height: "20vh" }}
            >
              <Icon name="yaki-logomark" size={48} />
              <p className="p-centered gray-c">{t("A84Nx8y")}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const Comment = ({
  comment,
  eventPubkey,
  isReply = false,
  isReplyBorder = false,
  index = 0,
  tagKind = "e",
  rootKind = null,
}) => {
  const { t } = useTranslation();
  const { userMutedList } = useSelector((state) => state.userMutedList);
  let allRepliesCount = useMemo(() => {
    let count = comment.replies.length > 0 ? repliesCount(comment) : 0;
    return count == 0 || count >= 10 ? count : `0${count}`;
  }, [comment]);

  if (userMutedList.includes(comment.pubkey)) return;
  return (
    <div
      className={`fit-container ${isReplyBorder ? "reply-side-border" : ""}`}
    >
      <NotesComment
        event={comment}
        rootNotePubkey={eventPubkey}
        hasReplies={comment.replies.length > 0}
        isReply={isReply}
        isReplyBorder={isReplyBorder}
        tagKind={tagKind}
        rootKind={rootKind}
      />
      {comment.replies.length > 0 && index < 3 && (
        <div className="fit-container fx-centered fx-end-h">
          <div
            className="fx-col fit-container fx-centered"
            style={{
              width: `calc(100% - 2.5rem)`,
              gap: 0,
            }}
          >
            {comment.replies.map((comment_, index_) => {
              return (
                <Comment
                  index={index + 1}
                  comment={comment_}
                  key={comment_.id}
                  eventPubkey={eventPubkey}
                  isReply={true}
                  isReplyBorder={index_ < comment.replies.length - 1}
                  tagKind={tagKind}
                  rootKind={rootKind}
                />
              );
            })}
          </div>
        </div>
      )}
      {comment.replies.length > 0 && index >= 3 && (
        <div className="fit-container fx-centered fx-end-h">
          <div
            className=" fx-centered fx-start-h box-pad-h pointer"
            style={{
              minWidth: `calc(100% - 2.5rem)`,
              position: "relative",
              paddingTop: "2rem",
            }}
            onClick={() => customHistory(`/note/${comment.nEvent}`)}
          >
            <div
              className="reply-tail"
              style={{ left: isReplyBorder ? "-.0625rem" : 0 }}
            ></div>

            <div
              className="fx-centered box-pad-h-s box-pad-v-s sc-s-18 option"
              style={{ padding: ".25rem .5rem" }}
            >
              <Icon name="plus-sign" />
              <p className="gray-c p-medium">
                {t("ADBrveA", { count: allRepliesCount })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
