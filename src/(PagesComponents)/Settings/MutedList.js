import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "../../Store/Slides/Publishers";
import NProfilePreviewer from "@/Components/NProfilePreviewer";

export function MutedList({ exit }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userRelays = useSelector((state) => state.userRelays);
  const userKeys = useSelector((state) => state.userKeys);
  const userMutedList = useSelector((state) => state.userMutedList);
  const isPublishing = useSelector((state) => state.isPublishing);
  const muteUnmute = async (index) => {
    try {
      if (isPublishing) {
        dispatch(
          setToast({
            type: 3,
            desc: "An event publishing is in process!",
          })
        );
        return;
      }

      let tempTags = Array.from(userMutedList.map((pubkey) => ["p", pubkey]));

      tempTags.splice(index, 1);

      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 10000,
          content: "",
          tags: tempTags,
          allRelays: userRelays,
        })
      );
    } catch (err) {
      console.log(err);
    }
  };
  if (!Array.isArray(userMutedList)) return;
  return (
    <div className="fixed-container box-pad-h fx-centered">
      <div
        className="box-pad-h-m box-pad-v-m sc-s-18 bg-sp"
        style={{ width: "min(100%, 500px)", position: "relative" }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        {userMutedList.length > 0 && (
          <h4 className="p-centered box-marg-s">{t("AX2OYcg")}</h4>
        )}
        {userMutedList.length > 0 && (
          <div
            className="fit-container fx-centered fx-col fx-start-v fx-start-h"
            style={{ maxHeight: "40vh", overflow: "scroll" }}
          >
            {userMutedList.map((pubkey, index) => {
              return (
                <div key={pubkey} className="fit-container fx-shrink">
                  <NProfilePreviewer
                    margin={false}
                    onClose={() => muteUnmute(index)}
                    close={true}
                    pubkey={pubkey}
                  />
                </div>
              );
            })}
          </div>
        )}
        {userMutedList.length === 0 && (
          <div
            className="fx-centered fx-col fit-container"
            style={{ height: "20vh" }}
          >
            <div className="user-24"></div>
            <p>{t("ACzeK4g")}</p>
            <p className="gray-c p-medium p-centered">{t("Ap5S8lY")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MutedList;
