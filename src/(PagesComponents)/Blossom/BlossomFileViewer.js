import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";
import VideoLoader from "@/Components/VideoLoader";
import { convertDate, shortenKey } from "@/Helpers/Encryptions";
import { downloadFile, formatBytes } from "@/Helpers/Helpers";
import React from "react";
import { useTranslation } from "react-i18next";

export default function BlossomFileViewer({ blob, exit, blobType }) {
  const { t } = useTranslation();
  return (
    <Overlay exit={exit} width={800}>
      <div className="box-pad-h box-pad-v fx-centered fx-col fx-start-h">
        <div className="fit-container fx-scattered box-pad-h-m box-pad-v-m sc-s-18 bg-sp">
          <div className="fx-centered fx-col fx" style={{ gap: 0 }}>
            <p className="gray-c">{blob.type}</p>
            <p>{shortenKey(blob.sha256, 10)}</p>
          </div>
          <div className="fx-centered fx-col box-pad-h fx" style={{ gap: 0 }}>
            <p className="gray-c">{t("AJgoAXJ")}</p>
            <p>{convertDate(new Date(blob.uploaded * 1000), true)}</p>
          </div>

          <div className="fx-centered fx-col fx" style={{ gap: 0 }}>
            <p className="gray-c">{t("AcwrhJU")}</p>
            <p>{formatBytes(blob.size)}</p>
          </div>
        </div>
        {blobType === "video" && (
          <video
            controls
            src={blob.url}
            className="sc-s-18 fit-container"
            style={{ aspectRatio: "16/9" }}
          />
        )}
        {blobType === "image" && (
          <img
            className="fit-container sc-s-18"
            src={blob.url}
            alt={blob.sha256}
            style={{ aspectRatio: "16/9", objectFit: "contain" }}
          />
        )}
        {!["image", "video"].includes(blobType) && (
          <div className="fit-container fx-centered sc-s-18 bg-sp fx-col fit-height box-pad-h box-pad-v fx-centered">
            <Icon name={"posts"} size={48} opacity={0.5} />
            <p className="gray-c">{blob.type}</p>
            <p className="p-centered">{shortenKey(blob.url, 15)}</p>
          </div>
        )}
        <button
          className="btn btn-normal fx-centered btn-full"
          onClick={() => downloadFile(blob.url)}
        >
          <Icon name={"download"} />
          {t("AdKpCLS")}
        </button>
      </div>
    </Overlay>
  );
}
