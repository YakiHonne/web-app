import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import RelayImage from "@/Components/RelayImage";
import RelaysPicker from "@/Components/RelaysPicker";
import { DraggableComp } from "@/Components/DraggableComp";
import { getRelayMetadata } from "@/Helpers/utils";
import { saveRelayMetadata } from "@/Helpers/Controlers";

export default function RelaysFeed({
  selectedRelaysFeed,
  setSelectedRelaysFeed,
  allRelays,
  setSources,
  update,
}) {
  const { t } = useTranslation();
  const handleAddRelaysFeed = (data) => {
    if (!data) return;
    let tempString = data.trim().includes("ws://")
      ? data.trim().toLowerCase()
      : "wss://" + data.trim().replace("wss://", "").toLowerCase();
    setSelectedRelaysFeed((prev) => {
      if (prev.find((_) => _.value === tempString)) {
        return prev;
      }
      return [
        {
          display_name: tempString
            .replaceAll("wss://", "")
            .replaceAll("ws://", ""),
          value: tempString,
          enabled: true,
        },
        ...prev,
      ];
    });
  };

  const removeRelay = (index) => {
    setSelectedRelaysFeed((prev) =>
      prev.filter((_, _index) => _index !== index)
    );
  };

  const hanleDragInternalITems = (newList) => {
    setSelectedRelaysFeed(newList);
    setSources((prev) => {
      let tempSources = structuredClone(prev);
      tempSources[1].list = newList;
      return tempSources;
    });
  };

  return (
    <div className="fit-container fx-centered fx-start-h fx-start-v fx-col box-pad-h box-pad-v">
      <RelaysPicker
        allRelays={allRelays}
        addRelay={handleAddRelaysFeed}
        excludedRelays={selectedRelaysFeed.map((_) => _.value)}
        showMessage={false}
      />
      <div className="fit-container fx-scattered">
        <p className="c1-c">{t("At4Hrf6")}</p>
        <button className="btn btn-normal btn-small" onClick={update}>
          {t("A8alhKV")}
        </button>
      </div>
      {selectedRelaysFeed.length > 0 && (
        <div className="fit-container fx-col fx-scattered fx-start-h fx-start-v">
          <DraggableComp
            children={selectedRelaysFeed.map((_) => {
              return {
                ..._,
                id: _.value,
              };
            })}
            setNewOrderedList={(data) => hanleDragInternalITems(data)}
            component={RelayItem}
            props={{
              removeRelay,
            }}
            background={false}
          />
          {/* {selectedRelaysFeed.map((item, index) => {
            return (
              <div
                className="fx-scattered fit-container sc-s-18 bg-sp box-pad-h-s box-pad-v-s"
                style={{ overflow: "visible" }}
                key={index}
              >
                <div className="fx-centered">
                  <RelayImage url={item.value} size={32} />
                  <div>
                    <p className="p-maj">{item.display_name}</p>
                    <p className="gray-c">{item.value}</p>
                  </div>
                </div>
                <div className="fx-centered">
                  <div
                    className="round-icon-small round-icon-tooltip"
                    data-tooltip={t("Almq94P")}
                    onClick={() => removeRelay(index)}
                  >
                    <div className="trash"></div>
                  </div>
                  <div
                    className="drag-el"
                    style={{ minWidth: "16px", aspectRatio: "1/1" }}
                  ></div>
                </div>
              </div>
            );
          })} */}
        </div>
      )}
      {selectedRelaysFeed.length === 0 && (
        <div className="fit-container fx-centered" style={{ height: "150px" }}>
          <div className="fx-centered fx-col box-pad-h box-pad-v">
            <p>{t("AcRP9Vs")}</p>
            <p className="gray-c p-centered box-pad-h">{t("AV1iUL2")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const RelayItem = ({ item, removeRelay, index }) => {
  const { t } = useTranslation();
  let [metadata, setMetadata] = useState(getRelayMetadata(item.value));

  useEffect(() => {
    const fetchData = async () => {
      let metadata = await saveRelayMetadata([item.value]);
      setMetadata(metadata[0]);
    };
    if (!metadata) {
      fetchData();
    }
  }, []);

  return (
    <div
      className="fx-scattered fit-container sc-s-18 bg-sp box-pad-h-s box-pad-v-s"
      style={{ overflow: "visible", cursor: "grab" }}
    >
      <div className="fx-centered">
        <RelayImage url={item.value} size={32} />
        <div>
          <p className="p-maj">{item.display_name}</p>
          <p className="gray-c p-one-line p-medium">
            {metadata?.description || item.value}
          </p>
        </div>
      </div>
      <div className="fx-centered">
        <div
          className="round-icon-small round-icon-tooltip"
          data-tooltip={t("Almq94P")}
          style={{ cursor: "pointer" }}
          onClick={() => removeRelay(index)}
        >
          <div className="trash"></div>
        </div>
        <div
          className="drag-el"
          style={{ minWidth: "16px", aspectRatio: "1/1" }}
        ></div>
      </div>
    </div>
  );
};
