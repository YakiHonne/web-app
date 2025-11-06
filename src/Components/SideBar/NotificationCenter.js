import React, { useEffect, useState } from "react";
import { ndkInstance } from "@/Helpers/NDKInstance";
import {
  getFollowings,
  getMutedlist,
  getNotificationLastEventTS,
  saveNotificationLastEventTS,
} from "@/Helpers/DB";
import { useDispatch, useSelector } from "react-redux";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import { getCustomSettings, getWotConfig } from "@/Helpers/ClientHelpers";
import { getWOTScoreForPubkeyLegacy, removeDuplicants } from "@/Helpers/Encryptions";
import { setToast } from "@/Store/Slides/Publishers";
import { localStorage_ } from "@/Helpers/utils";
import { SidebarNavItem } from "./SidebarNavItem";
import { isNoteMuted } from "@/Helpers/Helpers";

export default function NotificationCenter({
  icon = false,
  mobile = false,
  dismiss = false,
  isCurrent = false,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      let { score, notifications } = getWotConfig();
      let localStorageKey = `new-notification-${userKeys.pub}`;
      setNotifications(
        localStorage_.getItem(localStorageKey)
          ? parseInt(localStorage_.getItem(localStorageKey))
          : 0
      );
      let [userFollowings, userMutedList] = await Promise.all([
        getFollowings(userKeys.pub),
        getMutedlist(userKeys.pub),
      ]);
      userFollowings = userFollowings ? userFollowings.followings : [];
      userMutedList = userMutedList ? userMutedList.mutedlist : [];
      const lastEventCreatedAt = await getNotificationLastEventTS(userKeys.pub);
      let created_at = lastEventCreatedAt + 1 || 0;
      let filter = getFilter(
        userFollowings,
        lastEventCreatedAt ? lastEventCreatedAt + 1 : undefined
      );
      let events = [];
      let isNotified = false;
      const sub = ndkInstance.subscribe(filter, {
        cacheUsage: "CACHE_FIRST",
        groupable: false,
        // skipValidation: true,
        // skipVerification: true,
      });

      sub.on("event", (event) => {
        try {
          let scoreStatus = getWOTScoreForPubkeyLegacy(
            event.pubkey,
            notifications,
            score
          ).status;
          if (
            !(userMutedList || []).includes(event.pubkey) &&
            !isNoteMuted(event, userMutedList) &&
            scoreStatus
          ) {
            let checkForLabel = event.tags.find((tag) => tag[0] === "l");
            let isUncensored = checkForLabel
              ? ["UNCENSORED NOTE RATING", "UNCENSORED NOTE"].includes(
                checkForLabel[1]
              )
              : false;
            if (!isUncensored && event.pubkey !== userKeys.pub) {
              events.push(event);
              events = removeDuplicants(events)
              let eventsCount = events.length;
              localStorage_.setItem(localStorageKey, eventsCount);
              setNotifications((prev) => prev + 1);
              if (created_at < event.created_at) {
                created_at = event.created_at;
                saveNotificationLastEventTS(userKeys.pub, event.created_at);
              }
              if (!isNotified) {
                dispatch(
                  setToast({
                    type: 1,
                    desc: t("AtbtAF9"),
                  })
                );
                isNotified = true;
              }
            }
          }
        } catch (err) {
          console.log(err);
        }
      });

      sub.on("close", () => {
        isNotified = false;
      });
    };

    if (userKeys && window.location.pathname !== "/notifications") {
      fetchData();
    } else {
      setNotifications(0);
    }
  }, [userKeys]);

  const getFilter = (fList, since) => {
    let settings =
      getCustomSettings().notification || getCustomSettings().notification;
    let filter = [];
    let mentions = settings.find((_) => _.tab === "mentions")?.isHidden;
    let zaps = settings.find((_) => _.tab === "zaps")?.isHidden;
    let reactions = settings.find((_) => _.tab === "reactions")?.isHidden;
    let reposts = settings.find((_) => _.tab === "reposts")?.isHidden;
    let following = settings.find((_) => _.tab === "following")?.isHidden;

    if (!mentions) {
      filter.push({
        kinds: [30023, 30004, 34235, 30031, 21, 22],
        "#p": [userKeys.pub],
        limit: 20,
        since,
      });
      filter.push({
        kinds: [1],
        "#p": [userKeys.pub],
        limit: 20,
        since,
      });
    }
    if (!zaps)
      filter.push({
        kinds: [9735],
        "#p": [userKeys.pub],
        limit: 20,
        since,
      });
    if (!reactions)
      filter.push({
        kinds: [7],
        "#p": [userKeys.pub],
        limit: 20,
        since,
      });
    if (!reposts)
      filter.push({
        kinds: [6],
        "#p": [userKeys.pub],
        limit: 20,
        since,
      });
    if (!following) {
      filter.push({
        kinds: [30023, 30004, 34235, 30031, 21, 22],
        authors: fList,
        limit: 20,
        since,
      });
      filter.push({
        kinds: [1],
        authors: fList,
        "#l": ["FLASH NEWS"],
        limit: 20,
        since,
      });
    }
    return filter;
  };

  const handleOnClick = () => {
    let localStorageKey = `new-notification-${userKeys.pub}`;
    localStorage_.setItem(localStorageKey, 0);
    setNotifications(0)
    if (dismiss) dismiss();
    customHistory("/notifications");
  };

  return (
    <SidebarNavItem
      className={
        icon
          ? "round-icon"
          : `pointer fit-container fx-scattered  box-pad-h-s box-pad-v-s  ${isCurrent ? "active-link" : "inactive-link"
          }`
      }
      style={{ position: "relative" }}
      onClick={handleOnClick}
    >
      <div className="fx-centered">
        {!isCurrent && <div className="ringbell-24"></div>}
        {isCurrent && <div className="ringbell-bold-24"></div>}
        {!icon && (
          <div className={`link-label ${mobile ? "p-big" : ""}`}>
            {t("ASSFfFZ")}
          </div>
        )}
      </div>
      {notifications !== 0 && (
        <div className="sticker sticker-small sticker-red link-label">
          {notifications > 99 ? `+99` : notifications}
        </div>
      )}
    </SidebarNavItem>
  );
}
