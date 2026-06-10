import React, { useEffect, useMemo, useRef, useState } from "react";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import Date_ from "@/Components/Date_";
import { useSelector } from "react-redux";
import { getUser } from "@/Helpers/Controlers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import Link from "next/link";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import Spinner from "@/Components/Spinner";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import Zap from "@/Components/Reactions/Zap";
import useNoteStats from "@/Hooks/useNoteStats";
import UsersGroupProfilePicture from "./UsersGroupProfilePicture";
import { checkEventType } from "@/Helpers/NotificationsHelpers";
import useNotifications from "@/Hooks/useNotifications";
import OptionsDropdown from "./OptionsDropdown";
import { Virtuoso } from "react-virtuoso";
import {
  getEventFromCache,
  setEventFromCache,
} from "@/Helpers/utils/eventsCache";
import Icon from "@/Components/Icon";
import { iconsNames } from "@/Content/IconV2URL";
import { createPortal } from "react-dom";

export default function NotificationCenterMain() {
  const {
    notifications,
    isNotificationsLoading,
    notReadNotifications,
    notificationSettings,
    newNotifications,
    refreshNotifications,
    handleReadAll,
    handleUnreadAll,
    handleRead,
    handleUnRead,
    addNewEvents,
  } = useNotifications();
  const { t } = useTranslation();
  const [contentFromIndex, setContentFromIndex] = useState(0);
  const [contentFrom, setContentFrom] = useState("all");
  const notificationsRef = useRef(null);
  const barRef = useRef(null);
  const lastY = useRef(0);
  const [barHidden, setBarHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setBarHidden(y > lastY.current && y > 80);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const notificationsTypes = [
    t("AR9ctVs"),
    t("A8Da0of"),
    t("AENEcn9"),
    "Zaps",
    t("A9TqNxQ"),
  ];
  const notificationsTypesKeys = [
    "all",
    "mentions",
    "replies",
    "zaps",
    "following",
  ];

  const filteredNotifications = useMemo(() => {
    return notifications.filter((_) => {
      if (contentFrom === "all") return true;
      return _.type.type === contentFrom;
    });
  }, [notifications, contentFrom]);

  const switchContentSource = (index) => {
    if (index === contentFromIndex) return;
    setContentFromIndex(index);
    setContentFrom(notificationsTypesKeys[index]);
    notificationsRef.current?.scrollToIndex({
      top: 32,
      align: "start",
      behavior: "instant",
    });
  };

  const handleRefreshNotifications = () => {
    refreshNotifications();
    notificationsRef.current?.scrollToIndex({
      top: 32,
      align: "start",
      behavior: "instant",
    });
  };

  return (
    <>
      <div
        style={{ height: "100%", gap: 0, position: "relative" }}
        className="fit-container fx-centered fx-col fx-start-h fx-start-v"
        onClick={(e) => e.stopPropagation()}
      >
        {newNotifications.length > 0 && (
          <div
            className="fx-centered slide-down"
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              top: !barHidden ? "155px" : "56px",
              zIndex: 201,
              pointerEvents: "none",
              transition: "top 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              className="sc-s box-pad-h-s box-pad-v-s fx-scattered pointer"
              style={{ backgroundColor: "var(--c1)", border: "none", gap: "10px", pointerEvents: "auto" }}
              onClick={addNewEvents}
            >
              <UsersGroupProfilePicture
                pubkeys={[...new Set(newNotifications.map((note) => note.pubkey))].slice(0, 3)}
              />
              <div className="fx-centered" style={{ minWidth: "max-content", gap: "0" }}>
                <p className="white-c">{t("AV9Dfnw", { count: newNotifications.length })}</p>
                <p className="white-c box-pad-h-s">&#8593;</p>
              </div>
            </div>
          </div>
        )}

        <div ref={barRef} className={`uplift-filter-bar${barHidden ? " uplift-filter-bar-hidden" : ""}${isNotificationsLoading ? " uplift-filter-bar-loading" : ""}`}>
          <NotifTypeSelector
            barRef={barRef}
            types={notificationsTypes}
            selectedIndex={contentFromIndex}
            onSelect={switchContentSource}
          />
          <NotifOptionsButton
            barRef={barRef}
            isLoading={isNotificationsLoading}
            notReadNotifications={notReadNotifications}
            onRefresh={handleRefreshNotifications}
            onReadAll={handleReadAll}
            onUnreadAll={handleUnreadAll}
          />
        </div>


        {filteredNotifications.length > 0 && (
          <Virtuoso
            style={{ width: "100%", height: "100vh" }}
            useWindowScroll={true}
            totalCount={filteredNotifications.length}
            increaseViewportBy={200}
            overscan={200}
            skipAnimationFrameInResizeObserver={true}
            ref={notificationsRef}
            itemContent={(index) => {
              let event = filteredNotifications[index];
              return (
                <div className="fit-container" style={{ marginBottom: ".5rem" }} key={event.id}>
                  <Notification
                    event={event}
                    filterByType={contentFrom !== "all" ? contentFrom : ""}
                    handleRead={() => handleRead(index)}
                    handleUnRead={() => handleUnRead(index)}
                  />
                </div>
              );
            }}
          />
        )}
        {notificationSettings[
          ["mentions", "replies"].includes(contentFrom)
            ? "mentions"
            : contentFrom
        ] && <ActivateNotification />}
        {isNotificationsLoading && filteredNotifications.length === 0 && (
          <div className="fx-centered fit-container" style={{ height: "70vh" }}>
            <Spinner size={32} />
          </div>
        )}
      </div>
    </>
  );
}

function NotifPortalPanel({ barRef, triggerRef, dismissing, onClose, children }) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!barRef?.current) return;
    const bar = barRef.current.getBoundingClientRect();
    setPos({ top: bar.bottom + 6, centerX: bar.left + bar.width / 2 });
  }, [barRef]);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, triggerRef]);

  if (!pos) return null;

  return createPortal(
    <div style={{ position: "fixed", top: pos.top, left: pos.centerX, transform: "translateX(-50%)", width: "300px", zIndex: 99999 }}>
      <div ref={panelRef} className={`bg-dropdown di-wrapper${dismissing ? " dismissing" : ""}`} style={{ maxHeight: "60vh", overflowY: "auto", overflowX: "hidden", borderRadius: "16px", padding: ".25rem .45rem" }}>
        {children}
      </div>
    </div>,
    document.body
  );
}

