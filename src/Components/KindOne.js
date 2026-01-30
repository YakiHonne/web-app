import React, { useEffect, useMemo, useState } from "react";
import { getParsedNote } from "@/Helpers/ClientHelpers";
import { getParsedMedia, getParsedRepEvent } from "@/Helpers/Encryptions";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import ShowUsersList from "@/Components/ShowUsersList";
import Date_ from "@/Components/Date_";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { getSubData, getUser, translate } from "@/Helpers/Controlers";
import useNoteStats from "@/Hooks/useNoteStats";
import Comments from "@/Components/Reactions/Comments";
import { saveUsers } from "@/Helpers/DB";
import CommentsSection from "@/Components/CommentsSection";
import {
  getNoteTree,
  isImageUrl,
  isVid,
  compactContent,
} from "@/Helpers/ClientHelpers";
import { useTranslation } from "react-i18next";
import LoadingDots from "@/Components/LoadingDots";
import ZapAd from "@/Components/ZapAd";
import useUserProfile from "@/Hooks/useUsersProfile";
import NotesComment from "@/Components/NotesComment";
import { nip19 } from "nostr-tools";
import EventOptions from "@/Components/ElementOptions/EventOptions";
import { customHistory } from "@/Helpers/History";
import PostReaction from "./PostReaction";
import useIsMute from "@/Hooks/useIsMute";
import useCustomizationSettings from "@/Hooks/useCustomizationSettings";
import UnsupportedKindPreview from "./UnsupportedKindPreview";
import Link from "next/link";
import LinkRepEventPreview from "./LinkRepEventPreview";
import {
  getEventFromCache,
  setEventFromCache,
} from "@/Helpers/utils/eventsCache";

