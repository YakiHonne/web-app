import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getWOTScoreForPubkeyLegacy,
  getZapper,
  removeEventsDuplicants,
} from "@/Helpers/Encryptions";
import { useSelector } from "react-redux";
import { getSubData } from "@/Helpers/Controlers";
import {
  getFollowings,
  getMutedlist,
  getNotificationLastEventTS,
  saveNotificationLastEventTS,
  saveUsers,
} from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { sortEvents } from "nostr-tools";
import { isNoteMuted } from "@/Helpers/Helpers";
import { getCustomSettings, getWotConfig } from "@/Helpers/ClientHelpers";
import {
  clearNotifications,
  setIsNotificationsLoading,
  setNotifications,
  updateNotifications,
} from "@/Store/Slides/Extras";
import { useDispatch } from "react-redux";

export default function IinitiateNotifications() {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const refreshNotifications = useSelector(
    (state) => state.refreshNotifications,
  );

  const notificationSettings = (() => {
    let settings = getCustomSettings() || getCustomSettings("");
    let hideMentions = settings.hideMentions;
    let notificationsSettings = settings.notification;
    let mentions = notificationsSettings.find(
      (_) => _.tab === "mentions",
    )?.isHidden;
    let zaps = notificationsSettings.find((_) => _.tab === "zaps")?.isHidden;
    let reactions = notificationsSettings.find(
      (_) => _.tab === "reactions",
    )?.isHidden;
    let reposts = notificationsSettings.find(
      (_) => _.tab === "reposts",
    )?.isHidden;
    let following = notificationsSettings.find(
      (_) => _.tab === "following",
    )?.isHidden;

    return {
      mentions,
      zaps,
      reactions,
      reposts,
      following,
      hideMentions,
    };
  })();

  useEffect(() => {
    let sub;
    const fetchData = async (notificationsHistory) => {
      dispatch(setIsNotificationsLoading(true));
      let { score, notifications } = getWotConfig();
      let [userFollowings, userMutedList, lastEventCreatedAt] =
        await Promise.all([
          getFollowings(userKeys.pub),
          getMutedlist(userKeys.pub),
          getNotificationLastEventTS(userKeys.pub),
        ]);
      userFollowings = userFollowings ? userFollowings.followings : [];
      userMutedList = userMutedList ? userMutedList.mutedlist : [];
      let tempAuth = [];
      let filter = getFilter(
        userFollowings,
        notificationsHistory.length > 0
          ? lastEventCreatedAt
            ? lastEventCreatedAt + 1
            : undefined
          : undefined,
      );
      let data = await getSubData(
        filter,
        450,
        undefined,
        undefined,
        undefined,
        true,
        // "ONLY_RELAY"
      );
      data = data.data
        .map((event) => {
          let scoreStatus = getWOTScoreForPubkeyLegacy(
            event.pubkey,
            notifications,
            score,
          ).status;
          let hideMentions = notificationSettings.hideMentions
            ? event.tags.filter((_) => _[0] === "p").length > 10
            : false;

          if (
            !userMutedList?.includes(event.pubkey) &&
            !isNoteMuted(event, userMutedList) &&
            event.pubkey !== userKeys.pub &&
            scoreStatus &&
            !hideMentions
          ) {
            if (event.kind === 9735) {
              let description = JSON.parse(
                event.tags.find((tag) => tag[0] === "description")[1],
              );
              tempAuth.push(description.pubkey);
              return {
                ...description,
                created_at: event.created_at,
                amount: getZapper(event).amount,
                isNew: false,
                isRead: false,
              };
            } else if (event.kind === 6) {
              try {
                let isEventValid = JSON.parse(event.content);
                if (isEventValid) {
                  let pubkeys = event.tags
                    .filter((tag) => tag[0] === "p")
                    .map((tag) => tag[1]);
                  tempAuth.push([...pubkeys, event.pubkey]);
                  return { ...event, isNew: true, isRead: false };
                }
              } catch (err) {
                console.log("event kind:6 ditched");
              }
            } else {
              let checkForLabel = event.tags.find((tag) => tag[0] === "l");
              let isUncensored = checkForLabel
                ? ["UNCENSORED NOTE RATING", "UNCENSORED NOTE"].includes(
                    checkForLabel[1],
                  )
                : false;
              if (!isUncensored) {
                let pubkeys = event.tags
                  .filter((tag) => tag[0] === "p")
                  .map((tag) => tag[1]);
                tempAuth.push([...pubkeys, event.pubkey]);
                return { ...event, isNew: false, isRead: false };
              }
            }
          } else return false;
        })
        .filter((_) => _);
      let list = saveNotificationsHistory(userKeys.pub, data);
      dispatch(setNotifications({ data: list, pubkey: userKeys.pub }));
      if (data.length)
        saveNotificationLastEventTS(userKeys.pub, data[0]?.created_at);
      dispatch(setIsNotificationsLoading(false));
      saveUsers([...new Set(tempAuth.flat())]);
      filter = getFilter(userFollowings, list[0]?.created_at + 1);
      sub = ndkInstance.subscribe(filter, {
        cacheUsage: "ONLY_RELAY",
        groupable: false,
      });
      sub.on("event", (event) => {
        let scoreStatus = getWOTScoreForPubkeyLegacy(
          event.pubkey,
          notifications,
          score,
        ).status;
        let hideMentions = notificationSettings.hideMentions
          ? event.tags.filter((_) => _[0] === "p").length > 10
          : false;
        if (
          event.pubkey !== userKeys.pub &&
          !userMutedList.includes(event.pubkey) &&
          !isNoteMuted(event, userMutedList) &&
          scoreStatus &&
          !hideMentions
        ) {
          if (event.kind === 9735) {
            let description = JSON.parse(
              event.tags.find((tag) => tag[0] === "description")[1],
            );
            saveUsers([description.pubkey]);
            dispatch(
              setNotifications({
                data: [
                  {
                    ...description,
                    created_at: event.created_at,
                    amount: getZapper(event).amount,
                    isNew: true,
                    isRead: false,
                  },
                ],
                pubkey: userKeys.pub,
              }),
            );
          } else {
            let pubkeys = event.tags
              .filter((tag) => tag[0] === "p")
              .map((tag) => tag[1]);
            saveUsers([...pubkeys, event.pubkey]);
            dispatch(
              setNotifications({
                data: [
                  {
                    ...event.rawEvent(),
                    isNew: true,
                    isRead: false,
                  },
                ],
                pubkey: userKeys.pub,
              }),
            );
          }
        }
      });
    };
    if (userKeys) {
      let tempNot = getNotificationsHistory(userKeys.pub);
      if (tempNot && tempNot.length > 0) dispatch(updateNotifications(tempNot));
      else dispatch(clearNotifications());
      fetchData(tempNot);
    }
    if (!userKeys) {
      dispatch(clearNotifications());
      return;
    }
    return () => {
      if (sub) sub.stop();
    };
  }, [userKeys, refreshNotifications]);

  const getFilter = (fList, since) => {
    let filter = [];
    let { mentions, zaps, reactions, reposts, following } =
      notificationSettings;

    if (!mentions) {
      filter.push({
        kinds: [30023, 30004, 34235, 30031, 21, 22, 20],
        "#p": [userKeys.pub],
        limit: 150,
        since,
      });
      filter.push({
        kinds: [1],
        "#p": [userKeys.pub],
        limit: 150,
        since,
      });
    }
    if (!zaps)
      filter.push({
        kinds: [9735, 9321],
        "#p": [userKeys.pub],
        limit: 150,
        since,
      });
    if (!reactions)
      filter.push({
        kinds: [7],
        "#p": [userKeys.pub],
        limit: 150,
        since,
      });
    if (!reposts)
      filter.push({
        kinds: [6],
        "#p": [userKeys.pub],
        limit: 150,
        since,
      });
    if (!following) {
      filter.push({
        kinds: [30023, 30004, 34235, 30031, 21, 22, 20],
        authors: fList,
        limit: 150,
        since,
      });
      filter.push({
        kinds: [1],
        authors: fList,
        "#l": ["FLASH NEWS"],
        limit: 150,
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
        list = list.map((_) => {
          return { ..._, isNew: false };
        });
        if (notificationSettings.hideMentions) {
          list = list.filter(
            (_) => _.tags.filter((_) => _[0] === "p").length <= 10,
          );
        }
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
      if (notificationSettings.hideMentions) {
        newList = newList.filter(
          (_) => _.tags.filter((_) => _[0] === "p").length <= 10,
        );
      }
      localStorage.setItem(
        `notificationsSet_${pubkey}`,
        JSON.stringify(newList.slice(0, 800)),
      );
      return newList;
    } catch (err) {
      return [];
    }
  };

  return null;
}
