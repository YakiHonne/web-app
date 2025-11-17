import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import RelayImage from "./RelayImage";
import LoadingDots from "./LoadingDots";
import { saveRelayMetadata } from "@/Helpers/Controlers";
import { getRelayMetadata } from "@/Helpers/utils";
import RelayMetadataPreview from "./RelayMetadataPreview";
import { Virtuoso } from "react-virtuoso";

export default function RelaysPicker({
  allRelays,
  userAllRelays = [],
  addRelay,
  showMessage = true,
  excludedRelays = [],
}) {
  const { t } = useTranslation();
  const [showList, setShowList] = useState(false);
  const [searchedRelay, setSearchedRelay] = useState("");
  const searchedRelays = useMemo(() => {
    let tempRelay = allRelays.filter((relay) => {
      if (
        !userAllRelays.map((_) => _.url).includes(relay) &&
        !excludedRelays.includes(relay) &&
        relay.includes(searchedRelay)
      )
        return relay;
    });
    return tempRelay;
  }, [userAllRelays, searchedRelay, allRelays, excludedRelays]);
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
      {showMessage && (
        <div className="box-pad-v-s box-pad-h-s">
          <p className="gray-c p-medium">{t("A2wrBnY")}</p>
        </div>
      )}
      {showList && (
        <div
          className="fit-container sc-s-18 bg-dg fx-centered fx-col fx-start-h fx-start-v box-pad-h-s box-pad-v-s"
          style={{
            position: "absolute",
            left: 0,
            top: "calc(100% + 5px)",
            // height: selectedRelay ? "600px" : "300px",
            height: "300px",
            // maxHeight: "600px",
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
              {allRelays.length} relays
            </p>
            <hr />
            <hr />
          </div>
          {searchedRelays.length > 0 && <div className="fit-container fit-height">
            <Virtuoso
              style={{ height: "100%" }}
              totalCount={searchedRelays.length}
              itemContent={(index) => (
                <RelayItem
                  relayList={searchedRelays}
                  index={index}
                  addRelay={addRelay}
                  setShowList={setShowList}
                  setSearchedRelay={setSearchedRelay}
                />
              )}
            />
          </div>}
          {/* {searchedRelays.map((relay) => {
            if (!excludedRelays.includes(relay))
              return (
                <div
                  className={`pointer fit-container fx-scattered fx-col ${
                    selectedRelay !== relay
                      ? "box-pad-h-s box-pad-v-s"
                      : "box-pad-h-m box-pad-v-m"
                  } option-no-scale relay-item`}
                  style={{ position: "relative" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addRelay(relay);
                    setShowList(false);
                    setSearchedRelay("");
                    setSelectedRelay(false);
                  }}
                >
                  <div
                    className="fit-container fx-scattered"
                    style={{ position: "relative" }}
                  >
                    <div className="fx-centered ">
                      <RelayImage url={relay} size={16} />
                      <p>{relay}</p>
                    </div>
                    <div className="fx-centered">
                      <div
                        className="round-icon-small"
                        style={{ backgroundColor: "var(--dim-gray)" }}
                      >
                        <div className="plus-sign"></div>
                      </div>
                      <div
                        className="round-icon-small slide-down"
                        style={{ backgroundColor: "var(--dim-gray)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectedRelay === relay
                            ? setSelectedRelay(false)
                            : setSelectedRelay(relay);
                        }}
                      >
                        <div className="arrow "></div>
                      </div>
                    </div>
                  </div>
                  {selectedRelay === relay && (
                    <SelectedRelayPreview url={relay} />
                  )}
                </div>
              );
          })} */}
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
              <div className="fx-centered">
                <div className="sticker sticker-gray-black">
                  <div className="plus-sign"></div>
                </div>
                {/* <div className="sticker sticker-gray-black">{t("ARWeWgJ")}</div> */}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const SelectedRelayPreview = ({ url }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState(getRelayMetadata(url));
  useEffect(() => {
    const fetchData = async () => {
      let metadata = await saveRelayMetadata([url]);
      setMetadata(metadata[0]);
      setIsLoading(false);
    };
    if (!metadata) {
      fetchData();
    }
  }, []);

  if (!metadata && !isLoading) {
    return (
      <div className="fit-container box-pad-v fx-centered">
        <LoadingDots />
      </div>
    );
  }

  return <RelayMetadataPreview metadata={metadata} />;
};

const RelayItem = React.memo(
  ({ relayList, index, addRelay, setShowList, setSearchedRelay }) => {
    const [open, setOpen] = useState(false);
    return (
      <div
        className={`pointer fit-container fx-scattered fx-col box-pad-h-s box-pad-v-s option-no-scale relay-item`}
        style={{
          position: "relative",
          backgroundColor: open ? "var(--c1-side)" : "",
        }}
        onClick={(e) => {
          e.stopPropagation();
          addRelay(relayList[index]);
          setShowList(false);
          setSearchedRelay("");
          setOpen(!open);
        }}
      >
        <div
          className="fit-container fx-scattered"
          style={{ position: "relative" }}
        >
          <div className="fx-centered ">
            <RelayImage url={relayList[index]} size={16} />
            <p>{relayList[index]}</p>
          </div>
          <div className="fx-centered">
            <div
              className="round-icon-small"
              style={{ backgroundColor: "var(--dim-gray)" }}
            >
              <div className="plus-sign"></div>
            </div>
            <div
              className="round-icon-small slide-down"
              style={{ backgroundColor: "var(--dim-gray)" }}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              <div className="arrow "></div>
            </div>
          </div>
        </div>
        {open && <SelectedRelayPreview url={relayList[index]} />}
      </div>
    );
  }
);
