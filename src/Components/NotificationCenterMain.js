import React, { useEffect, useMemo, useRef, useState } from "react";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import Date_ from "@/Components/Date_";
import { useSelector } from "react-redux";
import { getUser } from "@/Helpers/Controlers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import Link from "next/link";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import LoadingLogo from "@/Components/LoadingLogo";
import { customHistory } from "@/Helpers/History";
import { t } from "i18next";
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
  const [contentFrom, setContentFrom] = useState("all");
  const notificationsRef = useRef(null);
  const filteredNotifications = useMemo(() => {
    return notifications.filter((_) => {
      if (contentFrom === "all") return true;
      return _.type.type === contentFrom;
    });
  }, [notifications, contentFrom]);
  const switchContentSource = (source) => {
    if (source === contentFrom) return;
    setContentFrom(source);
    notificationsRef.current?.scrollToIndex({
      top: 32,
      align: "start",
      behavior: "instant",
    });
  };
  const notificationsTypes = [
    { value: "all", display_name: t("AR9ctVs") },
    { value: "mentions", display_name: t("A8Da0of") },
    { value: "replies", display_name: t("AENEcn9") },
    { value: "zaps", display_name: "Zaps" },
    { value: "following", display_name: t("A9TqNxQ") },
  ];

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
        style={{
          // width: "min(100%, 600px)",
          height: "100%",
          gap: 0,
          position: "relative",
        }}
        className="fit-container fx-centered fx-col fx-start-h fx-start-v"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {newNotifications.length > 0 && (
          <div
            className="fit-container fx-centered box-pad-v slide-down"
            style={{ position: "absolute", left: 0, top: "85px", zIndex: 200 }}
          >
            <div
              className="sc-s  box-pad-h-s box-pad-v-s fx-scattered pointer"
              style={{
                backgroundColor: "var(--c1)",
                border: "none",
                gap: "10px",
              }}
              onClick={addNewEvents}
            >
              <UsersGroupProfilePicture
                pubkeys={[
                  ...new Set(newNotifications.map((note) => note.pubkey)),
                ].slice(0, 3)}
              />
              <div
                className="fx-centered"
                style={{
                  minWidth: "max-content",
                  gap: "0",
                }}
              >
                <p className="white-c">
                  {t("AV9Dfnw", { count: newNotifications.length })}
                </p>
                <p className="white-c box-pad-h-s">&#8593;</p>
              </div>
            </div>
            <div style={{ width: "42px" }}></div>
          </div>
        )}
        <div
          className="fit-container sticky"
          style={{
            zIndex: 100,
            top: "0",
            padding: 0,
          }}
        >
          <div className="fit-container fx-scattered box-pad-h box-pad-v-m">
            <h3>{t("ASSFfFZ")}</h3>
            <div className="fx-centered">
              <div
                className={`round-icon-small round-icon-tooltip ${
                  isNotificationsLoading ? "if-disabled" : ""
                }`}
                data-tooltip={t("AkQpkMC")}
                onClick={handleRefreshNotifications}
              >
                <div
                  className="switch-arrows-v2"
                  style={{
                    cursor: isNotificationsLoading ? "not-allowed" : "pointer",
                  }}
                ></div>
              </div>
              <OptionsDropdown
                options={[
                  <div
                    className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
                    onClick={() =>
                      notReadNotifications ? handleReadAll() : handleUnreadAll()
                    }
                  >
                    {notReadNotifications ? (
                      <p>{t("A0qY0bf")}</p>
                    ) : (
                      <p>{t("A3eHBf0")}</p>
                    )}
                  </div>,
                  <Link
                    className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
                    href={"/settings?tab=notifications"}
                  >
                    <p>{t("ABtsLBp")}</p>
                  </Link>,
                ]}
              />
            </div>
          </div>
          <div className="fit-container fx-even" style={{ gap: 0 }}>
            {notificationsTypes.map((type) => (
              <div
                className={`list-item-b fx-centered fx  ${
                  contentFrom === type.value ? "selected-list-item-b" : ""
                }`}
                style={{ padding: " .5rem 1rem" }}
                onClick={() => switchContentSource(type.value)}
              >
                {type.display_name}
              </div>
            ))}
          </div>
          {isNotificationsLoading && filteredNotifications.length > 0 && (
            <div>
              <div
                className="fit-container sc-s-18"
                style={{
                  width: "100%",
                  position: "absolute",
                  left: 0,
                  top: "6.5rem",
                  overflow: "hidden",
                  zIndex: 211,
                  height: "20px",
                  border: "none",
                  backgroundColor: "transparent",
                }}
              >
                <div
                  style={{ height: "2px", backgroundColor: "var(--c1)" }}
                  className="v-bounce"
                ></div>
              </div>
            </div>
          )}
        </div>
        {filteredNotifications.length > 0 && (
          <Virtuoso
            style={{ width: "100%", height: "100vh" }}
            totalCount={filteredNotifications.length}
            increaseViewportBy={200}
            overscan={200}
            skipAnimationFrameInResizeObserver={true}
            ref={notificationsRef}
            itemContent={(index) => {
              let event = filteredNotifications[index];
              return (
                <Notification
                  event={event}
                  key={event.id}
                  filterByType={contentFrom !== "all" ? contentFrom : ""}
                  handleRead={() => handleRead(index)}
                  handleUnRead={() => handleUnRead(index)}
                />
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
            <LoadingLogo size={96} />
          </div>
        )}
      </div>
    </>
  );
}

const Notification = React.memo(
  ({ event, filterByType = false, handleRead, handleUnRead }) => {
    const userKeys = useSelector((state) => state.userKeys);
    const nostrAuthors = useSelector((state) => state.nostrAuthors);
    const user = useMemo(() => {
      return getUser(event.pubkey) || getEmptyuserMetadata(event.pubkey);
    }, [nostrAuthors]);
    const [relatedEvent, setRelatedEvent] = useState(
      getEventFromCache(event?.type?.id)
    );
    const { postActions } = useNoteStats(event?.id, event?.pubkey);

    let notificationsDetails = useMemo(() => {
      return checkEventType(
        event,
        userKeys.pub,
        relatedEvent,
        user.display_name || user.name
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
    // if (!type || event.pubkey === userKeys.pub) return;
    // if ((filterByType && filterByType.includes(type)) || !filterByType)
    if (!notificationsDetails) return;
    return (
      <div
        className="fit-container fx-centered fx-start-v fx-start-h box-pad-v-m box-pad-h  pointer "
        onClick={handleOnClick}
        style={{
          borderTop: "1px solid  var(--c1-side)",
          borderBottom: "1px solid  var(--c1-side)",
        }}
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
              width: "max-content",
              height: "max-content",
              border: !event.isRead ? "3px solid var(--c1)" : "none",
              borderRadius: "var(--border-r-14)",
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
              backgroundColor: "var(--white)",
              border: "none",
              minWidth: "24px",
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
              {/* <p className="gray-c p-four-lines">{type?.label_2}</p> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
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
