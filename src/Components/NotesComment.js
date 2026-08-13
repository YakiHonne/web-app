import React, { useMemo, useState } from "react";
import UserProfilePic from "@/Components/UserProfilePic";
import ShowUsersList from "@/Components/ShowUsersList";
import Date_ from "@/Components/Date_";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { translate } from "@/Helpers/Controlers";
import useNoteStats from "@/Hooks/useNoteStats";
import Comments from "@/Components/Reactions/Comments";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import Spinner from "@/Components/Spinner";
import ZapAd from "@/Components/ZapAd";
import EventOptions from "@/Components/ElementOptions/EventOptions";
import PostReaction from "./PostReaction";
import useUserProfile from "@/Hooks/useUsersProfile";
import useIsMute from "@/Hooks/useIsMute";
import Link from "next/link";
import Icon from "@/Components/Icon";
import Badge from "@/Helpers/Badge";
import { iconsNames } from "@/Content/IconV2URL";
import EventStats from "./EventStats";
import CommentsSection from "@/Components/CommentsSection";
import Overlay from "@/Components/Overlay";
import useQuotaGuard from "@/Hooks/useQuotaGuard";

export default function NotesComment({
  event,
  rootNotePubkey = "",
  noReactions = false,
  hasReplies = false,
  isReply = false,
  isHistory = false,
  tagKind = "e",
  rootKind = null,
  fromKindOne = false,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { handleTranslateError } = useQuotaGuard();
  const userKeys = useSelector((state) => state.userKeys);
  const { isNip05Verified, userProfile, proUser } = useUserProfile(event.pubkey);
  const { isMuted } = useIsMute(event.pubkey);
  const [toggleComment, setToggleComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [usersList, setUsersList] = useState(false);
  const { postActions } = useNoteStats(event.id, event.pubkey);
  const [isNoteTranslating, setIsNoteTranslating] = useState("");
  const [translatedNote, setTranslatedNote] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const isLikedByAuthor = useMemo(() => {
    return postActions.likes.likes.find(
      (item) => item.pubkey === rootNotePubkey,
    );
  }, [postActions]);

  const onClick = (e) => {
    e.stopPropagation();
    let isSelected = window.getSelection().toString();
    if (!noReactions) {
      redirect(e);
      return;
    }
    if (isSelected) return null;
    customHistory(`/note/${event.nEvent}`);
  };
  const redirect = (e) => {
    e.stopPropagation();
    if (window.location.pathname.includes("/note/"))
      customHistory(`/note/${event.nEvent}`);
    else customHistory(`/note/${event.nEvent}`);
  };

  const translateNote = async () => {
    if (!userKeys) {
      dispatch(
        setToast({
          type: 3,
          desc: t("ALtr4nL"),
        }),
      );
      return;
    }
    setIsNoteTranslating(true);
    if (translatedNote) {
      setShowTranslation(true);
      setIsNoteTranslating(false);
      return;
    }
    try {
      if (event.isCollapsedNote) {
        customHistory(`/note/${event.nEvent}`, {
          triggerTranslation: true,
        });
        return;
      }
      let res = await translate(event.content);
      if (res.status !== 200) {
        handleTranslateError(res);
      }
      if (res.status === 200) {
        let noteTree = getNoteTree(
          res.res,
          undefined,
          undefined,
          undefined,
          event.pubkey,
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
          desc: err?.response?.status === 401 ? t("ALtr4nL") : t("AZ5VQXL"),
        }),
      );
    }
  };
  if (isDeleted) return;
  return (
    <>
      {showComments && fromKindOne && (
        <Overlay exit={() => setShowComments(false)} width={550}>
          <div
            className="fx-centered fx-col fx-start-v fx-start-h"
            style={{
              overflow: "scroll",
              scrollBehavior: "smooth",
              borderRadius: 0,
              gap: 0,
            }}
          >
            <div className="close" onClick={() => setShowComments(false)}>
              <div></div>
            </div>
            <CommentsSection
              noteTags={event.tags}
              id={event.id}
              eventPubkey={event.pubkey}
              author={userProfile}
              isRoot={event.isComment ? false : true}
            />
          </div>
        </Overlay>
      )}
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
        className={`fit-container box-pad-h-s ${isHistory ? "" : "box-pad-v-s"
          }`}
        style={{
          transition: ".2s ease-in-out",
          overflow: "visible",
          paddingBottom: 0,
          position: "relative",
        }}
      >
        {isReply && <div className="reply-tail"></div>}
        <div
          className={`${isHistory ? "box-pad-h-s " : "box-pad-h-m box-pad-v-m"
            } fit-container`}
          style={{
            transition: ".2s ease-in-out",
            overflow: "visible",
            paddingBottom: 0,
          }}
        >
          <div className="fit-container fx-centered fx-start-h fx-start-v">
            {!isMuted && (
              <div className="fx-scattered  fit-container">
                <div className="fx-centered">
                  <UserProfilePic
                    size={isHistory ? 40 : 30}
                    mainAccountUser={false}
                    user_id={userProfile.pubkey}
                    img={userProfile.picture}
                    metadata={noReactions ? undefined : userProfile}
                  />
                  <div>
                    <div
                      className="fx-centered fit-container fx-start-h"
                      style={{ gap: "3px" }}
                    >
                      <p className={isHistory ? "p-bold" : "p-medium"}>
                        {userProfile.display_name || userProfile.name}
                      </p>
                      {isNip05Verified && <Icon name="checkmark-c1" isColored />}
                      {proUser.isProUser && <Badge data={proUser} size={16} />}
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
                <div className="fx-centered">
                  {!isNoteTranslating && <Icon name={"translate"} onClick={translateNote} opacity={!isNoteTranslating && !showTranslation ? ".5" : "1"} size={20} />}
                  {isNoteTranslating && <Spinner />}
                  {!noReactions && (
                    <EventOptions
                      event={event}
                      component="notes"
                      refreshAfterDeletion={() => setIsDeleted(true)}
                    />
                  )}
                </div>
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
                    <p className={isHistory ? "" : "p-medium"}>
                      {t("A8APYES")}
                    </p>
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
            className={`fx-centered fx-col note-indent-2 ${hasReplies ? "reply-side-border-2" : ""
              }`}
            style={{ width: hasReplies ? "calc(100% - 1rem)" : "100%", paddingBottom: isHistory ? "1rem" : "unset" }}
          >
            {!isMuted && (
              <>
                <Link
                  href={`/note/${event.nEvent}`}
                  className="fit-container pointer no-hover"
                >
                  <div
                    className="fit-container pointer"
                    // onClick={onClick}
                    dir="auto"
                  >
                    {showTranslation ? translatedNote : event.note_tree}
                  </div>
                </Link>
                <div id={`slider-${event.id}`} />
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
                      <div
                        className="fit-container"
                        style={{ paddingRight: "1rem" }}
                      >
                        <ZapAd
                          zappers={postActions.zaps.zaps}
                          onClick={() =>
                            setUsersList({
                              title: t("AVDZ5cJ"),
                              list: postActions.zaps.zaps.map(
                                (item) => item.pubkey,
                              ),
                              extras: postActions.zaps.zaps,
                            })
                          }
                        />
                      </div>
                    )}

                    <div
                      className="fx-scattered fit-container"
                      style={{ paddingTop: ".5rem" }}
                    >
                      <PostReaction
                        event={event}
                        setOpenComment={setToggleComment}
                        openComment={toggleComment}
                        postActions={postActions}
                        userProfile={userProfile}
                        setShowComments={fromKindOne ? setShowComments : () => setToggleComment(true)}
                      />
                      {/* <div className="fx-centered">
                        {!isNoteTranslating && (
                          <Icon
                            v={2}
                            name={iconsNames.globe}
                            onClick={translateNote}
                            opacity={!isNoteTranslating && !showTranslation ? ".5" : "1"}
                            size={20}
                          />
                        )}
                        {isNoteTranslating && <Spinner />}
                      </div> */}
                      <EventStats postActions={postActions} />
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
                    tagKind={tagKind}
                    rootKind={rootKind}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
