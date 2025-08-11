import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BookmarkEvent from "@/Components/BookmarkEvent";
import ShareLink from "@/Components/ShareLink";
import {
  copyText,
  getLinkFromAddr,
} from "@/Helpers/Helpers";
import {
  getWallets,
  updateWallets,
} from "@/Helpers/ClientHelpers";
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
import { InitEvent, walletWarning } from "@/Helpers/Controlers";
import { decodeUrlOrAddress, encodeLud06 } from "@/Helpers/Encryptions";
import { setToPublish } from "@/Store/Slides/Publishers";
import DeleteWallet from "@/Components/DeleteWallet";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  let path = getLinkFromAddr(
    event.nEvent || event.naddr || event.pubkey
      ? nip19.npubEncode(event.pubkey)
      : ""
  );

  const postAsNote = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setPostToNote(event);
      }}
      className="pointer fx-scattered fit-container"
    >
      <p>{t("AB8DnjO")}</p>
      <div className="add-note"></div>
    </div>
  );
  const copyID = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.nEvent, t("ARJICtS"));
      }}
      className="pointer fx-scattered fit-container"
    >
      <p>{t("AYFAFKs")}</p>
      <div className="hashtag"></div>
    </div>
  );
  const copyNaddr = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.naddr, t("ApPw14o", { item: "naddr" }));
      }}
      className="pointer fx-scattered fit-container"
    >
      <p>{t("ApPw14o", { item: "naddr" })}</p>
      <div className="hashtag"></div>
    </div>
  );
  const copyPubkey = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(nip19.npubEncode(event.pubkey), t("AzSXXQm"));
      }}
      className="pointer fx-scattered fit-container"
    >
      <p>{t("AHrJpSX")}</p>
      <div className="key-icon"></div>
    </div>
  );
  const copyPubkeyHex = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.pubkey, t("AzSXXQm"));
      }}
      className="pointer fx-scattered fit-container"
    >
      <p>{t("AHrJpSX")}</p>
      <div className="pub-hex-24"></div>
    </div>
  );

  const showRawEventContent = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowRawEvent(!showRawEvent);
      }}
      className="pointer fx-scattered fit-container"
    >
      <p>{t("AUrrk1e")}</p>
      <div className="raw-event"></div>
    </div>
  );

  const addToCuration = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowArticleToCuration(true);
      }}
      className="fit-container fx-scattered pointer"
    >
      <p>{t("A89Qqmt")}</p>
      <div className="curation-plus"></div>
    </div>
  );

  const copyNWC = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.data, t("A6Pj02S"));
      }}
      className="fit-container fx-scattered pointer"
    >
      <p>{t("Aoq0uKa")}</p>
      <div className="copy"></div>
    </div>
  );

  const copyAddress = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        copyText(event.entitle, t("ALR84Tq"));
      }}
      className="fit-container fx-scattered pointer"
    >
      <p>{t("ArCMp34")}</p>
      <div className="copy"></div>
    </div>
  );

  const exportWallet = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        exportWallet(event.data, event.entitle);
      }}
      className="fit-container fx-scattered pointer"
    >
      <p>{t("A4A5psW")}</p>
      <div className="share-icon"></div>
    </div>
  );

  const linkWalletWithUser = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelectWalletToLink(event.entitle);
      }}
      className="fit-container fx-scattered pointer"
    >
      <span>{t("AmQVpu4")}</span>
      <div className="link"></div>
    </div>
  );

  const removeWallet = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowDeletionWallet(true);
      }}
      className="fit-container fx-scattered pointer"
    >
      <span className="red-c">{t("AawdN9R")}</span>
      <div className="trash"></div>
    </div>
  );

  const checkWidgetValidity = (
    <Link
      className="fit-container fx-scattered"
      href={`/smart-widget-checker?naddr=${event.naddr}`}
    >
      <p>{t("AavUrQj")}</p>
      <div className="smart-widget-checker"></div>
    </Link>
  );

  const cloneWidget = (
    <Link
      className="fit-container fx-scattered"
      href={"/smart-widget-builder"}
      state={{
        ops: "clone",
        metadata: { ...event },
      }}
    >
      <p>{t("AyWVBDx")}</p>
      <div className="clone"></div>
    </Link>
  );

  const editWidget = (
    <Link
      className="fit-container fx-scattered"
      href={"/smart-widget-builder"}
      state={{
        ops: "edit",
        metadata: {
          ...event,
        },
      }}
    >
      <p>{t("AsXohpb")}</p>
      <div className="edit"></div>
    </Link>
  );

  const editArticle = (
    <div
      className="fit-container fx-scattered pointer"
      onClick={(e) => {
        e.stopPropagation();
        navigate.push("/write-article", {
          state: {
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
          },
        });
      }}
    >
      <p>{t("AsXohpb")}</p>
      <div className="edit"></div>
    </div>
  );

  const editVideo = (
    <div
      className="fit-container  fx-scattered pointer"
      onClick={(e) => {
        e.stopPropagation();
        setShowEditVideo(true);
      }}
    >
      <p>{t("AsXohpb")}</p>
      <div className="edit"></div>
    </div>
  );
  const editCuration = (
    <div
      className="fit-container fx-scattered pointer"
      onClick={(e) => {
        e.stopPropagation();
        setShowEditCuration(true);
      }}
    >
      <p>{t("AsXohpb")}</p>
      <div className="edit"></div>
    </div>
  );

  const repEventBookmark = (
    <BookmarkEvent label={t("A4ZQj8F")} pubkey={event.pubkey} d={event.d} />
  );

  const noteBookmark = (
    <BookmarkEvent
      label={t("Ar5VgpT")}
      pubkey={event.id}
      kind={"1"}
      itemType="e"
    />
  );

  const shareLink = (
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
  );

  const muteUser =
    event.pubkey !== userKeys.pub ? (
      <div onClick={muteUnmute} className="pointer fit-container fx-scattered">
        {isMuted ? (
          <>
            <p className="red-c">{t("AKELUbQ")}</p>
            <div className="unmute"></div>
          </>
        ) : (
          <>
            <p className="red-c">{t("AGMxuQ0")}</p>
            <div className="mute"></div>
          </>
        )}
      </div>
    ) : (
      ""
    );

  const toDeleteEvent = (
    <div
      className="fit-container fx-scattered pointer"
      onClick={(e) => {
        e.stopPropagation();
        setDeleteEvent(event);
      }}
    >
      <p className="red-c">{t("Almq94P")}</p>
      <div className="trash"></div>
    </div>
  );

  const getOptionsItem = () => {
    switch (component) {
      case "user":
        return [copyPubkey, copyPubkeyHex, shareLink, muteUser];
      case "notes":
        return [
          copyID,
          copyPubkey,
          showRawEventContent,
          noteBookmark,
          shareLink,
          muteUser,
        ];
      case "repEvents":
        return [
          postAsNote,
          copyNaddr,
          copyPubkey,
          showRawEventContent,
          addToCuration,
          repEventBookmark,
          shareLink,
          muteUser,
        ];
      case "repEventsCard":
        return [
          postAsNote,
          copyNaddr,
          copyPubkey,
          showRawEventContent,
          repEventBookmark,
          shareLink,
          muteUser,
        ];
      case "dashboardNotes":
        return [copyID, showRawEventContent, shareLink];
      case "dashboardSW":
        return [
          postAsNote,
          copyNaddr,
          showRawEventContent,
          cloneWidget,
          checkWidgetValidity,
          editWidget,
          shareLink,
          toDeleteEvent,
        ];
      case "dashboardArticles":
        return [
          postAsNote,
          copyNaddr,
          showRawEventContent,
          editArticle,
          shareLink,
          toDeleteEvent,
        ];
      case "dashboardArticlesDraft":
        return [showRawEventContent, editArticle, toDeleteEvent];
      case "dashboardVideos":
        return [
          postAsNote,
          copyNaddr,
          showRawEventContent,
          editVideo,
          shareLink,
          toDeleteEvent,
        ];
      case "dashboardCuration":
        return [
          postAsNote,
          copyNaddr,
          showRawEventContent,
          editCuration,
          shareLink,
          toDeleteEvent,
        ];
      case "wallet":
        return [
          !checkIsLinked(event.entitle) && linkWalletWithUser,
          event.kind === 3 && copyNWC,
          event.kind !== 1 && copyAddress,
          exportWallet,
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
      <OptionsDropdown options={optionsItem} border={border} minWidth={180} />
    </>
  );
}
