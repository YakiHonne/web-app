import { extractNip19, FileUpload } from "@/Helpers/Helpers";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import LoadingDots from "../LoadingDots";
import { IMAGE_FILTERS } from "@/Content/ImageFilterConfig";
import MediaUploadArea from "./MediaUploadArea";
import ImageComp from "./ImageComp";
import VideoComp from "./VideoComp";
import MediaPostData from "./MediaPostData";
import ImageFilter from "./ImageFilter";
import VideoEditor from "./VideoEditor";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { InitEvent } from "@/Helpers/Controlers";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { nip19 } from "nostr-tools";
import { customHistory } from "@/Helpers/History";

const applyImageFilter = (file, filter = "grayscale(1)") => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.filter = filter;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        resolve({
          file: new File([blob], file.name, { type: file.type }),
          mimeType: file.type,
        });
      }, file.type);
    };

    img.src = URL.createObjectURL(file);
  });
};

const trimVideoFile = async (file, range) => {
  const ffmpeg = new FFmpeg({ log: true });

  await ffmpeg.load();

  const videoEl = document.createElement("video");
  videoEl.src = URL.createObjectURL(file);
  await new Promise((resolve) => (videoEl.onloadedmetadata = resolve));
  const duration = videoEl.duration;
  const start = (range.start / 100) * duration;
  const end = (range.end / 100) * duration;
  const trimDuration = end - start;
  const width = videoEl.videoWidth;
  const height = videoEl.videoHeight;

  const arrayBuffer = await file.arrayBuffer();
  await ffmpeg.writeFile("input.mp4", new Uint8Array(arrayBuffer));

  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-ss",
    start.toString(),
    "-t",
    trimDuration.toString(),
    "-c",
    "copy",
    "output.mp4",
  ]);

  const trimmedData = await ffmpeg.readFile("output.mp4");
  return {
    file: new File([trimmedData.buffer], "trimmed.mp4", { type: "video/mp4" }),
    duration: trimDuration.toString(),
    mimeType: "video/mp4",
    dim: `${width}x${height}`,
    kind: width > height ? 21 : 22,
  };
};

const base64ToFile = (dataUrl, filename) => {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];

  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], filename, { type: mime });
};

