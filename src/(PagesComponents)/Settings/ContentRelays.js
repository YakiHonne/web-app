import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import NDK from "@nostr-dev-kit/ndk";
import { setToPublish } from "@/Store/Slides/Publishers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import RelaysPicker from "@/Components/RelaysPicker";
import RelayImage from "@/Components/RelayImage";

export function ContentRelays({ setShowRelaysInfo, allRelays }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userAllRelays = useSelector((state) => state.userAllRelays);
  const relaysContainer = useRef(null);
  const [tempUserRelays, setTempUserRelays] = useState([]);
  const [relaysStatus, setRelaysStatus] = useState([]);
  const connectedRelays = useMemo(() => {
    return {
      relaysStatus: relaysStatus.reduce((acc, relay) => {
        acc[relay.url] = relay.connected;
        return acc;
      }, {}),
      connected: relaysStatus.filter((relay) => relay.connected).length,
      total: relaysStatus.length,
    };
  }, [relaysStatus]);
  useEffect(() => {
    try {
      setTempUserRelays(userAllRelays);
      setRelaysStatus(
        userAllRelays.map((item) => {
          return { url: item.url, connected: false };
        })
      );
    } catch (err) {
      console.log(err);
    }
  }, [userAllRelays]);

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
        setRelaysStatus(res);
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
    saveInKind10002();
  };

  const saveInKind10002 = async () => {
    try {
      let tags = convertArrayToKind10002();
      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 10002,
          content: "",
          tags: tags,
          allRelays: tempUserRelays
            .filter((relay) => relay.write)
            .map((relay) => relay.url),
        })
      );
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const convertArrayToKind10002 = () => {
    let tempArray = [];
    for (let relay of tempUserRelays) {
      if (!relay.toDelete) {
        let status =
          relay.read && relay.write ? "" : relay.read ? "read" : "write";
        if (status) tempArray.push(["r", relay.url, status]);
        if (!status) tempArray.push(["r", relay.url]);
      }
    }
    return tempArray;
  };

  const changeRelayStatus = (status, index) => {
    let tempArray = tempUserRelays.map((relay) => ({ ...relay }));
    tempArray[index].read = ["read", ""].includes(status) ? true : false;
    tempArray[index].write = ["write", ""].includes(status) ? true : false;

    setTempUserRelays(tempArray);
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
      <div className="fit-container sc-s-18" style={{ overflow: "visible" }}>
        <div className="fx-centered fx-end-h fx-start-v fit-container box-pad-h-s box-pad-v-s">
          <RelaysPicker
            allRelays={allRelays}
            userAllRelays={tempUserRelays}
            addRelay={addRelay}
          />
          <button
            className={`btn ${
              JSON.stringify(userAllRelays) !== JSON.stringify(tempUserRelays)
                ? "btn-normal"
                : "btn-disabled"
            }`}
            onClick={saveRelays}
            disabled={
              JSON.stringify(userAllRelays) === JSON.stringify(tempUserRelays)
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
              let status =
                relay.read && relay.write ? "" : relay.read ? "read" : "write";
              let isNew = !userAllRelays.find((item) => item.url === relay.url);
              return (
                <div
                  key={`${relay}-${index}`}
                  className="fit-container fx-centered fx-col fx-shrink  box-pad-h-s box-pad-v-s"
                  style={{
                    overflow: "visible",
                    backgroundColor: relay.toDelete ? "var(--red-side)" : "",
                    borderBottom: "1px solid var(--very-dim-gray)",
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
                          rotate: "180deg",
                          opacity: 0.9,
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
                        style={{borderColor: "var(--red-main)"}}
                      >
                        <div className="trash"></div>
                      </div>
                    )}
                  </div>
                  {!relay.toDelete && (
                    <div className="fit-container fx-centered fx-start-h box-pad-h-m ">
                      <button
                        style={{
                          opacity: status === "read" ? 1 : 0.4,
                        }}
                        className={"btn btn-small btn-gray"}
                        onClick={() => changeRelayStatus("read", index)}
                      >
                        {t("AANojFe")}
                      </button>
                      <button
                        style={{
                          opacity: status === "write" ? 1 : 0.4,
                        }}
                        className={"btn btn-small btn-gray"}
                        onClick={() => changeRelayStatus("write", index)}
                      >
                        {t("AHG1OTt")}
                      </button>
                      <button
                        style={{
                          opacity: status === "" ? 1 : 0.4,
                        }}
                        className={"btn btn-small btn-gray"}
                        onClick={() => changeRelayStatus("", index)}
                      >
                        {t("AvnTmjx")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContentRelays;
