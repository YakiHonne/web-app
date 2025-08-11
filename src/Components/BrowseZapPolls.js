import React, { useEffect, useState } from "react";
import { nip19 } from "nostr-tools";
import { getBech32 } from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import MinimalZapPollPreview from "@/Components/MinimalZapPollPreview";
import LoadingDots from "@/Components/LoadingDots";
import { useSelector } from "react-redux";
import { saveUsers } from "@/Helpers/DB";
import { getUser } from "@/Helpers/Controlers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";

export default function BrowseZapPolls({ setNevent, exit }) {
  const userKeys = useSelector((state) => state.userKeys);
  const userRelays = useSelector((state) => state.userRelays);

  const { t } = useTranslation();
  const [myPolls, setMyPolls] = useState([]);
  const [comPolls, setComPolls] = useState([]);
  const [myPollsLE, setMyPollsLE] = useState(undefined);
  const [comPollsLE, setComPollsLE] = useState(undefined);
  const [selectedOption, setSelectedOption] = useState("com");
  const [isLoading, setIsLoading] = useState(false);
  const [sub, setSub] = useState(false);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      const { relays, filter } = getFilter();
      let events = [];
      const subscription = ndkInstance.subscribe(filter, {
        closeOnEose: true,
        cacheUsage: "CACHE_FIRST",
      });

      subscription.on("event", async (event) => {
        events.push(event.pubkey);
        let nEvent = nip19.neventEncode({
          id: event.id,
          pubkey: event.pub,
        });
        try {
          if (selectedOption === "self") {
            setMyPolls((prev) => {
              let index = prev.findIndex((item) => item.id === event.id);
              if (index === -1)
                return [{ ...event, nEvent }, ...prev].sort(
                  (ev_1, ev_2) => ev_2.created_at - ev_1.created_at
                );
              return prev;
            });
          }
          if (selectedOption === "com") {
            setComPolls((prev) => {
              let index = prev.findIndex((item) => item.id === event.id);
              if (index === -1)
                return [{ ...event, nEvent }, ...prev].sort(
                  (ev_1, ev_2) => ev_2.created_at - ev_1.created_at
                );
              return prev;
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
    };

    getData();
  }, [myPollsLE, comPollsLE, selectedOption]);

  const getFilter = () => {
    let relaysToUse = userRelays;
    if (selectedOption === "self") {
      return {
        relays: relaysToUse,
        filter: [
          {
            kinds: [6969],
            authors: [userKeys.pub],
            until: myPollsLE,
            limit: 10,
          },
        ],
      };
    }
    return {
      relays: relaysToUse,
      filter: [{ kinds: [6969], until: comPollsLE, limit: 10 }],
    };
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading) return;
      let container = document.querySelector(".main-container");
      if (!container) return;
      if (
        container.scrollHeight - container.scrollTop - 60 >
        document.documentElement.offsetHeight
      ) {
        return;
      }
      setComPollsLE(comPolls[comPolls.length - 1]?.created_at || undefined);
      setMyPollsLE(myPolls[myPolls.length - 1]?.created_at || undefined);
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
    if (selectedOption === source) return;
    sub?.stop();
    setSelectedOption(source);
  };
  return (
    <div
      className="fixed-container fx-centered fx-start-v"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="fit-height overlay-container fx-centered fx-start-v fx-start-h fx-col bg-sp"
        style={{
          width: "min(100%,700px)",
          overflow: "scroll",
          border: "1px solid var(--pale-gray)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="fit-container fx-centered sticky"
          style={{ padding: "1rem" }}
        >
          <div
            className={`list-item fx-centered fx ${
              selectedOption === "com" ? "selected-list-item" : ""
            }`}
            onClick={() => handleContentSource("com")}
          >
            <p>{t("ADAU7C1")}</p>
          </div>
          <div
            className={`list-item fx-centered fx ${
              selectedOption === "self" ? "selected-list-item" : ""
            }`}
            onClick={() => handleContentSource("self")}
          >
            <p>{t("AQyoumZ")}</p>
          </div>
          <div className="close" style={{ position: "static" }} onClick={exit}>
            <div></div>
          </div>
        </div>
        <div className="fit-container fx-col fx-centered fx-start-h fx-start-v box-marg-s box-pad-h">
          {selectedOption === "self" &&
            myPolls.map((poll) => {
              return (
                <div
                  className="fit-container box-pad-h-m box-pad-v-m sc-s-18 fx-centered fx-col"
                  key={poll.id}
                >
                  <div className="fit-container fx-scattered">
                    <AuthorPreview pubkey={poll.pubkey} />
                    <div
                      className="round-icon-small round-icon-tooltip"
                      data-tooltip={t("Afcj438")}
                      onClick={() => setNevent(poll.nEvent)}
                    >
                      <div className="plus-sign"></div>
                    </div>
                  </div>
                  <MinimalZapPollPreview event={poll} />
                </div>
              );
            })}
          {selectedOption === "self" && myPolls.length === 0 && !isLoading && (
            <div
              className="fx-centered fit-container fx-col"
              style={{ height: "400px" }}
            >
              <h4>{t("Axpo9Sw")}</h4>
              <p className="gray-c p-centered">{t("A4w03gs")}</p>
            </div>
          )}
          {selectedOption === "com" &&
            comPolls.map((poll) => {
              return (
                <div
                  className="fit-container box-pad-h-m box-pad-v sc-s-18 fx-centered fx-col"
                  key={poll.id}
                >
                  <div className="fit-container fx-scattered">
                    <AuthorPreview pubkey={poll.pubkey} />
                    <div
                      className="round-icon-small round-icon-tooltip"
                      data-tooltip={t("Afcj438")}
                      onClick={() => setNevent(poll.nEvent)}
                    >
                      <div className="plus-sign"></div>
                    </div>
                  </div>
                  <MinimalZapPollPreview event={poll} />
                </div>
              );
            })}
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

const AuthorPreview = ({ pubkey }) => {
  let nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [author, setAuthor] = useState({
    pubkey: pubkey,
    display_name: getBech32("npub", pubkey).substring(0, 10),
    name: getBech32("npub", pubkey).substring(0, 10),
    picture: "",
  });
  useEffect(() => {
    let auth = getUser(pubkey);
    if (auth) {
      setAuthor(auth);
    }
  }, [nostrAuthors]);
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
