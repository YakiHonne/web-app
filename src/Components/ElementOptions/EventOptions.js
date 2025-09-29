import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BookmarkEvent from "@/Components/BookmarkEvent";
import ShareLink from "@/Components/ShareLink";
import { copyText, getLinkFromAddr } from "@/Helpers/Helpers";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import { useTranslation } from "react-i18next";
import useUserProfile from "@/Hooks/useUsersProfile";
import OptionsDropdown from "@/Components/OptionsDropdown";
import { nip19 } from "nostr-tools";
import RawEventDisplay from "@/Components/ElementOptions/RawEventDisplay";
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

export default function EventOptions({
  event,
  eventActions,
  component,
  border,
  refreshAfterDeletion,
}) {
  const { t } = useTranslation();
  const { userProfile } = useUserProfile(event.pubkey);
  const navigate = useRouter();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const { muteUnmute, isMuted } = useIsMute(event.pubkey);
  const [showRawEvent, setShowRawEvent] = useState(false);
  const [showAddArticleToCuration, setShowArticleToCuration] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState(false);
  const [postToNote, setPostToNote] = useState(false);
  const [showEditVideo, setShowEditVideo] = useState(false);
  const [showEditCuration, setShowEditCuration] = useState(false);
  const [selectWalletToLink, setSelectWalletToLink] = useState(false);
  const [showDeletionWallet, setShowDeletionWallet] = useState(false);

  const rawEvent = {
    id: event.id,
    pubkey: event.pubkey,
    created_at: event.created_at,
    kind: event.kind,
    tags: event.tags,
    content: event.content,
    sig: event.sig,
  };

  let path = window.location.pathname;

  const postAsNote = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setPostToNote(event);
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <div className="add-note-24"></div>
      <p>{t("AB8DnjO")}</p>
    </div>
  );
  const copyID = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.nEvent, t("ARJICtS"));
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <div className="hashtag-24"></div>
      <p>{t("AYFAFKs")}</p>
    </div>
  );
  const copyNaddr = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.naddr, t("ApPw14o", { item: "naddr" }));
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <div className="hashtag-24"></div>
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
      <div className="key-icon-24"></div>
      <p>{t("AHrJpSX")}</p>
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
      <div className="pub-hex-24"></div>
      <p>{t("AHrJpSX")}</p>
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
      <div className="raw-event-24"></div>
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
      <div className="curation-plus-24"></div>
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
      <div className="copy-24"></div>
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
      <div className="copy-24"></div>
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
      <div className="share-icon-24"></div>
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
      <div className="link-24"></div>
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
      <div className="trash-24"></div>
      <span className="red-c">{t("AawdN9R")}</span>
    </div>
  );

  const checkWidgetValidity = (
    <Link
      className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      href={`/smart-widget-checker?naddr=${event.naddr}`}
    >
      <div className="smart-widget-checker-24"></div>
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
      <div className="clone-24"></div>
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
      <div className="edit-24"></div>
      <p>{t("AsXohpb")}</p>
    </Link>
  );

  const editArticle = (
    <div
      className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      onClick={(e) => {
        e.stopPropagation();
        localStorage.setItem(
          event.naddr,
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
          })
        );
        navigate.push("/write-article?edit=" + event.naddr);
      }}
    >
      <div className="edit-24"></div>
      <p>{t("AsXohpb")}</p>
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
      <div className="edit-24"></div>
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
      <div className="edit-24"></div>
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
    <div className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale">
      <ShareLink
        label={t("A6enIP3")}
        title={event.title || userProfile.display_name || userProfile.name}
        description={event.description || event.about || event.content || ""}
        path={path}
        kind={event.kind}
        shareImgData={{
          post: event,
          author: userProfile,
          likes: eventActions ? eventActions.likes.likes.length : null,
          label: t("Az5ftet"),
        }}
      />
    </div>
  );

  const muteUser =
    event.pubkey !== userKeys.pub ? (
      <div
        onClick={muteUnmute}
        className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      >
        {isMuted ? (
          <>
            <div className="unmute-24"></div>
            <p className="red-c">{t("AKELUbQ")}</p>
          </>
        ) : (
          <>
            <div className="mute-24"></div>
            <p className="red-c">{t("AGMxuQ0")}</p>
          </>
        )}
      </div>
    ) : (
      ""
    );

  const toDeleteEvent = (
    <div
      className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
      onClick={(e) => {
        e.stopPropagation();
        setDeleteEvent(event);
      }}
    >
      <div className="trash-24"></div>
      <p className="red-c">{t("Almq94P")}</p>
    </div>
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
          showRawEventContent,
          broadcastEvent,
          noteBookmark,
          shareLink,
          HR,
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
          copyNaddr,
          copyPubkey,
          showRawEventContent,
          broadcastEvent,
          repEventBookmark,
          shareLink,
          HR,
          muteUser,
        ];
      case "dashboardNotes":
        return [copyID, showRawEventContent, broadcastEvent, shareLink];
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
      })
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

  const optionsItem = getOptionsItem();

  return (
    <>
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
      <OptionsDropdown
        options={optionsItem}
        border={border}
        minWidth={180}
        vertical={false}
      />
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
    dispatch(
      setToPublish({
        eventInitEx: rawEvent,
        allRelays: [relay],
      })
    );
    setShowRelays(false);
  };

  if (allRelays.length === 0) return null;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowRelays(!showRelays);
      }}
      style={{
        position: "relative",
        cursor: isProtected ? "not-allowed" : "pointer",
      }}
      className="pointer fx-scattered fit-container box-pad-h-s box-pad-v-s option-no-scale"
      onMouseEnter={() => setShowRelays(true)}
      onMouseLeave={() => setShowRelays(false)}
    >
      {showRelays && !isProtected && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "-5px",
            minWidth: "max-content",
            transform: "translate(-100%, -50%)",
            maxHeight: "400px",
            overflow: "scroll",
            gap: 0,
          }}
          onMouseLeave={() => setShowRelays(false)}
          className=" fx-centered fx-col fx-start-h fx-start-v sc-s-18  box-pad-h-s box-pad-v-s"
        >
          <p className="gray-c box-pad-h-s box-pad-v-s">{t("AZjgE2A")}</p>
          {allRelays.map((_) => {
            return (
              <div
                key={_}
                className="fx-shrink  fx-centered fx-start-h box-pad-v-s box-pad-h-s option-no-scale fit-container"
                onClick={() => handleRepublish(_)}
              >
                <RelayImage url={_} />
                <p className="p-one-line">{_}</p>
              </div>
            );
          })}
        </div>
      )}
      {showRelays && isProtected && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "-5px",
            width: "200px",
            transform: "translate(-100%, -50%)",
            maxHeight: "600px",
            overflow: "scroll",
            gap: 0,
          }}
          onMouseLeave={() => setShowRelays(false)}
          className=" fx-centered fx-col fx-start-h fx-start-v sc-s-18 bg-sp box-pad-h-s box-pad-v-m"
        >
          <div className="fx-centered fx-centered fx-col">
            <div className="protected-2-24"></div>
            <p className="gray-c p-centered">{t("AqqpEOw")}</p>
          </div>
        </div>
      )}
      <div className="fx-centered">
        <div
          className="republish-24"
          style={{ opacity: isProtected ? 0.5 : 1 }}
        ></div>
        <p className={isProtected ? "gray-c" : ""}>{t("AHhMsNx")}</p>
      </div>
      <div
        className="arrow"
        style={{ rotate: "-90deg", opacity: isProtected ? 0.5 : 1 }}
      ></div>
    </div>
  );
};