function NotifTypeSelector({ barRef, types, selectedIndex, onSelect }) {
  const [open, setOpen] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const triggerRef = useRef(null);

  const close = () => {
    setDismissing(true);
    setTimeout(() => { setOpen(false); setDismissing(false); }, 220);
  };

  return (
    <div ref={triggerRef}>
      <div
        className="fx-scattered if pointer"
        style={{ height: "40px", padding: "0 .5rem", border: "none" }}
        onClick={(e) => { e.stopPropagation(); open ? close() : setOpen(true); }}
      >
        <p style={{ whiteSpace: "nowrap" }}>{types[selectedIndex]}</p>
        <Icon name="arrow" />
      </div>
      {open && (
        <NotifPortalPanel barRef={barRef} triggerRef={triggerRef} dismissing={dismissing} onClose={close}>
          {types.map((label, index) => (
            <div
              key={index}
              className="pointer fit-container box-pad-h-s box-pad-v-s fx-scattered option-no-scale"
              style={{ borderRadius: "var(--border-r-18)" }}
              onClick={(e) => { e.stopPropagation(); onSelect(index); close(); }}
            >
              <p>{label}</p>
              {selectedIndex === index && <Icon name="check" size={24} />}
            </div>
          ))}
        </NotifPortalPanel>
      )}
    </div>
  );
}

function NotifOptionsButton({ barRef, isLoading, notReadNotifications, onRefresh, onReadAll, onUnreadAll }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const triggerRef = useRef(null);

  const close = () => {
    setDismissing(true);
    setTimeout(() => { setOpen(false); setDismissing(false); }, 220);
  };

  return (
    <div ref={triggerRef}>
      <div
        className={`fx-centered if option pointer${isLoading ? " if-disabled" : ""}`}
        style={{ height: "40px", width: "40px", borderRadius: "50px", border: "none" }}
        onClick={(e) => { e.stopPropagation(); open ? close() : setOpen(true); }}
      >
        <Icon v={2} name={iconsNames.more_vertical} size={20} opacity=".5" />
      </div>
      {open && (
        <NotifPortalPanel barRef={barRef} triggerRef={triggerRef} dismissing={dismissing} onClose={close}>
          <div
            className="pointer fit-container box-pad-h-s box-pad-v-s fx-centered fx-start-h option-no-scale"
            style={{ borderRadius: "var(--border-r-18)" }}
            onClick={(e) => { e.stopPropagation(); onRefresh(); close(); }}
          >
            <p>{t("AkQpkMC")}</p>
          </div>
          <div
            className="pointer fit-container box-pad-h-s box-pad-v-s fx-centered fx-start-h option-no-scale"
            style={{ borderRadius: "var(--border-r-18)" }}
            onClick={(e) => { e.stopPropagation(); notReadNotifications ? onReadAll() : onUnreadAll(); close(); }}
          >
            <p>{notReadNotifications ? t("A0qY0bf") : t("A3eHBf0")}</p>
          </div>
          <Link
            className="pointer fit-container box-pad-h-s box-pad-v-s fx-centered fx-start-h option-no-scale"
            style={{ borderRadius: "var(--border-r-18)" }}
            href="/settings?tab=notifications"
            onClick={close}
          >
            <p>{t("ABtsLBp")}</p>
          </Link>
        </NotifPortalPanel>
      )}
    </div>
  );
}

