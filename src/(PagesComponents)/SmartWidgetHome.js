import React, { useEffect, useRef, useState } from "react";
import SWActionPreview from "@/Components/SWActionPreview";
import { useTranslation } from "react-i18next";
import { getSubData } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import { getParsedSW } from "@/Helpers/Encryptions";
import LoadingDots from "@/Components/LoadingDots";
import { useSelector } from "react-redux";
import axiosInstance from "@/Helpers/HTTP_Client";
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";
import { t } from "i18next";
import LaunchSW from "@/Components/LaunchSW";
import Link from "next/link";

export default function SWhome() {
  return (
    <div>
      {/* <Helmet>
        <title>Yakihonne | Smart widgets</title>
        <meta
          name="description"
          content={"Experience the next generation of interactive content tools on the Nostr network. Upgraded performance and new features for content creators."}
        />
        <meta
          property="og:description"
          content={"Experience the next generation of interactive content tools on the Nostr network. Upgraded performance and new features for content creators."}
        />
        <meta
          property="og:image"
          content={"https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"}
        />  
        <meta
          property="og:image:width"
          content="1200"
        />
        <meta
          property="og:image:height"
          content="700"
        />
        <meta
          property="og:url"
          content={`https://yakihonne.com/smart-widgets`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Yakihonne" />
        <meta property="og:title" content="Yakihonne | Smart widgets" />
        <meta property="twitter:title" content="Yakihonne | Smart widgets" />
        <meta
          property="twitter:description"
          content={"Experience the next generation of interactive content tools on the Nostr network. Upgraded performance and new features for content creators."}
        />
        <meta
          property="twitter:image"
          content={"https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"}
        />
      </Helmet> */}
      <Main />
    </div>
  );
}

