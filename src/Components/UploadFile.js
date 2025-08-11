import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { FileUpload } from "@/Helpers/Helpers";
import { useTranslation } from "react-i18next";
import ProgressCirc from "@/Components/ProgressCirc";
import { nanoid } from "nanoid";

export default function UploadFile({
  kind = "audio/*,video/*,image/*",
  round = false,
  small = false,
  setImageURL,
  setIsUploadsLoading = () => null,
  setFileMetadata = null,
}) {
  const inputID = nanoid();
  const userKeys = useSelector((state) => state.userKeys);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [pastedImgURL, setPastedImgURL] = useState(false);
  const [pastedImgFile, setPastedImgFile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filesCount, setFilesCount] = useState(1);
  const [currentCount, setCurrentCount] = useState(0);

  const Upload = async (e) => {
    let files = e.target.files;
    let index = 0;
    setFilesCount(files.length);
    let images = [];
    if (!files && (!userKeys.sec || !userKeys.ext || !userKeys.bunker)) {
      dispatch(
        setToast({
          type: 2,
          desc: t("AhWOujw"),
        })
      );
      return;
    }
    for (let file of files) {
      setCurrentCount(index);
      setIsLoading(true);
      setIsUploadsLoading(true);
      let url = await FileUpload(file, userKeys, setProgress);
      if (url) images.push(url);
      if (setFileMetadata) setFileMetadata(file);
      setIsLoading(false);
      setIsUploadsLoading(false);
      setProgress(0);
      index += 1;
    }
    setImageURL(images.join(" "));
  };

  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;

      if (items) {
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();

            const reader = new FileReader();
            reader.onload = (e) => {
              setPastedImgFile(file);
              setPastedImgURL(e.target.result);
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  const handlePastedImage = (action) => {
    if (action) {
      Upload({
        target: {
          files: [pastedImgFile],
        },
      });
      setPastedImgFile(false);
      setPastedImgURL(false);
    }
    if (!action) {
      setPastedImgFile(false);
      setPastedImgURL(false);
    }
  };

  return (
    <>
      {pastedImgURL && (
        <div className="fixed-container fx-centered box-pad-h">
          <div
            className="sc-s-18 bg-sp slide-up"
            style={{ width: "min(100%, 550px)" }}
          >
            <div
              className="bg-img cover-bg fit-container"
              style={{
                aspectRatio: "16/9",
                backgroundImage: `url(${pastedImgURL})`,
              }}
            ></div>
            <div className="box-pad-h-m box-pad-v-m fx-centered">
              <button
                className="btn btn-gst btn-full"
                onClick={() => handlePastedImage(false)}
              >
                {t("AB4BSCe")}
              </button>
              <button
                className="btn btn-normal btn-full"
                onClick={() => handlePastedImage(true)}
              >
                {t("AadiJFs")}
              </button>
            </div>
          </div>
        </div>
      )}
      <label
        htmlFor={inputID}
        className={round ? (small ? "round-icon-small" : "round-icon") : ""}
        style={{
          position: "relative",
          pointerEvents: isLoading ? "none" : "auto",
        }}
      >
        <input
          type="file"
          name={inputID}
          id={inputID}
          multiple={setFileMetadata ? false : true}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            opacity: 0,
            zIndex: -1,
          }}
          accept={kind}
          onChange={Upload}
          disabled={isLoading}
        />
        {isLoading ? (
          small ? (
            // <div style={{ scale: ".6" }}>
            <ProgressCirc
              percentage={progress}
              size={18}
              width={3}
              innerComp={
                filesCount > 1 ? (
                  <span className="p-small gray-c">
                    {currentCount}/{filesCount}
                  </span>
                ) : (
                  <></>
                )
              }
            />
          ) : (
            // {/* <LoadingDots /> */}
            // </div>
            <ProgressCirc
              percentage={progress}
              size={22}
              width={3}
              innerComp={
                filesCount > 1 ? (
                  <span className="p-small gray-c">
                    {currentCount}/{filesCount}
                  </span>
                ) : (
                  <></>
                )
              }
            />
            // <LoadingDots />
          )
        ) : (
          <div className={small ? "image" : "image-24"}></div>
        )}
      </label>
    </>
  );
}
