import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setToast } from "../../Store/Slides/Publishers";
import LoadingDots from "../../Components/LoadingDots";
import { MutedList } from "./MutedList";
import { MediaUploader } from "./MediaUploader";
import MediaUploaderServer from "@/Content/MediaUploaderServer";
import { getMediaUploader, getSelectedServer, getWotConfig, updateMediaUploader } from "@/Helpers/ClientHelpers";

export function ContentModerationManagement({
  selectedTab,
  setSelectedTab,
  userKeys,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [customServer, setCustomServer] = useState(false);
  const [legacyDM, setLegacyDM] = useState(localStorage?.getItem("legacy-dm"));
  const [wotConfig, setWotConfig] = useState(getWotConfig());
  const [showMutedList, setShowMutedList] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [mediaUploader, setMediaUploader] = useState(getMediaUploader());
  const [selectedMediaServer, setSelectedMediaServer] = useState(
    getSelectedServer() || mediaUploader[0].value
  );

  useEffect(() => {
    if (userKeys) {
      setMediaUploader(getMediaUploader(handleRemoveServer));
      setSelectedMediaServer(getSelectedServer());
    }
  }, [userKeys]);

  const handleRemoveServer = (server) => {
    let tempServersURLs = MediaUploaderServer.map((s) => s[1]);
    let tempArray = mediaUploader
      .filter((s) => s.value !== server && !tempServersURLs.includes(s.value))
      .map((_) => [_.display_name, _.value]);
    replaceMediaUploader(
      tempArray,
      selectedMediaServer === server
        ? mediaUploader[0].value
        : selectedMediaServer
    );
    setMediaUploader(getMediaUploader());
  };
  const addNewServer = async () => {
    if (!customServer) return;
    setIsLoading(true);
    try {
      const test = await axios.post(customServer);
      dispatch(
        setToast({
          type: 2,
          desc: t("AQIc1lO"),
        })
      );
      setIsLoading(false);
    } catch (err) {
      if (err.response.status === 404) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AQIc1lO"),
          })
        );
        setIsLoading(false);
        return;
      }
      let domain = customServer.split("/")[2];

      setSelectedMediaServer(customServer);
      let checkExistance = mediaUploader.find((_) => _.display_name === domain);
      if (!checkExistance) {
        updateMediaUploader([domain, customServer], customServer);
        setMediaUploader(getMediaUploader());
      } else {
        updateMediaUploader(undefined, customServer);
      }
      setCustomServer(false);
      setIsLoading(false);
    }
  };

  const handleLegacyDMs = () => {
    if (legacyDM) {
      localStorage?.removeItem("legacy-dm");
      setLegacyDM(false);
    } else {
      localStorage?.setItem("legacy-dm", `${Date.now()}`);
      setLegacyDM(true);
    }
  };
  const handleChangeWotConfig = (key, value) => {
    if (key === "score") {
      let config = {
        ...wotConfig,
        score: value >= 0 && value <= 10 ? value : 2,
      };
      setWotConfig(config);
      localStorage?.setItem(
        `${userKeys.pub}-wot-config`,
        JSON.stringify(config)
      );
      return;
    }
    let newValue = !value;
    if (key === "all") {
      let config = {
        ...wotConfig,
        all: newValue,
        notifications: newValue,
        reactions: newValue,
        dms: newValue,
      };

      setWotConfig(config);
      localStorage?.setItem(
        `${userKeys.pub}-wot-config`,
        JSON.stringify(config)
      );
      return;
    }
    let config = { ...wotConfig, [key]: newValue };
    if (config.notifications && config.reactions && config.dms)
      config.all = true;
    else config.all = false;

    setWotConfig(config);
    localStorage?.setItem(`${userKeys.pub}-wot-config`, JSON.stringify(config));
  };
  return (
    <>
      {showMutedList && <MutedList exit={() => setShowMutedList(false)} />}
      {showMediaUploader && (
        <MediaUploader exit={() => setShowMediaUploader(false)} />
      )}

      <div
        className={`fit-container fx-scattered fx-col pointer ${selectedTab === "moderation" ? "sc-s box-pad-h-s box-pad-v-s" : ""}`}
        style={{
          borderBottom: "1px solid var(--very-dim-gray)",
          gap: 0,
          borderColor: "var(--very-dim-gray)",
          transition: "0.2s ease-in-out",
        }}
      >
        <div
          className="fx-scattered fit-container  box-pad-h-m box-pad-v-m "
          onClick={() =>
            selectedTab === "moderation"
              ? setSelectedTab("")
              : setSelectedTab("moderation")
          }
        >
          <div className="fx-centered fx-start-h fx-start-v">
            <div className="box-pad-v-s">
              <div className="content-s-24"></div>
            </div>
            <div>
              <p>{t("Ayh6w9C")}</p>
              <p className="p-medium gray-c">{t("Aa4zlCA")}</p>
            </div>
          </div>
          <div className="arrow"></div>
        </div>
        {selectedTab === "moderation" && (
          <div className="fit-container fx-col fx-centered  box-pad-h-m box-pad-v-m ">
            <div className="fx-scattered fit-container">
              <div>
                <p>{t("AX2OYcg")}</p>
                <p className="p-medium gray-c">{t("AYnXPtk")}</p>
              </div>
              <div
                className="btn-text-gray"
                style={{ marginRight: ".75rem" }}
                onClick={() => setShowMutedList(true)}
              >
                {t("AsXohpb")}
              </div>
            </div>
            <div className="fx-scattered fit-container">
              <div>
                <p>{t("A1XtC0x")}</p>
                <p className="p-medium gray-c">{t("ATtpr07")}</p>
              </div>
              <div
                className="btn-text-gray"
                style={{ marginRight: ".75rem" }}
                onClick={() => setShowMediaUploader(true)}
              >
                {t("AsXohpb")}
              </div>
            </div>
            {customServer !== false && (
              <div
                className="fx-centered fit-container slide-down box-pad-v-s"
                style={{
                  borderBottom: "1px solid var(--very-dim-gray)",
                }}
              >
                <input
                  type="text"
                  placeholder={t("A8PtjSa")}
                  className="if ifs-full"
                  style={{ height: "40px" }}
                  value={customServer}
                  onChange={(e) => setCustomServer(e.target.value)}
                />
                <button
                  className="btn btn-normal"
                  style={{ minWidth: "max-content" }}
                  onClick={addNewServer}
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingDots /> : t("ALyj7Li")}
                </button>
                <button
                  className="btn btn-red"
                  onClick={() => setCustomServer(false)}
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingDots /> : t("AB4BSCe")}
                </button>
              </div>
            )}
            <div className="fx-scattered fit-container">
              <div>
                <p>{t("ACASAT7")}</p>
                <p className="p-medium gray-c">{t("AZknCuh")}</p>
              </div>
            </div>
            <div className="fit-container">
              <p className="gray-c">{t("ATQOG8o")}</p>
              <div className="fit-container fx-centered">
                <input
                  type="range"
                  className="ifs-full"
                  min={0}
                  max={10}
                  value={wotConfig.score}
                  onChange={(e) =>
                    handleChangeWotConfig("score", parseInt(e.target.value))
                  }
                  disabled={
                    !(
                      wotConfig.notifications ||
                      wotConfig.reactions ||
                      wotConfig.dms
                    )
                  }
                />
                <div className="round-icon-small">
                  <p className="p-medium">{wotConfig.score}</p>
                </div>
              </div>
            </div>
            <div className="fit-container fx-col fx-centered fx-start-h fx-start-v">
              <p className="gray-c">{t("AUSdCrV")}</p>
              <div className="fit-container fx-centered fx-col">
                <label
                  className="fit-container fx-scattered"
                  htmlFor="wot-AR9ctVs"
                >
                  <p>{t("AR9ctVs")}</p>
                  <input
                    type="checkbox"
                    id="wot-AR9ctVs"
                    name="wot-AR9ctVs"
                    value={wotConfig.all}
                    checked={wotConfig.all}
                    onChange={() => handleChangeWotConfig("all", wotConfig.all)}
                  />
                </label>
                <label
                  className="fit-container fx-scattered"
                  htmlFor="wot-ASSFfFZ"
                >
                  <p>{t("ASSFfFZ")}</p>
                  <input
                    type="checkbox"
                    id="wot-ASSFfFZ"
                    name="wot-ASSFfFZ"
                    value={wotConfig.notifications}
                    checked={wotConfig.notifications}
                    onChange={() =>
                      handleChangeWotConfig(
                        "notifications",
                        wotConfig.notifications
                      )
                    }
                  />
                </label>
                <label
                  className="fit-container fx-scattered"
                  htmlFor="wot-Ad3ts4Q"
                >
                  <p>{t("Ad3ts4Q")}</p>
                  <input
                    type="checkbox"
                    id="wot-Ad3ts4Q"
                    name="wot-Ad3ts4Q"
                    value={wotConfig.reactions}
                    checked={wotConfig.reactions}
                    onChange={() =>
                      handleChangeWotConfig("reactions", wotConfig.reactions)
                    }
                  />
                </label>
                <label
                  className="fit-container fx-scattered"
                  htmlFor="wot-Aql44db"
                >
                  <p>{t("Aql44db")}</p>
                  <input
                    type="checkbox"
                    id="wot-Aql44db"
                    name="wot-Aql44db"
                    value={wotConfig.dms}
                    checked={wotConfig.dms}
                    onChange={() => handleChangeWotConfig("dms", wotConfig.dms)}
                  />
                </label>
              </div>
            </div>

            <div className="fx-scattered fit-container">
              <p>{t("A3KL0O7")}</p>
              <div
                className={`toggle ${legacyDM ? "toggle-dim-gray" : ""} ${
                  !legacyDM ? "toggle-c1" : "toggle-dim-gray"
                }`}
                onClick={handleLegacyDMs}
              ></div>
            </div>

            <p className="gray-c p-medium">
              {t("AsTdJ5U")}{" "}
              <a
                href="https://github.com/nostr-protocol/nips/blob/master/44.md"
                className="c1-c"
                style={{ textDecoration: "underline" }}
                target="_blank"
              >
                nip-44
              </a>
              {t("AgOr2Vf")}{" "}
              <a
                href="https://github.com/nostr-protocol/nips/blob/master/04.md"
                className="c1-c"
                style={{ textDecoration: "underline" }}
                target="_blank"
              >
                nip-04.
              </a>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ContentModerationManagement;
