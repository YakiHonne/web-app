import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import RelaysInfo from "./RelaysInfo";
import ContentRelays from "./ContentRelays";
import InboxRelays from "./InboxRelays";
import { useRouter } from "next/router";
import { SearchRelays } from "./SearchRelays";

export function RelaysConfig() {
  const { query } = useRouter();
  const { t } = useTranslation();
  const [showRelaysInfo, setShowRelaysInfo] = useState(false);
  const [allRelays, setAllRelays] = useState([]);
  const [allSearchRelays, setAllSearchRelays] = useState([]);
  const [showStatus, setShowStatus] = useState(false);
  const [selectedTab, setSelectedTab] = useState(
    query?.relaysType ? query.relaysType : 0
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRelaysData, allSearchRelaysData] = await Promise.allSettled([
          axios.get("https://cache-v2.yakihonne.com/api/v1/relays"),
          axios.get("https://cache-v2.yakihonne.com/api/v1/relays/nips/50"),
        ]);
        setAllRelays(allRelaysData?.value?.data);
        setAllSearchRelays(allSearchRelaysData?.value?.data || []);
      } catch {}
    };
    fetchData();
  }, []);
  return (
    <>
      {showRelaysInfo && (
        <RelaysInfo
          url={showRelaysInfo}
          exit={() => setShowRelaysInfo(false)}
        />
      )}
      {showStatus && (
        <div className="fixed-container fx-centered box-pad-h">
          <div
            style={{
              width: "min(100%, 400px)",
              position: "relative",
              gap: "20px",
            }}
            className="fx-centered fx-start-v fx-col box-pad-v box-pad-h sc-s-18 bg-sp slide-up"
          >
            <div className="close" onClick={() => setShowStatus(false)}>
              <div></div>
            </div>
            <h4>{t("AmikACu")}</h4>
            <div className="fx-centered fx-start-h fx-col fx-start-v">
              <div className="fx-centered">
                <div
                  style={{
                    minWidth: "6px",
                    aspectRatio: "1/1",
                    borderRadius: "50%",
                    backgroundColor: "var(--green-main)",
                  }}
                ></div>
                <p>{t("AcPWRJ9")}</p>
              </div>
              <div className="fx-centered">
                <div
                  style={{
                    minWidth: "6px",
                    aspectRatio: "1/1",
                    borderRadius: "50%",
                    backgroundColor: "var(--red-main)",
                  }}
                ></div>
                <p>{t("AJQQGgT")}</p>
              </div>
            </div>
            <hr />
            <p className="gray-c">{t("AugXNf5")}</p>
          </div>
        </div>
      )}
      <div className="fit-container fx-scattered box-pad-h">
        {selectedTab == 0 && (
          <div className="fx-centered" onClick={() => setShowStatus(true)}>
            <p className="c1-c slide-right">{t("AciF91F")}</p>
            <div className="info-tt" style={{ rotate: "180deg" }}></div>
          </div>
        )}
        {selectedTab == 1 && (
          <div className="fx-centered" onClick={() => setShowStatus(true)}>
            <p className="c1-c slide-right">{t("AEsTMiq")}</p>
            <div className="info-tt" style={{ rotate: "180deg" }}></div>
          </div>
        )}
        {selectedTab == 2 && (
          <div className="fx-centered" onClick={() => setShowStatus(true)}>
            <p className="c1-c slide-right">{t("AjCr7Wz")}</p>
            <div className="info-tt" style={{ rotate: "180deg" }}></div>
          </div>
        )}
        <div className="fx-centered">
          <div
            className="round-icon-small"
            onClick={() => setSelectedTab(Math.max(selectedTab - 1, 0))}
          >
            <div className="arrow" style={{ rotate: "90deg" }}></div>
          </div>
          <div
            className="round-icon-small"
            onClick={() => setSelectedTab(Math.min(selectedTab + 1, 2))}
          >
            <div className="arrow" style={{ rotate: "-90deg" }}></div>
          </div>
        </div>
      </div>
      <div
        className="fit-container fx-centered fx-start-h fx-start-v"
        style={{ overflow: "hidden" }}
      >
        <div
          className="fit-container fx-centered fx-start-h fx-start-v box-pad-v-s box-marg-s"
          style={{
            transform: `translateX(${
              selectedTab ? `calc(-${selectedTab * 100}%)` : "0"
            })`,
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <ContentRelays
            setShowRelaysInfo={setShowRelaysInfo}
            allRelays={allRelays}
          />
          <InboxRelays
            setShowRelaysInfo={setShowRelaysInfo}
            allRelays={allRelays}
          />
          <SearchRelays
            setShowRelaysInfo={setShowRelaysInfo}
            allRelays={allSearchRelays}
          />
        </div>
      </div>
    </>
  );
}
