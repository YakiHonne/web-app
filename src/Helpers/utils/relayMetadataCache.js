import { localStorage_ } from "./clientLocalStorage";

const relayMetadataCache = new Map();

const initRelaysMetadata = () => {
  try {
    let relays = localStorage_.getItem("relaysMetadata");
    if (relays) {
      relays = JSON.parse(relays);
      relays.forEach((relay) => {
        setRelayMetadata(relay.url, relay);
      });
    }
  } catch (err) {
    console.log(err);
  }
};

initRelaysMetadata();

export const saveLocalRelaysMetadata = () => {
  try {
    let relays = Array.from(relayMetadataCache.values());
    localStorage_.setItem("relaysMetadata", JSON.stringify(relays));
  } catch (err) {
    console.log(err);
  }
};

export function setRelayMetadata(key, data) {
  relayMetadataCache.set(key, data);
}

export function getRelayMetadata(key) {
  let cleanURL = !key.endsWith("/") ? key : key.slice(0, -1);
  return (
    relayMetadataCache.get(cleanURL) ||
    relayMetadataCache.get(key) ||
    getEmptyRelaysData(cleanURL)
  );
}

export function clearRelayMetadata(key) {
  relayMetadataCache.delete(key);
}

export const getEmptyRelaysData = (url) => {
  return {
    url,
    name: url.replace("wss://", "").replace("https://", "").replace("/", ""),
    description: url,
    pubkey: "",
    contact: "",
    supported_nips: [],
    supported_nip_extensions: [],
    software: "",
    version: "",
    limitation: {
      auth_required: false,
      payment_required: false,
    },
    payments_url: "",
    fees: {
      admission: [],
    },
    isEmpty: true,
  };
};
