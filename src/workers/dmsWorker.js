// decryptDMS.worker.js

// import { saveUsers } from "../Helpers/DB.js";
import { decrypt04, unwrapGiftWrap } from "../Helpers/DMsSypher";

onmessage = async (e) => {
  const { inbox, userKeys } = e.data;

  try {
    let authors = [];
    let until = Math.floor(Date.now() / 1000);
    let tempInbox = await Promise.all(
      inbox.map(async (event) => {
        if (event.kind === 4 && !userKeys.bunker) {
          let decryptedMessage = "";
          authors = [...new Set([...authors, event.pubkey])];

          let peer =
            event.pubkey === userKeys.pub
              ? event.tags.find((t) => t[0] === "p" && t[1])[1]
              : "";

          let reply = event.tags.find((t) => t[0] === "e");
          let replyID = reply ? reply[1] : "";

          decryptedMessage = await decrypt04(event, userKeys);

          let tempEvent = {
            id: event.id,
            created_at: event.created_at,
            content: decryptedMessage,
            pubkey: event.pubkey,
            kind: event.kind,
            peer,
            replyID,
          };

          until = Math.min(until, event.created_at);
          return tempEvent;
        }

        if (
          event.kind === 1059 &&
          (userKeys.sec || self?.nostr?.nip44) &&
          !userKeys.bunker
        ) {
          try {
            let unwrappedEvent = await unwrapGiftWrap(event, userKeys);

            if (unwrappedEvent && unwrappedEvent.kind === 14) {
              authors = [...new Set([...authors, unwrappedEvent.pubkey])];

              let peer =
                unwrappedEvent.pubkey === userKeys.pub
                  ? unwrappedEvent.tags.find((t) => t[0] === "p")[1]
                  : "";

              let reply = unwrappedEvent.tags.find((t) => t[0] === "e");
              let replyID = reply ? reply[1] : "";

              let tempEvent = {
                id: unwrappedEvent.id,
                created_at: unwrappedEvent.created_at,
                content: unwrappedEvent.content,
                pubkey: unwrappedEvent.pubkey,
                kind: unwrappedEvent.kind,
                peer,
                replyID,
              };

              until = Math.min(until, event.created_at);
              return tempEvent;
            }
          } catch (err) {
            console.log(err);
          }
        }
      })
    );

    // await saveUsers(authors);

    postMessage({
      inbox: tempInbox.filter(Boolean),
      authors,
      until: until - 1,
    });
  } catch (err) {
    postMessage({ error: err.message || "Worker failed" });
  }
};
