import { nip19 } from "nostr-tools";
import { checkMentionInContent, nEventEncode } from "./ClientHelpers";
import { t } from "i18next";
import { eventKinds } from "@/Content/Extra";
import { parsNutZap } from "./Helpers";

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
  if (reaction === "+" || !reaction) return "👍";
  if (reaction === "-") return "👎";
  return reaction;
};

const getRepEventsLink = (pubkey, kind, identifier) => {
  let naddr = nip19.naddrEncode({ pubkey, identifier, kind });
  if (kind == 30023) return `/article/${naddr}`;
  if (kind == 30004) return `/curation/${naddr}`;
  if (kind == 30005) return `/curation/${naddr}`;
  if (kind == 34235) return `/video/${naddr}`;
  if (kind == 34236) return `/video/${naddr}`;
  if (kind == 21) return `/video/${naddr}`;
  if (kind == 22) return `/video/${naddr}`;
  if (kind == 20) return `/image/${naddr}`;
  if (kind == 30031) return `/smart-widget-checker?naddr=${naddr}`;
};
const getUnRepEventsLink = (id, kind, event) => {
  let nevent = event?.encode ? event.encode() : nEventEncode(id);
  if (kind == 1 || kind == 1111) return `/note/${nevent}`;
  if (kind == 21) return `/video/${nevent}`;
  if (kind == 22) return `/video/${nevent}`;
  if (kind == 20) return `/image/${nevent}`;
};

const checkEventType = (event, pubkey, relatedEvent, username) => {
  try {
    if (event.kind === 1 || event.kind === 1111) {
      let isReply = event.tags.find(
        (tag) => tag.length > 3 && tag[3] === "reply",
      );
      let isRoot = event.tags.find(
        (tag) => tag.length > 3 && tag[3] === "root",
      );
      let isQuote = event.kind === 1 ? event.tags.find((tag) => tag[0] === "q") : false;
      let isPaidNote = event.kind === 1 ? event.tags.find(
        (tag) => tag[0] === "l" && tag[1] === "FLASH NEWS",
      ) : false;
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
          url: getUnRepEventsLink(event.id, event.kind, relatedEvent),
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
          url: getUnRepEventsLink(
            relatedEvent?.id || event.id,
            relatedEvent?.kind || event.kind,
            relatedEvent,
          ),
        };
      }
      if (isRoot) {
        let isMention = checkMentionInContent(event.content, pubkey);
        let eventKind =
          isRoot[0] === "a" ? isRoot[1].split(":")[0] : relatedEvent?.kind || 1;
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
          : getUnRepEventsLink(
              relatedEvent?.id || event.id,
              relatedEvent?.kind || event.kind,
            );
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
          url: getUnRepEventsLink(
            relatedEvent?.id || event.id,
            relatedEvent?.kind || event.kind,
            relatedEvent,
          ),
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
        url: getUnRepEventsLink(
          relatedEvent?.id || event.id,
          relatedEvent?.kind || event.kind,
          relatedEvent,
        ),
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

      let eventKind =
        ev[0] === "a" ? ev[1].split(":")[0] : relatedEvent?.kind || 1;
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
        : getUnRepEventsLink(
            relatedEvent?.id || event.id,
            relatedEvent?.kind || event.kind,
            relatedEvent,
          );

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
    if (event.kind === 9321) {
      let url = "/cashu-wallet?tab=nutzap";
      let parsedZap = parsNutZap(event);

      return {
        type: "zaps",
        label_1: t("ACVPtR9", { name: username, amount: parsedZap.amount }),
        label_2: parsedZap.message ? `: ${parsedZap.message}` : "",
        icon: eventIcons.zaps,
        id: event.id,
        url,
      };
    }
  } catch (err) {
    console.log(event, err);
    return false;
  }
};

export { checkEventType };
