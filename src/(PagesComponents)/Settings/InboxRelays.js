import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setToPublish } from "@/Store/Slides/Publishers";
import { InitEvent } from "@/Helpers/Controlers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import RelaysPicker from "@/Components/RelaysPicker";
import RelayImage from "@/Components/RelayImage";
import NDK from "@nostr-dev-kit/ndk";

export function InboxRelays({ setShowRelaysInfo, allRelays }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userInboxRelays = useSelector((state) => state.userInboxRelays);
  const relaysContainer = useRef(null);
  const [inboxRelaysStatus, setInboxRelaysStatus] = useState([]);
  const [tempUserRelays, setTempUserRelays] = useState([]);
  const currentUserRelays = useMemo(() => {
    return userInboxRelays.map((_) => {
      return { url: _ };
    });
  }, [userInboxRelays]);
  const suggestedRelays = useMemo(() => {
    let relays = [
      "wss://relay.damus.io",
      "wss://nostr-01.yakihonne.com",
      "wss://relay.0xchat.com",
    ];
    if (tempUserRelays.length === 0) return relays;
    return relays.filter((relay) => {
      return !tempUserRelays.some((item) => item.url === relay);
    });
  }, [tempUserRelays]);
  const connectedRelays = useMemo(() => {
    return {
      relaysStatus: inboxRelaysStatus.reduce((acc, relay) => {
        acc[relay.url] = relay.connected;
        return acc;
      }, {}),
      connected: inboxRelaysStatus.filter((relay) => relay.connected).length,
      total: inboxRelaysStatus.length,
    };
  }, [inboxRelaysStatus]);

  useEffect(() => {
    try {
      setTempUserRelays(userInboxRelays.map((_) => ({ url: _ })));
      setInboxRelaysStatus(
        userInboxRelays.map((item) => {
          return { url: item, connected: false };
        })
      );
    } catch (err) {
      console.log(err);
    }
  }, [userInboxRelays]);

  useEffect(() => {
    const CheckRelays = async () => {
      try {
        let res = await Promise.all(
          tempUserRelays.map(async (relay, index) => {
            let isRelay = ndkInstance.pool.getRelay(relay.url);
            if (isRelay) {
              return { url: relay.url, connected: isRelay.connected };
            } else {
              let tempNDK = new NDK({ explicitRelayUrls: [relay.url] });
              await tempNDK.connect(2000);
              let relayStatus = tempNDK.pool.getRelay(relay.url);
              return { url: relay.url, connected: relayStatus.connected };
            }
          })
        );
        setInboxRelaysStatus(res);
      } catch (err) {}
    };

    if (tempUserRelays) CheckRelays();
  }, [tempUserRelays]);

  const removeRelayFromList = (action, index) => {
    let tempArray = tempUserRelays.map((relay) => ({ ...relay }));
    if (action) {
      delete tempArray[index].toDelete;
      setTempUserRelays(tempArray);
    } else {
      tempArray[index].toDelete = true;
      setTempUserRelays(tempArray);
    }
  };

  const saveRelays = async () => {
    let relaysList = tempUserRelays
      .filter((_) => !_.toDelete)
      .map((_) => _.url);
    let tags = relaysList.map((url) => ["relay", url]);
    let event = {
      kind: 10050,
      content: "",
      tags,
    };
    event = await InitEvent(event.kind, event.content, event.tags);
    if (!event) return;
    dispatch(
      setToPublish({
        eventInitEx: event,
      })
    );
  };

  const addRelay = (url) => {
    setTempUserRelays((prev) => {
      let isThere = prev.find((relay) => relay.url === url);
      if (!isThere) return [{ url, read: true, write: true }, ...prev];
      return prev;
    });
    // let timeout = setTimeout(() => {
    //   if (relaysContainer.current) {
    //     relaysContainer.current.scrollTop =
    //       relaysContainer.current.scrollHeight;
    //   }
    //   clearTimeout(timeout);
    // }, 50);
  };

  const removePermanently = (index) => {
    let tempArray = tempUserRelays.filter((_, i) => i !== index);
    setTempUserRelays(tempArray);
  };
  return (
    <div className="fit-container box-pad-h-m fx-shrink">
      <div className="fit-container sc-s-18 " style={{ overflow: "visible" }}>
        <div className="fx-centered fx-end-h fx-start-v  fit-container box-pad-h-s box-pad-v-s">
          <RelaysPicker
            allRelays={allRelays}
            userAllRelays={tempUserRelays}
            addRelay={addRelay}
          />
          <button
            className={`btn ${
              JSON.stringify(currentUserRelays) !==
              JSON.stringify(tempUserRelays)
                ? "btn-normal"
                : "btn-disabled"
            }`}
            onClick={saveRelays}
            disabled={
              JSON.stringify(currentUserRelays) ===
              JSON.stringify(tempUserRelays)
            }
          >
            {t("AZWpmir")}
          </button>
        </div>
        <hr />
        {tempUserRelays.length > 0 && (
          <div
            className="fit-container fx-col fx-centered  fx-start-v fx-start-h"
            style={{
              maxHeight: "40vh",
              overflow: "scroll",
              overflowX: "hidden",
              gap: 0,
            }}
            ref={relaysContainer}
          >
            {tempUserRelays?.map((relay, index) => {
              let isNew = !userInboxRelays.includes(relay.url);
              return (
                <div
                  key={`${relay}-${index}`}
                  className="fit-container fx-centered fx-col fx-shrink  box-pad-h-s box-pad-v-s"
                  style={{
                    overflow: "visible",
                    backgroundColor: relay.toDelete ? "var(--red-side)" : "",
                    borderBottom:
                      index !== tempUserRelays.length - 1
                        ? "1px solid var(--very-dim-gray)"
                        : "",
                    gap: "10px",
                  }}
                >
                  <div className="fx-scattered fit-container box-pad-h-s ">
                    <div
                      className="fx-centered option"
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                      }}
                      onClick={() => setShowRelaysInfo(relay.url)}
                    >
                      <div
                        style={{
                          minWidth: "6px",
                          aspectRatio: "1/1",
                          borderRadius: "50%",
                          backgroundColor: connectedRelays?.relaysStatus[
                            relay.url
                          ]
                            ? "var(--green-main)"
                            : "var(--red-main)",
                        }}
                      ></div>
                      <RelayImage url={relay.url} />
                      <p>{relay.url}</p>
                      <div
                        className="info-tt"
                        style={{
                          filter: "brightness(0) invert()",
                          opacity: 0.5,
                        }}
                      ></div>
                    </div>
                    {!isNew && (
                      <div>
                        {!relay.toDelete && (
                          <div
                            onClick={() => removeRelayFromList(false, index)}
                            className="round-icon-small"
                          >
                            <div className="logout-red"></div>
                          </div>
                        )}
                        {relay.toDelete && (
                          <div
                            onClick={() => removeRelayFromList(true, index)}
                            className="round-icon-small"
                          >
                            <div className="undo"></div>
                          </div>
                        )}
                      </div>
                    )}
                    {isNew && (
                      <div
                        onClick={() => removePermanently(index)}
                        className="round-icon-small"
                        style={{ borderColor: "var(--red-main)" }}
                      >
                        <div className="trash"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {suggestedRelays.length > 0 && (
          <div className="fx-centered fx-col fit-container box-pad-h-s box-pad-v-s fx-start-v fx-start-h">
            {tempUserRelays.length === 0 && (
              <p className="gray-c box-pad-v-s p-italic">{t("AR04C4C")}</p>
            )}

            <p>{t("AoO5zem")}</p>
            {suggestedRelays.map((relay, index) => {
              return (
                <div
                  className="fx-scattered fit-container box-pad-v-s option"
                  style={{
                    borderBottom:
                      index !== suggestedRelays.length - 1
                        ? "1px solid var(--very-dim-gray)"
                        : "",
                  }}
                  key={index}
                  onClick={() => addRelay(relay)}
                >
                  <div className="fx-centered">
                    <RelayImage url={relay} />
                    <p>{relay}</p>
                  </div>
                  <div className="sticker sticker-gray-black">
                    {t("ARWeWgJ")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default InboxRelays;
