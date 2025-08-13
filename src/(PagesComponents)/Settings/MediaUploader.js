import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { InitEvent } from "@/Helpers/Controlers";
import {
  getMediaUploader,
  getSelectedServer,
  replaceMediaUploader,
  updateMediaUploader,
} from "@/Helpers/ClientHelpers";
import LoadingDots from "@/Components/LoadingDots";
import Select from "@/Components/Select";
import Toggle from "@/Components/Toggle";
import AddBlossomServer from "./AddBlossomServer";
import MediaUploaderServer from "@/Content/MediaUploaderServer";

export function MediaUploader({ exit }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userBlossomServers = useSelector((state) => state.userBlossomServers);
  const [selectedTab, setSelectedTab] = useState("0");
  const [mirrorOption, setMirrorOption] = useState(
    localStorage?.getItem(`${userKeys.pub}_mirror_blossom_servers`)
  );
  const [selectedService, setSelectedService] = useState(
    ["1", "2"].includes(localStorage?.getItem(`${userKeys.pub}_media_service`))
      ? localStorage?.getItem(`${userKeys.pub}_media_service`)
      : "1"
  );
  const [mediaUploader, setMediaUploader] = useState(getMediaUploader());
  const [selectedMediaServer, setSelectedMediaServer] = useState(
    getSelectedServer() || mediaUploader[0].value
  );
  const [isLoading, setIsLoading] = useState(false);
  const [customServer, setCustomServer] = useState(false);
  const [blossomCustomServer, setBlossomCustomServer] = useState(false);
  const [serversTodelete, setServersToDelete] = useState([]);

  const mediaServices = [
    {
      display_name: t("ATCstom"),
      value: "1",
    },
    {
      display_name:
        userBlossomServers.length === 0 ? t("A3Ok2VN") : t("A0n1wDK"),
      value: "2",
      disabled: userBlossomServers.length === 0,
    },
  ];

  useEffect(() => {
    if (selectedService === "2" && userBlossomServers.length === 0) {
      handleSelectMediaService("1");
    }
  }, [userBlossomServers]);

  const handleSelectMediaService = (value) => {
    if (value === "1") {
      localStorage?.setItem(`${userKeys.pub}_media_service`, "1");
      setSelectedService(value);
    }
    if (value === "2" && userBlossomServers.length > 0) {
      localStorage?.setItem(`${userKeys.pub}_media_service`, "2");
      setSelectedService(value);
    }
  };

  const getMediaUploaderFinalList = () => {
    let tempServersURLs = MediaUploaderServer.map((s) => s[1]);

    let tempArray = mediaUploader.map((s) => {
      return {
        ...s,
        right_el: !tempServersURLs.includes(s.value) ? (
          <div
            className="round-icon-small"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveServer(s.value);
            }}
          >
            <p className="red-c">&minus;</p>
          </div>
        ) : null,
      };
    });
    return tempArray;
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
  const handleSwitchMediaServer = (server) => {
    setSelectedMediaServer(server);
    updateMediaUploader(undefined, server);
  };

  const handleMirrorServers = () => {
    if (mirrorOption) {
      setMirrorOption(false);
      localStorage?.removeItem(`${userKeys.pub}_mirror_blossom_servers`);
    }
    if (!mirrorOption) {
      setMirrorOption(true);
      localStorage?.setItem(
        `${userKeys.pub}_mirror_blossom_servers`,
        `${Date.now()}`
      );
    }
  };

  const removeServersFromBlossomList = async () => {
    try {
      const event = {
        kind: 10063,
        content: "",
        tags: [
          ...userBlossomServers
            .filter((_) => !serversTodelete.includes(_))
            .map((url) => ["server", url]),
        ],
      };
      const eventInitEx = await InitEvent(
        event.kind,
        event.content,
        event.tags
      );
      dispatch(
        setToPublish({
          eventInitEx,
          allRelays: [],
        })
      );
      setServersToDelete([]);
    } catch (_) {
      return false;
    }
  };

  const selectMainServer = async (server) => {
    try {
      const event = {
        kind: 10063,
        content: "",
        tags: [
          ...[...new Set([server, ...userBlossomServers])].map((url) => [
            "server",
            url,
          ]),
        ],
      };
      const eventInitEx = await InitEvent(
        event.kind,
        event.content,
        event.tags
      );
      if(!eventInitEx) {
        return
      }
      dispatch(
        setToPublish({
          eventInitEx,
          allRelays: [],
        })
      );
      setServersToDelete([]);
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="fixed-container fx-centered box-pad-h">
      <div
        className="box-pad-h-m box-pad-v-m sc-s-18 bg-sp"
        style={{
          width: "min(100%, 500px)",
          position: "relative",
          overflow: "visible",
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4 className="box-marg-s">{t("A1XtC0x")}</h4>

        <div className="fx-centered fx-col fit-container fx-start-v fx-start-h">
          <div className="fit-container fx-scattered">
            <p>{t("AgZ9mO1")}</p>
            <Select
              options={mediaServices}
              value={selectedService}
              setSelectedValue={handleSelectMediaService}
            />
          </div>
          <hr />
          <p>{t("ABtsLBp")}</p>
          <div
            className="sc-s-18 bg-sp fx-centered fx-col fx-start-h fx-start-v fit-container box-pad-h-m box-pad-v-m option pointer"
            style={{ overflow: "visible" }}
          >
            <div
              className="fit-container fx-scattered"
              onClick={() => setSelectedTab("1")}
            >
              <p className="gray-c">{t("ATCstom")}</p>
              <div className="arrow"></div>
            </div>

            {selectedTab === "1" && (
              <div className="fit-container">
                <div className="fx-scattered fit-container">
                  <p>{t("AjCVBmz")}</p>

                  <div className="fx-centered">
                    {customServer === false && (
                      <Select
                        options={getMediaUploaderFinalList()}
                        value={selectedMediaServer}
                        setSelectedValue={handleSwitchMediaServer}
                      />
                    )}
                    {customServer === false && (
                      <div
                        className="round-icon-small round-icon-tooltip"
                        data-tooltip={t("ALyj7Li")}
                        onClick={() => setCustomServer("")}
                      >
                        <div className="plus-sign"></div>
                      </div>
                    )}
                    {customServer !== false && (
                      <div
                        className="round-icon-small"
                        onClick={() => setCustomServer(false)}
                        style={{
                          borderColor: "var(--red-main)",
                        }}
                      >
                        <p className="red-c">-</p>
                      </div>
                    )}
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
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            className="sc-s-18 bg-sp fx-centered fx-col fx-start-h fx-start-v fit-container box-pad-h-m box-pad-v-m option pointer"
            style={{ overflow: "scroll", maxHeight: "300px" }}
          >
            <div
              className="fit-container fx-scattered"
              onClick={() => setSelectedTab("2")}
            >
              <p className="gray-c">{t("A0n1wDK")}</p>
              <div className="arrow"></div>
            </div>

            {selectedTab === "2" && (
              <div className="fit-container fx-centered">
                <div className="fx-centered fx-col fx-start-h fx-start-v fit-container">
                  <div className="fit-container fx-scattered">
                    <p>{t("AoA6v9d")}</p>
                    <Toggle
                      status={mirrorOption}
                      setStatus={handleMirrorServers}
                    />
                  </div>
                  {userBlossomServers.length > 0 && (
                    <>
                      <p>{t("As9gwde")}</p>
                      <div className="fit-container fx-scattered">
                        <p className="green-c">{userBlossomServers[0]}</p>
                        <div
                          style={{
                            minWidth: "6px",
                            aspectRatio: "1/1",
                            borderRadius: "50%",
                            backgroundColor: "var(--green-main)",
                          }}
                        ></div>
                      </div>
                    </>
                  )}
                  <div className="fit-container fx-scattered">
                    <p>{t("At4Hrf6")}</p>
                    <div className="fx-centered">
                      {serversTodelete.length > 0 && (
                        <button
                          className="btn btn-normal btn-small slide-right"
                          onClick={removeServersFromBlossomList}
                        >
                          {t("A29aBCD")}
                        </button>
                      )}
                      {!blossomCustomServer && (
                        <div
                          className="round-icon-small round-icon-tooltip"
                          data-tooltip={t("ALyj7Li")}
                          onClick={() => setBlossomCustomServer(true)}
                        >
                          <div className="plus-sign"></div>
                        </div>
                      )}
                      {blossomCustomServer && (
                        <div
                          className="round-icon-small"
                          onClick={() => setBlossomCustomServer(false)}
                          style={{
                            borderColor: "var(--red-main)",
                          }}
                        >
                          <p className="red-c">-</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {blossomCustomServer && (
                    <AddBlossomServer
                      exit={() => setBlossomCustomServer(false)}
                    />
                  )}
                  {userBlossomServers.map((_, index) => {
                    let status = serversTodelete.includes(_);
                    return (
                      <div className="fit-container fx-scattered" key={index}>
                        <p className={index === 0 ? "green-c" : "gray-c"}>
                          {_}
                        </p>
                        <div className="fx-centered">
                          {index !== 0 && (
                            <button
                              className="btn btn-small btn-gst"
                              onClick={() => selectMainServer(_)}
                            >
                              {t("AYpApBJ")}
                            </button>
                          )}
                          {status && (
                            <div
                              className="round-icon-small"
                              onClick={() =>
                                setServersToDelete((prev) =>
                                  prev.filter((__) => __ !== _)
                                )
                              }
                            >
                              <div className="undo"></div>
                            </div>
                          )}
                          {!status && (
                            <div
                              className="round-icon-small round-icon-tooltip"
                              data-tooltip={t("AzkTxuy")}
                              onClick={() =>
                                setServersToDelete((prev) => [...prev, _])
                              }
                            >
                              <div className="trash"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {userBlossomServers.length === 0 && (
                    <p className="p-italic gray-c">{t("AHFsFp7")}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUploader;
