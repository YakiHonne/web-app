'use client';
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSubData } from "@/Helpers/Controlers";
import { getParsedSW } from "@/Helpers/Encryptions";
import SWActionPreview from "./SWActionPreview";
import { saveUsers } from "@/Helpers/DB";
import LoadingDots from "@/Components/LoadingDots";
import MiniTool from "./MiniTool";
import UserProfilePic from "./UserProfilePic";
import { useSelector } from "react-redux";

export default function ActionTools({ setData }) {
  const [showActions, setShowActions] = useState(false);
  return (
    <>
      {showActions && (
        <Actions
          exit={() => setShowActions(false)}
          setReturnedData={(data) => {
            setShowActions(false);
            setData(data);
          }}
        />
      )}
      <div className="categories-24" onClick={() => setShowActions(true)}></div>
    </>
  );
}

const Actions = ({ exit, setReturnedData }) => {
  const { t } = useTranslation();
  const userSavedTools = useSelector((state) => state.userSavedTools);
  const [actions, setActions] = useState([]);
  const [savedTools, setSavedTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMiniApp, setShowMiniApp] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (userSavedTools.length === 0 && savedTools.length > 0) {
        setSavedTools([]);
        return;
      }
      let swIDs = userSavedTools.map((_) => _.split(":")[2]);
      if (swIDs.length === 0) return;
      const data = await getSubData([{ kinds: [30033], "#d": swIDs }]);
      setSavedTools(data.data.map((_) => getParsedSW(_)));
      saveUsers(data.pubkeys);
    };

    fetchData();
  }, [userSavedTools]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoading) setIsLoading(true);
      const data = await getSubData([
        { kinds: [30033], limit: 10, "#l": ["tool"] },
      ]);
      setActions(data.data.map((_) => getParsedSW(_)));
      saveUsers(data.pubkeys);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      <div
        className="fixed-container fx-centered box-pad-h"
        style={{ zIndex: 10 }}
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(100%, 600px)",
            minHeight: "60vh",
            maxHeight: "60vh",
            overflow: "scroll",
          }}
          className="sc-s-18 bg-sp"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          {showMiniApp && (
            <div className="fit-container">
              <div
                className="fit-container fx-centered fx-start-h box-pad-h-m box-pad-v-m sc-s-18 pointer"
                onClick={() => setShowMiniApp("")}
                style={{ borderRadius: 0 }}
              >
                <div className="arrow" style={{ rotate: "90deg" }}></div>
                <h4>{showMiniApp.title}</h4>
              </div>
              <div
                className="fit-container "
                style={{ maxHeight: "60vh", overflow: "scroll" }}
              >
                <MiniTool
                  url={showMiniApp.buttons[0].url}
                  setReturnedData={(data) => {
                    setShowMiniApp("");
                    setReturnedData(data);
                  }}
                />
              </div>
              <div
                className="fit-container fx-scattered box-pad-h-s box-pad-v-s sc-s-18"
                style={{ borderRadius: 0 }}
              >
                <div className="fx-centered">
                  <UserProfilePic
                    user_id={showMiniApp.pubkey}
                    img={showMiniApp.author.picture}
                    size={20}
                  />
                  <p className="gray-c p-one-line">
                    {t("AsXpL4b", {
                      name:
                        showMiniApp.author.display_name ||
                        showMiniApp.author.name,
                    })}
                  </p>
                </div>
                <div>
                  <p className="gray-c">
                    {showMiniApp.buttons[0].url.replace("https://", "")}
                  </p>
                </div>
              </div>
            </div>
          )}
          {!showMiniApp && (
            <div className="box-pad-h box-pad-v">
              <div className="fit-container">
                <h3>{t("AJDWN22")}</h3>
              </div>
              <div className="fit-container box-pad-v-s">
                <div className="fit-container fx-start-h fx-centered sc-s-18 bg-sp box-pad-h-m">
                  <div className="search"></div>
                  <input
                    type="text"
                    className="if if-no-border ifs-full"
                    style={{ paddingLeft: 0, height: "var(--40)" }}
                    placeholder={t("APL1UR4")}
                  />
                </div>
              </div>
              {savedTools.length > 0 && (
                <p className="gray-c box-pad-v-s">{t("A92h87b")}</p>
              )}
              <div className="fit-container fx-start-h fx-wrap fx-centered">
                {savedTools.map((sw) => {
                  return (
                    <div className="ifs-small" key={sw.id}>
                      <SWActionPreview
                        metadata={sw}
                        setSelectSW={(data) => setShowMiniApp(data)}
                      />
                    </div>
                  );
                })}
              </div>
              {actions.length > 0 && (
                <p className="gray-c box-pad-v-s">{t("AQ3VGVk")}</p>
              )}
              <div className="fit-container fx-start-h fx-wrap fx-centered">
                {actions.map((sw) => {
                  if (!userSavedTools.includes(sw.aTag))
                    return (
                      <div className="ifs-small" key={sw.id}>
                        <SWActionPreview
                          metadata={sw}
                          setSelectSW={(data) => setShowMiniApp(data)}
                        />
                      </div>
                    );
                })}
                {isLoading && (
                  <div
                    style={{ height: "200px" }}
                    className="fit-container fx-centered"
                  >
                    <LoadingDots />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
