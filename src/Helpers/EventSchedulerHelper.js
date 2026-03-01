import { generateSecretKey, getPublicKey, nip44 } from "nostr-tools";
import { getDVMMasterKey, getKeys, setDVMMasterKey } from "./ClientHelpers";
import { getSubData, InitEvent } from "./Controlers";
import { encrypt44, bytesTohex, decrypt44 } from "./Encryptions";
import { setToPublish } from "@/Store/Slides/Publishers";
import { store } from "@/Store/Store";

let DVM_PUBKEY =
  "fb04b2aadb3cf9d3b97af52d3f544e1159ee1a4b8548334549d13b7cac4f8769";

export const getMasterKey = async () => {
  const userKeys = getKeys();
  let currentMasterKey = `master-key-${userKeys.pub}`;
  let cachedMasterKey = getDVMMasterKey(currentMasterKey);
  if (cachedMasterKey) return cachedMasterKey;
  const rumors = await getSubData(
    [{ kinds: [1059], "#p": [userKeys.pub], "#t": ["pidgeon-master-v3"] }],
    undefined,
    undefined,
    undefined,
    undefined,
    true,
  );
  let rumor = rumors.data.length > 0 ? rumors.data[0] : false;
  if (!rumor) {
    await masterKeyRequest();
    let key = await getMasterKey();
    return key;
  }
  let seal = await decrypt44(userKeys, rumor.pubkey, rumor.content);
  let parsedSeal = JSON.parse(seal);
  let unwrap = await decrypt44(userKeys, DVM_PUBKEY, parsedSeal.content);
  let parsedUnwrap = JSON.parse(unwrap);
  let masterPayload = JSON.parse(parsedUnwrap.content);
  let masterKey = setDVMMasterKey({
    key: currentMasterKey,
    payload: masterPayload,
  });
  return masterKey;
};

export const masterKeyRequest = async () => {
  const userKeys = getKeys();
  const ephemeralSK = generateSecretKey();
  let request = {
    kind: 5901,
    content: JSON.stringify({ t: "pidgeon-master-request", v: 3 }),
    tags: [
      ["p", DVM_PUBKEY],
      ["k", "3"],
    ],
  };
  let signedRequest = await InitEvent(
    request.kind,
    request.content,
    request.tags,
  );
  if (!signedRequest) return false;

  let encryptedRequest = await encrypt44(
    userKeys,
    DVM_PUBKEY,
    JSON.stringify(request),
  );

  if (!encryptedRequest) return false;
  let seal = {
    kind: 13,
    content: encryptedRequest,
    tags: [],
  };
  let signedSeal = await InitEvent(seal.kind, seal.content, seal.tags);
  if (!signedSeal) return false;

  let encryptedSeal = await encrypt44(
    { sec: bytesTohex(ephemeralSK) },
    DVM_PUBKEY,
    JSON.stringify(signedSeal),
  );
  if (!encryptedSeal) return false;

  let wrap = {
    kind: 1059,
    tags: [["p", DVM_PUBKEY]],
    content: encryptedSeal,
  };
  let signedWrap = await InitEvent(
    wrap.kind,
    wrap.content,
    wrap.tags,
    undefined,
    { pub: getPublicKey(ephemeralSK), sec: bytesTohex(ephemeralSK) },
  );
  if (!signedWrap) return false;

  store.dispatch(setToPublish({ eventInitEx: signedWrap }));
};

const getScheduleData = async ({ event, relays, kSubmit }) => {
  let eventData = JSON.stringify({
    tags: [["i", JSON.stringify(event), "text"]],
  });
  let encryptedData = nip44.v2.encrypt(eventData, kSubmit);
  if (!encryptedData) return false;
  let rumorEvent = {
    kind: 5905,
    content: encryptedData,
    tags: [
      ["p", DVM_PUBKEY],
      ["k", "3"],
      ["relays", ...relays],
    ],
  };
  let signedRumorEvent = await InitEvent(
    rumorEvent.kind,
    rumorEvent.content,
    rumorEvent.tags,
  );
  return signedRumorEvent;
};

const getScheduleEventSeal = async ({ event, relays, kSubmit, userKeys }) => {
  let scheduledEvent = await getScheduleData({ event, relays, kSubmit });
  if (!scheduledEvent) return false;
  let encryptedData = await encrypt44(
    userKeys,
    DVM_PUBKEY,
    JSON.stringify(scheduledEvent),
  );
  if (!encryptedData) return false;
  let seal = {
    kind: 13,
    content: encryptedData,
    tags: [],
  };
  let signedSeal = await InitEvent(seal.kind, seal.content, seal.tags);
  return signedSeal;
};

const wrapScheduleEventSeal = async ({ event, relays, kSubmit, userKeys }) => {
  const ephemeralSK = generateSecretKey();
  let scheduledEventSeal = await getScheduleEventSeal({
    event,
    relays,
    kSubmit,
    userKeys,
  });
  if (!scheduledEventSeal) return false;
  let encryptedScheduledEventSeal = await encrypt44(
    { sec: bytesTohex(ephemeralSK) },
    DVM_PUBKEY,
    JSON.stringify(scheduledEventSeal),
  );
  if (!encryptedScheduledEventSeal) return false;
  let wrap = {
    kind: 1059,
    content: encryptedScheduledEventSeal,
    tags: [["p", DVM_PUBKEY]],
  };
  let signedWrap = await InitEvent(
    wrap.kind,
    wrap.content,
    wrap.tags,
    undefined,
    { pub: getPublicKey(ephemeralSK), sec: bytesTohex(ephemeralSK) },
  );
  return signedWrap;
};

export const publishScheduledEvent = async ({ event, relays }) => {
  const userKeys = getKeys();
  let masterKey = await getMasterKey();
  let wrappedSchedleEvent = await wrapScheduleEventSeal({
    event,
    relays,
    kSubmit: masterKey.ksubmit,
    userKeys,
  });
  if (!wrappedSchedleEvent) return false;
  store.dispatch(
    setToPublish({
      eventInitEx: wrappedSchedleEvent,
      allRelays: masterKey.relays?.length > 0 ? masterKey.relays : relays,
    }),
  );
  return true;
};
