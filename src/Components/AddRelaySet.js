import { nanoid } from "nanoid";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import UploadFile from "./UploadFile";
import RelayItem from "./RelaysComponents/RelayItem";
import RelaysPicker from "./RelaysPicker";
import { setToPublish } from "@/Store/Slides/Publishers";
import { InitEvent } from "@/Helpers/Controlers";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export default function AddRelaySet({ exit, toEdit, allRelays }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const [title, setTitle] = useState(toEdit ? toEdit.title : "");
  const [image, setImage] = useState(toEdit ? toEdit.image : "");
  const [description, setDescription] = useState(
    toEdit ? toEdit.description : ""
  );
  const [relays, setRelays] = useState(toEdit ? toEdit.relays : []);
  const d = toEdit ? toEdit.d : nanoid();

  const removeRelay = (index) => {
    setRelays((prev) => prev.filter((_, _index) => _index !== index));
  };
  const addRelay = (relay) => {
    setRelays((prev) => [relay, ...prev]);
  };

  const update = async () => {
    let event = {
      kind: 30002,
      content: "",
      tags: [
        ["d", d],
        ["title", title],
        ["description", description],
        ["image", image],
        ...relays.map((_) => ["relay", _]),
      ],
    };
    let aTag = `30002:${userKeys.pub}:${d}`
    let eventInitEx = await InitEvent(
      event.kind,
      event.content,
      event.tags,
      undefined
    );
    if (!eventInitEx) {
      return;
    }
    dispatch(
      setToPublish({
        eventInitEx,
        allRelays: [],
      })
    );
    exit(aTag);
  };

  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      style={{ zIndex: 301 }}
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="sc-s bg-sp slide-up box-pad-h box-pad-v fx-centered fx-col"
        style={{
          position: "relative",
          width: "min(500px, 100%)",
          overflow: "visible",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4>{!toEdit ? t("AZSQyog") : t("AQBa7Rn")}</h4>
        <div className="fx-centered fx-start-h fit-container">
          <div
            className="bg-img cover-bg"
            style={{
              backgroundImage: `url(${image})`,
              borderRadius: "var(--border-r-50)",
              backgroundColor: "var(--dim-gray)",
              minWidth: "60px",
              aspectRatio: "1/1",
            }}
          ></div>
          <div className="fit-container">
            <p className="gray-c p-medium">Cover</p>
            <div className="fit-container fx-scattered">
              <input
                className="if ifs-full"
                type="text"
                placeholder={t("ApHMzMe")}
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <UploadFile round={true} setImageURL={setImage} />
            </div>
          </div>
        </div>
        <div className="fit-container fx-scattered fx-col fx-start-h fx-start-v">
          <p className="gray-c p-medium">title</p>
          <input
            type="text"
            className="if ifs-full"
            placeholder={t("AqTI7Iu")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="gray-c p-medium">Description</p>
          <input
            className="if ifs-full"
            type="text"
            placeholder={t("AM6TPts")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="fit-container fx-scattered fx-col fx-start-h fx-start-v">
          <p className="gray-c p-medium">Relays</p>
          <RelaysPicker
            allRelays={allRelays}
            addRelay={addRelay}
            excludedRelays={relays}
            showMessage={false}
          />
          <div
            className="fx-centered fx-col fx-start-h fx-start-v fit-container"
            style={{ maxHeight: "30vh", overflow: "scroll" }}
          >
            {relays.map((_, index) => {
              return (
                <RelayItem
                  key={index}
                  index={index}
                  item={{ id: _ }}
                  removeRelay={removeRelay}
                />
              );
            })}
          </div>
          {relays.length === 0 && (
            <div
              className="fit-container fx-centered"
              style={{ height: "120px" }}
            >
              <div className="fx-centered fx-col box-pad-h box-pad-v">
                <p>{t("AcRP9Vs")}</p>
                <p className="gray-c p-centered box-pad-h">{t("AV1iUL2")}</p>
              </div>
            </div>
          )}
        </div>
        <button className="btn btn-normal btn-full" onClick={update}>
          {t("A8alhKV")}
        </button>
      </div>
    </div>
  );
}
