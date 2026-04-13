import Dot from "@/Components/Dot";
import { useVideoThumbnail } from "@/Hooks/useVideoThumbnail";
import React, { useState } from "react";
import {
  copyText,
  downloadFile,
  formatBytes,
  getMediaType,
} from "@/Helpers/Helpers";
import Icon from "@/Components/Icon";
import { shortenKey } from "@/Helpers/Encryptions";
import { useTranslation } from "react-i18next";
import OptionsDropdown from "@/Components/OptionsDropdown";
import PostAsNote from "@/Components/PostAsNote";
import BlossomOps from "./BlossomOps";
import BlossomFileViewer from "./BlossomFileViewer";

export default function BlobCard({
  blob,
  display = 1,
  userBlossomServers,
  blossomColors,
  selectedServer,
  refreshLists,
}) {
  const { t } = useTranslation();
  let blobType = getMediaType(blob.type);
  const thumbnail = useVideoThumbnail(
    blobType === "video" ? blob.url : null,
    0.5,
    300,
    blobType === "image" ? blob.url : "",
  );
  const [showPostInNote, setShowPostInNote] = useState(false);
  const [showPreviewer, setShowPreviewer] = useState(false);
  const [ops, setOps] = useState(false);
  const options = [
    <div
      onClick={(e) => {
        setShowPreviewer(true);
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <p>{t("AYO6i7Y")}</p>
    </div>,
    <div
      onClick={(e) => {
        downloadFile(blob.url);
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <p>{t("AdKpCLS")}</p>
    </div>,
    <div
      onClick={(e) => {
        setShowPostInNote(true);
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <p>{t("AB8DnjO")}</p>
    </div>,
    <div
      onClick={(e) => {
        copyText(blob.sha256, t("ASr9ZwF"));
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <p>{t("A1S5EmZ")}</p>
    </div>,
    <div
      onClick={(e) => {
        copyText(blob.url, t("AxBmdge"));
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <p>{t("A4oCm1O")}</p>
    </div>,
    blob.seen?.length !== userBlossomServers.length ? (
      <div
        onClick={(e) => {
          setOps("mirror");
        }}
        className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
      >
        <p>{t("A1C3sNc")}</p>
      </div>
    ) : (
      ""
    ),
    <div
      onClick={(e) => {
        setOps("delete");
      }}
      className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
    >
      <p className="red-c">{t("AUhNvsT")}</p>
    </div>,
  ];

  if (display === 1)
    return (
      <div
        className="fx-centered fx-end-v fx-end-h box-pad-h-s box-pad-v-s sc-s-18 bg-img cover-bg pos-relative"
        style={{
          backgroundImage: `url(${thumbnail})`,
          flex: "1 1 200px",
          aspectRatio: "1/1",
          overflow: "visible",
        }}
      >
        {blobType === "video" && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
            }}
          >
            <svg
              aria-label="Reel"
              fill="white"
              height="24"
              role="img"
              viewBox="0 0 24 24"
              width="24"
              style={{
                boxShadow: "0 0 5px rgba(0, 0, 0, 0.55)",
                borderRadius: "10px",
                backgroundColor: "#888",
              }}
            >
              <path d="M22.942 7.464c-.062-1.36-.306-2.143-.511-2.671a5.366 5.366 0 0 0-1.272-1.952 5.364 5.364 0 0 0-1.951-1.27c-.53-.207-1.312-.45-2.673-.513-1.2-.054-1.557-.066-4.535-.066s-3.336.012-4.536.066c-1.36.062-2.143.306-2.672.511-.769.3-1.371.692-1.951 1.272s-.973 1.182-1.27 1.951c-.207.53-.45 1.312-.513 2.673C1.004 8.665.992 9.022.992 12s.012 3.336.066 4.536c.062 1.36.306 2.143.511 2.671.298.77.69 1.373 1.272 1.952.58.581 1.182.974 1.951 1.27.53.207 1.311.45 2.673.513 1.199.054 1.557.066 4.535.066s3.336-.012 4.536-.066c1.36-.062 2.143-.306 2.671-.511a5.368 5.368 0 0 0 1.953-1.273c.58-.58.972-1.181 1.27-1.95.206-.53.45-1.312.512-2.673.054-1.2.066-1.557.066-4.535s-.012-3.336-.066-4.536Zm-7.085 6.055-5.25 3c-1.167.667-2.619-.175-2.619-1.519V9c0-1.344 1.452-2.186 2.619-1.52l5.25 3c1.175.672 1.175 2.368 0 3.04Z"></path>
            </svg>
          </div>
        )}
        {blob?.seen?.length > 0 && (
          <div className="fx-centered fx-start-h fx-start-v ">
            {blob.seen.map((_, index) => {
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
        {!thumbnail && (
          <div className="pos-absolute top-0 right-0 fx-centered fit-container fit-height">
            <Icon name={"posts"} size={32} opacity={0.6} />
          </div>
        )}
      </div>
    );

  return (
    <>
      {showPostInNote && (
        <PostAsNote content={blob.url} exit={() => setShowPostInNote(false)} />
      )}
      {showPreviewer && (
        <BlossomFileViewer
          blob={blob}
          blobType={blobType}
          exit={() => setShowPreviewer(false)}
        />
      )}
      {ops && (
        <BlossomOps
          ops={ops}
          exit={() => setOps(false)}
          servers={userBlossomServers}
          blobData={{ ...blob, thumbnail }}
          seenOn={
            blob.seen
              ? blob.seen.map((_) => userBlossomServers[_])
              : [selectedServer]
          }
          refreshLists={() => {
            setOps(false);
            refreshLists();
          }}
        />
      )}
      <div
        className="fit-container box-pad-v-s box-pad-h-s fx-scattered sc-s-18 bg-sp"
        style={{ overflow: "visible" }}
      >
        <div className="fx-centered">
          {thumbnail && (
            <div
              className="fx-centered fx-end-v fx-end-h box-pad-h-s box-pad-v-s sc-s-18 bg-img cover-bg pos-relative"
              style={{
                backgroundImage: `url(${thumbnail})`,
                width: "50px",
                height: "50px",
                overflow: "visible",
              }}
            ></div>
          )}
          {!thumbnail && (
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
              <p className="gray-c p-medium">{blob.type}</p>
            </div>
            <p>{shortenKey(blob.sha256, 7)}</p>
          </div>
        </div>
        <div className="fx-centered fx-col fx-start-v" style={{ gap: 0 }}>
          <p className="gray-c p-medium">{t("AcwrhJU")}</p>
          <p>{formatBytes(blob.size)}</p>
        </div>
        {blob?.seen?.length > 0 && (
          <div className="fx-centered fx-col fx-start-v" style={{ gap: 0 }}>
            <p className="gray-c p-medium">{t("AJgoAXJ")}</p>
            <div className="fx-centered fx-start-h fx-start-v ">
              {blob.seen.map((_, index) => {
                return (
                  <div
                    key={index}
                    className="round-icon-tooltip pointer"
                    data-tooltip={userBlossomServers[_]}
                  >
                    <Dot color={blossomColors[_]} size={10} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <OptionsDropdown options={options} />
      </div>
    </>
  );
}
