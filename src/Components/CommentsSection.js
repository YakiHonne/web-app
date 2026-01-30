import React, { useEffect, useMemo, useState } from "react";
import NotesComment from "@/Components/NotesComment";
import { getWOTScoreForPubkeyLegacy } from "@/Helpers/Encryptions";
import { useSelector } from "react-redux";
import { getSubData } from "@/Helpers/Controlers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { saveUsers } from "@/Helpers/DB";
import UserProfilePic from "@/Components/UserProfilePic";
import Comments from "@/Components/Reactions/Comments";
import LoadingLogo from "@/Components/LoadingLogo";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import LoginSignup from "@/Components/LoginSignup";
import { getParsedNote, getWotConfig } from "@/Helpers/ClientHelpers";

const filterComments = (all, id, isRoot) => {
  if (isRoot) return filterRootComments(all);
  return filterRepliesComments(all, id);
};
const filterRepliesComments = (all, id) => {
  let temp = [];
  for (let comment of all) {
    if (
      comment.tags.find(
        (item) =>
          item[0] === "e" &&
          item[1] === id &&
          ["reply", "root"].includes(item[3])
      )
    ) {
      let note_tree = getParsedNote(comment, true);
      let replies = countReplies(comment.id, all);

      temp.push({
        ...note_tree,
        replies,
      });
    }
  }
  return temp;
};

const filterRootComments = (all) => {
  let temp = [];

  for (let comment of all) {
    let isRoot = comment.tags.find(
      (item) => item[0] === "e" && item[3] === "root"
    );
    let isReply = comment.tags.find(
      (item) => item[0] === "e" && item[3] === "reply"
    );
    if (
      !isReply ||
      (Array.isArray(isReply) &&
        Array.isArray(isRoot) &&
        isReply[1] === isRoot[1])
    ) {
      let note_tree = getParsedNote(comment, true);
      let replies = countReplies(comment.id, all);

      temp.push({
        ...note_tree,
        replies,
      });
    }
  }
  return temp;
};