const Notification = React.memo(
  ({ event, filterByType = false, handleRead, handleUnRead }) => {
    const { t } = useTranslation()
    const userKeys = useSelector((state) => state.userKeys);
    const nostrAuthors = useSelector((state) => state.nostrAuthors);
    const user = useMemo(() => {
      return getUser(event.pubkey) || getEmptyuserMetadata(event.pubkey);
    }, [nostrAuthors]);
    const [relatedEvent, setRelatedEvent] = useState(
      getEventFromCache(event?.type?.id),
    );
    const { postActions } = useNoteStats(event?.id, event?.pubkey);

    let notificationsDetails = useMemo(() => {
      return checkEventType(
        event,
        userKeys.pub,
        relatedEvent,
        user.display_name || user.name,
      );
    }, [event, userKeys, relatedEvent, user]);

    useEffect(() => {
      if (!notificationsDetails?.id && !notificationsDetails?.identifier)
        return;

      let filter = notificationsDetails.identifier
        ? [
          {
            "#d": [notificationsDetails.identifier],
            authors: [notificationsDetails.id],
            kinds: notificationsDetails.kinds
              ? notificationsDetails.kinds
              : undefined,
          },
        ]
        : [{ ids: [notificationsDetails.id] }];

      const sub = ndkInstance.subscribe(filter, {
        groupable: false,
      });

      sub.on("event", (event) => {
        setRelatedEvent(event.rawEvent());
        setEventFromCache(notificationsDetails.id, event.rawEvent());
        sub.stop();
      });
      return () => {
        sub.stop();
      };
    }, []);

    const handleOnClick = (e) => {
      e.stopPropagation();
      if (!event.isRead) handleRead();
      if (notificationsDetails.url) customHistory(notificationsDetails.url);
    };
    if (!notificationsDetails) return;
    return (
      <div
        className="sc-s fit-container fx-centered fx-start-v fx-start-h box-pad-v-m box-pad-h  pointer "
        onClick={handleOnClick}
        style={{ border: "none" }}
      >
        <div
          style={{ position: "relative", gap: "16px" }}
          className="fx-centered"
        >
          {!event.isRead && (
            <div
              style={{
                backgroundColor: "var(--c1)",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                position: "absolute",
                left: "-20px",
                bottom: "15px",
              }}
            ></div>
          )}
          <div
            style={{
              position: "relative",
              width: "52px",
              height: "52px",
              border: !event.isRead ? "3px solid var(--c1)" : "none",
              borderRadius: "50%",
            }}
          >
            <UserProfilePic
              size={48}
              mainAccountUser={false}
              user_id={user.pubkey}
              img={user.picture}
              metadata={user}
            />
          </div>
          <div
            className="round-icon"
            style={{
              position: "absolute",
              right: "-5px",
              bottom: "-5px",
              backgroundColor: "var(--c1-side)",
              border: "none",
              maxWidth: "24px",
              aspectRatio: "1/1",
            }}
          >
            <div className={notificationsDetails.icon}></div>
          </div>
        </div>
        <div
          className="fit-container fx-centered fx-start-h fx-start-v"
          style={{ width: "calc(100% - 32px)" }}
        >
          <div className="fx-centered fit-container">
            <div className="fit-container">
              <div className="fit-container fx-scattered">
                <div>
                  <p className="gray-c">
                    <Date_
                      toConvert={new Date(event.created_at * 1000)}
                      time={true}
                    />
                  </p>
                  <p className="p-four-lines">
                    {notificationsDetails?.label_1}{" "}
                  </p>
                </div>
                <div className="fx-centered">
                  {event.kind === 1 && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="round-icon-small round-icon-tooltip"
                      data-tooltip={t("AtGAGPY")}
                    >
                      <Zap user={user} event={event} actions={postActions} />
                    </div>
                  )}
                  <OptionsDropdown
                    vertical={false}
                    options={[
                      <div
                        className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
                        onClick={() =>
                          !event.isRead ? handleRead() : handleUnRead()
                        }
                      >
                        {!event.isRead ? (
                          <p>{t("A0qY0bf")}</p>
                        ) : (
                          <p>{t("A3eHBf0")}</p>
                        )}
                      </div>,
                    ]}
                  />
                </div>
              </div>
              <div
                className="gray-c p-four-lines poll-content-box"
                style={{ "--p-color": "var(--gray)" }}
              >
                <MinimalNoteView
                  note={notificationsDetails?.label_2}
                  pubkey={user.pubkey}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const ActivateNotification = () => {
  const { t } = useTranslation();
  return (
    <div
      className="fit-container fx-centered box-pad-v fx-col"
      style={{ height: "30vh" }}
    >
      <h4>{t("AzhKxMs")}</h4>
      <p className="gray-c p-centered" style={{ maxWidth: "400px" }}>
        {t("Aioqvbi")}
      </p>
      <Link href={"/settings"} state={{ tab: "customization" }}>
        <button className="btn btn-normal btn-small">{t("ABtsLBp")}</button>
      </Link>
    </div>
  );
};

const MinimalNoteView = React.memo(({ note, pubkey }) => {
  return <>{getNoteTree(note, undefined, undefined, undefined, pubkey)}</>;
});
