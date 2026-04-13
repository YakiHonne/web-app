import Icon from "@/Components/Icon";
import LoadingDots from "@/Components/LoadingDots";
import Overlay from "@/Components/Overlay";
import { shortenKey } from "@/Helpers/Encryptions";
import {
  deleteBlossomFile,
  formatBytes,
  generateAuthorizationHeaderForBlossomServer,
  mirrorBlossomServerFileUpload,
} from "@/Helpers/Helpers";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function BlossomOps({
  ops = "mirror",
  exit,
  servers,
  blobData,
  seenOn = [],
  refreshLists,
}) {
  const { t } = useTranslation();
  const [selectedServers, setSelectedServers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = () => {
    if (ops === "mirror") handleMirror();
    if (ops !== "mirror") handleDelete();
  };

  const handleMirror = async () => {
    setIsLoading(true);
    let token = await generateAuthorizationHeaderForBlossomServer({
      servers: [seenOn[0]],
      tTag: "upload",
      sha256: blobData.sha256,
    });

    if (!token) {
      setIsLoading(false);
      return;
    }

    let mirror = await mirrorBlossomServerFileUpload({
      isMirror: true,
      serversList: selectedServers,
      eventHash: token,
      fileUrl: blobData.url,
      excludeFirst: false,
    });
    if (!mirror || mirror.length === 0) {
      setIsLoading(false);
      return;
    }
    refreshLists();
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);

    let token = await generateAuthorizationHeaderForBlossomServer({
      servers: [seenOn[0]],
      tTag: "delete",
      sha256: blobData.sha256,
    });
    let deletion = await deleteBlossomFile({
      serversList: selectedServers,
      eventHash: token,
      sha256: blobData.sha256,
    });
    if (!deletion || deletion.length === 0) {
      setIsLoading(false);
      return;
    }
    refreshLists();
    setIsLoading(false);
  };

  return (
    <Overlay exit={exit} width={650}>
      <div className="fit-container box-pad-h box-pad-v fx-centered fx-col fx-start-h fx-start-v">
        <h4 className={ops === "mirror" ? "" : "red-c"}>
          {t(ops === "mirror" ? "Ajh3PKr" : "Ak9FIYH")}
        </h4>
        <p className="gray-c">{t(ops === "mirror" ? "AdteuRn" : "ANVuR5T")}</p>
        <div
          className="fit-container box-pad-v-s box-pad-h-s fx-scattered sc-s-18 bg-sp"
          style={{ overflow: "visible" }}
        >
          <div className="fx-centered">
            {blobData.thumbnail && (
              <div
                className="fx-centered fx-end-v fx-end-h box-pad-h-s box-pad-v-s sc-s-18 bg-img cover-bg pos-relative"
                style={{
                  backgroundImage: `url(${blobData.thumbnail})`,
                  width: "50px",
                  height: "50px",
                  overflow: "visible",
                }}
              ></div>
            )}
            {!blobData.thumbnail && (
              <div
                style={{
                  width: "50px",
                  height: "50px",
                }}
                className="fx-centered sc-s18 bg-sp"
              >
                <Icon name={"posts"} size={32} opacity={0.6} />
              </div>
            )}
            <div className="fx-centered fx-col fx-start-v" style={{ gap: 0 }}>
              <div className="fx-centered">
                <p className="gray-c p-medium">{blobData.type}</p>
              </div>
              <p>{shortenKey(blobData.sha256, 7)}</p>
            </div>
          </div>
          <div className="fx-centered fx-col fx-start-v" style={{ gap: 0 }}>
            <p className="gray-c p-medium">{t("AcwrhJU")}</p>
            <p>{formatBytes(blobData.size)}</p>
          </div>
        </div>
        <p className="gray-c">{t("A9TtIXe")}</p>
        <div className="fx-centered fx-col fx-wrap fit-container fx-start-h fx-start-v">
          {ops !== "mirror" &&
            servers.map((server, index) => {
              const isSelected = selectedServers.includes(server);
              const isSeen = seenOn.includes(server);
              if (isSeen)
                return (
                  <label
                    htmlFor={server}
                    key={index}
                    className="fx-centered fx-start-h pointer if ifs-full"
                    onChange={() =>
                      setSelectedServers((prev) =>
                        isSelected
                          ? prev.filter((s) => s !== server)
                          : [...prev, server],
                      )
                    }
                  >
                    <input
                      type="checkbox"
                      id={server}
                      value={isSelected}
                      checked={isSelected}
                    />
                    <p>{server}</p>
                  </label>
                );
            })}
          {ops === "mirror" &&
            servers.map((server, index) => {
              const isSelected = selectedServers.includes(server);
              const isSeen = seenOn.includes(server);
              if (!isSeen)
                return (
                  <label
                    htmlFor={server}
                    key={index}
                    className="fx-centered fx-start-h pointer if ifs-full"
                    onChange={() =>
                      isSeen
                        ? null
                        : setSelectedServers((prev) =>
                            isSelected
                              ? prev.filter((s) => s !== server)
                              : [...prev, server],
                          )
                    }
                  >
                    <input
                      type="checkbox"
                      id={server}
                      value={isSeen ? true : isSelected}
                      checked={isSeen ? true : isSelected}
                    />
                    <p>{server}</p>
                  </label>
                );
            })}
        </div>
        <button
          className={`btn btn-full ${ops === "mirror" ? "btn-normal" : "btn-red"} ${selectedServers.length > 0 ? "" : "btn-disabled"}`}
          onClick={handleAction}
        >
          {isLoading ? (
            <LoadingDots />
          ) : (
            t(ops === "mirror" ? "A1C3sNc" : "Almq94P")
          )}
        </button>
      </div>
    </Overlay>
  );
}
