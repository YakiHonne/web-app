import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import RelaysPicker from "@/Components/RelaysPicker";
import { DraggableComp } from "@/Components/DraggableComp";
import { InitEvent } from "@/Helpers/Controlers";
import { SelectTabs } from "@/Components/SelectTabs";
import RelaysSetPicker from "@/Components/RelaysSetPicker";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setToPublish } from "@/Store/Slides/Publishers";
import RelayItem from "@/Components/RelaysComponents/RelayItem";
import RelaySetItem from "@/Components/RelaysComponents/RelaySetItem";
import AddRelaySet from "@/Components/AddRelaySet";

export default function RelaysFeed({ allRelays, exit }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userFavRelays = useSelector((state) => state.userFavRelays);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedRelaysFeed, setSelectedRelaysFeed] = useState(
    userFavRelays.relays
  );
  const [selectedRelaysSetFeed, setSelectedRelaysSetFeed] = useState(
    userFavRelays.tags
      ? [
          ...new Set(
            userFavRelays.tags.filter((_) => _[0] === "a").map((_) => _[1])
          ),
        ]
      : []
  );
  const [seeRelaySetDetails, setSeeRelaySetDetails] = useState(false);
  const toUpdate = useMemo(() => {
    let oldState = {
      single: userFavRelays.relays,
      set: userFavRelays.tags
        ? [
            ...new Set(
              userFavRelays.tags.filter((_) => _[0] === "a").map((_) => _[1])
            ),
          ]
        : [],
    };
    let newState = {
      single: selectedRelaysFeed,
      set: selectedRelaysSetFeed,
    };
    return JSON.stringify(oldState) !== JSON.stringify(newState);
  }, [selectedRelaysFeed, selectedRelaysSetFeed]);
  const handleAddRelaysFeed = (data) => {
    if (!data) return;
    let tempString = data.trim().includes("ws://")
      ? data.trim().toLowerCase()
      : "wss://" + data.trim().replace("wss://", "").toLowerCase();
    setSelectedRelaysFeed((prev) => {
      if (prev.find((_) => _.value === tempString)) {
        return prev;
      }
      return [tempString, ...prev];
    });
  };

  const removeRelay = (index) => {
    setSelectedRelaysFeed((prev) =>
      prev.filter((_, _index) => _index !== index)
    );
  };

  const removeRelaySet = (index) => {
    setSelectedRelaysSetFeed((prev) =>
      prev.filter((_, _index) => _index !== index)
    );
  };
  const hanleDragInternalITems = (newList) => {
    setSelectedRelaysFeed(newList.map((_) => _.id));
  };
  const hanleDragInternalITemsForSets = (newList) => {
    setSelectedRelaysSetFeed(newList.map((_) => _.id));
  };

  const update = async (addToRelaysSet = false) => {
    let aTags = userFavRelays.tags
      ? userFavRelays.tags.filter((_) => !["relay", "a"].includes(_[0]))
      : [];
    let relays = selectedRelaysFeed.map((_) => {
      return ["relay", _];
    });
    let relaysSet = [
      ...(addToRelaysSet ? [addToRelaysSet] : []),
      ...selectedRelaysSetFeed,
    ].map((_) => {
      return ["a", _];
    });
    let tags = [...aTags, ...relays, ...relaysSet];
    let event = {
      kind: 10012,
      content: "",
      tags: tags,
    };
    console.log(tags);
    let eventInitEx = await InitEvent(
      event.kind,
      event.content,
      event.tags,
      undefined
    );
    if (!eventInitEx) {
      return;
    }
    dispatch(
      setToPublish({
        eventInitEx,
        allRelays: [],
      })
    );
    if (addToRelaysSet) {
      setSelectedRelaysSetFeed((prev) => [addToRelaysSet, ...prev]);
    } else exit();
  };

  return (
    <>
      {seeRelaySetDetails && (
        <AddRelaySet
          exit={() => setSeeRelaySetDetails(false)}
          allRelays={allRelays}
          toEdit={seeRelaySetDetails}
        />
      )}
      <div className="fit-container fx-centered fx-start-h fx-start-v fx-col box-pad-h box-pad-v">
        <div className="fit-container fx-scattered">
          <div>
            <SelectTabs
              tabs={[t("A1NJKQa"), t("AgRMPL3")]}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              small={true}
            />
          </div>
          <button
            className={`btn ${
              !toUpdate ? "btn-disabled" : "btn-normal"
            } btn-small`}
            onClick={() => toUpdate ? update() : null}
            disabled={!toUpdate}
          >
            {t("A8alhKV")}
          </button>
        </div>
        {selectedTab === 0 && (
          <>
            <RelaysPicker
              allRelays={allRelays}
              addRelay={handleAddRelaysFeed}
              excludedRelays={selectedRelaysFeed.map((_) => _.value)}
              showMessage={false}
            />
            {selectedRelaysFeed.length > 0 && (
              <>
                <p className="gray-c">{t("A4lbpBF")}</p>
                <div
                  className="fit-container fx-col fx-scattered fx-start-h fx-start-v"
                  style={{ maxHeight: "50vh", overflow: "scroll" }}
                >
                  <DraggableComp
                    children={selectedRelaysFeed.map((_) => {
                      return {
                        id: _,
                      };
                    })}
                    setNewOrderedList={(data) => hanleDragInternalITems(data)}
                    component={RelayItem}
                    props={{
                      removeRelay,
                      allowDrag: true,
                    }}
                    background={false}
                  />
                </div>
              </>
            )}
            {selectedRelaysFeed.length === 0 && (
              <div
                className="fit-container fx-centered"
                style={{ height: "150px" }}
              >
                <div className="fx-centered fx-col box-pad-h box-pad-v">
                  <p>{t("AcRP9Vs")}</p>
                  <p className="gray-c p-centered box-pad-h">{t("AV1iUL2")}</p>
                </div>
              </div>
            )}
          </>
        )}
        {selectedTab === 1 && (
          <>
            <RelaysSetPicker
              selectedRelaysSetFeed={selectedRelaysSetFeed}
              setSelectedRelaysSetFeed={setSelectedRelaysSetFeed}
              allRelays={allRelays}
              addToFavRelays={update}
            />
            {selectedRelaysSetFeed.length > 0 && (
              <>
                <p className="gray-c">{t("AIby7j8")}</p>
                <div
                  className="fit-container fx-col fx-scattered fx-start-h fx-start-v"
                  style={{ maxHeight: "50vh", overflow: "scroll" }}
                >
                  <DraggableComp
                    children={selectedRelaysSetFeed.map((_) => {
                      return {
                        id: _,
                      };
                    })}
                    setNewOrderedList={(data) => hanleDragInternalITemsForSets(data)}
                    component={RelaySetItem}
                    props={{
                      removeRelaySet,
                      allowDrag: true,
                      seeDetails: setSeeRelaySetDetails,
                    }}
                    background={false}
                  />
                </div>
              </>
            )}

            {selectedRelaysSetFeed.length === 0 && (
              <div
                className="fit-container fx-centered"
                style={{ height: "150px" }}
              >
                <div className="fx-centered fx-col box-pad-h box-pad-v">
                  <p>{t("Aalg3MI")}</p>
                  <p className="gray-c p-centered box-pad-h">{t("Andc78r")}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
