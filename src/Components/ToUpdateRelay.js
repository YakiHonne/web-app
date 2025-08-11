import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import LoadingScreen from "@/Components/LoadingScreen";
import LoadingDots from "@/Components/LoadingDots";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";

export default function ToUpdateRelay({ exit }) {
  const dispatch = useDispatch();
  const userRelays = useSelector((state) => state.userRelays);
  const userKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();
  const [tempuserMetadataRelays, setTempuserMetadataRelays] = useState(
    userRelays || []
  );
  const [allRelays, setAllRelays] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customRelay, setCustomRelay] = useState("");
  const [searchedRelay, setSearchedRelay] = useState("");
  const [searchedResult, setSearchedResult] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await axios.get("https://api.nostr.watch/v1/online");
        setAllRelays(data.data);
        setIsLoaded(true);
      } catch {
        dispatch(
          setToast({
            type: 2,
            desc: t("Acr4Slu"),
          })
        );
        exit();
      }
    };
    fetchData();
  }, []);

  const addFromAllRelays = (url) => {
    if (checkIfRelayExist(url)) {
      deleteRelay(url);
      return;
    }
    setTempuserMetadataRelays([...tempuserMetadataRelays, url]);
  };
  const addCustomRelay = () => {
    if (customRelay) {
      if (customRelay.startsWith("wss://")) {
        if (checkIfRelayExist(customRelay)) {
          setCustomRelay("");
          dispatch(
            setToast({
              type: 3,
              desc: t("AYo9s8g"),
            })
          );
          return false;
        }
        setTempuserMetadataRelays([...tempuserMetadataRelays, customRelay]);
        setCustomRelay("");
        return [...tempuserMetadataRelays, customRelay];
      } else {
        dispatch(
          setToast({
            type: 2,
            desc: t("AATNADF"),
          })
        );
        return false;
      }
    } else {
      return tempuserMetadataRelays;
    }
  };
  const deleteRelay = (url) => {
    let index = tempuserMetadataRelays.findIndex((item) => item === url);
    let tempArray = Array.from(tempuserMetadataRelays);
    tempArray.splice(index, 1);
    setTempuserMetadataRelays(tempArray);
  };
  const checkIfRelayExist = (input) => {
    let status = tempuserMetadataRelays.find((item) => item === input);
    return status ? true : false;
  };
  const handleSearchRelay = (e) => {
    let value = e.target.value;
    let tempArray = [];
    setSearchedRelay(value);
    if (!value) {
      setSearchedResult([]);
      return;
    }
    for (let url of allRelays) if (url.includes(value)) tempArray.push(url);
    setSearchedResult(tempArray);
  };
  const saveRelays = async () => {
    let relaysToAdd = addCustomRelay();
    if (relaysToAdd === false) return;
    saveInKind10002();
    exit();
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
          allRelays: tempuserMetadataRelays,
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
    for (let relay of tempuserMetadataRelays) {
      tempArray.push(["r", relay]);
    }
    return tempArray;
  };

  if (!isLoaded) return <LoadingScreen />;
  return (
    <section
      className="fixed-container fx-centered fx-wrap box-pad-h box-pad-v"
      style={{
        pointerEvents: isLoading ? "none" : "auto",
        overflow: "scroll",
        overflowX: "hidden",
      }}
    >
      <div
        className="fx-centered fx-wrap fx-start-v "
        style={{ rowGap: "32px", width: "min(100%, 1000px)" }}
      >
        <div
          className="fx-centered fx-col slide-up"
          style={{
            width: "min(100%, 350px)",
            flex: "1 1 350px",
          }}
        >
          <div
            className="fit-container fx-centered fx-start-h fx-col box-pad-h"
            style={{
              maxHeight: "30vh",
              overflow: "scroll",
              overflowX: "hidden",
            }}
          >
            <div
              className="fx-scattered fit-container box-marg-s"
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "var(--white)",
              }}
            >
              <h4>{t("AWjKzZJ")}</h4>
              <input
                type="search"
                className="if ifs-small"
                placeholder={t("AWiH4mf")}
                value={searchedRelay}
                onChange={handleSearchRelay}
              />
            </div>
            {searchedRelay && searchedResult.length === 0 && (
              <div className="fit-container fx-centered box-marg-full box-pad-h">
                <p className="gray-c italic-txt">{t("AR04C4C")}</p>
              </div>
            )}
            {searchedRelay &&
              searchedResult.map((relay, index) => {
                let status = checkIfRelayExist(relay);
                return (
                  <div
                    key={`${relay}-${index}`}
                    className="if fit-container fx-scattered fx-shrink pointer"
                    style={{ borderColor: status ? "var(--green-main)" : "" }}
                    onClick={() => addFromAllRelays(relay)}
                  >
                    <p className={status ? "green-c" : ""}>{relay}</p>
                    {status ? (
                      <div>
                        <p className="green-c p-big">&#10003;</p>
                      </div>
                    ) : (
                      <div>
                        <p className="p-big">&#43;</p>
                      </div>
                    )}
                    {/* <h4 className="gray-c"></h4> */}
                  </div>
                );
              })}
            {!searchedRelay &&
              allRelays.map((relay, index) => {
                let status = checkIfRelayExist(relay);
                return (
                  <div
                    key={`${relay}-${index}`}
                    className="if fit-container fx-scattered fx-shrink pointer"
                    style={{ borderColor: status ? "var(--green-main)" : "" }}
                    onClick={() => addFromAllRelays(relay)}
                  >
                    <p className={status ? "green-c" : ""}>{relay}</p>
                    {status ? (
                      <div>
                        <p className="green-c p-big">&#10003;</p>
                      </div>
                    ) : (
                      <div>
                        <p className="p-big">&#43;</p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
        <div
          className="fx-centered fx-col slide-up"
          style={{
            width: "min(100%, 350px)",
            flex: "1 1 350px",
          }}
        >
          <div
            className="fit-container fx-centered fx-start-h fx-col box-pad-h"
            style={{
              maxHeight: "25vh",
              overflow: "scroll",
              overflowX: "hidden",
            }}
          >
            <div
              className="fx-scattered fit-container box-marg-s"
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "var(--white)",
                zIndex: 10,
              }}
            >
              <h4>{t("AZjgE2A")}</h4>
            </div>
            {tempuserMetadataRelays.map((relay, index) => {
              return (
                <div
                  key={`${relay}-${index}`}
                  className="if fit-container fx-scattered fx-shrink pointer"
                >
                  <p>{relay}</p>
                  <div
                    className="trash"
                    onClick={() => deleteRelay(relay)}
                  ></div>
                </div>
              );
            })}
          </div>
          <div className="box-pad-h fit-container">
            <div className="fit-container fx-centered">
              <input
                type="text"
                className="if ifs-full"
                placeholder={t("ACi22Cf")}
                value={customRelay}
                onChange={(e) => setCustomRelay(e.target.value)}
              />
              <button className="btn btn-normal" onClick={addCustomRelay}>
                {t("ARWeWgJ")}
              </button>
            </div>
            <div className="fx-centered box-pad-v">
              <button
                className="btn btn-gst-red fx"
                onClick={exit}
                disabled={isLoading}
              >
                {isLoading ? <LoadingDots /> : t("AB4BSCe")}
              </button>
              <button
                className="btn btn-normal fx"
                onClick={saveRelays}
                disabled={isLoading}
              >
                {isLoading ? <LoadingDots /> : t("AZWpmir")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
