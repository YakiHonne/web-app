import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import UploadFile from "@/Components/UploadFile";
import UserSearchBar from "@/Components/UserSearchBar";
import NProfilePreviewer from "@/Components/NProfilePreviewer";
import { nanoid } from "nanoid";
import { useDispatch } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { InitEvent } from "@/Helpers/Controlers";

export default function AddPack({ exit, toEdit, kind }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [title, setTitle] = useState(toEdit ? toEdit.title : "");
  const [description, setDescription] = useState(
    toEdit ? toEdit.description : "",
  );
  const [image, setImage] = useState(toEdit ? toEdit.image : "");
  const [users, setUsers] = useState(toEdit ? toEdit.pTags : []);
  const update = async () => {
    if (title.length < 5) {
      dispatch(
        setToast({
          type: 2,
          desc: t("A28NHsZ"),
        }),
      );
      return;
    }
    if (users.length < 1) {
      dispatch(
        setToast({
          type: 2,
          desc: t("AYx8xcq"),
        }),
      );
      return;
    }
    let dTag = toEdit?.d ? toEdit.d : nanoid();

    let tags = [
      ["d", dTag],
      ["image", image],
      ["title", title],
      ["description", description],
      ...users.map((_) => ["p", _]),
    ];
    let event = {
      kind,
      content: "",
      tags: tags,
    };

    let eventInitEx = await InitEvent(
      event.kind,
      event.content,
      event.tags,
      undefined,
    );
    if (!eventInitEx) {
      return;
    }
    dispatch(
      setToPublish({
        eventInitEx,
        allRelays: [],
      }),
    );
    exit();
  };
  return (
    <div className="fixed-container fx-centered box-pad-h">
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
        <h4>{!toEdit?.d ? t("ABk34pX") : t("AOL2rQO")}</h4>
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
          <p className="gray-c p-medium">{t("AZFNSvo")}</p>
          <UserSearchBar
            onClick={(pubkey) =>
              setUsers((prev) => [...new Set([pubkey, ...prev])])
            }
            full={true}
          />
          <div
            className="fx-centered fx-col fx-start-h fx-start-v fit-container"
            style={{ maxHeight: "30vh", overflow: "scroll" }}
          >
            {users.map((_) => {
              return (
                <div className="fit-container fx-stretch">
                  <NProfilePreviewer
                    key={_}
                    pubkey={_}
                    margin={false}
                    close={true}
                    onClose={() =>
                      setUsers((prev) => prev.filter((pubkey) => pubkey !== _))
                    }
                  />
                </div>
              );
            })}
          </div>
          {users.length === 0 && (
            <div
              className="fit-container fx-centered"
              style={{ height: "120px" }}
            >
              <div className="fx-centered fx-col box-pad-h box-pad-v">
                <p>{t("ADVKjeK")}</p>
                <p className="gray-c p-centered box-pad-h">{t("A8Rf2Pa")}</p>
              </div>
            </div>
          )}
        </div>
        <button className="btn btn-normal btn-full" onClick={update}>
          {toEdit?.d ? t("A8alhKV") : t("ARWeWgJ")}
        </button>
      </div>
    </div>
  );
}
