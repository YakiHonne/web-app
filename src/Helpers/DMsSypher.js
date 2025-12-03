import { nip04, nip44 } from "nostr-tools";
import { BunkerSigner, parseBunkerInput } from "nostr-tools/nip46";

const decrypt04UsingBunker = async (userKeys, otherPartyPubkey, content) => {
  try {
    const bunkerPointer = await parseBunkerInput(userKeys.bunker);
    const bunker = BunkerSigner.fromBunker(
      userKeys.localKeys.sec,
      bunkerPointer,
      {
        onauth: (url) => {
          window.open(
            url,
            "_blank",
            "width=600,height=650,scrollbars=yes,resizable=yes"
          );
        },
      }
    );
    await bunker.connect();
    let data = await bunker.nip04Decrypt(otherPartyPubkey, content);
    return data;
  } catch (err) {
    console.log(err);
    return "";
  }
};

const decrypt04 = async (event, userKeys) => {
  try {
    let pubkey =
      event.pubkey === userKeys.pub
        ? event.tags.find((tag) => tag[0] === "p")[1]
        : event.pubkey;

    let decryptedMessage = "";
    if (userKeys.ext) {
      decryptedMessage = await window.nostr.nip04.decrypt(
        pubkey,
        event.content
      );
    } else if (userKeys.sec) {
      decryptedMessage = await nip04.decrypt(
        userKeys.sec,
        pubkey,
        event.content
      );
    } else {
      decryptedMessage = await decrypt04UsingBunker(
        userKeys,
        pubkey,
        event.content
      );
    }
    return decryptedMessage;
  } catch (err) {
    return false;
  }
};

const unwrapGiftWrap = async (event, userKeys) => {
  try {
    let decryptedEvent13 = await decrypt44(
      userKeys,
      event.pubkey,
      event.content
    );

    let { pubkey, content } = JSON.parse(decryptedEvent13);

    let decryptedEvent14 = await decrypt44(userKeys, pubkey, content);
    return JSON.parse(decryptedEvent14);
  } catch (err) {
    return false;
  }
};

const decrypt44 = async (userKeys, otherPartyPubkey, content) => {
  try {
    let decryptedMessage = "";
    if (userKeys.ext) {
      decryptedMessage = await window.nostr.nip44.decrypt(
        otherPartyPubkey,
        content
      );
    } else if (userKeys.sec) {
      decryptedMessage = await nip44.v2.decrypt(
        content,
        nip44.v2.utils.getConversationKey(userKeys.sec, otherPartyPubkey)
      );
    } else {
      decryptedMessage = await decrypt44UsingBunker(
        userKeys,
        otherPartyPubkey,
        content
      );
    }
    return decryptedMessage;
  } catch (err) {
    return false;
  }
};

const decrypt44UsingBunker = async (userKeys, otherPartyPubkey, content) => {
  try {
    const bunkerPointer = await parseBunkerInput(userKeys.bunker);
    const bunker = BunkerSigner.fromBunker(
      userKeys.localKeys.sec,
      bunkerPointer,
      {
        onauth: (url) => {
          window.open(
            url,
            "_blank",
            "width=600,height=650,scrollbars=yes,resizable=yes"
          );
        },
      }
    );
    await bunker.connect();

    let data = await bunker.nip44Decrypt(otherPartyPubkey, content);
    return data;
  } catch (err) {
    console.log(err);
    return "";
  }
};

export { decrypt04, unwrapGiftWrap };
