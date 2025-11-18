import React, { useEffect, useMemo, useState } from "react";
import ArrowUp from "@/Components/ArrowUp";
import UserProfilePic from "@/Components/UserProfilePic";
import Date_ from "@/Components/Date_";
import LoadingDots from "@/Components/LoadingDots";
import { useDispatch } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { getSubData, translate } from "@/Helpers/Controlers";
import useNoteStats from "@/Hooks/useNoteStats";
import CommentsSection from "@/Components/CommentsSection";
import HistorySection from "@/Components/HistorySection";
import { useTranslation } from "react-i18next";
import { getNoteTree, getParsedNote } from "@/Helpers/ClientHelpers";
import PagePlaceholder from "@/Components/PagePlaceholder";
import ZapAd from "@/Components/ZapAd";
import EventOptions from "@/Components/ElementOptions/EventOptions";
import Link from "next/link";
import useIsMute from "@/Hooks/useIsMute";
import useUserProfile from "@/Hooks/useUsersProfile";
import PostReaction from "@/Components/PostReaction";
import Backbar from "@/Components/Backbar";
import { straightUp } from "@/Helpers/Helpers";
import ShowUsersList from "@/Components/ShowUsersList";
import { customHistory } from "@/Helpers/History";
import { nip19 } from "nostr-tools";
import LoadingLogo from "@/Components/LoadingLogo";
import { saveUsers } from "@/Helpers/DB";

