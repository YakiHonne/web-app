import React, { useEffect, useMemo, useState } from "react";
import { nip19 } from "nostr-tools";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import ShowUsersList from "@/Components/ShowUsersList";
import Date_ from "@/Components/Date_";
import NumberShrink from "@/Components/NumberShrink";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { getUser, translate } from "@/Helpers/Controlers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import useNoteStats from "@/Hooks/useNoteStats";
import Comments from "@/Components/Reactions/Comments";
import Like from "@/Components/Reactions/Like";
import Repost from "@/Components/Reactions/Repost";
import Quote from "@/Components/Reactions/Quote";
import Zap from "@/Components/Reactions/Zap";
import { customHistory } from "@/Helpers/History";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { useTranslation } from "react-i18next";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import LoadingDots from "@/Components/LoadingDots";
import ZapAd from "@/Components/ZapAd";
import EventOptions from "@/Components/ElementOptions/EventOptions";

export default function NotesComment({
  event,
  rootNotePubkey = "",
  noReactions = false,
  hasReplies = false,
  isReply = false,
  isHistory = false,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const userKeys = useSelector((state) => state.userKeys);
  const userRelays = useSelector((state) => state.userRelays);
  const userMutedList = useSelector((state) => state.userMutedList);

  const [user, setUser] = useState(getEmptyuserMetadata(event.pubkey));
  const [toggleComment, setToggleComment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usersList, setUsersList] = useState(false);
  const [isNip05Verified, setIsNip05Verified] = useState(false);
  const { postActions } = useNoteStats(event.id, event.pubkey);
  const [isNoteTranslating, setIsNoteTranslating] = useState("");
  const [translatedNote, setTranslatedNote] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTransEnabled, setIsTransEnabled] = useState(true);
  const isLikedByAuthor = useMemo(() => {
    return postActions.likes.likes.find(
      (item) => item.pubkey === rootNotePubkey
    );
  }, [postActions]);
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

  const isMuted = useMemo(() => {
    let checkProfile = () => {
      if (!Array.isArray(userMutedList)) return false;
      let index = userMutedList.findIndex((item) => item === user?.pubkey);
      if (index === -1) {
        return false;
      }
      return { index };
    };
    return checkProfile();
  }, [userMutedList, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let tempPubkey = event.pubkey;
        let auth = getUser(tempPubkey);

        if (auth) {
          setUser(auth);
          let ndkUser = new NDKUser({ pubkey: event.pubkey });
          ndkUser.ndk = ndkInstance;
          let checknip05 = auth.nip05
            ? await ndkUser.validateNip05(auth.nip05)
            : false;

          if (checknip05) setIsNip05Verified(true);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [nostrAuthors]);

  const onClick = (e) => {
    e.stopPropagation();
    let isSelected = window.getSelection().toString();
    if (!noReactions) {
      redirect(e);
      return;
    }
    if (isSelected) return null;
    customHistory(`/notes/${event.nEvent}`);
  };
  const redirect = (e) => {
    e.stopPropagation();
    if (window.location.pathname.includes("/notes/"))
      customHistory(`/notes/${event.nEvent}`);
    else customHistory(`/notes/${event.nEvent}`);
  };

  const translateNote = async () => {
    setIsNoteTranslating(true);
    if (translatedNote) {
      setShowTranslation(true);
      setIsNoteTranslating(false);
      return;
    }
    try {
      if (event.isCollapsedNote) {
        customHistory(`/notes/${event.nEvent}`, {
          triggerTranslation: true,
        });
        return;
      }
      let res = await translate(event.content);
      if (res.status === 500) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AZ5VQXL"),
          })
        );
      }
      if (res.status === 400) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AJeHuH1"),
          })
        );
      }
      if (res.status === 200) {
        let noteTree = getNoteTree(
          res.res,
          undefined,
          undefined,
          undefined,
          event.pubkey
        );
        setTranslatedNote(noteTree);
        setShowTranslation(true);
      }
      setIsNoteTranslating(false);
    } catch (err) {
      setShowTranslation(false);
      setIsNoteTranslating(false);
      dispatch(
        setToast({
          type: 2,
          desc: t("AZ5VQXL"),
        })
      );
    }
  };

  return (
    <div
      className={`fit-container box-pad-h-s ${isHistory ? "" : "box-pad-v-s"}`}
      style={{
        transition: ".2s ease-in-out",
        overflow: "visible",
        paddingBottom: 0,
        position: "relative",
      }}
    >
      {isReply && <div className="reply-tail"></div>}
      {usersList && (
        <ShowUsersList
          exit={() => setUsersList(false)}
          title={usersList.title}
          list={usersList.list}
          extras={usersList.extras}
          extrasType={usersList.extrasType}
        />
      )}
      <div
        className={`${
          isHistory ? "box-pad-h-s " : "box-pad-h-m box-pad-v-m"
        } fit-container`}
        style={{
          transition: ".2s ease-in-out",
          overflow: "visible",
          paddingBottom: 0,
        }}
      >
        <div className="fit-container fx-centered fx-start-h fx-start-v">
          {!isMuted && (
            <div className="fx-centered fx-start-h fx-start-v ">
              <UserProfilePic
                size={isHistory ? 40 : 30}
                mainAccountUser={false}
                user_id={user.pubkey}
                img={user.picture}
                metadata={user}
              />
              <div>
                <div
                  className="fx-centered fit-container fx-start-h"
                  style={{ gap: "3px" }}
                >
                  <p className={isHistory ? "" : "p-medium"}>
                    {user.display_name || user.name}
                  </p>
                  {isNip05Verified && <div className="checkmark-c1"></div>}
                  <p className="gray-c p-medium">&#8226;</p>
                  <p className="gray-c p-medium">
                    <Date_
                      toConvert={new Date(event.created_at * 1000)}
                      time={true}
                    />
                  </p>
                </div>
                {/* <p className="p-medium gray-c">
                  @{user.name || user.display_name}
                </p> */}
              </div>
              {isLikedByAuthor && (
                <div className="sticker sticker-small sticker-normal sticker-gray-black">
                  {t("AAECdsg")}
                </div>
              )}
            </div>
          )}
          {isMuted && (
            <div className="fx-centered fx-start-h ">
              <UserProfilePic
                size={isHistory ? 40 : 30}
                mainAccountUser={false}
                user_id={""}
                img={""}
                allowClick={false}
              />
              <div>
                <div
                  className="fx-centered fit-container fx-start-h"
                  style={{ gap: "6px" }}
                >
                  <p className={isHistory ? "" : "p-medium"}>{t("A8APYES")}</p>
                  <p className="gray-c p-medium">&#8226;</p>
                  <p className="gray-c p-medium">
                    <Date_
                      toConvert={new Date(event.created_at * 1000)}
                      time={true}
                    />
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={`fx-centered fx-col fit-container note-indent-2 ${
            hasReplies ? "reply-side-border-2" : ""
          }`}
          style={{
            // paddingTop: "1rem",
            paddingBottom: isHistory ? "1rem" : "unset",
          }}
        >
          {!isMuted && (
            <>
              <div
                className="fit-container pointer"
                onClick={onClick}
                style={{ paddingLeft: ".75rem" }}
                dir="auto"
              >
                {showTranslation ? translatedNote : event.note_tree}
              </div>
              {event.isCollapsedNote && (
                <div
                  className="fit-container fx-centered fx-start-h pointer"
                  style={{ paddingTop: ".5rem" }}
                  onClick={onClick}
                >
                  <p className="c1-c">... {t("AnWFKlu")}</p>
                </div>
              )}
              {!noReactions && (
                <>
                  {postActions?.zaps?.zaps?.length > 0 && (
                    <div className="fit-container">
                      <ZapAd
                        zappers={postActions.zaps.zaps}
                        onClick={() =>
                          setUsersList({
                            title: t("AVDZ5cJ"),
                            list: postActions.zaps.zaps.map(
                              (item) => item.pubkey
                            ),
                            extras: postActions.zaps.zaps,
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="fx-scattered fit-container">
                    <div className="fx-centered" style={{ columnGap: "16px" }}>
                      <div className="fx-centered">
                        <div
                          className="round-icon-tooltip"
                          data-tooltip={t("ADHdLfJ")}
                        >
                          <div
                            className="comment-24"
                            onClick={() => setToggleComment(!toggleComment)}
                          ></div>
                        </div>
                        <div>
                          <p>{postActions.replies.replies.length}</p>
                        </div>
                      </div>
                      <div className="fx-centered">
                        <Like
                          isLiked={isLiked}
                          event={event}
                          actions={postActions}
                        />
                        <div
                          className={`pointer round-icon-tooltip ${
                            isLiked ? "orange-c" : ""
                          } `}
                          data-tooltip={t("Alz0E9Y")}
                          onClick={(e) => {
                            e.stopPropagation();
                            postActions.likes.likes.length > 0 &&
                              setUsersList({
                                title: t("Alz0E9Y"),
                                list: postActions.likes.likes.map(
                                  (item) => item.pubkey
                                ),
                                extras: postActions.likes.likes,
                                extrasType: "reaction",
                              });
                          }}
                        >
                          <NumberShrink
                            value={postActions.likes.likes.length}
                          />
                        </div>
                      </div>
                      <div
                        className={`fx-centered pointer ${
                          isLoading ? "flash" : ""
                        }`}
                        style={{ columnGap: "8px" }}
                      >
                        <Repost
                          isReposted={isReposted}
                          event={event}
                          actions={postActions}
                        />
                        <div
                          className={`round-icon-tooltip ${
                            isReposted ? "orange-c" : ""
                          } `}
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
                          <NumberShrink
                            value={postActions.reposts.reposts.length}
                          />
                        </div>
                      </div>
                      <div className="fx-centered">
                        <Quote
                          isQuoted={isQuoted}
                          event={event}
                          actions={postActions}
                        />
                        <div
                          className={`pointer round-icon-tooltip ${
                            isQuoted ? "orange-c" : ""
                          }`}
                          data-tooltip={t("AWmDftG")}
                          onClick={(e) => {
                            e.stopPropagation();
                            postActions.quotes.quotes.length > 0 &&
                              setUsersList({
                                title: t("AWmDftG"),
                                list: postActions.quotes.quotes.map(
                                  (item) => item.pubkey
                                ),
                                extras: [],
                              });
                          }}
                        >
                          <NumberShrink
                            value={postActions.quotes.quotes.length}
                          />
                        </div>
                      </div>
                      <div className="fx-centered">
                        <div
                          className="round-icon-tooltip"
                          data-tooltip={t("AtGAGPY")}
                        >
                          <Zap
                            user={user}
                            event={event}
                            actions={postActions}
                            isZapped={isZapped}
                          />
                        </div>
                        <div
                          className={`pointer round-icon-tooltip ${
                            isZapped ? "orange-c" : ""
                          }`}
                          data-tooltip={t("AVDZ5cJ")}
                          onClick={(e) => {
                            e.stopPropagation();
                            postActions.zaps.total > 0 &&
                              setUsersList({
                                title: t("AVDZ5cJ"),
                                list: postActions.zaps.zaps.map(
                                  (item) => item.pubkey
                                ),
                                extras: postActions.zaps.zaps,
                              });
                          }}
                        >
                          <NumberShrink value={postActions.zaps.total} />
                        </div>
                      </div>
                    </div>
                    <div className="fx-centered">
                      {isTransEnabled && (
                        <div className="fit-container">
                          {!isNoteTranslating && !showTranslation && (
                            <div
                              className="round-icon-tooltip"
                              data-tooltip={t("AdHV2qJ")}
                              onClick={translateNote}
                            >
                              <div className="translate-24"></div>
                            </div>
                          )}
                          {!isNoteTranslating && showTranslation && (
                            <div
                              className="round-icon-tooltip"
                              data-tooltip={t("AE08Wte")}
                              onClick={() => setShowTranslation(false)}
                            >
                              <div className="translate-24"></div>
                            </div>
                          )}
                          {isNoteTranslating && <LoadingDots />}
                        </div>
                      )}
                      <EventOptions event={event} component="notes" />
                    </div>
                  </div>
                </>
              )}
              {toggleComment && (
                <Comments
                  exit={() => setToggleComment(false)}
                  noteTags={event.tags}
                  replyId={event.id}
                  replyPubkey={event.pubkey}
                  actions={postActions}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