const Main = () => {
  const [status, setStatus] = useState(true);
  const [showTips, setShowtips] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const handleSearch = (e, searchKeywordInput) => {
    if (e) e.preventDefault();
    if (searchKeywordInput.trim()) {
      setSearchKeyword(searchKeywordInput.trim());
    }
  };

  useEffect(() => {
    if (showTips && searchKeyword) setShowtips(!showTips);
    if (!showTips && !searchKeyword) setShowtips(!showTips);
  }, [searchKeyword]);

  return (
    <div className="box-pad-h-m">
      <div
        className="fx-centered fit-container fx-start-h fx-col box-pad-v"
        style={{ gap: 0, minHeight: "100vh" }}
      >
        <div className="box-pad-v fx-centered">
          <div
            className="smart-widget-24"
            style={{
              minWidth: "44px",
              minHeight: "44px",
              animation: "1.5s infinite rotate",
            }}
          ></div>
          <h3>{t("A2mdxcf")}</h3>
        </div>

        <InputField
          handleSearch={handleSearch}
          setSearchKeyword={setSearchKeyword}
          status={status}
        />

        <div
          style={{
            paddingBottom: 0,
          }}
          className="fit-container fx-centered fx-col fx-start-v box-pad-h-m box-pad-v"
        >
          <div
            className={`fit-container fx-scattered `}
            style={{ transition: ".2s ease-in-out" }}
            onClick={() => setShowtips(!showTips)}
          >
            <p>{t("A9Mca7S")}</p>
            <div
              className="plus-sign"
              style={{
                rotate: showTips ? "45deg" : "0deg",
                minWidth: "14px",
                minHeight: "14px",
              }}
            ></div>
          </div>
          {showTips && (
            <>
              <div className="fx fx-centered fx-stretch">
                <div className="fx box-pad-h-m box-pad-v-m sc-s-18 bg-sp">
                  <p className="gray-c">
                    <span className="c1-c">{t("AYZh36g")} </span>
                    {t("AiCvw1P")}
                  </p>
                </div>
                <div className="fx box-pad-h-m box-pad-v-m sc-s-18 bg-sp fx-centered fx-col fx-start-h">
                  <p className="gray-c">
                    <span className="c1-c">{t("A6U9fNT")} </span>
                    {t("AmK7zqi")}
                  </p>
                </div>
              </div>
              <div className="fit-container fx-centered fx-stretch">
                <div className="fx-centered fx-start-h fx-start-v box-pad-h-m box-pad-v-m sc-s-18 bg-sp fx">
                  <div className="fx-centered fx-col fx-start-h fx-start-v">
                    <p className="p-big p-bold">{t("Axeyl28")}</p>
                    <p className="gray-c">{t("ASfQxuq")}</p>
                    <Link href={"/sw-playground"} className="fit-container">
                      <button className=" fx-centered btn-normal btn option pointer btn-full">
                        {t("Axeyl28")}
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="fx-centered fx-start-h fx-start-v box-pad-h-m box-pad-v-m sc-s-18  bg-sp fx">
                  <div className="fx-centered fx-col fx-start-h fx-start-v">
                    <p className="p-big p-bold">{t("ADuxxCf")}</p>
                    <p className="gray-c">{t("Afi8Kwg")}</p>
                    <div className="fit-container fx-centered ">
                      <Link
                        href={
                          "https://github.com/search?q=topic%3Asmart-widget+org%3AYakiHonne&type=Repositories"
                        }
                        target="_blank"
                        className="fx"
                      >
                        <div className="box-pad-h-m box-pad-v-s sc-s fx-centered bg-sp option pointer fx">
                          <div className="github-logo"></div>
                          <p style={{ minWidth: "max-content" }}>
                            {t("AvcFvUD")}
                          </p>
                        </div>
                      </Link>
                      <Link href={"/docs/sw/intro"} className="fx">
                        <div className="box-pad-h-m box-pad-v-s sc-s fx-centered bg-sp option pointer">
                          <div className="posts"></div>
                          <p style={{ minWidth: "max-content" }}>
                            {t("As9snfY")}
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div style={{ height: "7px" }}></div>
          <hr />
          <hr />
        </div>
        <div
          className="fx-centered fx-col fx-start-v box-pad-h-m fit-container"
        >
          {searchKeyword && (
            <div className="fit-container fx-scattered">
              <h4>
                <span className="gray-c">{t("AWJ9AGo")}</span> {searchKeyword}
              </h4>
              <div
                className="close"
                style={{ position: "static" }}
                onClick={() => setSearchKeyword("")}
              >
                <div></div>
              </div>
            </div>
          )}
          <SWSet external={searchKeyword} />
        </div>
      </div>
    </div>
  );
};

const SWSet = ({ external }) => {
  const { t } = useTranslation();
  const userSavedTools = useSelector((state) => state.userSavedTools);
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSW, setSelectedSW] = useState("");
  const [lastEventTimestamp, setLastEventTimestamp] = useState(undefined);
  const [isEnded, setEnded] = useState(false);
  const [type, setType] = useState("tool");
  const [savedTools, setSavedTools] = useState([]);
  const [searchedTools, setSearchedTools] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (userSavedTools.length === 0 && savedTools.length > 0) {
        setSavedTools([]);
        return;
      }
      let swIDs = userSavedTools.map((_) => _.split(":")[2]);
      if (swIDs.length === 0) return;
      const data = await getSubData([{ kinds: [30033], "#d": swIDs }], 400);
      setSavedTools(data.data.map((_) => getParsedSW(_)));
      saveUsers(data.pubkeys);
    };
    const fetchDataDVM = async () => {
      try {
        setIsLoading(true);
        if (searchedTools.length > 0) setSearchedTools([]);
        let data = await axiosInstance.post("/api/v1/dvm-query", {
          message: external,
        });
        setSearchedTools(data.data.map((_) => getParsedSW(_)));
        saveUsers(external.map((_) => _.pubkey));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    if (!external) fetchData();
    if (external) fetchDataDVM();
  }, [userSavedTools, external]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoading) setIsLoading(true);
      const data = await getSubData(
        [
          {
            kinds: [30033],
            limit: 20,
            until: lastEventTimestamp,
            "#l": type === "tool" ? ["tool", "action"] : ["basic"],
          },
        ],
        400
      );
      console.log(data);
      setActions((prev) => [...prev, ...data.data.map((_) => getParsedSW(_))]);
      saveUsers(data.pubkeys);
      setIsLoading(false);
      if (data.data.length === 0 && actions.length > 0) setEnded(true);
    };

    fetchData();
  }, [lastEventTimestamp, type]);

  const handleLastEventTS = () => {
    setLastEventTimestamp(actions[actions.length - 1].created_at - 1);
  };

  const handleCbButton = (data) => {
    if (data.type === "basic") setSelectedSW(data);
  };

  const switchContentType = (t) => {
    setType(t);
    setLastEventTimestamp(undefined);
    setActions([]);
    setEnded(false);
  };

  return (
    <>
      {selectedSW && (
        <LaunchSW metadata={selectedSW} exit={() => setSelectedSW("")} />
      )}
      <div className="fit-container">
        <div className="fit-container fx-start-h fx-wrap fx-centered">
          {!external && (
            <div
              className="fit-container fx-centered fx-start-h sticky box-pad-h"
              style={{
                top: "-1px",
                paddingTop: 0,
                paddingBottom: 0,
                columnGap: 0,
                borderBottom: "1px solid var(--very-dim-gray)",
              }}
            >
              <div
                className={`list-item-b fx-centered fx-shrink ${
                  type === "tool" ? "selected-list-item-b" : ""
                }`}
                onClick={() => switchContentType("tool")}
              >
                Tool widgets
              </div>
              <div
                className={`list-item-b fx-centered fx-shrink ${
                  type === "basic" ? "selected-list-item-b" : ""
                }`}
                onClick={() => switchContentType("basic")}
              >
                Basic widgets
              </div>
            </div>
          )}
          {!external &&
            actions.map((sw) => {
              return (
                <div className="ifs-small" key={sw.id}>
                  <SWActionPreview
                    metadata={sw}
                    setSelectSW={(data) => setSelectedSW(data)}
                    cbButton={handleCbButton}
                  />
                </div>
              );
            })}
          {external &&
            searchedTools.map((sw) => {
              return (
                <div className="ifs-small" key={sw.id}>
                  <SWActionPreview
                    metadata={sw}
                    setSelectSW={(data) => setSelectedSW(data)}
                    cbButton={handleCbButton}
                  />
                </div>
              );
            })}
          {!isLoading && !isEnded && !external && (
            <div
              className="fit-container fx-centered box-pad-v-m pointer btn-text-gray"
              onClick={handleLastEventTS}
            >
              <p>{t("AnWFKlu")}</p>
              <div className="arrow"></div>
            </div>
          )}
          {isEnded && (
            <div className="fit-container box-pad-v-m fx-centered">
              <p className="gray-c">{t("AUrhqmn")}</p>
            </div>
          )}
          {isLoading && (
            <div
              style={{ height: "150px" }}
              className="fit-container fx-centered"
            >
              <LoadingDots />
            </div>
          )}
        </div>
        {((!external && actions.length === 0) ||
          (external && searchedTools.length === 0)) &&
          !isLoading && (
            <div
              className="fit-container fx-centered fx-col"
              style={{ height: "150px" }}
            >
              <div
                className="yaki-logomark"
                style={{ minWidth: "48px", minHeight: "48px", opacity: 0.5 }}
              ></div>
              <p className="gray-c">{t("ANA9vN0")}</p>
            </div>
          )}
      </div>
    </>
  );
};

