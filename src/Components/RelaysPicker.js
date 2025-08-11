import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function RelaysPicker({ allRelays, userAllRelays = [], addRelay, showMessage = true }) {
  const { t } = useTranslation();
  const [showList, setShowList] = useState(false);
  const [searchedRelay, setSearchedRelay] = useState("");

  const searchedRelays = useMemo(() => {
    let tempRelay = allRelays.filter((relay) => {
      if (
        !userAllRelays.map((_) => _.url).includes(relay) &&
        relay.includes(searchedRelay)
      )
        return relay;
    });
    return tempRelay;
  }, [userAllRelays, searchedRelay, allRelays]);
  const optionsRef = useRef(null);

  useEffect(() => {
    const handleOffClick = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        setShowList(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [optionsRef]);

  const handleOnChange = (e) => {
    let value = e.target.value;
    setSearchedRelay(value);
  };

  return (
    <div
      style={{ position: "relative" }}
      className="fit-container"
      ref={optionsRef}
      onClick={() => setShowList(true)}
    >
      <input
        placeholder={t("ALPrAZz")}
        className="if ifs-full"
        style={{ height: "var(--40)" }}
        value={searchedRelay}
        onChange={handleOnChange}
      />
      {showMessage && <div className="box-pad-v-s box-pad-h-s">
        <p className="gray-c p-medium">{t("A2wrBnY")}</p>
      </div>}
      {showList && (
        <div
          className="fit-container sc-s-18 fx-centered fx-col fx-start-h fx-start-v box-pad-h-m box-pad-v-m slide-up"
          style={{
            position: "absolute",
            left: 0,
            top: "calc(100% + 5px)",
            maxHeight: "200px",
            overflow: "scroll",
            zIndex: "200",
            animationDuration: ".15s"
          }}
        >
          <div className="fx-centered fit-container">
            <p className="gray-c" style={{ minWidth: "max-content" }}>
              {allRelays.length} relays
            </p>
            <hr />
            <hr />
          </div>
          {searchedRelays.map((relay) => {
            return (
              <div
                className="fx-scattered fit-container pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  addRelay(relay);
                  setShowList(false);
                  setSearchedRelay("");
                }}
              >
                <p>{relay}</p>
                <div className="fx-centered">
                  <div className="sticker sticker-gray-black">
                    {t("ARWeWgJ")}
                  </div>
                </div>
              </div>
            );
          })}
          {searchedRelays.length === 0 && searchedRelay && (
            <div
              className="fx-scattered fit-container pointer"
              onClick={(e) => {
                e.stopPropagation();
                addRelay(
                  searchedRelay.includes("ws://")
                    ? searchedRelay
                    : "wss://" + searchedRelay.replace("wss://", "")
                );
                setShowList(false);
                setSearchedRelay("");
              }}
            >
              <p>{searchedRelay}</p>

              <div className="plus-sign"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
