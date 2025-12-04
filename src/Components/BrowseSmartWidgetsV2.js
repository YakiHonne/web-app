
import React, { useEffect, useState } from "react";
import { nip19 } from "nostr-tools";
import {
  getEmptyuserMetadata,
  getParsedSW,
} from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import LoadingDots from "@/Components/LoadingDots";
import PreviewWidget from "@/Components/SmartWidget/PreviewWidget";
import { useSelector } from "react-redux";
import { getUser } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";
import WidgetCardV2 from "./WidgetCardV2";

export default function BrowseSmartWidgetsV2({ setWidget, exit }) {
  const userKeys = useSelector((state) => state.userKeys);
  const userRelays = useSelector((state) => state.userRelays);
  const { t } = useTranslation();
  const [comWidgets, setComWidgets] = useState([]);
  const [myWidgets, setMyWidgets] = useState([]);
  const [contentSource, setContentSource] = useState("community");
  const [myWidgetsLE, setMyWidgetsLE] = useState(undefined);
  const [comWidgetsLE, setComWidgetsLE] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [sub, setSub] = useState(false);

  useEffect(() => {
    const { filter } = getFilter();
    let events = [];
    setIsLoading(true);
    let subscription = ndkInstance.subscribe(filter, {
      closeOnEose: true,
      cacheUsage: "CACHE_FIRST",
    });
    subscription.on("event", (event) => {
      try {
        let metadata = getParsedSW(event.rawEvent());
        events.push(event.pubkey);
        if (contentSource === "community") {
          setComWidgets((prev) => {
            let element = prev.find((widget) => widget.id === event.id);
            if (element) return prev;
            return [
              {
                metadata,
                ...event,
                author: getEmptyuserMetadata(event.pubkey),
              },
              ...prev,
            ].sort((el_1, el_2) => el_2.created_at - el_1.created_at);
          });
        }
        if (contentSource === "self") {
          setMyWidgets((prev) => {
            let element = prev.find((widget) => widget.id === event.id);
            if (element) return prev;
            return [
              {
                metadata,
                ...event,
                author: getEmptyuserMetadata(event.pubkey),
              },
              ...prev,
            ].sort((el_1, el_2) => el_2.created_at - el_1.created_at);
          });
        }
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    });
    subscription.on("eose", () => {
      saveUsers([...new Set(events)]);
      setIsLoading(false);
    });

    setSub(subscription);
  }, [contentSource, myWidgetsLE, comWidgetsLE]);

  const getFilter = () => {
    let relaysToUse = userRelays;
    if (contentSource === "self") {
      return {
        relays: relaysToUse,
        filter: [
          {
            kinds: [30033],
            authors: [userKeys.pub],
            until: myWidgetsLE,
            limit: 10,
          },
        ],
      };
    }
    return {
      relays: relaysToUse,
      filter: [{ kinds: [30033], until: comWidgetsLE, limit: 10 }],
    };
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading) return;
      let container = document.querySelector(".main-page-nostr-container");
      if (!container) return;
      if (
        container.scrollHeight - container.scrollTop - 60 >
        document.documentElement.offsetHeight
      ) {
        return;
      }
      setMyWidgetsLE(
        comWidgets[comWidgets.length - 1]?.created_at || undefined
      );
      setComWidgetsLE(myWidgets[myWidgets.length - 1]?.created_at || undefined);
    };
    document
      .querySelector(".overlay-container")
      ?.addEventListener("scroll", handleScroll);
    return () =>
      document
        .querySelector(".overlay-container")
        ?.removeEventListener("scroll", handleScroll);
  }, [isLoading]);

  const handleContentSource = (source) => {
    if (source === contentSource) return;
    if (sub) sub.stop();
    setContentSource(source);
  };

  return (
    <div
      className="fixed-container fx-centered fx-start-v"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
      id="sw-browser"
    >
      <div
        className="fit-height overlay-container fx-centered fx-start-v fx-start-h fx-col sc-s-18 bg-sp"
        style={{
          width: "min(100%,550px)",
          overflow: "scroll",
          borderRadius: "0",
          border: "1px solid var(--pale-gray)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="box-pad-h-m  fit-container fx-col fx-centered fx-start-h fx-start-v"
          style={{ flex: 1.5, maxWidth: "700px" }}
        >
          <div
            className="fit-container sticky fx-centered fx-col"
            style={{ rowGap: "16px", backgroundColor: "var(--white)" }}
          >
            <div className="fit-container fx-centered ">
              <div
                className={`list-item fx-centered fx ${
                  contentSource === "community" ? "selected-list-item" : ""
                }`}
                onClick={() => handleContentSource("community")}
              >
                <p>{t("A1RYH3h")}</p>
              </div>
              <div
                className={`list-item fx-centered fx ${
                  contentSource === "self" ? "selected-list-item" : ""
                }`}
                onClick={() => handleContentSource("self")}
              >
                <p>{t("Ak5dbF4")}</p>
              </div>
              <div
                className="close"
                style={{ position: "static" }}
                onClick={exit}
              >
                <div></div>
              </div>
            </div>
          </div>
          <div
            className="fit-container fx-col fx-centered fx-start-h fx-start-v"
            style={{ width: "min(100%,700px)" }}
          >
            {contentSource === "community" &&
              comWidgets.map((widget) => {
                return (
                  <WidgetCardV2
                    widget={widget}
                    key={widget.id}
                    addWidget={setWidget}
                    options={false}
                    setWidget={setWidget}
                  />
                );
              })}
            {contentSource === "self" &&
              myWidgets.map((widget) => {
                return (
                  <WidgetCardV2
                    widget={widget}
                    key={widget.id}
                    addWidget={setWidget}
                    options={false}
                    setWidget={setWidget}
                  />
                );
              })}
          </div>
          {isLoading && (
            <div
              className="fit-container fx-centered"
              style={{ height: "30vh" }}
            >
              <p className="gray-c">{t("AKvHyxG")}</p>
              <LoadingDots />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const WidgetCard = ({ setWidget, widget }) => {
  const { t } = useTranslation();
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [authorData, setAuthorData] = useState(widget.author);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let auth = getUser(widget.author.pubkey);

        if (auth) {
          setAuthorData(auth);
        }
        return;
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [nostrAuthors]);

  return (
    <div
      className="box-pad-h-m box-pad-v-m sc-s-18 fx-centered fx-col fit-container fx-start-h fx-start-v"
      style={{ overflow: "visible" }}
    >
      <div className="fit-container fx-scattered">
        <AuthorPreview author={authorData} />
        <div
          className="fx-centered"
          onClick={() =>
            setWidget({
              ...widget,
              naddr: nip19.naddrEncode({
                pubkey: widget.pubkey,
                identifier: widget.d,
                kind: widget.kind,
              }),
            })
          }
        >
          <div
            className="round-icon-small round-icon-tooltip"
            data-tooltip={t("AcXhvAu")}
          >
            <div className="plus-sign"></div>
          </div>
        </div>
      </div>
      <PreviewWidget widget={widget.metadata} />
      {(widget.title || widget.description) && (
        <>
          <div
            className="fx-centered fx-col fx-start-h fx-start-v fit-container box-pad-v-s"
            style={{ rowGap: 0 }}
          >
            <p>{widget.title || t("AMvUjqZ")}</p>
            {widget.description && (
              <p className="gray-c p-medium">{widget.description}</p>
            )}
            {!widget.description && (
              <p className="gray-c p-italic p-medium">{t("AtZrjns")}</p>
            )}
          </div>
          <hr />
        </>
      )}
    </div>
  );
};

const AuthorPreview = ({ author }) => {
  return (
    <div className="fx-centered fx-start-h ">
      <UserProfilePic
        size={40}
        mainAccountUser={false}
        user_id={author.pubkey}
        img={author.picture}
        metadata={author}
      />
      <div>
        <p className="p-bold">{author.display_name || author.name}</p>
        <p className="p-medium gray-c">@{author.name || author.display_name}</p>
      </div>
    </div>
  );
};
