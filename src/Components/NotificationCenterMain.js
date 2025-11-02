import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getEmptyuserMetadata,
  getWOTScoreForPubkeyLegacy,
  getZapper,
  removeEventsDuplicants,
} from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import Date_ from "@/Components/Date_";
import { useSelector } from "react-redux";
import { getSubData, getUser } from "@/Helpers/Controlers";
import {
  getFollowings,
  getMutedlist,
  getNotificationLastEventTS,
  saveNotificationLastEventTS,
  saveUsers,
} from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { nip19, sortEvents } from "nostr-tools";
import Link from "next/link";
import { straightUp } from "@/Helpers/Helpers";
import {
  getCustomSettings,
  getNoteTree,
  getWotConfig,
  nEventEncode,
} from "@/Helpers/ClientHelpers";
import { eventKinds } from "@/Content/Extra";
import LoadingLogo from "@/Components/LoadingLogo";
import { customHistory } from "@/Helpers/History";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import Zap from "@/Components/Reactions/Zap";
import useNoteStats from "@/Hooks/useNoteStats";
import UsersGroupProfilePicture from "./UsersGroupProfilePicture";

const eventIcons = {
  paid_notes: "not-paid-notes",
  replies_comments: "not-replies-comments",
  quotes: "not-quotes",
  mentions: "not-mentions",
  reactions: "not-reactions",
  reposts: "not-reposts",
  zaps: "not-zaps",
  article: "not-articles",
  curation: "not-curations",
  video: "not-videos",
  "smart widget": "not-smart-widgets",
};

const getReaction = (reaction) => {
  if (reaction === "+") return "👍";
  if (reaction === "-") return "👎";
  return reaction;
};

const checkMentionInContent = (note, pubkey) => {
  let matches = note.match(/\b(?:npub1|nprofile1)[0-9a-z]+\b/g);
  matches =
    matches?.map((_) => {
      if (_.startsWith("npub")) return nip19.decode(_).data;
      if (_.startsWith("nprofile")) return nip19.decode(_).data.pubkey;
    }) || [];
  return matches?.includes(pubkey);
};

const getRepEventsLink = (pubkey, kind, identifier, id) => {
  let naddr = nip19.naddrEncode({ pubkey, identifier, kind });
  if (kind == 30023) return `/article/${naddr}`;
  if (kind == 30004) return `/curation/${naddr}`;
  if (kind == 30005) return `/curation/${naddr}`;
  if (kind == 34235) return `/video/${naddr}`;
  if (kind == 34236) return `/video/${naddr}`;
  if (kind == 30031) return `/smart-widget-checker?naddr=${naddr}`;
};

