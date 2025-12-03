import useRelaysSet from "@/Hooks/useRelaysSet";
import React, { useEffect, useState } from "react";
import RelaySetItem from "./RelaySetItem";
import AddRelaySet from "../AddRelaySet";
import { InitEvent } from "@/Helpers/Controlers";
import { setToPublish } from "@/Store/Slides/Publishers";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { deleteRelaysSet } from "@/Helpers/DB";

export default function RelaysSetSettings({ exit, allRelays }) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const { userRelaysSetSimplified } = useRelaysSet();
  const [relaysSets, setRelaysSets] = useState(
    userRelaysSetSimplified.map((_) => _.aTag)
  );
  const [selectedRelaysSet, setSelectedRelaysSet] = useState(null);

  useEffect(() => {
    setRelaysSets(userRelaysSetSimplified.map((_) => _.aTag));
  }, [userRelaysSetSimplified]);

  const removeRelaySet = async (index) => {
    let eventID = userRelaysSetSimplified[index].id;
    let aTag = userRelaysSetSimplified[index].aTag;
    let eventInitEx = await InitEvent(5, "Delete this relay set", [
      ["e", eventID],
    ]);
    if (!eventInitEx) return;
    dispatch(setToPublish({ eventInitEx, allRelays: [] }));
    deleteRelaysSet(aTag, userKeys.pub);
  };

  return (
    <>
      {selectedRelaysSet && (
        <AddRelaySet
          exit={() => setSelectedRelaysSet(null)}
          toEdit={selectedRelaysSet}
          allRelays={allRelays}
        />
      )}
      <div
        className="fixed-container fx-centered box-pad-h box-pad-v"
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
        style={{ zIndex: 300 }}
      >
        <div
          className="sc-s box-pad-h bg-sp"
          style={{ position: "relative", width: "min(500px, 100%)", position: "relative" }}
          onClick={(e) => e.stopPropagation()}
        >
            <div className="close" onClick={exit}>
                <div></div>
            </div>
          <div className="fx-centered fx-col fx-start-h fx-start-v box-pad-v">
            <h4>Relays Set Settings</h4>
            <p className="gray-c">Edit or delete your relays set</p>
          </div>
          <div
            className="fit-container fx-centered fx-col fx-start-h fx-start-v box-marg-s"
            style={{ maxHeight: "40vh", overflow: "scroll" }}
          >
            {relaysSets.map((_, index) => {
              return (
                <RelaySetItem
                  key={_}
                  item={{ id: _ }}
                  removeRelaySet={removeRelaySet}
                  index={index}
                  allowDrag={false}
                  seeDetails={setSelectedRelaysSet}
                  removeRelaySetConfirmation={true}
                />
              );
            })}
            {relaysSets.length === 0 && (
              <div
                className="fx-centered fit-container"
                style={{ height: "150px" }}
              >
                <p className="gray-c">No relays set found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
