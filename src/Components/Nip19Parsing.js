import React, { useEffect, useState } from "react";
import {
  getBech32,
  getEmptyuserMetadata,
  getHex,
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

export default function Nip19Parsing({ addr, minimal = false }) {
  const [event, setEvent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isParsed, setIsParsed] = useState(false);
  const [url, setUrl] = useState("/");
  const { t } = useTranslation();

  useEffect(() => {
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
          url_ = `/curations/${addr_}`;
        if (data.data.kind === 34235) url_ = `/videos/${addr_}`;
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
        if (event.kind === 0) {
          let content = JSON.parse(event.content);
          setEvent({
            kind: event.kind,
            picture: content.picture || "",
            name:
              content.name ||
              content.display_name ||
              getBech32("npub", event.pubkey).substring(0, 10),
            display_name:
              content.display_name ||
              content.name ||
              getBech32("npub", event.pubkey).substring(0, 10),
          });
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

  if (
    event?.kind === 1 ||
    ((addr.startsWith("nevent") || addr.startsWith("note")) && addr.length > 20)
  )
    return (
      <>
        {!minimal && (
          <>
            {event?.kind === 1 && (
              <div className="fit-container sc-s-18 box-pad-h-s box-pad-v-s" style={{ marginTop: ".5rem", backgroundColor: "var(--c1-side)", border:"none" }}>
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
          </>
        )}
        {minimal && (
          <Link
            href={`/notes/${addr}`}
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

  if (!event)
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
  if (event.kind === 0)
    return (
      <Link
        href={url}
        className="btn-text-gray"
        target={"_blank"}
        onClick={(e) => e.stopPropagation()}
        style={{ color: "var(--orange-main)" }}
      >
        @{event.display_name}
      </Link>
    );
  if (event.kind === 30031)
    return (
      <div className="fit-container box-pad-v-s">
        {/* {!minimal && (
          <WidgetCard widget={event} deleteWidget={null} options={false} />
        
        )} */}
        <MinimalPreviewWidget widget={event} />
        {/* {minimal && <MinimalPreviewWidget widget={event} />} */}
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
        {/* <SWCard widget={event} /> */}
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
}