const checkEventType = (event, pubkey, relatedEvent, username) => {
  try {
    if (event.kind === 1) {
      let isReply = event.tags.find(
        (tag) => tag.length > 3 && tag[3] === "reply"
      );
      let isRoot = event.tags.find(
        (tag) => tag.length > 3 && tag[3] === "root"
      );
      let isQuote = event.tags.find((tag) => tag[0] === "q");
      let isPaidNote = event.tags.find(
        (tag) => tag[0] === "l" && tag[1] === "FLASH NEWS"
      );
      let isRelayedEventPaidNote = relatedEvent
        ? event.tags.find((tag) => tag[0] === "l" && tag[1] === "FLASH NEWS")
        : false;
      let eventKind = isRelayedEventPaidNote ? true : false;

      if (isPaidNote) {
        let label_1 = t(eventKind ? "AmKIbHq" : "AMukTAR", {
          name: username,
        });
        let label_2 = event.content;
        return {
          type: "following",
          label_1,
          label_2,
          icon: eventIcons.paid_notes,
          id: false,
          url: `/note/${nEventEncode(event.id)}`,
        };
      }
      if (isReply) {
        let isMention = checkMentionInContent(event.content, pubkey);
        let label_1 =
          relatedEvent && relatedEvent.pubkey === pubkey
            ? t(eventKind ? "Aj3QSsl" : "A3hNKTw", {
                name: username,
              })
            : t(eventKind ? "AnMEe4G" : "AAm18zd", {
                name: username,
              });
        let label_2 = event.content;
        let type = "replies";
        let icon = eventIcons.replies_comments;
        if (isMention) {
          label_1 = t("A1DWKNA", {
            name: username,
          });
          label_2 = event.content;
          type = "mentions";
          icon = eventIcons.mentions;
        }

        return {
          type,
          label_1,
          label_2,
          icon,
          id: isReply[1],
          url: `/note/${nEventEncode(event.id)}`,
        };
      }
      if (isRoot) {
        let isMention = checkMentionInContent(event.content, pubkey);
        let eventKind = isRoot[0] === "a" ? isRoot[1].split(":")[0] : 1;
        let eventPubkey = isRoot[0] === "a" ? isRoot[1].split(":")[1] : false;
        let eventIdentifier =
          isRoot[0] === "a" ? isRoot[1].split(":")[2] : false;
        let content = eventPubkey
          ? relatedEvent?.tags?.find((tag) => tag[0] === "title")
          : relatedEvent?.content;
        content = eventPubkey && content ? content[1] : relatedEvent?.content;
        let label_1 =
          (relatedEvent && relatedEvent.pubkey === pubkey) ||
          eventPubkey === pubkey
            ? t(`Az3sitJ_${eventKind}`, { name: username })
            : t(`AxGCCW4_${eventKind}`, { name: username });
        let label_2 = event.content;
        let url = eventPubkey
          ? getRepEventsLink(eventPubkey, eventKind, eventIdentifier)
          : `/note/${nEventEncode(isRoot[1])}`;
        let type = "replies";
        let icon = eventIcons.replies_comments;
        if (isMention) {
          label_1 = t("A1DWKNA", {
            name: username,
          });
          label_2 = event.content;
          type = "mentions";
          icon = eventIcons.mentions;
        }
        return {
          type,
          label_1,
          label_2,
          id: isRoot[0] === "a" ? eventPubkey : isRoot[1],
          identifier: eventIdentifier,
          icon,
          url,
        };
      }

      if (isQuote) {
        let label_1 =
          relatedEvent && relatedEvent.pubkey === pubkey
            ? t("AbWsTvK", { name: username })
            : t("ACmLZt3", {
                name: username,
              });
        let id = isQuote[1];
        let label_2 = event.content;
        let aTag = isQuote[1].split(":")[0];
        let identifier = false;
        let kinds = false;
        if (aTag.length > 2) {
          let kind = parseInt(isQuote[1].split(":")[0]);
          kinds = [kind];
          label_1 = t(`AbWsTvK_${kind}`, { name: username });

          id = isQuote[1].split(":")[1];
          identifier = isQuote[1].split(":")[2];
        }
        return {
          type: "quotes",
          label_1,
          label_2,
          id,
          identifier,
          kinds,
          icon: eventIcons.quotes,
          url: `/note/${nEventEncode(event.id)}`,
        };
      }

      let label_1 = t("AtWXTcu", { name: username });
      let label_2 = event.content;

      return {
        type: "mentions",
        label_1,
        label_2,
        icon: eventIcons.mentions,
        id: false,
        url: `/note/${nEventEncode(event.id)}`,
      };
    }

    if (
      [30023, 30004, 30005, 34235, 30031, 34236, 21, 22].includes(event.kind)
    ) {
      let self = event.tags.find((tag) => tag[1] === pubkey);
      let identifier = event.tags.find((tag) => tag[0] === "d");
      let content = event.tags.find((tag) => tag[0] === "title");
      content = content ? content[1] : "";
      let label_1 = self
        ? t(`AETny3G_${event.kind}`, { name: username })
        : t(`AWXssJ6_${event.kind}`, { name: username });
      let label_2 = content;

      return {
        type: self ? "mentions" : "following",
        label_1,
        label_2,
        icon: eventIcons[eventKinds[event.kind]],
        id: false,
        url: identifier
          ? getRepEventsLink(event.pubkey, event.kind, identifier[1])
          : `/video/${nip19.neventEncode({
              id: event.id,
              pubkey: event.pubkey,
            })}`,
      };
    }

    if (event.kind === 7) {
      let isE = event.tags.find((tag) => tag[0] === "e");
      let isA = event.tags.find((tag) => tag[0] === "a");
      let ev = isA || isE;

      let eventKind = ev[0] === "a" ? ev[1].split(":")[0] : 1;
      let eventPubkey = ev[0] === "a" ? ev[1].split(":")[1] : false;
      let eventIdentifier = ev[0] === "a" ? ev[1].split(":")[2] : false;
      let content = eventPubkey
        ? relatedEvent?.tags?.find((tag) => tag[0] === "title")
        : relatedEvent?.content;
      content = eventPubkey && content ? content[1] : relatedEvent?.content;
      let reaction = getReaction(event.content);
      let label_1 =
        (relatedEvent && relatedEvent.pubkey === pubkey) ||
        eventPubkey === pubkey
          ? t(`AeOUYTy_${eventKind}`, {
              name: username,
              reaction,
            })
          : t(`A5xBOLZ_${eventKind}`, {
              name: username,
              reaction,
            });
      let label_2 = content;
      let url = eventPubkey
        ? getRepEventsLink(eventPubkey, eventKind, eventIdentifier)
        : `/note/${nEventEncode(ev[1])}`;

      return {
        type: "reactions",
        label_1,
        label_2,
        id: ev[0] === "a" ? eventPubkey : ev[1],
        identifier: eventIdentifier,
        icon: eventIcons.reactions,
        url,
      };
    }

    if (event.kind === 6) {
      let innerEvent = JSON.parse(event.content);
      let label_1 =
        innerEvent && innerEvent.pubkey === pubkey
          ? t("AtLiZSD", { name: username })
          : t("Avp7edv", { name: username });
      let label_2 = innerEvent.content;

      return {
        type: "reposts",
        label_1,
        label_2,
        icon: eventIcons.reposts,
        id: false,
        url: `/note/${nEventEncode(innerEvent.id)}`,
      };
    }

    if (event.kind === 9734) {
      let isE = event.tags.find((tag) => tag[0] === "e");
      let isA = event.tags.find((tag) => tag[0] === "a");
      let ev = isA || isE;
      let url = false;
      let eventKind = 0;
      if (ev) {
        eventKind = ev[0] === "a" ? ev[1].split(":")[0] : 1;
        let eventPubkey = ev[0] === "a" ? ev[1].split(":")[1] : false;
        let eventIdentifier = ev[0] === "a" ? ev[1].split(":")[2] : false;
        url = eventPubkey
          ? getRepEventsLink(eventPubkey, eventKind, eventIdentifier)
          : `/note/${nEventEncode(ev[1])}`;
      }

      let amount =
        event.amount || event.tags.find((tag) => tag[0] === "amount");

      let message = event.content;

      return {
        type: "zaps",
        label_1:
          eventKind === 0
            ? t("A5xBOLZ", { name: username, amount })
            : t(`AdiWL4V_${eventKind}`, { name: username, amount }),
        label_2: message ? `: ${message}` : "",
        icon: eventIcons.zaps,
        id: isE ? isE[1] : false,
        url,
      };
    }
  } catch (err) {
    console.log(event, err);
    return false;
  }
};

