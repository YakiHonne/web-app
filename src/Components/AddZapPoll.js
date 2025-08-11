'use client';
import React, { useState } from "react";
import { nip19 } from "nostr-tools";
import LoadingDots from "@/Components/LoadingDots";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";
import { InitEvent } from "@/Helpers/Controlers";

export default function AddZapPoll({ exit, setNevent }) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userRelays = useSelector((state) => state.userRelays);

  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [options, setOptions] = useState([]);
  const [tempOption, setTempOption] = useState("");
  const [minSats, setMinSats] = useState("");
  const [maxSats, setMaxSats] = useState("");
  const [closedAt, setClosedAt] = useState("");
  const [isLoading, setLoading] = useState(false);

  const handleChange = (e) => {
    let value = e.target.value;
    let element = e.target;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;

    setContent(value);
    if (!value || value === "\n") {
      setContent("");
      return;
    }
  };

  const handleAddOption = () => {
    if (!tempOption) return;
    setOptions((prev) => [...prev, tempOption]);
    setTempOption("");
  };
  const handleEditOption = (value, index) => {
    let tempArray = Array.from(options);
    tempArray[index] = value;
    setOptions(tempArray);
  };
  const handleDeleteOption = (index) => {
    let tempArray = Array.from(options);
    tempArray.splice(index, 1);
    setOptions(tempArray);
  };

  const postPoll = async () => {
    let created_at = Math.floor(Date.now() / 1000);
    let closed_at = closedAt
      ? Math.floor(new Date(closedAt).getTime() / 1000)
      : false;
    let tempOptions = options.filter((option) => option);
    let relaysToPublish = userRelays;

    if (!content) {
      dispatch(
        setToast({
          type: 3,
          desc: t("A27e02j"),
        })
      );
      return;
    }
    if (tempOptions.length <= 1) {
      dispatch(
        setToast({
          type: 3,
          desc: t("A8kBPLg"),
        })
      );
      return;
    }
    if (closed_at && closed_at <= created_at) {
      dispatch(
        setToast({
          type: 3,
          desc: t("AGMAEDk"),
        })
      );
      return;
    }
    if (minSats !== "" && maxSats !== "" && minSats > maxSats) {
      dispatch(
        setToast({
          type: 3,
          desc: t("ABcXmEu"),
        })
      );
      return;
    }
    let tags = options.map((option, index) => [
      "poll_option",
      `${index}`,
      option,
    ]);
    tags.push(["p", userKeys.pub]);
    tags.push([
      "client",
      "Yakihonne",
      "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
    ]);

    if (closed_at) tags.push(["closed_at", `${closed_at}`]);
    if (minSats !== "") tags.push(["value_minimum", `${minSats}`]);
    if (maxSats !== "") tags.push(["value_maximum", `${maxSats}`]);
    let tempEvent = {
      created_at,
      kind: 6969,
      content: content,
      tags,
    };
    let eventInitEx = await InitEvent(
      tempEvent.kind,
      tempEvent.content,
      tempEvent.tags,
      tempEvent.created_at
    );
    if(!eventInitEx) return
    dispatch(
      setToPublish({
        eventInitEx: eventInitEx,
        allRelays: relaysToPublish,
      })
    );
    let nEvent = nip19.neventEncode({
      id: tempEvent.id,
      pubkey: userKeys.pub,
    });
    let sub = ndkInstance.subscribe([{ kinds: [6969], ids: [tempEvent.id] }], {
      closeOnEose: true,
      cacheUsage: "CACHE_FIRST",
    });

    sub.on("event", () => {
      dispatch(
        setToast({
          type: 1,
          desc: t("AcX6TcC"),
        })
      );
      setNevent(nEvent);
      sub.stop();
    });
  };
  return (
    <div className="fixed-container box-pad-h fx-centered">
      <div
        className="sc-s-18 box-pad-h-m box-pad-v-m fx-centered fx-col bg-sp"
        style={{
          width: "min(100%, 500px)",
          position: "relative",
          overflow: "visible",
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4 className="box-marg-s">{t("A91LHJy")}</h4>
        <textarea
          className="txt-area fit-container"
          onChange={handleChange}
          value={content}
          placeholder={t("AM6TPts")}
        />
        <input
          type="number"
          className="if ifs-full"
          placeholder={t("AHw7r4k")}
          value={minSats}
          onChange={(e) => {
            setMinSats(parseInt(e.target.value) || "");
          }}
        />
        <input
          type="number"
          className="if ifs-full"
          placeholder={t("AVuHanv")}
          value={maxSats}
          onChange={(e) => setMaxSats(parseInt(e.target.value) || "")}
        />
        <input
          type="datetime-local"
          className="if ifs-full pointer"
          placeholder={t("ATAnXen")}
          value={closedAt}
          min={new Date().toISOString()}
          onChange={(e) => {
            setClosedAt(e.target.value);
          }}
        />
        <div className="fit-container fx-centered fx-col fx-start-v">
          <p className="p-medium gray-c">{t("A5DDopE")}</p>
          {options.map((option, index) => {
            return (
              <div className="fit-container fx-centered" key={index}>
                <input
                  type="text"
                  className="if ifs-full"
                  placeholder="Option"
                  value={option}
                  onChange={(e) => handleEditOption(e.target.value, index)}
                />
                <div
                  className="round-icon round-icon-tooltip"
                  data-tooltip={t("Almq94P")}
                  onClick={() => handleDeleteOption(index)}
                >
                  <div className="trash"></div>
                </div>
              </div>
            );
          })}
          <div className="fit-container fx-scattered">
            <input
              type="text"
              className="if ifs-full"
              placeholder="Add option"
              value={tempOption}
              onChange={(e) => setTempOption(e.target.value)}
            />
            <div
              className={`round-icon round-icon-tooltip ${
                tempOption ? "pointer" : "if-disabled"
              }`}
              data-tooltip={t("AI4ia0I")}
              onClick={handleAddOption}
            >
              <div className="plus-sign" style={{ cursor: "unset" }}></div>
            </div>
          </div>
          <button className="btn btn-normal btn-full" onClick={postPoll}>
            {isLoading ? <LoadingDots /> : t("As7IjvV")}
          </button>
        </div>
      </div>
    </div>
  );
}