export default function PostMedia({ exit }) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const [file, setFile] = useState(null);
  const [fileLocalUrl, setFileLocalUrl] = useState(null);
  const [filter, setFilter] = useState("none");
  const [isLoading, setIsLoading] = useState(false);
  const [isImg, setIsImg] = useState(true);
  const [isSensitive, setSensitive] = useState(false);
  const [videoCover, setVideoCover] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(false);
  const [description, setDescription] = useState("");
  const [mainPostUploadPerc, setMainPostUploadPerc] = useState(0);
  const [videoCoverUploadPerc, setVideoCoverUploadPerc] = useState(0);
  const { t } = useTranslation();
  const handlePickFile = (file) => {
    setFile(file);
    setFileLocalUrl(URL.createObjectURL(file));
    setIsImg(file.type.startsWith("image/"));
  };
  const [range, setRange] = useState({ start: 0, end: 100 });
  const isPublishingEnabled = useMemo(() => {
    if (!file) return false;
    if (!isImg && !videoCover) return false;
    return true;
  }, [file, isImg, videoCover, description]);

  const clearWorkspace = () => {
    setFile(null);
    setFileLocalUrl(null);
    setIsImg(true);
    setFilter("none");
    setDescription("");
    setRange({ start: 0, end: 100 });
    setVideoCover(null);
    setMainPostUploadPerc(0);
    setVideoCoverUploadPerc(0);
  };

  const publishPost = async () => {
    try {
      if (isLoading || !isPublishingEnabled) return;
      setIsLoading(true);
      let userKeys_ = selectedProfile
        ? { ...selectedProfile }
        : { ...userKeys };
      let cover = false;
      if (!isImg)
        cover = await FileUpload(
          base64ToFile(videoCover, "cover.jpg"),
          userKeys_,
          setVideoCoverUploadPerc
        );
      if (!isImg && !cover) {
        dispatch(
          setToast({
            type: 2,
            desc: t("A7s0kOG"),
          })
        );
        setIsLoading(false);
        setVideoCoverUploadPerc(0);
        return;
      }
      let file_ = isImg
        ? await applyImageFilter(file, IMAGE_FILTERS[filter])
        : await trimVideoFile(file, range);
      let toUpload = await FileUpload(
        file_.file,
        userKeys_,
        setMainPostUploadPerc
      );
      if (!toUpload) {
        dispatch(
          setToast({
            type: 2,
            desc: t("A7s0kOG"),
          })
        );
        setIsLoading(false);
        setMainPostUploadPerc(0);
        return;
      }
      let processedTags = extractNip19(description);
      let published_at = Math.floor(new Date().getTime() / 1000);
      let tags = [
        [
          "client",
          "Yakihonne",
          "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
        ],
        ["title", description],
        ["published_at", `${published_at}`],
        ["alt", description],
      ];
      let iMeta = [
        "imeta",
        "url " + `${toUpload}`,
        "duration " + `${file_.duration}`,
        "m " + `${file_.mimeType}`,
      ];
      if (!isImg) iMeta.push("dim " + `${file_.dim}`);
      if (cover) iMeta.push("image  " + `${cover}`);
      if (isSensitive) tags.push(["content-warning", "Sensitive content"]);
      if (processedTags.tags.length > 0) tags = tags.concat(processedTags.tags);
      tags.push(iMeta);
      tags.push(["m", `${file_.mimeType}`]);

      let eventInitEx = await InitEvent(
        isImg ? 20 : file_.kind,
        description,
        tags,
        published_at,
        selectedProfile
      );
      if (!eventInitEx) {
        dispatch(
          setToast({
            type: 2,
            desc: t("Acr4Slu"),
          })
        );
        setIsLoading(false);
        setVideoCoverUploadPerc(0);
        setMainPostUploadPerc(0);
        return;
      }
      dispatch(
        setToPublish({
          eventInitEx,
        })
      );
      let timer = setTimeout(() => {
        if (isImg)
          customHistory(`/image/${nip19.neventEncode({ id: eventInitEx.id })}`);
        if (!isImg)
          customHistory(`/video/${nip19.neventEncode({ id: eventInitEx.id })}`);
        setIsLoading(false);
        clearTimeout(timer);
        exit();
      }, 1000);
    } catch (err) {
      console.log(err);
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        })
      );
      setIsLoading(false);
      setVideoCoverUploadPerc(0);
      setMainPostUploadPerc(0);
    }
  };

  return (
    <div
      className="fixed-container box-pad-h fx-centered"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="fx-centered fx-start-h fx-strt-v sc-s bg-sp fx-stretch fx-wrap slide-up"
        style={{
          width: file ? "min(100%,1000px)" : "min(100%,500px)",
          maxHeight: "85vh",
          overflowY: "scroll",
          position: "relative",
          transition: "width 0.2s ease-in-out",
          gap: 0,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <div style={{ flex: "1 1 300px" }} className=" box-pad-h box-pad-v">
          <div className="box-marg-s fx-centered fx-col">
            <h4>{t("AGDG0c8")}</h4>
            <p className="p-centered gray-c">{t("Al5cCvt")}</p>
          </div>
          {!file && <MediaUploadArea setFile={handlePickFile} />}
          {isImg && file && (
            <ImageComp fileLocalUrl={fileLocalUrl} filter={filter} />
          )}
          {!isImg && file && (
            <VideoComp
              fileLocalUrl={fileLocalUrl}
              range={range}
              setRange={setRange}
            />
          )}
        </div>
        {file && (
          <div
            className="x-scattered fx-col"
            style={{
              flex: "1 1 300px",
              borderLeft: "1px solid var(--dim-gray)",
              opacity: isLoading ? 0.7 : 1,
              pointerEvents: isLoading ? "none" : "",
              cursor: isLoading ? "progress" : "default",
              transition: ".2s ease-in-out",
            }}
          >
            <div
              className="box-pad-h box-pad-v fit-container fx-centered fx-col fx-start-v fx-start-h"
              style={{
                minHeight: "calc(100% - 90px)",
                maxHeight: "60vh",
                overflow: "scroll",
              }}
            >
              <MediaPostData
                description={description}
                setDescription={setDescription}
                isSensitive={isSensitive}
                setSensitive={setSensitive}
                setSelectedProfile={setSelectedProfile}
              />
              {isImg && (
                <ImageFilter
                  img={fileLocalUrl}
                  selectedFilter={filter}
                  setSelectedFilter={setFilter}
                />
              )}
              {!isImg && (
                <VideoEditor
                  fileLocalUrl={fileLocalUrl}
                  file={file}
                  range={range}
                  setRange={setRange}
                  setVideoCover={setVideoCover}
                />
              )}
            </div>
            <div
              className="fit-container fx-centered fx-start-h fx-start-v fx-col"
              style={{ gap: 0 }}
            >
              <LoadingState
                videoCoverUploadPerc={videoCoverUploadPerc}
                mainPostUploadPerc={mainPostUploadPerc}
                isImg={isImg}
              />
              <div className="fit-container fx-centered box-pad-h-m box-pad-v-m">
                <button
                  className="btn btn-normal btn-gray"
                  onClick={clearWorkspace}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingDots />
                  ) : (
                    <div className="arrow" style={{ rotate: "90deg" }}></div>
                  )}
                </button>
                <button
                  className={`btn btn-normal btn-full ${
                    !isPublishingEnabled ? "btn-disabled" : ""
                  }`}
                  onClick={publishPost}
                  disabled={isLoading || !isPublishingEnabled}
                >
                  {isLoading ? <LoadingDots /> : "Publish"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const LoadingState = ({ videoCoverUploadPerc, mainPostUploadPerc, isImg }) => {
  const { t } = useTranslation();
  if (videoCoverUploadPerc < 100 && mainPostUploadPerc < 100) return null;
  return (
    <div className="fit-container fx-centered fx-start-h fx-start-v box-pad-h-m">
      {videoCoverUploadPerc > 0 && (
        <div
          className="fx-centered fx-col fx-start-h fx-start-v"
          style={{ gap: "3px", width: "50%" }}
        >
          {videoCoverUploadPerc < 100 && (
            <p className="orange-c p-italic p-medium">{t("AZDKx9Y")}</p>
          )}
          {videoCoverUploadPerc === 100 && (
            <p className="green-c p-medium">{t("AnTtxm5")}</p>
          )}
          <div
            style={{
              width: `${videoCoverUploadPerc}%`,
              height: "3px",
              backgroundColor:
                videoCoverUploadPerc < 100
                  ? "var(--orange-main)"
                  : "var(--green-main)",
              borderRadius: "12px",
              transition: "width 0.2s ease-in-out",
            }}
          ></div>
        </div>
      )}
      {mainPostUploadPerc > 0 && (
        <div
          className="fx-centered fx-col fx-start-h fx-start-v"
          style={{ gap: "3px", width: isImg ? "100%" : "50%" }}
        >
          {!isImg && mainPostUploadPerc < 100 && (
            <p className="orange-c p-italic p-medium">{t("AssZyMD")}</p>
          )}
          {!isImg && mainPostUploadPerc === 100 && (
            <p className="green-c p-medium">{t("AwQZyHt")}</p>
          )}
          <div
            style={{
              width: `${mainPostUploadPerc}%`,
              height: "3px",
              backgroundColor:
                mainPostUploadPerc < 100
                  ? "var(--orange-main)"
                  : "var(--green-main)",
              borderRadius: "12px",
              transition: "width 0.2s ease-in-out",
            }}
          ></div>
        </div>
      )}
    </div>
  );
};
