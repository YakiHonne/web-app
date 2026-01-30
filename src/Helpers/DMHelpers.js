import {
  generateSecretKey,
  finalizeEvent,
  getEventHash,
  nip44,
} from "nostr-tools";
import { bytesTohex, encrypt04, encrypt44 } from "./Encryptions";
import { InitEvent, updateYakiChestStats } from "./Controlers";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { store } from "@/Store/Store";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { t } from "i18next";
import { checkCurrentConvo, getInboxRelaysForUser } from "./DB";
import { relaysOnPlatform } from "@/Content/Relays";
import { getKeys } from "./ClientHelpers";
import axiosInstance from "./HTTP_Client";
import { getNDKInstanceForDMs } from "./utils/ndkInstancesForDMsCache";

export const sendMessage = async (selectedPerson, message) => {
  let userKeys = getKeys();
  let legacy =
    userKeys?.sec || window?.nostr?.nip44
      ? localStorage.getItem("legacy-dm")
      : true;
  if (
    !message ||
    !userKeys ||
    !selectedPerson ||
    (userKeys && !(userKeys.ext || userKeys.sec || userKeys.bunker))
  )
    return;
  let userInboxRelays = store.getState().userInboxRelays;
  let otherPartyRelays = await getInboxRelaysForUser(selectedPerson);
  let relaysToPublish = [
    ...new Set([
      ...userInboxRelays,
      ...(otherPartyRelays.length > 0 ? otherPartyRelays : relaysOnPlatform),
    ]),
  ];

  if (legacy) {
    let encryptedMessage = await encrypt04(userKeys, selectedPerson, message);
    if (!encryptedMessage) {
      return false;
    }
    let tags = [];
    tags.push(["p", selectedPerson]);

    let created_at = Math.floor(Date.now() / 1000);
    let tempEvent = {
      created_at,
      kind: 4,
      content: encryptedMessage,
      tags,
    };
    tempEvent = await InitEvent(
      tempEvent.kind,
      tempEvent.content,
      tempEvent.tags,
      tempEvent.created_at,
    );
    if (!tempEvent) return;
    store.dispatch(
      setToPublish({
        eventInitEx: tempEvent,
        allRelays: relaysToPublish,
      }),
    );
    return true;
  }
  if (!legacy) {
    let { sender_event, receiver_event } = await getGiftWrap(
      selectedPerson,
      userKeys,
      message,
    );

    if (!(sender_event && receiver_event)) return false;

    let response = await initPublishing(
      `${userKeys.pub}:${selectedPerson}`,
      relaysToPublish,
      sender_event,
      receiver_event,
    );
    if (response) {
      let action_key =
        selectedPerson ===
        "20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3"
          ? "dms-10"
          : "dms-5";
      updateYakiChest(action_key);
      return true;
    } else {
      return false;
    }
  }
};

const getGiftWrap = async (selectedPerson, userKeys, message) => {
  let g_sk_1 = bytesTohex(generateSecretKey());
  let g_sk_2 = bytesTohex(generateSecretKey());

  let [signedKind13_1, signedKind13_2] = await Promise.all([
    getEventKind13(selectedPerson, userKeys, selectedPerson, message),
    getEventKind13(userKeys.pub, userKeys, selectedPerson, message),
  ]);

  if (!(signedKind13_1 && signedKind13_2)) return false;

  let content_1 = nip44.v2.encrypt(
    JSON.stringify(signedKind13_1),
    nip44.v2.utils.getConversationKey(g_sk_1, selectedPerson),
  );
  let content_2 = nip44.v2.encrypt(
    JSON.stringify(signedKind13_2),
    nip44.v2.utils.getConversationKey(g_sk_2, userKeys.pub),
  );
  let event_1 = {
    created_at: getRandomizedTimestamp(),
    kind: 1059,
    tags: [["p", selectedPerson]],
    content: content_1,
  };
  let event_2 = {
    created_at: getRandomizedTimestamp(),
    kind: 1059,
    tags: [["p", userKeys.pub]],
    content: content_2,
  };
  event_1 = finalizeEvent(event_1, g_sk_1);
  event_2 = finalizeEvent(event_2, g_sk_2);
  return { sender_event: event_2, receiver_event: event_1 };
};

const getEventKind14 = (selectedPerson, userKeys, message) => {
  let event = {
    pubkey: userKeys.pub,
    created_at: Math.floor(Date.now() / 1000),
    kind: 14,
    tags: [
      ["p", selectedPerson],
      ["p", userKeys.pub],
    ],
    content: message,
  };

  event.id = getEventHash(event);
  return event;
};

const getEventKind13 = async (pubkey, userKeys, selectedPerson, message) => {
  let unsignedKind14 = getEventKind14(selectedPerson, userKeys, message);
  let content = await encrypt44(
    userKeys,
    pubkey,
    JSON.stringify(unsignedKind14),
  );

  if (!content) return false;

  let event = {
    created_at: getRandomizedTimestamp(),
    kind: 13,
    tags: [],
    content,
  };
  event = await InitEvent(
    event.kind,
    event.content,
    event.tags,
    event.created_at,
  );
  return event;
};

const initPublishing = async (name, relays, event1, event2) => {
  try {
    let ndkInstanceForDM = await getNDKInstanceForDMs(name, relays);
    let ev1 = new NDKEvent(ndkInstanceForDM, event1);
    let ev2 = new NDKEvent(ndkInstanceForDM, event2);

    let [res1, res2] = await Promise.race([ev1.publish(), ev2.publish()]);

    store.dispatch(
      setToast({
        type: 1,
        desc: t("Ax4F7eu"),
      }),
    );

    return true;
  } catch (err) {
    console.log(err);
    store.dispatch(
      setToast({
        type: 2,
        desc: t("A4cCSy5"),
      }),
    );
    return false;
  }
};

const updateYakiChest = async (action_key) => {
  try {
    let data = await axiosInstance.post("/api/v1/yaki-chest", {
      action_key,
    });
    let { user_stats, is_updated } = data.data;

    if (is_updated) {
      store.dispatch(setUpdatedActionFromYakiChest(is_updated));
      updateYakiChestStats(user_stats);
    }
  } catch (err) {
    console.log(err);
  }
};

export const handleUpdateConversation = (event) => {
  const userKeys = getKeys();
  if (event.checked) return;
  let tempEvent = {
    pubkey: event.pubkey,
    convo: event.convo,
    id: event.id,
    last_message: event.last_message,
    checked: true,
  };
  checkCurrentConvo(tempEvent, userKeys.pub);
};

const getRandomizedTimestamp = () => {
  let randomTimestamp =
    Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 172800);
  return randomTimestamp;
};