export default function Note({ event, nevent }) {
  const { state } = {};
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(event ? false : true);
  const [usersList, setUsersList] = useState(false);
  const [isNoteTranslating, setIsNoteTranslating] = useState("");
  const [translatedNote, setTranslatedNote] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [note, setNote] = useState(getParsedNote(event));
  const { isMuted: isMutedPubkey, muteUnmute: muteUnmutePubkey } = useIsMute(
    note?.pubkey
  );

  const { userProfile, isNip05Verified } = useUserProfile(note?.pubkey);
  const { postActions } = useNoteStats(note?.id, note?.pubkey);
  const unsupportedKind = useMemo(() => {
    return note?.kind !== 1;
  }, [note]);
  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true);
      let id = nip19.decode(nevent)?.data.id || nip19.decode(nevent)?.data;
      let relays = nip19.decode(nevent)?.data.relays || [];
      const res = await getSubData([{ ids: [id] }], 2000, relays, undefined, 1);
      if (res.data.length === 0) {
        setIsLoading(false);
        return;
      }
      let parsedNote = getParsedNote(res.data[0]);
      setNote(parsedNote);
      saveUsers([parsedNote.pubkey]);
      setIsLoading(false);
    };
    if (!event) fetchNote();
    if (state) {
      let { triggerTranslation } = state;
      if (triggerTranslation) translateNote();
    }
    straightUp();
  }, [event]);

  const translateNote = async () => {
    setIsNoteTranslating(true);
    if (translatedNote) {
      setShowTranslation(true);
      setIsNoteTranslating(false);
      return;
    }
    try {
      let res = await translate(note.content);
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
          note.pubkey
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
  if ([21, 22].includes(event?.kind)) {
    return customHistory("/video/" + nevent);
  }
  if (isLoading)
    return (
      <div
        className="fit-container fx-centered fx-col"
        style={{ height: "100vh" }}
      >
        <LoadingLogo />
      </div>
    );

  if (!note && !isLoading)
    return (
      <div
        className="fit-container fx-centered fx-col"
        style={{ height: "100vh" }}
      >
        <h4>{t("AAbA1Xn")}</h4>
        <p className="gray-c p-centered">{t("Agge1Vg")}</p>
        <Link href="/">
          <button className="btn btn-normal btn-small">{t("AWroZQj")}</button>
        </Link>
      </div>
    );
  if (note?.kind !== 1)
    return customHistory(
      "/unsupported/" + nip19.neventEncode({ id: event?.id })
    );
  return (
    <div>
      <ArrowUp />
      {usersList && (
        <ShowUsersList
          exit={() => setUsersList(false)}
          title={usersList.title}
          list={usersList.list}
          extras={usersList.extras}
          extrasType={usersList.extrasType}
        />
      )}
      {!isMutedPubkey && (
        <div
          className="fx-centered fit-container fx-col fx-start-h"
          style={{ gap: 0 }}
        >
          {note && (
            <div className="main-middle">
              <Backbar />
              {note && !note.isRoot && (
                <>
                  <div
                    className="fit-container box-pad-h box-pad-v-m box-marg-s fx-centered pointer sticky"
                    style={{
                      borderTop: "1px solid var(--very-dim-gray)",
                      borderBottom: "1px solid var(--very-dim-gray)",
                    }}
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <div className="fx-centered">
                      <p>
                        {showHistory && t("ApSnq9V")}
                        {!showHistory && t("AUScjxu")}
                      </p>
                      <div
                        className="arrow-12"
                        style={{
                          rotate: !showHistory ? "0deg" : "180deg",
                        }}
                      ></div>
                    </div>
                  </div>
                  <HistorySection
                    id={note.rootData[1]}
                    tagKind={note.rootData[0]}
                    isRoot={!note.isReply}
                    targetedEventID={note.id}
                    showHistory={showHistory}
                  />
                </>
              )}
              <div
                className="fit-container fx-centered fx-col fx-start-v"
                style={{ paddingBottom: "3rem", gap: 0 }}
              >
                <div className="fit-container fx-scattered fx-start-v">
                  <div className="fx-centered fit-container fx-start-h box-pad-h-m box-marg-s">
                    <UserProfilePic
                      img={userProfile.picture}
                      size={64}
                      mainAccountUser={false}
                      user_id={note.pubkey}
                      metadata={userProfile}
                    />
                    <div className="box-pad-h-m fx-centered fx-col fx-start-v">
                      <div className="fx-centered">
                        <h4>{userProfile.display_name || userProfile.name}</h4>
                        {isNip05Verified && (
                          <div className="checkmark-c1-24"></div>
                        )}
                      </div>
                      <p className="gray-c">
                        <Date_
                          toConvert={new Date(note.created_at * 1000)}
                          time={true}
                        />
                      </p>
                    </div>
                  </div>
                  {note.isPaidNote && (
                    <div
                      className="sticker sticker-c1"
                      style={{ minWidth: "max-content" }}
                    >
                      {t("AAg9D6c")}
                    </div>
                  )}
                </div>
                <div className="fit-container box-pad-h-m" dir="auto">
                  {showTranslation ? translatedNote : note.note_tree}
                </div>
                {postActions?.zaps?.zaps?.length > 0 && (
                  <div className="fit-container box-pad-h-m">
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
                <div className="fit-container fx-scattered box-pad-h-m box-pad-v-m">
                  <PostReaction
                    event={note}
                    setOpenComment={setOpenComment}
                    openComment={openComment}
                    postActions={postActions}
                    userProfile={userProfile}
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
                    <EventOptions event={note} component={"notes"} />
                  </div>
                </div>
                <MutedThreadWarning event={note} />
                <CommentsSection
                  tagKind={note.rootData ? note.rootData[0] : "e"}
                  noteTags={note.tags}
                  id={note.id}
                  eventPubkey={note.pubkey}
                  nEvent={note.nEvent}
                  postActions={postActions}
                  author={userProfile}
                  isRoot={note.isRoot}
                  rootData={note.rootData}
                  leaveComment={openComment}
                />
              </div>
            </div>
          )}
          {!note && !unsupportedKind && (
            <div
              className="fit-container fx-centered fx-col"
              style={{ height: "100vh" }}
            >
              <h4>{t("AAbA1Xn")}</h4>
              <p className="gray-c p-centered">{t("Agge1Vg")}</p>
              <Link href="/">
                <button className="btn btn-normal btn-small">
                  {t("AWroZQj")}
                </button>
              </Link>
            </div>
          )}
          {unsupportedKind && <PagePlaceholder page={"unsupported"} />}
        </div>
      )}
      {isMutedPubkey && (
        <PagePlaceholder page={"muted-user"} onClick={muteUnmutePubkey} />
      )}
    </div>
  );
}

const MutedThreadWarning = ({ event }) => {
  const { t } = useTranslation();
  const { isMuted: isMutedId } = useIsMute(event?.id, "e");
  const { isMuted: isMutedComment } = useIsMute(event?.isComment, "e");
  const { isMuted: isMutedRoot } = useIsMute(
    event.rootData ? event.rootData[1] : false,
    "e"
  );
  if (!(isMutedId || isMutedComment || isMutedRoot)) return null;
  return (
    <div
      className="fit-container fx-scattered box-pad-h box-pad-v-m box-marg-s"
      style={{
        borderBottom: "1px solid var(--very-dim-gray)",
        borderTop: "1px solid var(--very-dim-gray)",
      }}
    >
      <div className="fx-centered">
        <div className="mute-24"></div>
        {isMutedId && <p className="red-c">{t("AYDVAzA")}</p>}
        {!isMutedId && (isMutedComment || isMutedRoot) && (
          <p className="red-c">{t("AjbaFuf")}</p>
        )}
      </div>
    </div>
  );
};