function InputField({ status = true, handleSearch }) {
  const [searchKeywordInput, setSearchKeywordInput] = useState("");
  const inputFieldRef = useRef(null);

  useEffect(() => {
    if (inputFieldRef.current) {
      inputFieldRef.current.style.height = "20px";
      inputFieldRef.current.style.height = `${inputFieldRef.current.scrollHeight}px`;
      inputFieldRef.current.scrollTop = inputFieldRef.current.scrollHeight;
      inputFieldRef.current.focus();
      const chatContainer = document.querySelector(".chat-container");
      if (chatContainer) {
        if (inputFieldRef.current.scrollHeight > 50)
          chatContainer.style.height = `calc(80vh - ${Math.min(
            inputFieldRef.current.scrollHeight - 50,
            200
          )}px)`;
        else chatContainer.style.height = "80vh";
      }
    }
  }, [searchKeywordInput]);

  useEffect(() => {
    if (status && inputFieldRef.current) inputFieldRef.current.focus();
  }, [status]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault();
        setSearchKeywordInput("");
        handleSearch(e, searchKeywordInput);
      }
    }
  };

  const handleTyping = (e) => {
    let value = e.target.value;
    setSearchKeywordInput(value);
  };

  return (
    <div
      className="sc-s box-pad-h-s box-pad-v-s fx-centered fx-col sw-search-box fit-container"
      style={{
        // width: "min(100%, 600px)",
        cursor: status ? "unset" : "not-allowed",
        overflow: "visible",
      }}
      onClick={() => inputFieldRef?.current?.focus()}
    >
      <form
        onSubmit={(e) => {
          if (status) {
            setSearchKeywordInput("");
            handleSearch(e, searchKeywordInput);
          }
        }}
        style={{ position: "relative" }}
        className="fit-container"
      >
        <textarea
          type="text"
          className={`if ifs-full if-no-border ${status ? "" : "if-disabled"}`}
          value={searchKeywordInput}
          onChange={handleTyping}
          placeholder={t("A3IdSmf")}
          ref={inputFieldRef}
          onKeyDown={handleKeyDown}
          disabled={!status}
          style={{
            padding: "1rem 0rem 1rem 1rem",
            height: "20px",
            maxHeight: "250px",
            borderRadius: 0,
          }}
        />
      </form>
      <div className="fit-container fx-scattered box-pad-h-m box-pad-v-m">
        <div className="fx-centered">
          <Link
            className={`sc-s box-pad-h-m box-pad-v-s ${
              status ? "option pointer" : "if-disabled"
            } fx-centered`}
            style={{
              backgroundColor: "var(--pale-gray)",
            }}
            href={"/smart-widgets"}
          >
            <div className="search"></div>
            {t("AYZh36g")}
          </Link>
          <Link
            className={`sc-s box-pad-h-m box-pad-v-s ${
              status ? "option pointer" : "if-disabled"
            } fx-centered`}
            style={{
              backgroundColor: "",
            }}
            href={"/sw-ai"}
          >
            <div className="ringbell"></div>
            {t("A6U9fNT")}
          </Link>
        </div>
        {status && (
          <div
            className="round-icon slide-up"
            style={{
              minWidth: "40px",
              minHeight: "40px",
              backgroundColor: "var(--c1)",
            }}
            onClick={() => {
              if (status) {
                setSearchKeywordInput("");
                handleSearch(undefined, searchKeywordInput);
              }
            }}
          >
            <div className="send"></div>
          </div>
        )}
      </div>
    </div>
  );
}
