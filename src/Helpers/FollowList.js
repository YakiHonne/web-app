import { ndkInstance } from "./NDKInstance";
import { InitEvent } from "./Controlers";
import { getFollowings, saveFollowings } from "./DB";
import { relaysOnPlatform } from "@/Content/Relays";
import { store } from "@/Store/Store";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { t } from "i18next";

const FETCH_TIMEOUT = 4000;
let lastPublished = null;

const fetchLatestFollowList = (pubkey, relays) => {
  return new Promise((resolve) => {
    let latest = null;
    let isDone = false;
    let timer = null;
    const sub = ndkInstance.subscribe([{ kinds: [3], authors: [pubkey] }], {
      cacheUsage: "PARALLEL",
      closeOnEose: true,
      groupable: false,
      relayUrls: relays,
    });
    const finish = () => {
      if (isDone) return;
      isDone = true;
      clearTimeout(timer);
      const answered = (sub.eosesSeen?.size || 0) > 0;
      sub.stop();
      resolve({ event: latest, answered });
    };
    sub.on("event", (event) => {
      if (event.pubkey !== pubkey) return;
      if (!latest || event.created_at > latest.created_at)
        latest = event.rawEvent();
    });
    sub.on("eose", finish);
    timer = setTimeout(finish, FETCH_TIMEOUT);
  });
};

const mergeWithCached = (base, cached) => {
  const baseTags = base ? base.tags : [];
  const pTags = new Map(
    baseTags.filter((tag) => tag[0] === "p").map((tag) => [tag[1], tag]),
  );
  return [
    ...baseTags.filter((tag) => tag[0] !== "p"),
    ...(cached.followings || []).map((pubkey) => pTags.get(pubkey) || ["p", pubkey]),
  ];
};

export const updateFollowList = async ({ follow = [], unfollow = [] }) => {
  const { userKeys, userRelays } = store.getState();
  if (!userKeys?.pub) return { error: "no-account" };
  const relays = [...new Set([...(userRelays || []), ...relaysOnPlatform])];
  const [{ event, answered }, cached] = await Promise.all([
    fetchLatestFollowList(userKeys.pub, relays),
    getFollowings(userKeys.pub),
  ]);

  let base = event;
  if (
    lastPublished?.pubkey === userKeys.pub &&
    (!base || lastPublished.created_at > base.created_at)
  )
    base = lastPublished;

  let tags = base ? base.tags.map((tag) => [...tag]) : null;
  if (cached?.last_timestamp && (!base || cached.last_timestamp > base.created_at))
    tags = mergeWithCached(base, cached);

  if (!tags) {
    if (!answered) return { error: "unavailable" };
    tags = [];
  }

  const toUnfollow = new Set(unfollow);
  let nextTags = tags.filter((tag) => !(tag[0] === "p" && toUnfollow.has(tag[1])));
  const followed = new Set(
    nextTags.filter((tag) => tag[0] === "p").map((tag) => tag[1]),
  );
  for (const pubkey of follow) {
    if (followed.has(pubkey) || toUnfollow.has(pubkey)) continue;
    nextTags.push(["p", pubkey]);
    followed.add(pubkey);
  }

  if (base && JSON.stringify(nextTags) === JSON.stringify(base.tags)) {
    saveFollowings(base, userKeys.pub);
    return { unchanged: true };
  }

  const createdAt = Math.max(
    Math.floor(Date.now() / 1000),
    (base?.created_at || 0) + 1,
    (cached?.last_timestamp || 0) + 1,
  );
  const eventInitEx = await InitEvent(3, base?.content || "", nextTags, createdAt);
  if (!eventInitEx) return { error: "signing" };
  lastPublished = eventInitEx;
  saveFollowings(eventInitEx, userKeys.pub);
  return { eventInitEx, relays };
};

export const publishFollowChanges = async (changes) => {
  try {
    const res = await updateFollowList(changes);
    if (res.error === "unavailable")
      store.dispatch(setToast({ type: 2, desc: t("ADjYzrA") }));
    if (res.eventInitEx)
      store.dispatch(
        setToPublish({ eventInitEx: res.eventInitEx, allRelays: res.relays }),
      );
    return res;
  } catch (err) {
    console.log(err);
    return { error: "failed" };
  }
};