export default function NotificationCenterMain() {
  const userKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [newNotifications, setNewNotifications] = useState([]);
  const [contentFrom, setContentFrom] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const notificationsRef = useRef(null);
  const notificationSettings = (() => {
    let settings =
      getCustomSettings().notification || getCustomSettings("").notification;
    let mentions = settings.find((_) => _.tab === "mentions")?.isHidden;
    let zaps = settings.find((_) => _.tab === "zaps")?.isHidden;
    let reactions = settings.find((_) => _.tab === "reactions")?.isHidden;
    let reposts = settings.find((_) => _.tab === "reposts")?.isHidden;
    let following = settings.find((_) => _.tab === "following")?.isHidden;

    return {
      mentions,
      zaps,
      reactions,
      reposts,
      following,
    };
  })();

  useEffect(() => {
    let sub;
    const fetchData = async () => {
      setIsLoading(true);
      let { score, notifications } = getWotConfig();
      let [userFollowings, userMutedList, lastEventCreatedAt] =
        await Promise.all([
          getFollowings(userKeys.pub),
          getMutedlist(userKeys.pub),
          getNotificationLastEventTS(userKeys.pub),
        ]);
      userFollowings = userFollowings ? userFollowings.followings : [];
      userMutedList = userMutedList ? userMutedList.mutedlist : [];
      let notificationsHistory = getNotificationsHistory(userKeys.pub);
      let tempAuth = [];
      let filter = getFilter(
        userFollowings,
        notificationsHistory.length > 0
          ? lastEventCreatedAt
            ? lastEventCreatedAt + 1
            : undefined
          : undefined
      );
      let data = await getSubData(filter);
      data = data.data
        .map((event_) => {
          let event = event_.rawEvent();
          let scoreStatus = getWOTScoreForPubkeyLegacy(
            event.pubkey,
            notifications,
            score
          ).status;
          if (!userMutedList?.includes(event.pubkey) && scoreStatus) {
            if (event.kind === 9735) {
              let description = JSON.parse(
                event.tags.find((tag) => tag[0] === "description")[1]
              );
              tempAuth.push(description.pubkey);
              return {
                ...description,
                created_at: event.created_at,
                amount: getZapper(event).amount,
              };
            } else if (event.kind === 6) {
              try {
                let isEventValid = JSON.parse(event.content);
                if (isEventValid) {
                  let pubkeys = event.tags
                    .filter((tag) => tag[0] === "p")
                    .map((tag) => tag[1]);
                  tempAuth.push([...pubkeys, event.pubkey]);
                  return event;
                }
              } catch (err) {
                console.log("event kind:6 ditched");
              }
            } else {
              let checkForLabel = event.tags.find((tag) => tag[0] === "l");
              let isUncensored = checkForLabel
                ? ["UNCENSORED NOTE RATING", "UNCENSORED NOTE"].includes(
                    checkForLabel[1]
                  )
                : false;
              if (!isUncensored) {
                let pubkeys = event.tags
                  .filter((tag) => tag[0] === "p")
                  .map((tag) => tag[1]);
                tempAuth.push([...pubkeys, event.pubkey]);
                return event;
              }
            }
          } else return false;
        })
        .filter((_) => _);
      let list = saveNotificationsHistory(userKeys.pub, data);
      setNotifications(list);
      if (data.length)
        saveNotificationLastEventTS(userKeys.pub, data[0]?.created_at);
      setIsLoading(false);
      saveUsers([...new Set(tempAuth.flat())]);
      filter = getFilter(userFollowings, list[0]?.created_at + 1);
      sub = ndkInstance.subscribe(filter, {
        cacheUsage: "CACHE_FIRST",
        groupable: false,
      });
      sub.on("event", (event) => {
        let scoreStatus = getWOTScoreForPubkeyLegacy(
          event.pubkey,
          notifications,
          score
        ).status;
        if (!userMutedList.includes(event.pubkey) && scoreStatus) {
          if (event.kind === 9735) {
            let description = JSON.parse(
              event.tags.find((tag) => tag[0] === "description")[1]
            );
            saveUsers([description.pubkey]);
            setNewNotifications((prev) =>
              removeEventsDuplicants([
                {
                  ...description,
                  created_at: event.created_at,
                  amount: getZapper(event).amount,
                },
                ...prev,
              ])
            );
          } else {
            let pubkeys = event.tags
              .filter((tag) => tag[0] === "p")
              .map((tag) => tag[1]);
            saveUsers([...pubkeys, event.pubkey]);

            setNewNotifications((prev) =>
              removeEventsDuplicants([event.rawEvent(), ...prev])
            );
          }
        }
      });
    };
    if (userKeys) {
      let tempNot = getNotificationsHistory(userKeys.pub);
      if (tempNot && tempNot.length > 0) setNotifications(tempNot);
      else setNotifications([]);
      fetchData(tempNot && tempNot.length > 0);
    }
    if (!userKeys) {
      setNotifications([]);
      return;
    }
    return () => {
      if (sub) sub.stop();
    };
  }, [userKeys]);

  const switchContentSource = (source) => {
    if (source === contentFrom) return;
    setContentFrom(source);
    straightUp();
  };

  const addNewEvents = () => {
    let events = [];
    for (let event of newNotifications) {
      if (event.kind === 9735) {
        let description = JSON.parse(
          event.tags.find((tag) => tag[0] === "description")[1]
        );
        events.push(description);
      } else {
        events.push(event);
      }
    }
    let list = saveNotificationsHistory(userKeys.pub, events);
    setNotifications(list);
    saveNotificationLastEventTS(userKeys.pub, list[0].created_at);
    setNewNotifications([]);
    straightUp();
  };

  const getFilter = (fList, since) => {
    let filter = [];
    let { mentions, zaps, reactions, reposts, following } =
      notificationSettings;

    if (!mentions) {
      filter.push({
        kinds: [30023, 30004, 34235, 30031, 21, 22],
        "#p": [userKeys.pub],
        limit: 10,
        since,
      });
      filter.push({
        kinds: [1],
        "#p": [userKeys.pub],
        limit: 100,
        since,
      });
    }
    if (!zaps)
      filter.push({
        kinds: [9735],
        "#p": [userKeys.pub],
        limit: 10,
        since,
      });
    if (!reactions)
      filter.push({
        kinds: [7],
        "#p": [userKeys.pub],
        limit: 10,
        since,
      });
    if (!reposts)
      filter.push({
        kinds: [6],
        "#p": [userKeys.pub],
        limit: 10,
        since,
      });
    if (!following) {
      filter.push({
        kinds: [30023, 30004, 34235, 30031, 21, 22],
        authors: fList,
        limit: 10,
        since,
      });
      filter.push({
        kinds: [1],
        authors: fList,
        "#l": ["FLASH NEWS"],
        limit: 10,
        since,
      });
    }
    return filter;
  };

  const getNotificationsHistory = (pubkey) => {
    try {
      let list = localStorage.getItem(`notificationsSet_${pubkey}`);

      if (list) {
        list = JSON.parse(list);
        return list;
      }
      return [];
    } catch (err) {
      return [];
    }
  };

  const saveNotificationsHistory = (pubkey, list) => {
    try {
      let history = getNotificationsHistory(pubkey);
      let newList = removeEventsDuplicants(sortEvents([...list, ...history]));
      localStorage.setItem(
        `notificationsSet_${pubkey}`,
        JSON.stringify(newList.slice(0, 1000))
      );
      return newList;
    } catch (err) {
      return [];
    }
  };

  return (
    <>
      <div
        style={{
          width: "min(100%, 600px)",
          height: "100%",
          gap: 0,
          position: "relative",
        }}
        className=" fx-centered fx-col fx-start-h fx-start-v"
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
            <Link href={"/settings?tab=notifications"}>
              <div className="setting-24"></div>
            </Link>
          </div>
          <div className="fit-container fx-even" style={{ gap: 0 }}>
            <div
              className={`list-item-b fx-centered fx  ${
                contentFrom === "all" ? "selected-list-item-b" : ""
              }`}
              style={{ padding: " .5rem 1rem" }}
              onClick={() => switchContentSource("all")}
            >
              {t("AR9ctVs")}
            </div>
            <div
              className={`list-item-b fx-centered fx ${
                contentFrom === "mentions" ? "selected-list-item-b" : ""
              }`}
              style={{ padding: " .5rem 1rem" }}
              onClick={() => switchContentSource("mentions")}
            >
              {t("A8Da0of")}
            </div>
            <div
              className={`list-item-b fx-centered fx ${
                contentFrom === "replies" ? "selected-list-item-b" : ""
              }`}
              style={{ padding: " .5rem 1rem" }}
              onClick={() => switchContentSource("replies")}
            >
              {t("AENEcn9")}
            </div>

            <div
              className={`list-item-b fx-centered fx ${
                contentFrom === "zaps" ? "selected-list-item-b" : ""
              }`}
              style={{ padding: " .5rem 1rem" }}
              onClick={() => switchContentSource("zaps")}
            >
              Zaps
            </div>
            <div
              className={`list-item-b fx-centered fx ${
                contentFrom === "following" ? "selected-list-item-b" : ""
              }`}
              style={{ padding: " .5rem 1rem" }}
              onClick={() => switchContentSource("following")}
            >
              {t("A9TqNxQ")}
            </div>
          </div>
          {isLoading && notifications.length > 0 && (
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

        {notifications.length > 0 && (
          <div
            className="fit-container fx-centered fx-col fx-start-h"
            style={{
              rowGap: 0,
              overflow: "hidden",
              position: "relative",
            }}
            ref={notificationsRef}
          >
            {notifications.map((event) => {
              if (contentFrom !== "all")
                return (
                  <Notification
                    event={event}
                    key={event.id}
                    filterByType={contentFrom}
                  />
                );
              return <Notification event={event} key={event.id} />;
            })}
          </div>
        )}
        {notificationSettings[
          ["mentions", "replies"].includes(contentFrom)
            ? "mentions"
            : contentFrom
        ] && <ActivateNotification />}
        {isLoading && notifications.length === 0 && (
          <div className="fx-centered fit-container" style={{ height: "70vh" }}>
            <LoadingLogo size={96} />
          </div>
        )}
      </div>
    </>
  );
}

const Notification = ({ event, filterByType = false }) => {
  const userKeys = useSelector((state) => state.userKeys);
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const user = useMemo(() => {
    return getUser(event.pubkey) || getEmptyuserMetadata(event.pubkey);
  }, [nostrAuthors]);
  const [relatedEvent, setRelatedEvent] = useState(false);
  const { postActions } = useNoteStats(event?.id, event?.pubkey);

  let type = useMemo(() => {
    return checkEventType(
      event,
      userKeys.pub,
      relatedEvent,
      user.display_name || user.name
    );
  }, [event, userKeys, relatedEvent, user]);

  useEffect(() => {
    if (!type?.id) return;

    let filter = type.identifier
      ? [
          {
            "#d": [type.identifier],
            authors: [type.id],
            kinds: type.kinds ? type.kinds : undefined,
          },
        ]
      : [{ ids: [type.id] }];
    const sub = ndkInstance.subscribe(filter, {
      cacheUsage: "ONLY_RELAY",
      groupable: false,
    });

    sub.on("event", (event) => {
      setRelatedEvent(event.rawEvent());
      sub.stop();
    });
  }, []);

  const handleOnClick = (e) => {
    e.stopPropagation();
    if (type.url) customHistory(type.url);
  };

  if (!type || event.pubkey === userKeys.pub) return;
  if ((filterByType && filterByType.includes(type.type)) || !filterByType)
    return (
      <div
        className="fit-container fx-centered fx-start-v fx-start-h box-pad-v-m box-pad-h  pointer"
        onClick={handleOnClick}
        style={{
          borderTop: "1px solid  var(--c1-side)",
          borderBottom: "1px solid  var(--c1-side)",
        }}
      >
        <div style={{ position: "relative" }}>
          <UserProfilePic
            size={48}
            mainAccountUser={false}
            user_id={user.pubkey}
            img={user.picture}
            metadata={user}
          />
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
            <div className={type.icon}></div>
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
                  <p className="p-four-lines">{type?.label_1} </p>
                </div>
                {event.kind === 1 && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="round-icon-small round-icon-tooltip"
                    data-tooltip={t("AtGAGPY")}
                  >
                    <Zap user={user} event={event} actions={postActions} />
                  </div>
                )}
              </div>
              <div
                className="gray-c p-four-lines poll-content-box"
                style={{ "--p-color": "var(--gray)" }}
              >
                <MinimalNoteView note={type?.label_2} pubkey={user.pubkey} />
              </div>
              {/* <p className="gray-c p-four-lines">{type?.label_2}</p> */}
            </div>
          </div>
        </div>
      </div>
    );
};

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

const MinimalNoteView = ({ note, pubkey }) => {
  return (
    <>{getNoteTree(note, undefined, undefined, undefined, pubkey, true)}</>
  );
};
