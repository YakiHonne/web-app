import React, { useEffect, useState } from "react";
import LoadingDots from "@/Components/LoadingDots";
import UserSearchBar from "@/Components/UserSearchBar";
import NProfilePreviewer from "@/Components/NProfilePreviewer";
import UploadFile from "@/Components/UploadFile";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { nanoid } from "nanoid";
import { InitEvent } from "@/Helpers/Controlers";
import { useTranslation } from "react-i18next";

export default function ToPublishVideo({
  videoURL,
  videoTitle,
  videoDesc,
  videoMetadata,
  event,
  exit,
}) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState(event?.tTags || []);
  const [thumbnailPrev, setThumbnailPrev] = useState(event?.image || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(event?.image || "");
  const [tempTag, setTempTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [zapSplit, setZapSplit] = useState(event?.zapSplit ||[]);
  const [zapSplitEnabled, setZapSplitEnabled] = useState(event?.zapSplit?.length > 1 ? true : false);

  useEffect(() => {
    if (userKeys && event?.zapSplit.length === 0) {
      setZapSplit([["zap", userKeys.pub, "", "100"]]);
    }
  }, [userKeys]);

  const handleImageUpload = (file) => {
    if (file && !file.type.includes("image/")) {
      dispatch(
        setToast({
          type: 2,
          desc: t("ANdY72a"),
        })
      );
      return;
    }
    if (file) {
      setThumbnailPrev(URL.createObjectURL(file));
      setThumbnailUrl("");
    }
  };

  const initThumbnail = async () => {
    setThumbnailPrev("");
    setThumbnailUrl("");
  };

  const Submit = async () => {
    try {
      if (!(videoURL && videoTitle)) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AjrOVXL"),
          })
        );
        return;
      }
      setIsLoading(true);
      let tags = [
        ["d", event.d || nanoid()],
        [
          "imeta",
          `url ${videoURL}`,
          `image ${thumbnailUrl}`,
          videoMetadata ? `m ${videoMetadata.type}` : "m video/mp4",
        ],
        ["url", videoURL],
        ["title", videoTitle],
        ["summary", videoDesc],
        ["published_at", event.published_at ? `${event.published_at}` : `${Math.floor(Date.now() / 1000)}`],
        [
          "client",
          "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
        ],
        ["m", videoMetadata ? videoMetadata.type : "video/mp4"],
        ["duration", "0"],
        ["size", videoMetadata ? `${videoMetadata.size}` : "0"],
      ];
      if (zapSplit) tags = [...tags, ...zapSplit];
      for (let cat of selectedCategories) {
        tags.push(["t", cat]);
      }
      tags.push(["thumb", thumbnailUrl]);
      tags.push(["image", thumbnailUrl]);
      tags.push([
        "client",
        "Yakihonne",
        "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
      ]);

      let eventInitEx = await InitEvent(34235, videoDesc, tags);

      if (!eventInitEx) {
        setIsLoading(false);
        return;
      }
      dispatch(
        setToPublish({
          eventInitEx,
          allRelays: [],
        })
      );

      let timeout = setTimeout(() => {
        exit();
        clearTimeout(timeout);
        return;
      }, [1000]);
    } catch (err) {
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        })
      );
      setIsLoading(false);
    }
  };

  const removeCategory = (cat) => {
    let index = selectedCategories.findIndex((item) => item === cat);
    let tempArray = Array.from(selectedCategories);
    tempArray.splice(index, 1);
    setSelectedCategories(tempArray);
  };

  const handleThumbnailValue = (e) => {
    let value = e.target.value;
    setThumbnailUrl(value);
    setThumbnailPrev(value);
  };

  const handleAddZapSplit = (pubkey, action) => {
    if (action === "add") {
      let findPubkey = zapSplit.find((item) => item[1] === pubkey);
      if (!findPubkey)
        setZapSplit((prev) => [...prev, ["zap", pubkey.pubkey, "", "1"]]);
    }
    if (action === "remove") {
      let findPubkeyIndex = zapSplit.findIndex((item) => item[1] === pubkey);
      if (findPubkeyIndex !== -1) {
        let tempZapSplit = Array.from(zapSplit);
        tempZapSplit.splice(findPubkeyIndex, 1);
        setZapSplit(tempZapSplit);
      }
    }
  };

  const handleZapAmount = (amount, pubkey) => {
    let tempAmount = amount ? Math.abs(amount) : 0;
    let findPubkeyIndex = zapSplit.findIndex((item) => item[1] === pubkey);
    if (findPubkeyIndex !== -1) {
      let tempZapSplit = Array.from(zapSplit);
      tempZapSplit[findPubkeyIndex][3] = `${amount}`;
      setZapSplit(tempZapSplit);
    }
  };
  const calculatePercentage = (amount) => {
    let allAmount =
      zapSplit.reduce((total, item) => (total += parseInt(item[3])), 0) || 1;
    return Math.floor((amount * 100) / allAmount);
  };
  return (
    <div className="fit-container box-pad-h-m fx-centered fx-col">
      <div className=" fx-centered fx-start-v fx-stretch fit-container">
        <div className="fx-centered fx-col fit-container">
          <div
            className="fit-container fx-centered fx-col sc-s-18 box-pad-h bg-img cover-bg"
            style={{
              position: "relative",
              height: "200px",
              backgroundImage: `url(${thumbnailPrev})`,
              backgroundColor: "var(--dim-gray)",
            }}
          >
            {thumbnailPrev && (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  position: "absolute",
                  right: "16px",
                  top: "16px",
                  backgroundColor: "var(--dim-gray)",
                  borderRadius: "var(--border-r-50)",
                  zIndex: 10,
                }}
                className="fx-centered pointer"
                onClick={initThumbnail}
              >
                <div className="trash"></div>
              </div>
            )}

            {!thumbnailPrev && (
              <>
                <p className="gray-c p-medium">({t("At5dj7a")})</p>
              </>
            )}
          </div>
          <div className="fit-container fx-centered">
            <input
              type="text"
              className="if ifs-full"
              placeholder={t("AA8XLSe")}
              value={thumbnailUrl}
              onChange={handleThumbnailValue}
              disabled={isLoading}
            />
            <UploadFile
              round={true}
              setFileMetadata={handleImageUpload}
              setImageURL={setThumbnailUrl}
              setIsUploadsLoading={setIsLoading}
            />
          </div>
          <div style={{ position: "relative" }} className="fit-container">
            <form
              className="fit-container fx-scattered"
              onSubmit={(e) => {
                e.preventDefault();
                tempTag.replace(/\s/g, "").length
                  ? setSelectedCategories([
                      ...selectedCategories,
                      tempTag.trim(),
                    ])
                  : dispatch(
                      setToast({
                        type: 3,
                        desc: t("Axk4fkj"),
                      })
                    );
                setTempTag("");
              }}
              style={{ position: "relative" }}
            >
              <input
                type="text"
                className="if ifs-full"
                placeholder={t("AWdcSzG")}
                value={tempTag}
                onChange={(e) => setTempTag(e.target.value)}
                disabled={isLoading}
              />
              {tempTag && (
                <button
                  className="btn btn-normal"
                  style={{ minWidth: "max-content" }}
                  disabled={isLoading}
                >
                  {t("A3yqwwq")}
                </button>
              )}
            </form>
          </div>
          {selectedCategories.length > 0 && (
            <div className="fit-container box-pad-v-m fx-centered fx-col fx-start-h">
              <p className="p-medium gray-c fit-container p-left">
                {t("ANyX947")}
              </p>
              <div className="fit-container  fx-scattered fx-wrap fx-start-h">
                {selectedCategories.map((item, index) => {
                  return (
                    <div
                      key={`${item}-${index}`}
                      className="sticker sticker-gray-c1"
                      style={{ columnGap: "8px" }}
                    >
                      <span>{item}</span>
                      <p
                        className="p-medium pointer"
                        onClick={() => removeCategory(item)}
                      >
                        &#10005;
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <label
        htmlFor="zap-split"
        className="if ifs-full fx-centered fx-start-h"
        style={{
          borderColor: zapSplitEnabled ? "var(--blue-main)" : "",
        }}
      >
        <input
          type="checkbox"
          id="zap-split"
          checked={zapSplitEnabled}
          onChange={() => !isLoading && setZapSplitEnabled(!zapSplitEnabled)}
        />
        <p className={zapSplitEnabled ? "" : "gray-c"}>{t("A07MMRw")}</p>
      </label>
      {zapSplitEnabled && (
        <>
          <UserSearchBar
            full={true}
            onClick={(pubkey) => handleAddZapSplit(pubkey, "add")}
          />
          <div
            className="fit-container fx-wrap fx-centered"
            style={{ maxHeight: "30vh", overflow: "scroll" }}
          >
            {zapSplit.map((item, index) => {
              const percentage = calculatePercentage(item[3]) || 0;
              return (
                <div
                  className="fit-container fx-scattered fx-stretch"
                  key={item[1]}
                >
                  <NProfilePreviewer
                    pubkey={item[1]}
                    margin={false}
                    close={true}
                    onClose={() =>
                      zapSplit.length > 1 &&
                      handleAddZapSplit(item[1], "remove")
                    }
                  />
                  <div
                    style={{ width: "35%" }}
                    className="sc-s-18 fx-centered fx-col fx-start-v"
                  >
                    <div
                      style={{
                        position: "relative",
                      }}
                    >
                      <input
                        type="number"
                        className="if ifs-full if-no-border"
                        placeholder={t("AnnuNdL")}
                        value={item[3]}
                        max={100}
                        style={{ height: "100%" }}
                        onChange={(e) =>
                          handleZapAmount(e.target.value, item[1])
                        }
                      />
                    </div>
                    <hr />
                    <p className="orange-c p-medium box-pad-h-m">
                      {percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="fit-container fx-centered box-marg-s">
        <button
          className="btn btn-gst-red fx"
          disabled={isLoading}
          onClick={exit}
        >
          {isLoading ? <LoadingDots /> : t("AB4BSCe")}
        </button>
        <button
          className="btn fx  btn-normal"
          onClick={() => !isLoading && Submit(30023)}
          disabled={isLoading}
        >
          {isLoading ? <LoadingDots /> : t("As7IjvV")}
        </button>
      </div>
    </div>
  );
}
