'use client';
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { nip19 } from "nostr-tools";
import { ndkInstance } from "@/Helpers/NDKInstance";
import ToPublishVideo from "@/Components/ToPublishVideo";
import UploadFile from "@/Components/UploadFile";
import { getVideoFromURL } from "@/Helpers/Helpers";
import LoadingDots from "@/Components/LoadingDots";
import { useTranslation } from "react-i18next";

export default function AddVideo({ exit, event }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [videoURL, setVideoURL] = useState(event?.vUrl || "");
  const [videoTitle, setVideoTitle] = useState(event?.title || "");
  const [videoDesc, setVideoDesc] = useState(event?.description || "");
  const [isLoading, setIsLoading] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState(false);
  const [type, setType] = useState(event ? "link" : "");

  const validate = async () => {
    if (type === "link") {
      setType("");
      return;
    }
    if (type === "1063") {
      try {
        let naddr = nip19.decode(videoURL);
        if (naddr.data.kind !== 1063) {
          dispatch(
            setToast({
              type: 2,
              desc: t("AVqYqwu"),
            })
          );
          return;
        }
        setIsLoading(true);
        let event = await ndkInstance.fetchEvent({
          kinds: [1063],
          ids: [naddr.data.id],
        });
        if (!event) {
          dispatch(
            setToast({
              type: 2,
              desc: t("ABNCz9e"),
            })
          );
          setIsLoading(false);
          return;
        }
        let mime = "";
        let url = "";

        for (let tag of event.tags) {
          if (tag[0] === "m") mime = tag[1];
          if (tag[0] === "url") url = tag[1];
        }

        if (!mime.includes("video")) {
          dispatch(
            setToast({
              type: 2,
              desc: t("A2eNUTw"),
            })
          );
          setIsLoading(false);
          return;
        }
        if (!url) {
          dispatch(
            setToast({
              type: 2,
              desc: t("AW6UnXx"),
            })
          );
          setIsLoading(false);
          return;
        }

        setVideoURL(url);
        setType("");
        setIsLoading(false);
        return;
      } catch (err) {
        dispatch(
          setToast({
            type: 2,
            desc: t("A01W0qK"),
          })
        );
        return;
      }
    }
  };

  useEffect(() => {
    if(event) validate()
  }, [])

  return (
    <>
      <div className="fixed-container fx-centered box-pad-h">
        <div
          className="sc-s-18 bg-sp"
          style={{
            position: "relative",
            width: "min(100%, 600px)",
            height: "100dvh",
            overflow: "scroll",
          }}
        >
          {!videoURL && !type && (
            <div className="fit-container fx-centered fx-col box-pad-h box-pad-v">
              <p>{t("Alc6XJv")}</p>
              <p className="p-medium gray-c p-centered box-marg-s">
                {t("AmzVdGS")}
              </p>
              <div className="fx-centered" style={{ columnGap: "16px" }}>
                <div className="fx-centered fx-col">
                  <UploadFile
                    kind={"video/mp4,video/x-m4v,video/*"}
                    setImageURL={setVideoURL}
                    setIsUploadsLoading={setIsLoading}
                    setFileMetadata={setVideoMetadata}
                    round={true}
                  />
                  <p className="p-medium gray-c">{t("ALzxqMa")}</p>
                </div>
                <p className="p-small gray-c">|</p>
                <div
                  className="fx-centered fx-col"
                  style={{ opacity: isLoading ? ".5" : "1" }}
                  onClick={() => setType("link")}
                >
                  <div className="round-icon">
                    <div className="link-24"></div>
                  </div>
                  <p className="p-medium gray-c">{t("AgSNaRf")}</p>
                </div>
                <p className="p-small gray-c">|</p>
                <div
                  className="fx-centered fx-col"
                  style={{ opacity: isLoading ? ".5" : "1" }}
                  onClick={() => setType("1063")}
                >
                  <div className="round-icon">
                    <div className="share-icon-2-24"></div>
                  </div>
                  <p className="p-medium gray-c">{t("Awm7WWX")}</p>
                </div>
              </div>
            </div>
          )}
          {videoURL && !type && (
            <div className="fit-container box-pad-h box-pad-v-s">
              <div className="box-pad-v-s fx-scattered fit-container">
                <div>
                  <h4>{t("Ao1TlO5")}</h4>
                  <p className="p-medium orange-c p-one-line">{videoURL}</p>
                </div>
                <div
                  className="round-icon"
                  onClick={() => {
                    setType("");
                    setVideoURL("");
                  }}
                >
                  <div className="trash"></div>
                </div>
              </div>
              {getVideoFromURL(videoURL)}
            </div>
          )}
          <hr />
          {type && (
            <div className="fit-container fx-centered fx-start-v fx-col box-pad-h box-pad-v">
              <div>
                <p className="p-left fit-container">
                  {type === "link" ? t("ATrNdrk") : t("Aj0EOon")}
                </p>
                {type === "1063" && (
                  <p className="gray-c p-medium">{t("Act0Er9")}</p>
                )}
              </div>
              <div className="fx-centered fit-container">
                <input
                  type="text"
                  className="if ifs-full"
                  placeholder={type === "link" ? t("AkLqPbH") : "nEvent"}
                  value={videoURL}
                  onChange={(e) => setVideoURL(e.target.value)}
                  disabled={isLoading}
                />
                <div className="fx-centered">
                  <button
                    className="btn btn-normal"
                    onClick={() => (videoURL ? validate() : null)}
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingDots /> : t("AfMMwZC")}
                  </button>
                  <button
                    className="btn btn-gst-red"
                    onClick={() => {
                      setType("");
                      setVideoURL("");
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingDots /> : t("AB4BSCe")}
                  </button>
                </div>
              </div>
            </div>
          )}
          <hr />
          <div className="fit-container fx-centered fx-col box-pad-h-m box-pad-v-s">
            <input
              type="text"
              placeholder={t("AqTI7Iu")}
              className="if ifs-full"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
            <textarea
              placeholder={t("AM6TPts")}
              className="txt-area ifs-full"
              value={videoDesc}
              onChange={(e) => setVideoDesc(e.target.value)}
            />
          </div>
          <ToPublishVideo
            videoURL={videoURL}
            videoTitle={videoTitle}
            videoDesc={videoDesc}
            videoMetadata={videoMetadata}
            event={event}
            exit={() => {
              exit();
            }}
          />
        </div>
      </div>
    </>
  );
}
