import Dot from "@/Components/Dot";
import Icon from "@/Components/Icon";
import LoadingDots from "@/Components/LoadingDots";
import Slider from "@/Components/Slider";
import useBlossomManagement from "@/Hooks/useBlossomManagement";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Blossom() {
  const { t } = useTranslation();
  const { userBlossomServers, blobs, allBlobs, isBlobsLoading, blossomColors } =
    useBlossomManagement();
  const [selectedTab, setSelectedTab] = useState(false);

  return (
    <div className="fit-container box-pad-h box-pad-v">
      <div className="fit-container fx-scattered ">
        <div className="fx-centered fx-col fx-start-h fx-start-v">
          <h3>{t("AGYERPI")}</h3>
          <p className="gray-c">{t("AEYOiv7")}</p>
        </div>
        <button className="btn btn-normal fx-centered">
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
        )}
      </div>
      <div className="fit-container fx-centered fx-wrap">
        {selectedTab === false &&
          allBlobs.map((_, index) => {
            return (
              <div
                key={index}
                className="fx-centered fx-end-v fx-end-h box-pad-h-s box-pad-v-s sc-s-18 bg-img cover-bg"
                style={{
                  backgroundImage: `url(${_.url})`,
                  flex: "1 1 200px",
                  aspectRatio: "1/1",
                  overflow: "visible",
                }}
              >
                {_.seen.length > 0 && (
                  <div className="fx-centered fx-start-h fx-start-v ">
                    {_.seen.map((_, index) => {
                      return (
                        <div
                          key={index}
                          className="round-icon-tooltip pointer"
                          data-tooltip={userBlossomServers[_]}
                        >
                          <Dot color={blossomColors[_]} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        {selectedTab !== false &&
          blobs[userBlossomServers[selectedTab]].map((_, index) => {
            return (
              <div
                key={index}
                className="fx-centered fx-end-v fx-end-h box-pad-h-s box-pad-v-s sc-s-18 bg-img cover-bg"
                style={{
                  backgroundImage: `url(${_.url})`,
                  flex: "1 1 200px",
                  aspectRatio: "1/1",
                  overflow: "visible",
                }}
              ></div>
            );
          })}
      </div>
    </div>
  );
}
