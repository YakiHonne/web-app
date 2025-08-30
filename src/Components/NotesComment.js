import React, { useMemo, useState } from "react";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import ShowUsersList from "@/Components/ShowUsersList";
import Date_ from "@/Components/Date_";
import { useDispatch } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { translate } from "@/Helpers/Controlers";
import useNoteStats from "@/Hooks/useNoteStats";
import Comments from "@/Components/Reactions/Comments";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import LoadingDots from "@/Components/LoadingDots";
import ZapAd from "@/Components/ZapAd";
import EventOptions from "@/Components/ElementOptions/EventOptions";
import PostReaction from "./PostReaction";
import useUserProfile from "@/Hooks/useUsersProfile";
import useIsMute from "@/Hooks/useIsMute";

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
  const { isNip05Verified, userProfile } = useUserProfile(event.pubkey);
  const { isMuted } = useIsMute(event.pubkey);
  const [toggleComment, setToggleComment] = useState(false);
  const [usersList, setUsersList] = useState(false);
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
                    <p className={isHistory ? "" : "p-medium"}>
                      {userProfile.display_name || userProfile.name}
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
              <EventOptions event={event} component="notes" />
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
                    <div className="fit-container" style={{paddingRight: "1rem"}}>
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

                  <div className="fx-scattered fit-container"  style={{ paddingTop: ".5rem" }}>
                    <PostReaction
                      event={event}
                      setOpenComment={setToggleComment}
                      openComment={toggleComment}
                      postActions={postActions}
                      userProfile={userProfile}
                    />
                    <div className="fx-centered">
                      <div className="fit-container box-pad-h-m">
                        {!isNoteTranslating && !showTranslation && (
                          <div
                            className="round-icon-tooltip"
                            data-tooltip={t("AdHV2qJ")}
                            onClick={translateNote}
                          >
                            <div className="translate-24 opacity-4"></div>
                          </div>
                        )}
                        {!isNoteTranslating && showTranslation && (
                          <div
                            className="round-icon-tooltip"
                            data-tooltip={t("AE08Wte")}
                            onClick={() => setShowTranslation(false)}
                          >
                            <div className="translate-24 opacity-4"></div>
                          </div>
                        )}
                        {isNoteTranslating && <LoadingDots />}
                      </div>
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
