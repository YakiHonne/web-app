import React, { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import BookmarkEvent from "@/Components/BookmarkEvent";
import ShareLink, { SharingWindow } from "@/Components/ShareLink";
import { copyText, getLinkFromAddr } from "@/Helpers/Helpers";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import { useTranslation } from "react-i18next";
import useUserProfile from "@/Hooks/useUsersProfile";
import OptionsDropdown from "@/Components/OptionsDropdown";
import MobileSheet from "@/Components/MobileSheet";
import useIsMobile from "@/Hooks/useIsMobile";
import { nip19 } from "nostr-tools";
import dynamic from "next/dynamic";

const RawEventDisplay = dynamic(
  () => import("@/Components/ElementOptions/RawEventDisplay"),
  { ssr: false },
);
import useIsMute from "@/Hooks/useIsMute";
import AddArticleToCuration from "@/Components/AddArticleToCuration";
import PostAsNote from "@/Components/PostAsNote";
import ToDeleteGeneral from "@/Components/ToDeleteGeneral";
import AddVideo from "@/Components/AddVideo";
import AddCuration from "@/Components/AddCuration";
import LinkWallet from "@/Components/LinkWallet";
import { exportWallet, InitEvent, walletWarning } from "@/Helpers/Controlers";
import { decodeUrlOrAddress, encodeLud06 } from "@/Helpers/Encryptions";
import { setToPublish } from "@/Store/Slides/Publishers";
import DeleteWallet from "@/Components/DeleteWallet";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RelayImage from "../RelayImage";
import useIsPinnedNote from "@/Hooks/useIsPinnedNote";
import { removeEventStats } from "@/Helpers/DB";
import DatePicker from "../DatePicker";
import { publishScheduledEvent } from "@/Helpers/EventSchedulerHelper";
import Icon from "@/Components/Icon";

export default function EventOptions({
  event,
  component,
  border,
  refreshAfterDeletion,
  deleteTags = [],
}) {
  const { t } = useTranslation();
  const { userProfile } = useUserProfile(event.pubkey);
  const navigate = useRouter();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const { isMuted: isMutedPubkey, muteUnmute: muteUnmutePubkey } = useIsMute(
    event?.pubkey,
  );
  const { isMuted: isMutedId, muteUnmute: muteUnmuteId } = useIsMute(
    event?.id,
    "e",
  );
  const { isPinned, pinUnpin } = useIsPinnedNote(event?.id);

  const [showRawEvent, setShowRawEvent] = useState(false);
  const [showAddArticleToCuration, setShowArticleToCuration] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState(false);
  const [postToNote, setPostToNote] = useState(false);
  const [showEditVideo, setShowEditVideo] = useState(false);
  const [showEditCuration, setShowEditCuration] = useState(false);
  const [selectWalletToLink, setSelectWalletToLink] = useState(false);
  const [showDeletionWallet, setShowDeletionWallet] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(
    event.created_at,
  );
  const [showSharing, setShowSharing] = useState(false);

  const rawEvent = {
    id: event.id,
    pubkey: event.pubkey,
    created_at: event.created_at,
    kind: event.kind,
    tags: event.tags,
    content: event.content,
    sig: event.sig,
  };
  let path = getLinkFromAddr(
    event.naddr ||
    event.nEvent ||
    (event.pubkey && nip19.npubEncode(event.pubkey)),
    event.kind,
  );
  const postAsNote = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setPostToNote(event);
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="add-note" size={20} />
      <p>{t("AB8DnjO")}</p>
    </div>
  );
  const reschedule = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowDatePicker(event);
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="calendar" size={20} />
      <p>{t("A9x72MB")}</p>
    </div>
  );
  const copyID = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.naddr || event.nEvent, t("ARJICtS"));
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="hashtag" size={20} />
      <p>{t("AYFAFKs")}</p>
    </div>
  );
  const copyNaddr = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.naddr || event.nEvent, t("ApPw14o", { item: "naddr" }));
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="hashtag" size={20} />
      <p>{t("ApPw14o", { item: "naddr" })}</p>
    </div>
  );
  const copyPubkey = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(nip19.npubEncode(event.pubkey), t("AzSXXQm"));
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="key-icon" size={20} />
      <p>{t("AHrJpSX")} (npub)</p>
    </div>
  );
  const copyContent = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.content, t("Ae9XEnt"));
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="copy" size={20} />
      <p>{t("AUkCrth")}</p>
    </div>
  );
  const copyPubkeyHex = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.pubkey, t("AzSXXQm"));
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="key-icon" size={20} />
      <p>{t("AHrJpSX")} (hex)</p>
    </div>
  );

  const showRawEventContent = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowRawEvent(!showRawEvent);
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="raw-event" size={20} />
      <p>{t("AUrrk1e")}</p>
    </div>
  );

  const addToCuration = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowArticleToCuration(true);
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="curation-plus" size={20} />
      <p>{t("A89Qqmt")}</p>
    </div>
  );

  const copyNWC = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.data, t("A6Pj02S"));
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="copy" size={20} />
      <p>{t("Aoq0uKa")}</p>
    </div>
  );

  const copyAddress = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.entitle, t("ALR84Tq"));
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="copy" size={20} />
      <p>{t("ArCMp34")}</p>
    </div>
  );
  const broadcastEvent = <BroadcastEvent event={event} />;

  const exportOneWallet = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        exportWallet(event.data, event.entitle);
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="share-v2" size={20} />
      <p>{t("A4A5psW")}</p>
    </div>
  );

  const linkWalletWithUser = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelectWalletToLink(event.entitle);
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="link" size={20} />
      <span>{t("AmQVpu4")}</span>
    </div>
  );

  const removeWallet = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowDeletionWallet(true);
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <Icon name="trash" isColored size={20} />
      <span className="red-c">{t("AawdN9R")}</span>
    </div>
  );

  const checkWidgetValidity = (
    <Link
      className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      href={`/smart-widget-checker?naddr=${event.naddr}`}
    >
      <Icon name="smart-widget-checker" size={20} />
      <p>{t("AavUrQj")}</p>
    </Link>
  );

  const cloneWidget = (
    <Link
      className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      href={"/smart-widget-builder?clone=" + event.naddr}
      onClick={() => {
        localStorage.setItem(event.naddr, JSON.stringify(event));
      }}
    >
      <Icon name="clone" size={20} />
      <p>{t("AyWVBDx")}</p>
    </Link>
  );

  const editWidget = (
    <Link
      className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      href={"/smart-widget-builder?edit=" + event.naddr}
      onClick={() => {
        localStorage.setItem(event.naddr, JSON.stringify(event));
      }}
    >
      <Icon name="edit" size={20} />
      <p>{t("AsXohpb")}</p>
    </Link>
  );

  const editArticle = (
    <div
      className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      onClick={(e) => {
        e.stopPropagation();
        localStorage.setItem(
          "ArticleToEdit",
          JSON.stringify({
            post_pubkey: event.pubkey,
            post_id: event.id,
            post_kind: event.kind,
            post_title: event.title,
            post_desc: event.description,
            post_thumbnail: event.image,
            post_tags: event.items,
            post_d: event.d,
            post_content: event.content,
            post_published_at: event.published_at,
          }),
        );
        navigate.push("/write-article?edit=" + event.naddr);
      }}
    >
      <Icon name="edit" size={20} />
      <p>{t("AsXohpb")}</p>
    </div>
  );

  const publishNow = (
    <div
      className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      onClick={(e) => {
        e.stopPropagation();
        handleRescheduleEvent();
      }}
    >
      <Icon name="succeeded-events" size={20} />
      <p>{t("AxIOpkH")}</p>
    </div>
  );
  const editVideo = (
    <div
      className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      onClick={(e) => {
        e.stopPropagation();
        setShowEditVideo(true);
      }}
    >
      <Icon name="edit" size={20} />
      <p>{t("AsXohpb")}</p>
    </div>
  );
  const editCuration = (
    <div
      className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      onClick={(e) => {
        e.stopPropagation();
        setShowEditCuration(true);
      }}
    >
      <Icon name="edit" size={20} />
      <p>{t("AsXohpb")}</p>
    </div>
  );

  const repEventBookmark = (
    <div className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale">
      <BookmarkEvent label={t("A4ZQj8F")} pubkey={event.pubkey} d={event.d} />
    </div>
  );

  const noteBookmark = (
    <div className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale">
      <BookmarkEvent
        label={t("Ar5VgpT")}
        pubkey={event.id}
        kind={"1"}
        itemType="e"
      />
    </div>
  );

  const shareLink = (
    <div
      className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      onClick={(e) => { e.stopPropagation(); setShowSharing(true); }}
    >
      <Icon name="share-v2" size={20} />
      <p>{t("A6enIP3")}</p>
    </div>
  );

  const muteUser =
    userKeys && event.pubkey !== userKeys.pub ? (
      <div
        onClick={muteUnmutePubkey}
        className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      >
        {isMutedPubkey ? (
          <>
            <Icon name="unmute" size={20} />
            <p className="red-c">{t("AKELUbQ")}</p>
          </>
        ) : (
          <>
            <Icon name="mute" size={20} isColored />
            <p className="red-c">{t("AGMxuQ0")}</p>
          </>
        )}
      </div>
    ) : (
      ""
    );
  const pinNote =
    userKeys && event.pubkey === userKeys.pub ? (
      <div
        onClick={pinUnpin}
        className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      >
        {!isPinned ? (
          <>
            <Icon name="pin" size={20} />
            <p>{t("AZKwkIB")}</p>
          </>
        ) : (
          <>
            <Icon name="unpin" size={20} />
            <p>{t("AXGyCxz")}</p>
          </>
        )}
      </div>
    ) : (
      ""
    );
  const muteThread = userKeys ? (
    <div
      onClick={muteUnmuteId}
      className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
    >
      {isMutedId ? (
        <>
          <Icon name="unmute" size={20} />
          <p className="red-c">{t("AnddeNp")}</p>
        </>
      ) : (
        <>
          <Icon name="mute" size={20} isColored />
          <p className="red-c">{t("AydqZTl")}</p>
        </>
      )}
    </div>
  ) : (
    ""
  );

  const toDeleteEvent =
    userKeys && event.pubkey === userKeys.pub ? (
      <div
        className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
        onClick={(e) => {
          e.stopPropagation();
          setDeleteEvent(event);
        }}
      >
        <Icon name="trash" isColored size={20} />
        <p className="red-c">{t("Almq94P")}</p>
      </div>
    ) : (
      ""
    );

  const HR = <hr style={{ margin: "4px 0", padding: "0 5px" }} />;

  const getOptionsItem = () => {
    switch (component) {
      case "user":
        return [copyPubkey, copyPubkeyHex, shareLink, HR, muteUser];
      case "notes":
        return [
          copyID,
          copyPubkey,
          copyContent,
          pinNote,
          showRawEventContent,
          broadcastEvent,
          noteBookmark,
          shareLink,
          HR,
          muteThread,
          muteUser,
          toDeleteEvent,
        ];
      case "media":
        return [
          copyID,
          copyPubkey,
          showRawEventContent,
          broadcastEvent,
          shareLink,
          HR,
          muteThread,
          muteUser,
        ];
      case "repEvents":
        return [
          postAsNote,
          copyNaddr,
          copyPubkey,
          showRawEventContent,
          broadcastEvent,
          addToCuration,
          repEventBookmark,
          shareLink,
          HR,
          muteUser,
        ];
      case "repEventsCard":
        return [
          postAsNote,
          event.kind >= 30000 ? copyNaddr : copyID,
          copyPubkey,
          showRawEventContent,
          broadcastEvent,
          repEventBookmark,
          shareLink,
          HR,
          muteUser,
        ];
      case "dashboardNotes":
        return [
          copyID,
          copyContent,
          showRawEventContent,
          broadcastEvent,
          shareLink,
          toDeleteEvent,
        ];
      case "dashboardSchedule":
        return [publishNow, reschedule, toDeleteEvent];
      case "dashboardSW":
        return [
          postAsNote,
          copyNaddr,
          showRawEventContent,
          broadcastEvent,
          cloneWidget,
          checkWidgetValidity,
          editWidget,
          shareLink,
          HR,
          toDeleteEvent,
        ];
      case "dashboardArticles":
        return [
          postAsNote,
          copyNaddr,
          showRawEventContent,
          broadcastEvent,
          editArticle,
          shareLink,
          HR,
          toDeleteEvent,
        ];
      case "dashboardArticlesDraft":
        return [showRawEventContent, editArticle, HR, toDeleteEvent];
      case "dashboardVideos":
        return [
          postAsNote,
          copyNaddr,
          showRawEventContent,
          broadcastEvent,
          editVideo,
          shareLink,
          HR,
          toDeleteEvent,
        ];
      case "dashboardPictures":
        return [
          copyID,
          showRawEventContent,
          broadcastEvent,
          shareLink,
          HR,
          toDeleteEvent,
        ];
      case "dashboardCuration":
        return [
          postAsNote,
          copyNaddr,
          showRawEventContent,
          broadcastEvent,
          editCuration,
          shareLink,
          HR,
          toDeleteEvent,
        ];
      case "wallet":
        return [
          !checkIsLinked(event.entitle) && linkWalletWithUser,
          event.kind === 3 && copyNWC,
          event.kind !== 1 && copyAddress,
          exportOneWallet,
          HR,
          removeWallet,
        ];
    }
  };

  const refreshAfterDeletion_ = () => {
    setDeleteEvent(false);
    refreshAfterDeletion(event.id);
    if (event.kind === 1) {
      let isComment = event.isComment;
      let isRoot = event.rootData?.length > 0 ? event.rootData[1] : false;
      if (isComment) removeEventStats(isComment, event.id, "replies");
      if (isRoot) removeEventStats(isRoot, event.id, "replies");
    }
  };

  const linkWallet = async () => {
    if (!selectWalletToLink.includes("@")) {
      walletWarning();
      return;
    }
    let content = { ...userMetadata };
    content.lud16 = selectWalletToLink;
    content.lud06 = encodeLud06(selectWalletToLink);

    let eventInitExt = await InitEvent(0, JSON.stringify(content), []);

    if (!eventInitExt) {
      setSelectWalletToLink(false);
      return;
    }
    dispatch(
      setToPublish({
        userKeys: userKeys,
        kind: 0,
        content: JSON.stringify(content),
        tags: [],
      }),
    );
    setSelectWalletToLink(false);
  };

  const checkIsLinked = (addr) => {
    if (userMetadata) {
      if (!(userMetadata.lud16 && userMetadata.lud06)) return false;
      if (userMetadata.lud16 && userMetadata.lud16 === addr) return true;
      if (userMetadata.lud06) {
        let decoded = decodeUrlOrAddress(userMetadata.lud06);
        if (decoded && decoded === addr) return true;
      }
      return false;
    }
  };

  const handleDeleteWallet = (e) => {
    e?.stopPropagation();
    try {
      let wallets = getWallets();
      let tempWallets = wallets.filter((wallet) => wallet.id !== event.id);
      if (tempWallets.length > 0 && event.active) {
        tempWallets[0].active = true;
        setShowDeletionWallet(false);
        updateWallets(tempWallets);
        refreshAfterDeletion(tempWallets);
        return;
      }

      setShowDeletionWallet(false);
      updateWallets(tempWallets);
      refreshAfterDeletion(tempWallets);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRescheduleEvent = async (rescheduleDate) => {
    if (rescheduleDate) setSelectedScheduleDate(rescheduleDate);
    let deleteEventTags = [["e", event.id], ...deleteTags];
    let eventDelInitEx = await InitEvent(5, "Reschedule job", deleteEventTags);
    if (!eventDelInitEx) {
      setIsLoading(false);
      return;
    }
    dispatch(
      setToPublish({
        eventInitEx: eventDelInitEx,
        allRelays: event.relays,
      }),
    );
    let dateToPublish = rescheduleDate || Math.ceil(Date.now() / 1000);
    let eventInitEx = await InitEvent(
      1,
      event.content,
      event.tags,
      dateToPublish,
    );

    if (!eventInitEx) {
      setIsLoading(false);
      return;
    }
    if (rescheduleDate) {
      let status = await publishScheduledEvent({
        event: eventInitEx,
        relays: event.relays,
      });
      if (status) refreshAfterDeletion();
      return;
    }
    dispatch(
      setToPublish({
        eventInitEx: eventInitEx,
        allRelays: event.relays,
      }),
    );
    refreshAfterDeletion();
  };

  const optionsItem = getOptionsItem();

  return (
    <>
      {showSharing && (
        <SharingWindow
          path={path}
          title={event.title || userProfile.display_name || userProfile.name}
          description={event.description || event.about || event.content || ""}
          exit={() => setShowSharing(false)}
        />
      )}
      {showEditVideo && (
        <AddVideo exit={() => setShowEditVideo(false)} event={event} />
      )}
      {showEditCuration && (
        <AddCuration exit={() => setShowEditCuration(false)} event={event} />
      )}
      {showAddArticleToCuration && (
        <AddArticleToCuration
          d={event.naddr}
          exit={() => setShowArticleToCuration(false)}
          kind={event.kind}
        />
      )}
      {postToNote !== false && (
        <PostAsNote
          exit={() => setPostToNote(false)}
          content={typeof postToNote === "string" ? postToNote : ""}
          linkedEvent={typeof postToNote !== "string" ? postToNote : ""}
        />
      )}
      {deleteEvent && (
        <ToDeleteGeneral
          eventId={event.id}
          title={event.title}
          kind={event.kind}
          refresh={refreshAfterDeletion_}
          cancel={() => setDeleteEvent(false)}
          aTag={event.aTag}
          tags={deleteTags}
        />
      )}
      {showRawEvent && (
        <RawEventDisplay event={rawEvent} exit={() => setShowRawEvent(false)} />
      )}
      {selectWalletToLink && (
        <LinkWallet
          exit={() => setSelectWalletToLink(false)}
          handleLinkWallet={linkWallet}
        />
      )}
      {showDatePicker && (
        <DatePicker
          close={() => setShowDatePicker(false)}
          remove={false}
          selected={selectedScheduleDate}
          onSelect={(data) => {
            setShowDatePicker(false);
            handleRescheduleEvent(data);
          }}
        />
      )}
      {showDeletionWallet && (
        <DeleteWallet
          exit={(e) => {
            e.stopPropagation();
            setShowDeletionWallet(false);
          }}
          handleDelete={handleDeleteWallet}
          wallet={event}
        />
      )}
      {!(
        showDeletionWallet ||
        showEditVideo ||
        showEditCuration ||
        showAddArticleToCuration ||
        postToNote ||
        deleteEvent ||
        showRawEvent
      ) && (
          <OptionsDropdown
            options={optionsItem}
            border={border}
            minWidth={180}
            vertical={false}
          />
        )}
    </>
  );
}

const BroadcastEvent = ({ event }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userRelays = useSelector((state) => state.userRelays);
  const userKeys = useSelector((state) => state.userKeys);
  const isProtected = event.isProtected && userKeys.pub !== event.pubkey;
  const userFavRelays = useSelector((state) => state.userFavRelays);
  const [showRelays, setShowRelays] = useState(false);
  const [subPos, setSubPos] = useState(null);
  const hideTimeout = useRef(null);
  const rowRef = useRef(null);
  const isMobile = useIsMobile();

  const allRelays = useMemo(() => {
    return [...new Set([...userRelays, ...(userFavRelays?.relays || [])])];
  }, [userRelays, userFavRelays]);

  const handleRepublish = async (relay) => {
    let rawEvent = {
      id: event.id,
      pubkey: event.pubkey,
      created_at: event.created_at,
      kind: event.kind,
      tags: event.tags,
      content: event.content,
      sig: event.sig,
    };
    dispatch(setToPublish({ eventInitEx: rawEvent, allRelays: [relay] }));
    setShowRelays(false);
  };

  const updateSubPos = () => {
    if (rowRef.current) {
      const r = rowRef.current.getBoundingClientRect();
      setSubPos({ top: r.top + r.height / 2, right: window.innerWidth - r.left + 6 });
    }
  };

  const handleMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(hideTimeout.current);
    updateSubPos();
    setShowRelays(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    hideTimeout.current = setTimeout(() => setShowRelays(false), 150);
  };

  if (allRelays.length === 0) return null;

  const relaysContent = isProtected ? (
    <div className="fx-centered fx-col box-pad-h-s box-pad-v-m">
      <Icon name="protected-2" size={20} />
      <p className="gray-c p-centered">{t("AqqpEOw")}</p>
    </div>
  ) : (
    <>
      <p className="gray-c box-pad-h-s box-pad-v-s">{t("AZjgE2A")}</p>
      {userFavRelays?.relays.map((_) => (
        <div
          key={_}
          className="fx-shrink fx-centered fx-start-h box-pad-v-s box-pad-h-s option-no-scale fit-container"
          onClick={() => handleRepublish(_)}
        >
          <div style={{ position: "relative" }}>
            <RelayImage url={_} size={30} />
            <div style={{ position: "absolute", right: "-10px", bottom: "-10px", zIndex: 10, scale: ".65" }}>
              <div className="round-icon-small round-icon-tooltip" data-tooltip={t("Ay0vA4Z")} style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "none" }}>
                <Icon name="star" size={20} />
              </div>
            </div>
          </div>
          <p className="p-one-line">{_}</p>
        </div>
      ))}
      {userRelays.map((_) =>
        !userFavRelays?.relays.includes(_) ? (
          <div
            key={_}
            className="fx-shrink fx-centered fx-start-h box-pad-v-s box-pad-h-s option-no-scale fit-container"
            onClick={() => handleRepublish(_)}
          >
            <RelayImage url={_} size={30} />
            <p className="p-one-line">{_}</p>
          </div>
        ) : null
      )}
    </>
  );

  return (
    <div
      ref={rowRef}
      style={{ cursor: isProtected ? "not-allowed" : "pointer" }}
      className="pointer fx-scattered fit-container box-pad-h-s box-pad-v-s option-no-scale"
      onClick={(e) => {
        e.stopPropagation();
        if (showRelays) { setShowRelays(false); return; }
        updateSubPos();
        setShowRelays(true);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="fx-centered">
        <Icon name="republish" size={20} />
        <p className={isProtected ? "gray-c" : ""}>{t("AHhMsNx")}</p>
      </div>
      <Icon name="arrow" />

      {isMobile ? (
        <MobileSheet open={showRelays} onClose={() => setShowRelays(false)} title={t("AHhMsNx")}>
          <div className="fx-centered fx-col fx-start-h fx-start-v" style={{ padding: "0 8px" }}>
            {relaysContent}
          </div>
        </MobileSheet>
      ) : (
        showRelays && subPos && typeof document !== "undefined" && createPortal(
          <div
            data-dropdown-submenu
            style={{
              position: "fixed",
              top: subPos.top,
              right: subPos.right,
              transform: "translateY(-50%)",
              minWidth: "220px",
              maxHeight: "400px",
              overflowY: "auto",
              zIndex: 9999999,
              borderRadius: "16px",
            }}
            className="fx-centered fx-col fx-start-h fx-start-v bg-dropdown box-pad-h-s box-pad-v-s dynamic-island-dropdown"
            onMouseEnter={() => clearTimeout(hideTimeout.current)}
            onMouseLeave={handleMouseLeave}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {relaysContent}
          </div>,
          document.body
        )
      )}
    </div>
  );
};
