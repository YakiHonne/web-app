import Dot from "@/Components/Dot";
import Icon from "@/Components/Icon";
import LoadingDots from "@/Components/LoadingDots";
import Slider from "@/Components/Slider";
import useBlossomManagement from "@/Hooks/useBlossomManagement";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import BlobCard from "./BlobCard";
import UploadBlossom from "./UploadBlossom";

export default function Blossom() {
  const { t } = useTranslation();
  const {
    userBlossomServers,
    blobs,
    allBlobs,
    isBlobsLoading,
    blossomColors,
    refreshLists,
  } = useBlossomManagement();
  const [selectedTab, setSelectedTab] = useState(false);
  const [display, setDisplay] = useState(2);
  const [showUpload, setShowUpload] = useState(false);
  return (
    <>
      {showUpload && <UploadBlossom exit={() => setShowUpload(false)} />}
      <div className="fit-container box-pad-h box-pad-v">
        <div className="fit-container fx-scattered ">
          <div className="fx-centered fx-col fx-start-h fx-start-v">
            <h3>{t("AGYERPI")}</h3>
            <p className="gray-c">{t("AEYOiv7")}</p>
          </div>
          <button
            className="btn btn-normal fx-centered"
            onClick={() => setShowUpload(true)}
          >
            {t("AiINSld")}
            <Icon name={"plus-sign"} size={14} />
          </button>
        </div>
        <div className="box-pad-v-m fit-container">
          {isBlobsLoading && (
            <div className="fx-centered box-pad-v">
              <LoadingDots />
            </div>
          )}
          {!isBlobsLoading && userBlossomServers.length > 0 && (
            <div
              className="fit-container fx-scattered"
              style={{ maxWidth: "100%" }}
            >
              <div style={{ width: "calc(100% - 120px)" }}>
                <Slider
                  slideBy={150}
                  items={[
                    <div
                      className={`box-pad-h-s box-pad-v-s sc-s-18 ${selectedTab === false ? "" : "bg-sp"} fx-centered pointer`}
                      onClick={() => setSelectedTab(false)}
                    >
                      <Dot color={"var(--black)"} />
                      <p>{t("A2q2L8K")}</p>
                    </div>,
                    ...userBlossomServers.map((_, index) => {
                      return (
                        <div
                          key={index}
                          className={`box-pad-h-m box-pad-v-s sc-s-18 ${selectedTab === index ? "" : "bg-sp"} fx-centered pointer`}
                          onClick={() => setSelectedTab(index)}
                        >
                          <Dot color={blossomColors[index]} />
                          <p>{_.replaceAll("https://", "")}</p>
                        </div>
                      );
                    }),
                  ]}
                />
              </div>
              <div className="fx-centered max-content">
                <div
                  className={`round-icon pointer fx-centered ${display === 1 ? "bg" : "bg-sp"}`}
                  onClick={() => setDisplay(1)}
                >
                  <Icon
                    name={"grid-4"}
                    size={20}
                    onClick={() => setDisplay(1)}
                  />
                </div>
                <div
                  className={`round-icon pointer fx-centered ${display === 2 ? "bg" : "bg-sp"}`}
                  onClick={() => setDisplay(2)}
                >
                  <Icon
                    name={"grid-2"}
                    size={20}
                    onClick={() => setDisplay(2)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="fit-container fx-centered fx-wrap">
          {selectedTab === false &&
            allBlobs.map((_, index) => {
              return (
                <BlobCard
                  key={_.sha256}
                  blob={_}
                  userBlossomServers={userBlossomServers}
                  blossomColors={blossomColors}
                  display={display}
                  selectedServer={userBlossomServers[selectedTab]}
                  refreshLists={refreshLists}
                />
              );
            })}
          {selectedTab !== false &&
            blobs[userBlossomServers[selectedTab]].map((_, index) => {
              return (
                <BlobCard
                  key={_.sha256}
                  blob={_}
                  userBlossomServers={userBlossomServers}
                  blossomColors={blossomColors}
                  display={display}
                  refreshLists={refreshLists}
                  selectedServer={userBlossomServers[selectedTab]}
                />
              );
            })}
        </div>
      </div>
    </>
  );
}