function KindOne({
  event,
  reactions = true,
  border = false,
  minimal = false,
  getReposts = () => null,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isNip05Verified, userProfile } = useUserProfile(event?.pubkey);
  const [toggleComment, setToggleComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [usersList, setUsersList] = useState(false);
  const { postActions } = useNoteStats(event?.id, event?.pubkey);
  const [isNoteTranslating, setIsNoteTranslating] = useState("");
  const [translatedNote, setTranslatedNote] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { repliesView } = useCustomizationSettings();
  const isThread = useMemo(() => {
    return repliesView === undefined || repliesView === "thread";
  }, [repliesView]);
  const [isClamped, setIsClamped] = useState(10000);
  const noteRef = React.useRef(null);
  const { isMuted: isMutedPubkey, muteUnmute: muteUnmutePubkey } = useIsMute(
    event?.pubkey,
  );
  const { isMuted: isMutedId, muteUnmute: muteUnmuteId } = useIsMute(
    event?.id,
    "e",
  );
  const { isMuted: isMutedComment } = useIsMute(event?.isComment, "e");
  const { isMuted: isMutedRoot } = useIsMute(
    event.rootData ? event.rootData[1] : false,
    "e",
  );
  const checkNotes = useMemo(() => {
    const NOTE_PREFIXES = ["note1", "nevent", "naddr"];
    const MAX_COMPONENTS = 5;
    const WORD_LIMIT = 70;

    const range_ = event.content.trim().split(/\s+|\n/);
    const range = range_.slice(0, WORD_LIMIT);

    let checkForComponents = 0;

    for (let i = 0; i < range.length; i++) {
      let cleanElement = range[i].trim().replace("nostr:", "");

      // Early exit if max components reached
      if (checkForComponents >= MAX_COMPONENTS) break;

      // Check for note prefixes first (faster)
      let hasNotePrefix = false;
      for (let prefix of NOTE_PREFIXES) {
        if (cleanElement.startsWith(prefix)) {
          checkForComponents++;
          hasNotePrefix = true;
          break;
        }
      }

      // Only check for media if no note prefix found
      if (!hasNotePrefix) {
        if (isImageUrl(cleanElement)?.type === "image") {
          checkForComponents++;
        } else if (isVid(cleanElement)) {
          checkForComponents++;
        }
      }
    }

    if (checkForComponents > 0 && checkForComponents < MAX_COMPONENTS)
      return 15;
    if (checkForComponents >= MAX_COMPONENTS) return 10;
    if (checkForComponents === 0 && range_.length === range.length)
      return 10000;
    return 20;
  }, [event.content]);

  useEffect(() => {
    if (noteRef.current) {
      const el = noteRef.current;
      if (el.scrollHeight > 700 && el.scrollHeight <= 1000) setIsClamped(20);
      if (el.scrollHeight > 1000) setIsClamped(checkNotes);
    }
  }, [showTranslation, translatedNote, event.note_tree, checkNotes]);

  useEffect(() => {
    if (postActions && postActions?.reposts?.reposts?.length > 0)
      getReposts(postActions?.reposts?.reposts);
  }, [postActions]);

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isNavigating) {
      console.log("Click ignored - already navigating");
      return;
    }

    try {
      let isSelected = window.getSelection().toString();
      if (isSelected) {
        console.log("Text selected, ignoring click");
        return null;
      }

      if (!event?.nEvent) {
        console.error("Missing nEvent in event object:", event);
        return;
      }

      setIsNavigating(true);

      customHistory(`/note/${event.nEvent}`);

      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 1000);
    } catch (error) {
      console.error("Error in onClick handler:", error);
      setIsNavigating(false);
    }
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
          }),
        );
      }
      if (res.status === 400) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AJeHuH1"),
          }),
        );
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
          desc: t("AZ5VQXL"),
        }),
      );
    }
  };
  if (isDeleted) {
    return;
  }
  if ((isMutedId || isMutedComment || isMutedRoot) && !minimal) return;
  if (isMutedPubkey) {
    return (
      <div
        className="box-pad-v fx-centered fx-col fit-container note-item"
        id={event.id}
        style={{ borderBottom: border ? "1px solid var(--very-dim-gray)" : "" }}
      >
        <p
          className="box-pad-h p-centered gray-c"
          style={{ maxWidth: "400px" }}
        >
          {t("Ao4Segq")}
        </p>
        <button
          className="btn btn-gray btn-small"
          onClick={() => muteUnmutePubkey()}
        >
          {t("AKELUbQ")}
        </button>
      </div>
    );
  }
  if (isMutedId || isMutedComment || isMutedRoot) {
    return (
      <div
        className="box-pad-v fx-centered fx-col fit-container note-item"
        id={event.id}
        style={{ borderBottom: border ? "1px solid var(--very-dim-gray)" : "" }}
      >
        <p
          className="box-pad-h p-centered gray-c"
          style={{ maxWidth: "400px" }}
        >
          {t("AsOUmIi")}
        </p>
        {isMutedId && (
          <button
            className="btn btn-gray btn-small"
            onClick={() => muteUnmuteId()}
          >
            {t("AnddeNp")}
          </button>
        )}
        {isMutedComment && (
          <button
            className="btn btn-gray btn-small"
            onClick={() => muteUnmuteComment()}
          >
            {t("AnddeNp")}
          </button>
        )}
        {isMutedRoot && (
          <button
            className="btn btn-gray btn-small"
            onClick={() => muteUnmuteId()}
          >
            {t("AnddeNp")}
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {showComments && (
        <FastAccessCS
          noteTags={event.tags}
          id={event.id}
          eventPubkey={event.pubkey}
          author={userProfile}
          exit={() => setShowComments(false)}
          isRoot={event.isComment ? false : true}
        />
      )}
      {usersList && (
        <ShowUsersList
          exit={() => setUsersList(false)}
          title={usersList.title}
          list={usersList.list}
          extras={usersList.extras}
          extrasType={usersList?.extrasType}
        />
      )}
      <div
        className="box-pad-v-m fit-container note-item"
        id={event.id}
        style={{ borderBottom: border ? "1px solid var(--very-dim-gray)" : "" }}
      >
        {event.isComment && isThread && (
          <RelatedEvent
            event={event.isComment}
            reactions={reactions}
            isThread={isThread}
          />
        )}
        <div
          className={`fit-container box-pad-h-m fx-centered fx-col`}
          style={{
            backgroundColor: !toggleComment ? "" : "var(--c1-side)",
            transition: ".2s ease-in-out",
            overflow: "visible",
          }}
        >
          <div
            className=" fit-container pointer"
            style={{
              transition: ".2s ease-in-out",
              overflow: "visible",
            }}
          >
            <div className="fit-container fx-centered fx-start-h fx-start-v">
              <div>
                <UserProfilePic
                  size={40}
                  mainAccountUser={false}
                  user_id={userProfile.pubkey}
                  img={userProfile.picture}
                  metadata={minimal ? undefined : userProfile}
                />
              </div>
              <div
                className={
                  "fit-container fx-centered fx-start-h fx-start-v fx-col"
                }
                style={{ gap: "6px" }}
              >
                <div className="fx-scattered fit-container">
                  <div className="fx-centered" style={{ gap: "3px" }}>
                    <div className="fx-centered" style={{ gap: "3px" }}>
                      <p className="p-bold p-one-line" style={{ margin: 0 }}>
                        {userProfile.display_name || userProfile.name}
                      </p>
                      {isNip05Verified && <div className="checkmark-c1"></div>}
                    </div>
                    <p className="gray-c p-medium" style={{ margin: 0 }}>
                      &#8226;
                    </p>
                    <p className="gray-c p-medium" style={{ margin: 0 }}>
                      <Date_
                        toConvert={new Date(event.created_at * 1000)}
                        time={true}
                      />
                    </p>
                  </div>
                  <div className="fx-centered">
                    {event.isPaidNote && (
                      <div className="sticker sticker-c1">{t("AAg9D6c")}</div>
                    )}
                    {reactions && (
                      <EventOptions
                        event={event}
                        component="notes"
                        refreshAfterDeletion={(data) => setIsDeleted(data)}
                      />
                    )}{" "}
                  </div>
                </div>
                {event.isComment && !isThread && (
                  <RelatedEvent event={event.isComment} isThread={isThread} />
                )}
                <Link
                  href={`/note/${event.nEvent}`}
                  className="fit-container pointer no-hover"
                >
                  <div className="fx-centered fx-col fit-container">
                    <div className="fit-container" dir="auto">
                      {!minimal ? (
                        <div
                          className="p-n-lines"
                          style={{
                            "--lines": isClamped ? isClamped : "unset",
                          }}
                          ref={noteRef}
                        >
                          {showTranslation ? translatedNote : event.note_tree}
                        </div>
                      ) : (
                        <div className="p-six-lines" ref={noteRef}>
                          {compactContent(event.content, event.pubkey)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            {isClamped !== 10000 && (
              <div
                className="fit-container note-indent fx-centered fx-start-h pointer"
                style={{ paddingTop: ".5rem" }}
                onClick={onClick}
              >
                <p className="c1-c">... {t("AnWFKlu")}</p>
              </div>
            )}
            {reactions && (
              <>
                {postActions?.zaps?.zaps?.length > 0 && (
                  <div className="fit-container note-indent">
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
                  className="fx-scattered fit-container note-indent"
                  style={{ paddingTop: "1rem" }}
                >
                  <PostReaction
                    event={event}
                    setOpenComment={setToggleComment}
                    openComment={toggleComment}
                    postActions={postActions}
                    userProfile={userProfile}
                    setShowComments={setShowComments}
                  />
                  <div className="fx-centered">
                    <div className="fit-container">
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
          </div>
          {toggleComment && (
            <Comments
              noteTags={event.tags}
              exit={() => setToggleComment(false)}
              replyId={event.id}
              replyPubkey={event.pubkey}
              actions={postActions}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default React.memo(KindOne);

const getPreviouslyFetchedEvent = (id) => {
  let event = getEventFromCache(id);
  let parsedEvent = false;
  if (!event) return false;
  if (event.kind === 1 || event.kind === 1111) {
    parsedEvent = getParsedNote(event);
    parsedEvent = { ...parsedEvent, isComment: false };
  } else if ([22, 21, 20].includes(event.kind)) {
    parsedEvent = getParsedMedia(event);
  } else {
    parsedEvent = getParsedRepEvent(event);
  }
  return parsedEvent;
};

const RelatedEvent = React.memo(({ event, reactions = true, isThread }) => {
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const { t } = useTranslation();
  const [user, setUser] = useState(false);
  const [relatedEvent, setRelatedEvent] = useState(
    getPreviouslyFetchedEvent(event),
  );
  const [isRelatedEventPubkey, setIsRelatedEventPubkey] = useState(false);
  const [isRelatedEventLoaded, setIsRelatedEventLoaded] = useState(
    relatedEvent ? true : false,
  );
  const [isUnsupported, setIsUnsupported] = useState(false);
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        let auth = await getUser(isRelatedEventPubkey);
        if (auth) setUser(auth);
      } catch (err) {
        console.log(err);
      }
    };
    if (isRelatedEventPubkey) fetchAuthor();
  }, [nostrAuthors, isRelatedEventPubkey]);

  useEffect(() => {
    const fetchData = async (kind, ids) => {
      try {
        setIsRelatedEventLoaded(false);
        let event_ =
          kind === 0
            ? await getSubData([{ ids: [ids] }], 500)
            : await getSubData(
                [
                  {
                    kinds: [kind],
                    authors: [ids.pubkey],
                    "#d": [ids.identifier],
                  },
                ],
                500,
              );
        if (event_.data.length > 0) {
          let post = event_.data[0];
          saveUsers([post.pubkey]);
          let parsedEvent;
          if (post.kind === 1 || post.kind === 1111) {
            parsedEvent = getParsedNote(post);
            parsedEvent = { ...parsedEvent, isComment: false };
          } else if ([22, 21, 20].includes(post.kind)) {
            parsedEvent = getParsedMedia(post);
          } else {
            parsedEvent = getParsedRepEvent(post);
          }
          if (
            ![
              0, 1, 1111, 6969, 30033, 30031, 30004, 30005, 30023, 34235, 22, 21, 20,
            ].includes(parsedEvent.kind)
          ) {
            setIsUnsupported(true);
          } else {
            let key =
              kind === 0 ? ids : `${kind}:${ids.pubkey}:${ids.identifier}`;
            setEventFromCache(key, post.rawEvent());
          }
          setRelatedEvent(parsedEvent);
          setIsRelatedEventPubkey(post.pubkey);
          setUser(getEmptyuserMetadata(post.pubkey));
        }
        setIsRelatedEventLoaded(true);
      } catch (err) {
        console.log(err);
        setIsRelatedEventLoaded(true);
      }
    };
    if (event && !relatedEvent) {
      let checkEventKind = event.split(":");
      if (checkEventKind.length > 2) {
        saveUsers([checkEventKind[1]]);
        fetchData(parseInt(checkEventKind[0]), {
          pubkey: checkEventKind[1],
          identifier: checkEventKind[2],
        });
        return;
      }
      fetchData(0, event);
    }
  }, [event]);

  const handleOnClick = (e) => {
    e.stopPropagation();
    if (!user) return;
    customHistory(`/profile/${nip19.nprofileEncode({ pubkey: user.pubkey })}`);
  };

  if (isThread)
    return relatedEvent ? (
      <div className=" fit-container">
        {!isUnsupported && (
          <>
            {(relatedEvent.kind === 1 || relatedEvent.kind === 1111) && (
              <NotesComment
                event={relatedEvent}
                hasReplies={true}
                isHistory={true}
                noReactions={!reactions}
              />
            )}
            {relatedEvent.kind !== 1 && relatedEvent.kind !== 1111 && (
              <div className="box-pad-h-m">
                <div>
                  <LinkRepEventPreview event={relatedEvent} />
                </div>
                <div
                  className="reply-side-border-2"
                  style={{ paddingBottom: "1.5rem" }}
                ></div>
              </div>
            )}
          </>
        )}
        {isUnsupported && (
          <UnsupportedKindPreview
            addr={relatedEvent.nEvent || relatedEvent.naddr}
          />
        )}
      </div>
    ) : (
      <div
        className="fit-container box-pad-h-m fx-centered fx-start-h fx-start-v fx-col"
        style={{ gap: 0 }}
      >
        <div className="sc-s bg-sp box-pad-h-s box-pad-v-s ">
          <LoadingDots />
        </div>
        <div
          style={{
            height: "20px",
            borderLeft: "1px solid var(--pale-gray)",
            marginLeft: "1rem",
          }}
        ></div>
      </div>
    );

  return (
    <>
      <div className="fit-container fx-centered fx-start-h">
        {isRelatedEventLoaded ? (
          <div className="fx-centered">
            <p className="gray-c" onClick={handleOnClick}>
              {t("AoUrRsg")}{" "}
              <span className="c1-c">
                @{user?.display_name || user?.name || "USER"}
              </span>
            </p>
            {relatedEvent && (
              <div
                className="arrow-12"
                style={{ rotate: showNote ? "-180deg" : "0deg" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNote(!showNote);
                }}
              ></div>
            )}
          </div>
        ) : (
          <div className="fx-centered">
            <p className="gray-c">{t("AoUrRsg")}</p>
            <LoadingDots />
          </div>
        )}
      </div>
      {relatedEvent && showNote && (
        <div
          className="fit-container"
          style={{ borderLeft: "1px solid var(--c1)" }}
        >
          {!isUnsupported && (
            <>
              {(relatedEvent.kind === 1 || relatedEvent.kind === 1111) && (
                <KindOne event={relatedEvent} reactions={reactions} />
              )}
              {relatedEvent.kind !== 1 && relatedEvent.kind !== 1111 && (
                <div className="fit-container box-pad-h-m">
                  <LinkRepEventPreview event={relatedEvent} />
                </div>
              )}
            </>
          )}
          {isUnsupported && (
            <UnsupportedKindPreview
              addr={relatedEvent.nEvent || relatedEvent.naddr}
            />
          )}
        </div>
      )}
    </>
  );
});

const FastAccessCS = ({
  id,
  noteTags,
  eventPubkey,
  author,
  exit,
  isRoot = true,
}) => {
  const { t } = useTranslation();
  return (
    <div
      className="fixed-container fx-centered fx-start-v"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="fx-centered fx-col fx-start-v fx-start-h sc-s-18 bg-sp"
        style={{
          overflow: "scroll",
          scrollBehavior: "smooth",
          height: "100vh",
          width: "min(100%, 550px)",
          position: "relative",
          borderRadius: 0,
          gap: 0,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          className="fit-container fx-centered sticky"
          style={{ borderBottom: "1px solid var(--very-dim-gray)" }}
        >
          <div className="fx-scattered fit-container box-pad-h">
            <h4 className="p-caps">{t("Aog1ulK")}</h4>
            <div
              className="close"
              style={{ position: "static" }}
              onClick={exit}
            >
              <div></div>
            </div>
          </div>
        </div>
        <CommentsSection
          noteTags={noteTags}
          id={id}
          eventPubkey={eventPubkey}
          author={author}
          isRoot={isRoot}
        />
      </div>
    </div>
  );
};
