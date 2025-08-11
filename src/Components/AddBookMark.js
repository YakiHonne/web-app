'use client';
import React, { useState } from "react";
import LoadingDots from "@/Components/LoadingDots";
import { nanoid } from "nanoid";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";

export default function AddBookmark({ bookmark, exit, tags = [] }) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userRelays = useSelector((state) => state.userRelays);

  const { t } = useTranslation();
  const [title, setTitle] = useState(bookmark?.title || "");
  const [description, setDescription] = useState(bookmark?.description || "");
  const [image, setImage] = useState(bookmark?.image || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleDataUpload = () => {
    try {
      setIsLoading(true);
      let tempTags = getTags(title, description, image);
      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 30003,
          content: "",
          tags: tempTags,
          allRelays: userRelays,
        })
      );
      setIsLoading(false);
      exit();
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      setToast({
        type: 2,
        desc: t("Acr4Slu"),
      });
    }
  };

  const getTags = (title, description, image) => {
    let tempTags = structuredClone(tags);
    let checkStatus = false;
    for (let tag of tempTags) {
      if (tag[0] === "d") {
        checkStatus = true;
      }
    }
    if (!checkStatus) {
      tempTags.push([
        "client",
        "Yakihonne",
        "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
      ]);
      tempTags.push(["published_at", `${Math.floor(Date.now() / 1000)}`]);
      tempTags.push(["d", nanoid()]);
      tempTags.push(["title", title]);
      tempTags.push(["description", description]);
      tempTags.push(["image", image]);
      return tempTags;
    }
    for (let i = 0; i < tempTags.length; i++) {
      if (tempTags[i][0] === "title") {
        tempTags[i][1] = title;
      }
      if (tempTags[i][0] === "description") {
        tempTags[i][1] = description;
      }
      if (tempTags[i][0] === "image") {
        tempTags[i][1] = image;
      }
    }

    return tempTags;
  };

  const handleShowRelaysPicker = () => {
    if (!title) {
      setIsLoading(false);
      dispatch(
        setToast({
          type: 3,
          desc: t("AJFeKRU"),
        })
      );
      return;
    }
    handleDataUpload();
  };

  return (
    <section
      className="fixed-container fx-centered box-pad-h"
      style={{ zIndex: "10001" }}
    >
      <section
        className="fx-centered fx-col sc-s-18 bg-sp box-pad-v-m"
        style={{ width: "500px", }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <div className="fit-container fx-centered box-pad-h ">
          <h4>{bookmark ? <>{t("A9nS8Wz")}</> : <>{t("AvADsej")}</>}</h4>
        </div>
        {/* <hr /> */}
        <div className="fit-container fx-centered fx-col">
          <div className="fx-centered fx-wrap fit-container box-pad-h">
            <input
              type="text"
              className="if ifs-full"
              placeholder={t("AqTI7Iu")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              type="text"
              className="if ifs-full"
              placeholder={t("AM6TPts")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ height: "100px", paddingTop: "1rem" }}
            />
          </div>
        </div>
        <div className="fit-container box-pad-h">
          <button
            className="btn btn-normal btn-full"
            onClick={handleShowRelaysPicker}
          >
            {isLoading ? (
              <LoadingDots />
            ) : bookmark ? (
              <>{t("A9nS8Wz")}</>
            ) : (
              <>{t("A984pJy")}</>
            )}
          </button>
        </div>
      </section>
    </section>
  );
}
