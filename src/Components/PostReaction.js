import React, { useMemo, useState } from "react";
import NumberShrink from "@/Components/NumberShrink";
import { useSelector } from "react-redux";
import ShowUsersList from "./ShowUsersList";
import { useTranslation } from "react-i18next";
import Like from "./Reactions/Like";
import Repost from "./Reactions/Repost";
import Quote from "./Reactions/Quote";
import Zap from "./Reactions/Zap";

export default function PostReaction({
  event,
  setOpenComment = () => null,
  setShowComments = () => null,
  openComment = false,
  postActions,
  userProfile,
}) {
  const userKeys = useSelector((state) => state.userKeys);
  const [usersList, setUsersList] = useState(false);
  const { t } = useTranslation();

  const isLiked = useMemo(() => {
    return userKeys
      ? postActions.likes.likes.find((item) => item.pubkey === userKeys.pub)
      : false;
  }, [postActions, userKeys]);

  const isReposted = useMemo(() => {
    return userKeys
      ? postActions.reposts.reposts.find((item) => item.pubkey === userKeys.pub)
      : false;
  }, [postActions, userKeys]);
  const isQuoted = useMemo(() => {
    return userKeys
      ? postActions.quotes.quotes.find((item) => item.pubkey === userKeys.pub)
      : false;
  }, [postActions, userKeys]);

  const isZapped = useMemo(() => {
    return userKeys
      ? postActions.zaps.zaps.find((item) => item.pubkey === userKeys.pub)
      : false;
  }, [postActions, userKeys]);

  return (
    <>
      {usersList && (
        <ShowUsersList
          exit={() => setUsersList(false)}
          title={usersList.title}
          list={usersList.list}
          extras={usersList.extras}
          extrasType={usersList.extrasType}
        />
      )}
      <div className="fx-centered" style={{ columnGap: "20px" }}>
        <div className={`fx-centered pointer `} style={{ columnGap: "8px" }}>
          <Like
            isLiked={isLiked}
            event={event}
            actions={postActions}
            tagKind={event.kind > 30000 ? "a" : "e"}
          />
          <div
            className={`round-icon-tooltip ${isLiked ? "orange-c" : ""}`}
            data-tooltip={t("Alz0E9Y")}
            onClick={(e) => {
              e.stopPropagation();
              postActions.likes.likes.length > 0 &&
                setUsersList({
                  title: t("Alz0E9Y"),
                  list: postActions.likes.likes.map((item) => item.pubkey),
                  extras: postActions.likes.likes,
                  extrasType: "reaction",
                });
            }}
          >
            <div className={isLiked ? "" : "opacity-4"}>
              <NumberShrink value={postActions.likes.likes.length} />
            </div>
          </div>
        </div>
        <div className={`fx-centered pointer `} style={{ columnGap: "8px" }}>
          <div className="round-icon-tooltip" data-tooltip={t("ADHdLfJ")}>
            <div
              className="comment-24 opacity-4"
              onClick={() => setOpenComment(!openComment)}
            ></div>
          </div>
          <div className="round-icon-tooltip" data-tooltip={t("AMBxvKP")}>
            <div onClick={() => setShowComments(true)} className="opacity-4">
              <NumberShrink value={postActions.replies.replies.length} />
            </div>
          </div>
        </div>
        {event.kind === 1 && (
          <div className={`fx-centered pointer `} style={{ columnGap: "8px" }}>
            <Repost
              isReposted={isReposted}
              event={event}
              actions={postActions}
            />
            <div
              className={`round-icon-tooltip ${isReposted ? "orange-c" : ""}`}
              data-tooltip={t("Aai65RJ")}
              onClick={(e) => {
                e.stopPropagation();
                postActions.reposts.reposts.length > 0 &&
                  setUsersList({
                    title: t("Aai65RJ"),
                    list: postActions.reposts.reposts.map(
                      (item) => item.pubkey
                    ),
                    extras: [],
                  });
              }}
            >
              <div className={isReposted ? "" : "opacity-4"}>
                <NumberShrink value={postActions.reposts.reposts.length} />
              </div>
            </div>
          </div>
        )}
        <div className={`fx-centered pointer `} style={{ columnGap: "8px" }}>
          <Quote isQuoted={isQuoted} event={event} actions={postActions} />
          <div
            className={`round-icon-tooltip ${isQuoted ? "orange-c" : ""}`}
            data-tooltip={t("AWmDftG")}
            onClick={(e) => {
              e.stopPropagation();
              postActions.quotes.quotes.length > 0 &&
                setUsersList({
                  title: t("AWmDftG"),
                  list: postActions.quotes.quotes.map((item) => item.pubkey),
                  extras: [],
                });
            }}
          >
            <div className={isQuoted ? "" : "opacity-4"}>
              <NumberShrink value={postActions.quotes.quotes.length} />
            </div>
          </div>
        </div>
        <div className="fx-centered" style={{ columnGap: "8px" }}>
          <div className="round-icon-tooltip" data-tooltip="Tip note">
            <Zap
              user={userProfile}
              event={event}
              actions={postActions}
              isZapped={isZapped}
            />
          </div>
          <div
            data-tooltip={t("AO0OqWT")}
            className={`pointer round-icon-tooltip ${
              isZapped ? "orange-c" : ""
            }`}
            onClick={() =>
              postActions.zaps.total > 0 &&
              setUsersList({
                title: t("AVDZ5cJ"),
                list: postActions.zaps.zaps.map((item) => item.pubkey),
                extras: postActions.zaps.zaps,
              })
            }
          >
            <div className={isZapped ? "" : "opacity-4"}>
              <NumberShrink value={postActions.zaps.total} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
