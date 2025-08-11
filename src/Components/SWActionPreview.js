import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import { getUser, InitEvent } from "@/Helpers/Controlers";
import { useTranslation } from "react-i18next";
import UserProfilePic from "@/Components/UserProfilePic";
import axios from "axios";
import { savedToolsIdentifier } from "@/Content/Extras";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";

export default function SWActionPreview({
  metadata,
  setSelectSW,
  cbButton,
  remove = false,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const userSavedTools = useSelector((state) => state.userSavedTools);
  const [author, setAuthor] = useState(getEmptyuserMetadata(""));
  const isAdded = useMemo(() => {
    return userSavedTools.includes(metadata.aTag);
  }, [userSavedTools]);

  useEffect(() => {
    const fetchData = async () => {
      let appPubkey = metadata.pubkey;
      try {
        let swmdt = await axios.get(
          metadata.buttons[0].url + "/.well-known/widget.json"
        );
        appPubkey = swmdt?.data?.pubkey || metadata.pubkey;
      } catch (err) {
        console.log(err);
      }
      const data = getUser(appPubkey);
      if (data) setAuthor(data);
    };
    fetchData();
  }, [nostrAuthors]);

  const handleActionTools = async () => {
    try {
      let event = {
        kind: 30003,
        tags: [
          [
            "client",
            "Yakihonne",
            "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
          ],
          ["d", savedToolsIdentifier],
          ...(!isAdded
            ? [["a", metadata.aTag], ...userSavedTools.map((_) => ["a", _])]
            : [
                ...userSavedTools
                  .filter((_) => _ !== metadata.aTag)
                  .map((_) => ["a", _]),
              ]),
        ],
      };

      let eventInitEx = await InitEvent(event.kind, "", event.tags);
      if (!eventInitEx) return;
      dispatch(
        setToPublish({
          eventInitEx,
          allRelays: [],
        })
      );
    } catch (err) {
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        })
      );
    }
  };

  return (
    <div
      className="fit-container fx-scattered sc-s-18 box-pad-h-s box-pad-v-s bg-sp pointer"
      onClick={(e) => {
        e.stopPropagation();
        setSelectSW({ ...metadata, author });
      }}
    >
      <div className="fx-centered">
        <div
          className="sc-s-18 bg-img cover-bg"
          style={{
            backgroundImage:
              metadata.type === "basic"
                ? `url(${metadata.image})`
                : `url(${metadata.icon})`,
            minWidth: "40px",
            aspectRatio: "1/1",
          }}
        ></div>
        <div>
          <p className="p-one-line p-bold p-maj">{metadata.title || "N/A"}</p>
          <div className="fx-centered fx-start-h">
            <UserProfilePic
              user_id={metadata.pubkey}
              img={author.picture}
              size={16}
            />
            <p className="gray-c p-one-line p-medium">
              {t("AsXpL4b", { name: author.display_name || author.name })}
            </p>
          </div>
        </div>
      </div>
      {cbButton && (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {metadata.type !== "basic" && !isAdded && (
            <button
              className="btn btn-small btn-normal"
              onClick={(e) => {
                e.stopPropagation();
                handleActionTools(metadata);
              }}
            >
              {t("ARWeWgJ")}
            </button>
          )}
          {metadata.type !== "basic" && isAdded && !remove && (
            <button
              className="btn btn-small btn-gray"
              onClick={(e) => {
                e.stopPropagation();
                setSelectSW({ ...metadata, author });
              }}
            >
              {t("AYO6i7Y")}
            </button>
          )}
          {metadata.type !== "basic" && isAdded && remove && (
            <button
              className="btn btn-small btn-gst"
              onClick={(e) => {
                e.stopPropagation();
                handleActionTools(metadata);
              }}
            >
              {t("AzkTxuy")}
            </button>
          )}
          {metadata.type === "basic" && (
            <button
              className="btn btn-small btn-gray"
              onClick={(e) => {
                e.stopPropagation();
                cbButton(metadata);
              }}
            >
              {t("AYO6i7Y")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
