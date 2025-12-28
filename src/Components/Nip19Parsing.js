import React, { useEffect, useState } from "react";
import {
  getEmptyuserMetadata,
  getHex,
  getParsedAuthor,
  getParsedMedia,
  getParsedRepEvent,
  getParsedSW,
} from "@/Helpers/Encryptions";
import { getParsedNote } from "@/Helpers/ClientHelpers";
import { nip19 } from "nostr-tools";
import Link from "next/link";
import KindOne from "@/Components/KindOne";
import LoadingDots from "@/Components/LoadingDots";
import MinimalPreviewWidget from "@/Components/SmartWidget/MinimalPreviewWidget";
import { saveUsers } from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";
import LinkRepEventPreview from "@/Components/LinkRepEventPreview";
import ZapPollsComp from "@/Components/SmartWidget/ZapPollsComp";
import WidgetCardV2 from "@/Components/WidgetCardV2";
import UserProfilePic from "./UserProfilePic";
import { getLinkFromAddr } from "@/Helpers/Helpers";
import UnsupportedKindPreview from "./UnsupportedKindPreview";
import {
  getEventFromCache,
  setEventFromCache,
} from "@/Helpers/utils/eventsCache";
import MediaEventPreview from "./MediaEventPreview";

const getPreviouslyCachedEvent = (addr) => {
  try {
    let addr_ = addr
      .replaceAll(",", "")
      .replaceAll(":", "")
      .replaceAll(";", "")
      .replaceAll(".", "");
    if (addr_.startsWith("naddr")) {
      let data = nip19.decode(addr_);
      let aTag = `${data.data.kind}:${data.data.pubkey}:${data.data.identifier}`;
      let event = getEventFromCache(aTag);
      return event ? getParsedRepEvent(event) : false;
    }
    if (addr_.startsWith("nprofile")) {
      let data = nip19.decode(addr_);
      let pubkey = data.data.pubkey;
      let event = getEventFromCache(pubkey);
      return event ? getParsedAuthor(event) : false;
    }
    if (addr_.startsWith("npub")) {
      let data = nip19.decode(addr_);
      let pubkey = "";
      if (typeof data.data === "string") pubkey = data.data;
      else if (data.data.pubkey) pubkey = data.data.pubkey;
      let event = getEventFromCache(pubkey);
      return event ? getParsedAuthor(event) : false;
    }

    if (addr_.startsWith("nevent") || addr_.startsWith("note")) {
      let data = nip19.decode(addr_);
      let event = getEventFromCache(data.data.id || data.data);
      return event ? getParsedNote(event, true) : false;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const setNewlyFetchedEventToCache = (event) => {
  let id = event.id;
  if (event.kind === 0) id = event.pubkey;
  if ([30033, 30031, 30004, 30005, 30023, 34235, 22, 21].includes(event.kind))
    id = getParsedRepEvent(event).aTag;
  setEventFromCache(id, event.rawEvent());
};
function Nip19Parsing({ addr, minimal = false }) {
  const [event, setEvent] = useState(getPreviouslyCachedEvent(addr));
  const [isLoading, setIsLoading] = useState(true);
  const [isParsed, setIsParsed] = useState(false);
  const [isUnsupported, setIsUnsupported] = useState(false);
  const [url, setUrl] = useState(getLinkFromAddr(addr));
  const { t } = useTranslation();
  useEffect(() => {
    if (event) return;
    let filter = [];
    try {
      let addr_ = addr
        .replaceAll(",", "")
        .replaceAll(":", "")
        .replaceAll(";", "")
        .replaceAll(".", "");
      if (addr_.startsWith("naddr")) {
        let data = nip19.decode(addr_);
        filter.push({
          kinds: [data.data.kind],
          "#d": [data.data.identifier],
          authors: [data.data.pubkey],
        });
        let url_ = "";
        if (data.data.kind === 30023) url_ = `/article/${addr_}`;
        if ([30004, 30005].includes(data.data.kind))
          url_ = `/curation/${addr_}`;
        if ([34235, 21, 22].includes(data.data.kind)) url_ = `/video/${addr_}`;
        setUrl(url_);
      }
      if (addr_.startsWith("nprofile")) {
        let data = nip19.decode(addr_);
        filter.push({
          kinds: [0],
          authors: [data.data.pubkey],
        });
        let url_ = `/profile/${addr_}`;
        setUrl(url_);
      }
      if (addr_.startsWith("npub")) {
        let data = nip19.decode(addr_);
        let pubkey = "";
        if (typeof data.data === "string") pubkey = data.data;
        else if (data.data.pubkey) pubkey = data.data.pubkey;
        filter.push({
          kinds: [0],
          authors: [pubkey],
        });
        let hex = getHex(addr_.replace(",", "").replace(".", ""));
        let url_ = `/profile/${nip19.nprofileEncode({ pubkey: hex })}`;
        setUrl(url_);
      }

      if (addr_.startsWith("nevent") || addr_.startsWith("note")) {
        let data = nip19.decode(addr_);
        filter.push({
          ids: [data.data.id || data.data],
        });
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      return;
    }
    setIsParsed(true);

    if (filter.length === 0) {
      setIsLoading(false);
      return;
    }

    const sub = ndkInstance.subscribe(filter, {
      cacheUsage: "CACHE_FIRST",
      groupable: false,
      subId: "nip19-parsing",
    });
    sub.on("event", (event) => {
      if (event.id) {
        setNewlyFetchedEventToCache(event);
        if (event.kind === 0) {
          let content =
            getParsedAuthor(event.rawEvent()) ||
            getEmptyuserMetadata(event.pubkey);
          setEvent({ ...content, kind: 0 });
        }
        if (event.kind === 1) {
          let parsedEvent = getParsedNote(event, true);

          setEvent(parsedEvent);
          setIsLoading(false);
        }
        if ([6969, 30033].includes(event.kind)) {
          setEvent(event.rawEvent());
          setIsLoading(false);
        }

        if (event.kind === 30031) {
          let metadata = JSON.parse(event.content);
          let parsedContent = getParsedRepEvent(event);
          setEvent({
            ...parsedContent,
            metadata,
            ...event,
            author: getEmptyuserMetadata(event.pubkey),
          });
          saveUsers([event.pubkey]);
          setIsLoading(false);
        }
        if ([30004, 30005, 30023, 34235].includes(event.kind)) {
          let parsedContent = getParsedRepEvent(event);
          let title = parsedContent.title;
          if (!title) {
            if ([30004, 30005].includes(event.kind)) title = t("A1lshru");
            if ([30023].includes(event.kind)) title = t("Aqw9gzk");
            if ([34235].includes(event.kind)) title = t("A3vFdLd");
          }
          setEvent({
            ...parsedContent,
            title,
          });
        }
        if ([20, 22, 21].includes(event.kind)) {
          let parsedContent = getParsedMedia(event);
          setEvent({
            ...parsedContent,
          });
        }
        if (
          ![
            0, 1, 6969, 30033, 30031, 30004, 30005, 30023, 34235, 22, 21,
          ].includes(event.kind)
        ) {
          setIsUnsupported(true);
        }
        saveUsers([event.pubkey]);
        setIsLoading(false);
        sub.stop();
      }
    });

    let timer = setTimeout(() => {
      setIsLoading(false);
      clearTimeout(timer);
    }, 4000);

    return () => {
      sub.stop();
      clearTimeout(timer);
    };
  }, []);

  if (!event && !isUnsupported)
    return (
      <>
        {isParsed && (
          <Link
            href={`/${addr}`}
            className="btn-text-gray"
            target={"_blank"}
            onClick={(e) => e.stopPropagation()}
            style={{ color: "var(--orange-main)" }}
          >
            @{addr.substring(0, 10)}
          </Link>
        )}
        {!isParsed && <p>{addr}</p>}
      </>
    );
  if (!event && isUnsupported)
    return (
      <>
        {isParsed && (
          <UnsupportedKindPreview addr={addr} />
        )}
        {!isParsed && <p>{addr}</p>}
      </>
    );
  if (
    event?.kind === 1 ||
    ((addr.startsWith("nevent") || addr.startsWith("note")) && addr.length > 20)
  )
    return (
      <>
        {!minimal && (
          <>
            {event?.kind === 1 && (
              <div
                className="fit-container sc-s-18 "
                style={{
                  marginTop: ".5rem",
                  backgroundColor: "var(--c1-side)",
                }}
              >
                <KindOne event={event} reactions={false} minimal={true} />
              </div>
            )}
            {event?.kind === 6969 && (
              <div className="fit-container" style={{ paddingTop: ".5rem" }}>
                <ZapPollsComp event={event} />
              </div>
            )}
            {isLoading && !event && (
              <div
                style={{
                  backgroundColor: "var(--c1-side)",
                  marginTop: ".5rem",
                }}
                className="fit-container box-pad-h box-pad-v sc-s-18 fx-centered"
              >
                <p className="p-medium gray-c">{t("AgfmpuR")}</p>
                <LoadingDots />
              </div>
            )}
            {!isLoading && !event && (
              <div
                style={{
                  backgroundColor: "var(--c1-side)",
                  marginTop: ".5rem",
                }}
                className="fit-container box-pad-h-m box-pad-v-m sc-s-18 fx-centered"
              >
                <p className="p-medium gray-c">{t("AQeXcer")}</p>
              </div>
            )}
            {[30004, 30005, 30023, 34235].includes(event.kind) && (
              <div className="fit-container" style={{ margin: ".5rem 0" }}>
                {!minimal && (
                  <LinkRepEventPreview event={event} allowClick={true} />
                )}
                {minimal && (
                  <Link
                    href={url}
                    className="btn-text-gray"
                    target={"_blank"}
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: "var(--orange-main)" }}
                  >
                    @{event.title}
                  </Link>
                )}
              </div>
            )}
            {[20, 21, 22].includes(event.kind) && (
              <div className="fit-container" style={{ margin: ".5rem 0" }}>
                {!minimal && <MediaEventPreview event={event} />}
                {minimal && (
                  <Link
                    href={url}
                    className="btn-text-gray"
                    target={"_blank"}
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: "var(--orange-main)" }}
                  >
                    @{event.naddr || event.nEvent}
                  </Link>
                )}
              </div>
            )}
          </>
        )}
        {minimal && (
          <Link
            href={`/note/${addr}`}
            className="btn-text-gray"
            target={"_blank"}
            onClick={(e) => e.stopPropagation()}
            style={{ color: "var(--orange-main)" }}
          >
            @{addr.substring(0, 10)}
          </Link>
        )}
      </>
    );

  if (event.kind === 0)
    return (
      <UserProfilePic
        user_id={event.pubkey}
        size={16}
        mainAccountUser={false}
        withName={event.display_name || event.name}
        img={event.picture}
      />
    );
  if (event.kind === 30031)
    return (
      <div className="fit-container box-pad-v-s">
        <MinimalPreviewWidget widget={event} />
      </div>
    );
  if (event.kind === 30033)
    return (
      <div className="fit-container box-pad-v-s">
        <WidgetCardV2
          widget={{
            ...event,
            metadata: getParsedSW(event),
            author: getEmptyuserMetadata(event.pubkey),
          }}
          header={false}
        />
      </div>
    );

  if ([30004, 30005, 30023, 34235].includes(event.kind))
    return (
      <div className="fit-container" style={{ margin: ".5rem 0" }}>
        {!minimal && <LinkRepEventPreview event={event} allowClick={true} />}
        {minimal && (
          <Link
            href={url}
            className="btn-text-gray"
            target={"_blank"}
            onClick={(e) => e.stopPropagation()}
            style={{ color: "var(--orange-main)" }}
          >
            @{event.title}
          </Link>
        )}
      </div>
    );
  if ([20, 21, 22].includes(event.kind))
    return (
      <div className="fit-container" style={{ margin: ".5rem 0" }}>
        {!minimal && <MediaEventPreview event={event} />}
        {minimal && (
          <Link
            href={url}
            className="btn-text-gray"
            target={"_blank"}
            onClick={(e) => e.stopPropagation()}
            style={{ color: "var(--orange-main)" }}
          >
            @{event.naddr || event.nEvent}
          </Link>
        )}
      </div>
    );
}

const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.addr === nextProps.addr && prevProps.minimal === nextProps.minimal
  );
};

export default React.memo(Nip19Parsing, areEqual);