const countReplies = (id, all) => {
  let replies = [];

  for (let comment of all) {
    let ev = comment.tags.find(
      (item) => item[3] === "reply" && item[0] === "e" && item[1] === id
    );
    if (ev) {
      let nestedReplies = countReplies(comment.id, all);
      let _ = getParsedNote(comment, true);
      replies.push({
        ..._,
        replies: nestedReplies,
      });
    }
  }

  replies.sort((a, b) => b.created_at - a.created_at);

  return replies;
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
  isRoot,
  tagKind = "e",
  leaveComment = false,
  rootData,
}) {
  const userKeys = useSelector((state) => state.userKeys);
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

  useEffect(() => {
    let parsedCom = () => {
      let res = filterComments(comments, id, isRoot);
      setNetComments(res);
      if (res.length !== 0 || comments.length > 0) setIsLoading(false);
    };
    parsedCom();
  }, [comments]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { score, reactions } = getWotConfig();

      const commentKinds = tagKind === "a" ? [1, 1111] : [1];
      
      const events = await getSubData(
        [
          {
            kinds: commentKinds,
            [`#${tagKind}`]: [rootData ? rootData[1] : id],
          },
        ],
        300
      );
      let tempEvents = events.data
        .map((event) => {
          let is_un = event.tags.find((tag) => tag[0] === "l");
          let is_comment = event.tags.find(
            (tag) => tag.length > 3 && ["root", "reply"].includes(tag[3])
          );
          let is_quote = event.tags.find((tag) => tag[0] === "q");
          let is_mention = event.tags.filter(
            (tag) => tag.length > 3 && tag[3] === "mention" && tag[1] === id
          );
          let scoreStatus = getWOTScoreForPubkeyLegacy(
            event.pubkey,
            reactions,
            score
          );
          if (
            !(
              (is_un && is_un[1] === "UNCENSORED NOTE") ||
              (is_quote && !is_comment) ||
              (is_mention.length > 0 && !is_comment)
            ) &&
            scoreStatus.status
          ) {
            return event;
          }
        })
        .filter((_) => _);

      if (tempEvents.length === 0) setIsLoading(false);
      setComments(tempEvents);
      saveUsers(events.pubkeys);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (isLoading) return;

    const commentKinds = tagKind === "a" ? [1, 1111] : [1];

    const sub = ndkInstance.subscribe(
      [
        {
          kinds: commentKinds,
          [`#${tagKind}`]: [rootData ? rootData[1] : id],
          since: Math.floor(Date.now() / 1000),
        },
      ],
      { cacheUsage: "ONLY_RELAY", groupable: false }
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

  useEffect(() => {
    setShowWriteNote(leaveComment);
  }, [leaveComment]);

  return (
    <>
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
      <div className="fit-container fx-centered fx-col box-marg-s">
        {userKeys && (
          <>
            <hr />
            {!showWriteNote && (
              <div
                className="fit-container fx-centered fx-start-h  box-pad-h-m box-pad-v-m pointer"
                style={{
                  overflow: "visible",
                  // border: "1px solid var(--very-dim-gray)",
                }}
                onClick={() => setShowWriteNote(true)}
              >
                <UserProfilePic size={40} mainAccountUser={true} />
                <div className="sc-s-18 box-pad-h-m box-pad-v-s fit-container">
                  <p className="gray-c">
                    {/* Comment on {author.display_name || author.name}'s {kind} */}
                    {t("AOmRQKF")}
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
                />
              </div>
            )}
          </>
        )}
        {!userKeys && (
          <>
            <hr />
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
        <hr />
        <div
          className="fit-container fx-centered fx-col fx-start-h fx-start-v"
          style={{ gap: 0 }}
        >
          {isLoading && (
            <div
              style={{ height: "40vh" }}
              className="fit-container box-pad-h-m fit-height fx-centered"
            >
              <LoadingLogo size={64} />
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
          {netComments.map((comment, index) => {
            return (
              <Comment
                comment={comment}
                key={comment.id}
                noteID={id}
                eventPubkey={author.pubkey}
                kind={"article"}
              />
            );
          })}
          {(netComments.length == 0 || isCommentsMuted) && !isLoading && (
            <div
              className="fit-container fx-centered fx-col"
              style={{ height: "20vh" }}
            >
              <div
                className="yaki-logomark"
                style={{ minWidth: "48px", minHeight: "48px", opacity: 0.5 }}
              ></div>
              <p className="p-centered gray-c">{t("A84Nx8y")}</p>
            </div>
            // <div
            //   className="fit-container fx-centered fx-col"
            //   style={{ height: "20vh" }}
            // >
            //   <h4>{t("ARe2fkn")}</h4>
            //   <p className="p-centered gray-c">{t("AkLuU1q")}</p>
            //   <div className="comment-24"></div>
            // </div>
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
}) => {
  const { t } = useTranslation();
  const { userMutedList } = useSelector((state) => state.userMutedList);
  let allRepliesCount = useMemo(() => {
    let count = comment.replies.length > 0 ? repliesCount(comment) : 0;
    return count == 0 || count >= 10 ? count : `0${count}`;
  }, []);

  if (userMutedList.includes(comment.pubkey)) return;
  // if (userMutedList.includes(comment.pubkey) && !isReply) return <h1>hkjkh</h1>;
  if (userMutedList.includes(comment.pubkey))
    return (
      <div
        className={`fit-container ${isReplyBorder ? "reply-side-border" : ""}`}
      >
        <div className="fit-container fx-centered fx-start-h">
          <div
            className=" fx-centered fx-start-h box-pad-h pointer"
            style={{
              minWidth: `calc(100% - 2.5rem)`,
              position: "relative",
              paddingTop: "2rem",
            }}
          >
            {isReply && (
              <div
                className="reply-tail"
                style={{ left: isReplyBorder ? "-.0625rem" : 0 }}
              ></div>
            )}
            <div
              className="fx-centered box-pad-h-s box-pad-v-s sc-s-18"
              style={{ padding: ".25rem .5rem" }}
            >
              <p className="red-c p-medium">{t("AgJ47NX")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  return (
    <div
      className={`fit-container ${isReplyBorder ? "reply-side-border" : ""}`}
      // style={{ borderLeft: isReplyBorder ? "1px solid var(--dim-gray)" : "" }}
    >
      <NotesComment
        event={comment}
        rootNotePubkey={eventPubkey}
        hasReplies={comment.replies.length > 0}
        isReply={isReply}
        isReplyBorder={isReplyBorder}
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
              <div className="plus-sign"></div>
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
