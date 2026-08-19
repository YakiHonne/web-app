import { getCustomSettings } from "@/Helpers/ClientHelpers";
import { removeNotificationsSet, saveNotificationsSet } from "@/Helpers/DB";
import {
  clearNotifications,
  setRefreshNotifications,
  updateNotifications,
} from "@/Store/Slides/Extras";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export default function useNotifications() {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const globalNotifications = useSelector((state) => state.notifications);
  const isNotificationsLoading = useSelector(
    (state) => state.isNotificationsLoading,
  );
  const { userMutedList } = useSelector((state) => state.userMutedList);
  const unmutedNotifications = useMemo(() => {
    if (!Array.isArray(userMutedList) || userMutedList.length === 0)
      return globalNotifications;
    return globalNotifications.filter(
      (_) => !userMutedList.includes(_.pubkey),
    );
  }, [globalNotifications, userMutedList]);
  const notifications = useMemo(() => {
    return unmutedNotifications.filter((_) => !_.isNew);
  }, [unmutedNotifications]);
  const newNotifications = useMemo(() => {
    return unmutedNotifications.filter((_) => _.isNew);
  }, [unmutedNotifications]);
  const notReadNotifications = useMemo(() => {
    return unmutedNotifications.filter((_) => !_.isRead).length;
  }, [unmutedNotifications]);
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

  const refreshNotifications = () => {
    if (isNotificationsLoading) return;
    removeNotificationsSet(userKeys.pub);
    dispatch(clearNotifications());
    dispatch(setRefreshNotifications(Date.now()));
  };

  const handleReadAll = () => {
    let notifications = globalNotifications.map((_) => {
      return {
        ..._,
        isRead: true,
        isNew: false,
      };
    });
    saveInLocalStorage(notifications);
    dispatch(updateNotifications(notifications));
  };
  const handleUnreadAll = () => {
    let notifications = globalNotifications.map((_) => {
      return {
        ..._,
        isRead: false,
        isNew: false,
      };
    });
    saveInLocalStorage(notifications);
    dispatch(updateNotifications(notifications));
  };
  const handleRead = (index) => {
    let notifications = structuredClone(globalNotifications);
    notifications[index].isRead = true;
    notifications[index].isNew = false;
    saveInLocalStorage(notifications);
    dispatch(updateNotifications(notifications));
  };
  const handleUnRead = (index) => {
    let notifications = structuredClone(globalNotifications);
    notifications[index].isRead = false;
    notifications[index].isNew = false;
    saveInLocalStorage(notifications);
    dispatch(updateNotifications(notifications));
  };

  const addNewEvents = () => {
    let notifications = globalNotifications.map((_) => {
      return {
        ..._,
        isNew: false,
      };
    });
    saveInLocalStorage(notifications);
    dispatch(updateNotifications(notifications));
  };

  const saveInLocalStorage = (notifications) => {
    saveNotificationsSet(userKeys.pub, notifications);
  };

  return {
    notifications,
    newNotifications,
    notReadNotifications,
    refreshNotifications,
    isNotificationsLoading,
    notificationSettings,
    handleReadAll,
    handleUnreadAll,
    handleRead,
    handleUnRead,
    addNewEvents,
  };
}
