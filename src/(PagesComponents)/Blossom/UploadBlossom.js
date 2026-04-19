import Overlay from "@/Components/Overlay";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import FileDragAndDropWrapper from "./FileDragAndDropWrapper";
import {
  generateAuthorizationHeaderForBlossomServer,
  getHashFromFile,
  getMediaType,
} from "@/Helpers/Helpers";
import LoadingDots from "@/Components/LoadingDots";
import ProgressCirc from "@/Components/ProgressCirc";
import axios from "axios";
import { store } from "@/Store/Store";
import { setToast } from "@/Store/Slides/Publishers";
import Icon from "@/Components/Icon";

export default function UploadBlossom({ exit, servers, refreshLists }) {
  const { t } = useTranslation();
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServers, setSelectedServers] = useState([]);
  const [progress, setProgress] = useState({});
  const handleSelectfile = (file) => {
    if (!file) {
      setFileType(null);
      setFile(null);
      setFileUrl(null);
      return;
    }
    setFileType(getMediaType(file.type));
    setFileName(file.name);
    setFile(file);
    setFileUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (selectedServers.length > 0 && file) {
      setIsLoading(true);
      let hash = await getHashFromFile(file);
      let x = hash.x;
      let blob = hash.blob;

      let encodeB64 = await generateAuthorizationHeaderForBlossomServer({
        servers: selectedServers,
        tTag: "upload",
        sha256: x,
      });

      if (!encodeB64) {
        setIsLoading(false);
        return;
      }

      try {
        const results = await Promise.allSettled(
          selectedServers.map(async (server) => {
            return axios.put(`${server}/upload`, blob, {
              headers: {
                "Content-Type": blob.type,
                // "Content-Length": blob.size.toString(),
                Authorization: `Nostr ${encodeB64}`,
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                setProgress((prev) => ({
                  ...prev,
                  [server]: percentCompleted,
                }));
              },
            });
          }),
        );

        let atLeastOneSuccess = false;
        results.forEach((result, index) => {
          const server = selectedServers[index];
          if (result.status === "fulfilled") {
            atLeastOneSuccess = true;
          } else {
            store.dispatch(
              setToast({
                type: 2,
                desc:
                  server +
                    ": " +
                    (result.reason?.response?.data?.message ||
                      result.reason?.response?.data ||
                      result.reason?.message) ||
                  `Could not upload to ${server}`,
              }),
            );
          }
        });

        if (atLeastOneSuccess) {
          refreshLists();
        }
      } catch (err) {
        console.log(err);
      }
      setProgress({});
      setIsLoading(false);
    }
  };

  return (
    <Overlay exit={exit}>
      <div className="fx-centered fx-col fx-start-v  box-pad-h-m box-pad-v-m">
        <FileDragAndDropWrapper
          title={t("A5AaVbz")}
          description={t("AGrXxV8")}
          isLoading={isLoading}
          onChange={handleSelectfile}
          fileUrl={fileUrl}
          fileType={fileType}
          label={fileName}
        />
        <p className="gray-c">{t("A9TtIXe")}</p>
        <div className="fx-centered fx-col fx-wrap fit-container fx-start-h fx-start-v">
          {servers.map((server, index) => {
            const isSelected = selectedServers.includes(server);

            return (
              <label
                htmlFor={server}
                key={index}
                className="fx-centered fx-start-h pointer if ifs-full"
              >
                <input
                  type="checkbox"
                  id={server}
                  value={isSelected}
                  checked={isSelected}
                  onChange={() =>
                    !isLoading &&
                    setSelectedServers((prev) =>
                      isSelected
                        ? prev.filter((s) => s !== server)
                        : [...prev, server],
                    )
                  }
                />
                <p>{server}</p>
                {progress[server] && progress[server] < 100 && (
                  <ProgressCirc
                    width={3}
                    percentage={progress[server]}
                    size={20}
                  />
                )}
                {progress[server] && progress[server] === 100 && (
                  <Icon name="checkmark" size={20} isColored={true} />
                )}
              </label>
            );
          })}
        </div>
        <button
          className={`btn btn-full ${selectedServers.length > 0 && file ? "btn-normal" : "btn-disabled"}`}
          onClick={handleUpload}
        >
          {isLoading ? <LoadingDots /> : t("AiINSld")}
        </button>
      </div>
    </Overlay>
  );
}
