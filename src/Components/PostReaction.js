import React, { useMemo, useRef, useState } from "react";
import NumberShrink from "@/Components/NumberShrink";
import { useSelector } from "react-redux";
import ShowUsersList from "./ShowUsersList";
import { useTranslation } from "react-i18next";
import Like from "./Reactions/Like";
import RepostWithQuote from "./Reactions/RepostWithQuote";
import Zap from "./Reactions/Zap";
import useCustomizationSettings from "@/Hooks/useCustomizationSettings";
import Icon from "@/Components/Icon";
import { iconsNames } from "@/Content/IconV2URL";

export default function PostReaction({
  event,
  setOpenComment = () => null,
  setShowComments = () => null,
  openComment = false,
  postActions,
  userProfile,
}) {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [usersList, setUsersList] = useState(false);
  const zapRef = useRef(null);
  const { reactionsSettings } = useCustomizationSettings();
  const order = useMemo(() => {
    const reactionsOrder = reactionsSettings.reduce(
      (acc, { reaction, status }, index) => {
        acc[reaction] = { index, status };
        return acc;
      },
      {},
    );
    return {
      likes: reactionsOrder.likes.status ? reactionsOrder.likes.index + 1 : -1,
      replies: reactionsOrder.replies.status
        ? reactionsOrder.replies.index + 1
        : -1,
      repost: reactionsOrder.repost.status
        ? reactionsOrder.repost.index + 1
        : -1,
      quote: reactionsOrder.quote.status ? reactionsOrder.quote.index + 1 : -1,
      zap: reactionsOrder.zap.status ? reactionsOrder.zap.index + 1 : -1,
    };
  }, [reactionsSettings]);

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

  const repostQuoteTotal =
    postActions.reposts.reposts.length + postActions.quotes.quotes.length;

  const showRepostQuote =
    event.kind === 1 && (order.repost > -1 || order.quote > -1);
  const repostQuoteOrder =
    order.repost > -1 ? order.repost : order.quote > -1 ? order.quote : -1;

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
      <div className="fx-centered" style={{ columnGap: "18px" }}>
        {order.likes > -1 && (
          <div
            className="fx-centered pointer reaction-btn"
            style={{ columnGap: "4px", order: order.likes, borderRadius: "20px", padding: "4px 8px", transition: "background-color 0.15s ease" }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Like
              isLiked={isLiked}
              event={event}
              actions={postActions}
              tagKind={event.kind > 30000 ? "a" : "e"}
              total={postActions.likes.likes.length}
            />
            {/* <span className={`p-medium ${isLiked ? "orange-c" : "opacity-4"}`}>
              <NumberShrink value={postActions.likes.likes.length} />
            </span> */}
          </div>
        )}
        {order.replies > -1 && (
          <div
            className="fx-centered pointer reaction-btn"
            style={{ columnGap: "4px", order: order.replies, borderRadius: "20px", padding: "4px 8px", transition: "background-color 0.15s ease" }}
            onClick={(e) => {
              e.stopPropagation();
              if (postActions.replies.replies.length > 0) setShowComments(true);
              else setOpenComment(!openComment);
            }}
          >
            <Icon
              name={iconsNames.chat_circle}
              size={20}
              v={2}
              opacity={0.4}
            />
            <span className="p-medium opacity-4">
              <NumberShrink value={postActions.replies.replies.length} />
            </span>
          </div>
        )}
        {showRepostQuote && (
          <div style={{ order: repostQuoteOrder }}>
            <RepostWithQuote
              isReposted={isReposted}
              isQuoted={isQuoted}
              event={event}
              actions={postActions}
              totalCount={repostQuoteTotal}
            />
          </div>
        )}
        {order.zap > -1 && (
          <div
            className="fx-centered pointer reaction-btn"
            style={{ columnGap: "4px", order: order.zap, borderRadius: "20px", padding: "4px 8px", transition: "background-color 0.15s ease" }}
            onClick={(e) => {
              e.stopPropagation();
              zapRef.current?.open();
            }}
          >
            <Zap
              ref={zapRef}
              user={userProfile}
              event={event}
              actions={postActions}
              isZapped={isZapped}
              amount={postActions.zaps.total}
            />
            {/* <span
              className={`p-medium ${isZapped ? "orange-c" : "opacity-4"}`}
            // onClick={(e) => {
            //   e.stopPropagation();
            //   postActions.zaps.total > 0 &&
            //     setUsersList({
            //       title: t("AVDZ5cJ"),
            //       list: postActions.zaps.zaps.map((item) => item.pubkey),
            //       extras: postActions.zaps.zaps,
            //     });
            // }}
            >
              <NumberShrink value={postActions.zaps.total} />
            </span> */}
          </div>
        )}
      </div>
    </>
  );
}
