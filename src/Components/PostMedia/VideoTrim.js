import React from "react";
import LoadingDots from "../LoadingDots";
import VideoTrimControler from "./VideoTrimControler";
import { useTranslation } from "react-i18next";

export default function VideoTrim({
  videoTimeframes,
  isVideoFramesLoading,
  videoDuration,
  setRange,
  range,
  timeCheckpoints,
}) {
  const { t } = useTranslation();
  return (
    <div className="fit-container">
      <div style={{ paddingBottom: "24px" }}>
        <p className="gray-c">{t("ALJAfqb")}</p>
      </div>
      <div
        className="fit-container"
        style={{
          position: "relative",
        }}
      >
        {!isVideoFramesLoading && (
          <div className="fit-container sc-s-18 fx-centered" style={{ gap: 0 }}>
            {videoTimeframes.map((src, index) => (
              <div
                key={index}
                alt={`frame-${index}`}
                className="bg-img cover-bg"
                style={{
                  flex: 1,
                  height: "100px",
                  backgroundImage: `url(${src})`,
                }}
              ></div>
            ))}
          </div>
        )}
        {isVideoFramesLoading && (
          <div
            style={{ width: "100%", height: "100px" }}
            className="fx-centered sc-s-18"
          >
            <LoadingDots />
          </div>
        )}
        {videoTimeframes.length > 0 && (
          <VideoTrimControler
            duration={videoDuration}
            setRange={setRange}
            range={range}
          />
        )}
      </div>
      {timeCheckpoints.length > 0 && (
        <div className="fit-container fx-scattered fx-col box-pad-v-s box-pad-h-m">
          <div className="fit-container fx-scattered">
            {Array.from({ length: 17 }, (_, index) => (
              <div
                key={index}
                style={{
                  minWidth: "5px",
                  minHeight: "5px",
                  borderRadius: "20px",
                  backgroundColor: "var(--gray)",
                }}
              ></div>
            ))}
          </div>
          <div className="fit-container fx-scattered">
            {timeCheckpoints.map((checkpoint, index) => (
              <div key={index}>
                <p className="gray-c p-medium">{checkpoint}s</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
