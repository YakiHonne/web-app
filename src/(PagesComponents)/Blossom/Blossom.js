import Dot from "@/Components/Dot";
import Icon from "@/Components/Icon";
import Spinner from "@/Components/Spinner";
import Select from "@/Components/Select";
import useBlossomManagement from "@/Hooks/useBlossomManagement";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import BlobCard from "./BlobCard";
import UploadBlossom from "./UploadBlossom";
import { VirtuosoGrid } from "react-virtuoso";
import YakiBlossomCard from "./YakiBlossomCard";
import { YAKI_BLOSSOM, formatBytes } from "@/Content/Blossom";

export default function Blossom() {
  const { t } = useTranslation();
  const {
    userBlossomServers,
    blobs,
    allBlobs,
    isBlobsLoading,
    blossomColors,
    refreshLists,
    yakiUsage,
    isYakiUsageLoading,
  } = useBlossomManagement();
  const [selectedTab, setSelectedTab] = useState(false);
  const [display, setDisplay] = useState(2);
  const [showUpload, setShowUpload] = useState(false);

  const selectedServer =
    selectedTab === false ? false : userBlossomServers[selectedTab];

  const consumedStorage = useMemo(() => {
    const list =
      selectedTab === false
        ? allBlobs
        : blobs[userBlossomServers[selectedTab]] || [];
    return list.reduce((sum, blob) => sum + (blob?.size || 0), 0);
  }, [selectedTab, allBlobs, blobs, userBlossomServers]);
  return (
    <>
      {showUpload && (
        <UploadBlossom
          exit={() => setShowUpload(false)}
          servers={userBlossomServers}
          refreshLists={() => {
            setShowUpload(false);
            refreshLists();
          }}
        />
      )}
      <div className="fit-container box-pad-h box-pad-v">
        <div className="fit-container fx-scattered ">
          <div className="fx-centered fx-col fx-start-h fx-start-v">
            <h4>{t("AGYERPI")}</h4>
            <p className="gray-c">{t("AEYOiv7")}</p>
          </div>
          <button
            className="btn btn-normal fx-centered"
            onClick={() => setShowUpload(true)}
          >
            {t("A5AaVbz")}
            <Icon name={"plus-sign"} size={14} />
          </button>
        </div>
        <div className="box-pad-v-m fit-container">
          {userBlossomServers.length > 0 && (
            <div
              className="fit-container fx-scattered"
              style={{ maxWidth: "100%" }}
            >
              <div style={{ width: "calc(100% - 120px)", maxWidth: "320px" }}>
                <Select
                  fullWidth
                  disabled={isBlobsLoading}
                  value={selectedTab}
                  setSelectedValue={setSelectedTab}
                  options={[
                    {
                      value: false,
                      display_name: t("A2q2L8K"),
                      left_el: isBlobsLoading ? (
                        <Spinner size={14} />
                      ) : (
                        <Dot color={"var(--black)"} />
                      ),
                    },
                    ...userBlossomServers.map((server, index) => ({
                      value: index,
                      display_name: server.replaceAll("https://", ""),
                      left_el: <Dot color={blossomColors[index]} />,
                      right_el:
                        server === YAKI_BLOSSOM ? (
                          <Icon name="crown" size={16} />
                        ) : null,
                    })),
                  ]}
                />
              </div>
              <div className="fx-centered max-content" style={{ columnGap: "6px" }}>
                <div
                  className="round-icon pointer fx-centered"
                  style={
                    display === 1
                      ? {
                          backgroundColor: "var(--very-dim-gray)",
                          borderColor: "var(--c1)",
                        }
                      : undefined
                  }
                  onClick={() => setDisplay(1)}
                >
                  <Icon
                    name={"grid-4"}
                    size={20}
                    isBoldThemeColor={display === 1}
                  />
                </div>
                <div
                  className="round-icon pointer fx-centered"
                  style={
                    display === 2
                      ? {
                          backgroundColor: "var(--very-dim-gray)",
                          borderColor: "var(--c1)",
                        }
                      : undefined
                  }
                  onClick={() => setDisplay(2)}
                >
                  <Icon
                    name={"list_unordered"}
                    v={2}
                    size={20}
                    isBoldThemeColor={display === 2}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <div
          className="fit-container"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            backgroundColor: "var(--white)",
            paddingBottom: "8px",
          }}
        >
          <YakiBlossomCard used={yakiUsage} isLoading={isYakiUsageLoading} />
        </div>

        {selectedServer !== YAKI_BLOSSOM && consumedStorage > 0 && (
          <div className="fit-container fx-scattered box-pad-v-s">
            <p className="gray-c">{t("AcwrhJU")}</p>
            <p className="p-bold">{formatBytes(consumedStorage)}</p>
          </div>
        )}

        {((selectedTab === false && allBlobs.length > 0) ||
          (selectedTab !== false &&
            blobs[userBlossomServers[selectedTab]].length > 0)) && (
            <VirtuosoGrid
              key={`${display}-${selectedTab}`}
              style={{ width: "100%", height: "100vh" }}
              overscan={200}
              useWindowScroll={true}
              skipAnimationFrameInResizeObserver={true}
              increaseViewportBy={300}
              totalCount={
                selectedTab === false
                  ? allBlobs.length
                  : blobs[userBlossomServers[selectedTab]].length
              }
              listClassName={`fx-centered fx-start-h fx-wrap ${display === 1 ? "fx-gap-v" : ""}`}
              itemClassName={
                display === 1 ? "grid-item-blossom-1" : "grid-item-blossom-2"
              }
              itemContent={(index) => {
                let _ =
                  selectedTab === false
                    ? allBlobs[index]
                    : blobs[userBlossomServers[selectedTab]][index];
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
              }}
            />
          )}
        {/* <div className="fit-container fx-centered fx-wrap">
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
          {selectedTab !== false &&
            blobs[userBlossomServers[selectedTab]].length === 0 && (
              <div className="fit-container fx-centered box-pad-v">
                <p className="gray-c">{t("AimYE39")}</p>
              </div>
            )}
        </div> */}
        {selectedTab !== false &&
          blobs[userBlossomServers[selectedTab]].length === 0 && (
            <div className="fit-container fx-centered box-pad-v">
              <p className="gray-c">{t("AimYE39")}</p>
            </div>
          )}
      </div>
    </>
  );
}
