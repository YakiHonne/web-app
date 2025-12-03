import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useRelaysSet from "@/Hooks/useRelaysSet";
import AddRelaySet from "./AddRelaySet";
import RelaysSetSettings from "./RelaysComponents/RelaysSetSettings";

export default function RelaysSetPicker({
  selectedRelaysSetFeed,
  setSelectedRelaysSetFeed,
  allRelays,
  addToFavRelays,
}) {
  const { t } = useTranslation();
  const { userRelaysSetSimplified } = useRelaysSet();
  const [showList, setShowList] = useState(false);
  const [searchedRelay, setSearchedRelay] = useState("");
  const [addRelaysSet, setAddRelaysSet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const relaysSets = useMemo(() => {
    return searchedRelay
      ? userRelaysSetSimplified.filter((_) =>
          _.title.toLowerCase().includes(searchedRelay.toLowerCase())
        )
      : userRelaysSetSimplified;
  }, [userRelaysSetSimplified, searchedRelay]);
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

  const handlePickRelaySet = (aTag, isImported) => {
    if (isImported)
      setSelectedRelaysSetFeed((prev) => prev.filter((_) => _ !== aTag));
    if (!isImported) setSelectedRelaysSetFeed((prev) => [aTag, ...prev]);
    setShowList(false);
  };

  const handleExit = (aTag) => {
    if (aTag) addToFavRelays(aTag);
    setAddRelaysSet(false);
  };
  return (
    <>
      {addRelaysSet && <AddRelaySet exit={handleExit} allRelays={allRelays} />}
      {showSettings && (
        <RelaysSetSettings
          exit={() => setShowSettings(false)}
          allRelays={allRelays}
        />
      )}
      <div className="fit-container fx-scattered">
        <div
          style={{ position: "relative" }}
          className="fit-container fx-centered fx-start-h if ifs-full"
          ref={optionsRef}
          onClick={() => setShowList(true)}
        >
          <div className="search"></div>
          <input
            placeholder={t("AaW83Mz")}
            className="if if-no-border ifs-full"
            style={{ height: "var(--40)", paddingLeft: "0" }}
            value={searchedRelay}
            onChange={handleOnChange}
          />
          {showList && (
            <div
              className="fit-container sc-s-18 bg-sp fx-centered fx-col fx-start-h fx-start-v box-pad-h-s box-pad-v-s"
              style={{
                position: "absolute",
                left: 0,
                top: "calc(100% + 5px)",
                // height: selectedRelay ? "600px" : "300px",
                maxHeight: "300px",
                overflow: "scroll",
                zIndex: "200",
                gap: 0,
                transition: "height 0.3s ease-in-out",
              }}
            >
              <div className="fx-centered fit-container">
                <p
                  className="gray-c box-pad-h-s"
                  style={{ minWidth: "max-content" }}
                >
                  {relaysSets.length} sets
                </p>
                <hr />
                {relaysSets.length > 0 && (
                  <div
                    className="btn-text-gray pointer p-medium box-pad-h-s"
                    onClick={() => setShowSettings(true)}
                  >
                    {t("ABtsLBp")}
                  </div>
                )}
              </div>
              {relaysSets.length > 0 && (
                <div className="fit-container fit-height">
                  {relaysSets.map((relaySet) => {
                    let isImported = selectedRelaysSetFeed.includes(
                      relaySet.aTag
                    );
                    return (
                      <div
                        className={`pointer fit-container fx-scattered  box-pad-h-s box-pad-v-s option-no-scale relay-item ${
                          relaySet.relays.length === 0 ? "if-disabled" : ""
                        }`}
                        style={{
                          position: "relative",
                        }}
                        key={relaySet.id}
                        onClick={() =>
                          relaySet.relays.length > 0 &&
                          handlePickRelaySet(relaySet.aTag, isImported)
                        }
                      >
                        <div className="fx-centered">
                          <div
                            style={{
                              minWidth: "30px",
                              minHeight: "30px",
                              borderRadius: "var(--border-r-50)",
                              backgroundColor: "var(--c1-side)",
                              backgroundImage: `url(${relaySet.image})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                            className="fx-centered"
                          >
                            {!relaySet.image && (
                              <p
                                className={`p-bold p-caps `}
                                style={{ position: "relative", zIndex: 1 }}
                              >
                                {relaySet.title.charAt(0)}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="p-one-line">{relaySet.title}</p>
                            <p className="p-medium gray-c p-one-line">
                              {relaySet.title}
                            </p>
                          </div>
                        </div>
                        <div className="fx-centered">
                          <div
                            className={`pointer sticker sticker-normal sticker-small ${
                              relaySet.relays.length > 0
                                ? "sticker-green-side"
                                : "sticker-red-side"
                            }`}
                            style={{ minWidth: "max-content" }}
                          >
                            {relaySet.relays.length} relays
                          </div>
                          {!isImported && (
                            <div
                              className="pointer sticker sticker-normal sticker-small sticker-gray-black"
                              style={{ minWidth: "max-content" }}
                            >
                              &#8593; import
                            </div>
                          )}
                          {isImported && (
                            <div
                              className="pointer sticker sticker-normal sticker-small sticker-green-side"
                              style={{ minWidth: "max-content" }}
                            >
                              &#10003; imported
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <div
          className="round-icon-small round-icon-tooltip"
          data-tooltip={t("AVHSp5S")}
          style={{ position: "relative", zIndex: 2 }}
          onClick={() => setAddRelaysSet(true)}
        >
          <div className="plus-sign"></div>
        </div>
      </div>
    </>
  );
}
