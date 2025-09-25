import React, { Fragment, useEffect, useState } from "react";
import { convertDate, encryptEventData } from "@/Helpers/Encryptions";
import LoadingDots from "@/Components/LoadingDots";
import Counter from "@/Components/Counter";
import { redirectToLogin } from "@/Helpers/Helpers";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { InitEvent } from "@/Helpers/Controlers";

export default function UN({
  sealedCauses = [],
  data,
  flashNewsAuthor,
  setTimestamp,
  state = "nmh",
  action = true,
  scaled = false,
}) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userRelays = useSelector((state) => state.userRelays);
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  let findSource = data.tags.find((tag) => tag[0] === "source");
  let source = findSource ? findSource[1] : "";
  let isVoted =
    data?.ratings?.find((rating) => rating.pubkey === userKeys.pub) || false;
  const [vote, setVote] = useState("");
  const [causes, setCauses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerUndo, setTriggerUndo] = useState(false);
  const platformCauses = {
    "+": [
      "Cites high-quality sources",
      "Easy to understand",
      "Directly addresses the post’s claim",
      "Provides important context",
      "Other",
    ],
    "-": [
      "Sources not included or unreliable",
      "Sources do not support note",
      "Incorrect information",
      "Opinion or speculation",
      "Typos or unclear language",
      "Misses key points or irrelevant",
      "Argumentative or biased language",
      "Harassment or abuse",
      "Other",
    ],
  };
  const [revotingPermission, setRevotingPermission] = useState(true);
  useEffect(() => {
    if (!userKeys) setVote("");
  }, [userKeys]);

  useEffect(() => {
    const parseContent = async () => {
      let res = await getNoteTree(
        data.content,
        undefined,
        undefined,
        undefined,
        data.pubkey
      );
      setContent(res);
    };
    parseContent();
  }, [data]);
  const handleYes = () => {
    if (!userKeys) {
      redirectToLogin();
      return;
    }
    if (vote) {
      if (vote === "-") {
        setVote("+");
      }
      if (vote !== "-") {
        setVote("");
      }
      setCauses([]);
    }
    if (!vote) {
      setVote("+");
      setCauses([]);
    }
  };
  const handleNo = () => {
    if (!userKeys) {
      redirectToLogin();
      return;
    }
    if (vote) {
      if (vote === "+") {
        setVote("-");
      }
      if (vote !== "+") {
        setVote("");
      }
      setCauses([]);
    }
    if (!vote) {
      setVote("-");
      setCauses([]);
    }
  };
  const handleCauses = (cause) => {
    let index = causes.findIndex((item) => item === cause);
    if (index === -1) setCauses([...causes, cause]);
    if (index !== -1) {
      let tempCauses = Array.from(causes);
      tempCauses.splice(index, 1);
      setCauses(tempCauses);
    }
  };
  const handlePublishing = async () => {
    try {
      setIsLoading(true);
      let relaysToPublish = userRelays;
      let tags = [];
      let created_at = Math.floor(Date.now() / 1000);

      tags.push(["e", data.id]);
      tags.push(["l", "UNCENSORED NOTE RATING"]);
      tags.push(["yaki_flash_news", encryptEventData(`${created_at}`)]);
      for (let cause of causes) tags.push(["cause", cause]);

      let event = {
        kind: 7,
        content: vote,
        created_at,
        tags,
      };
      event = await InitEvent(
        event.kind,
        event.content,
        event.tags,
        event.created_at
      );
      if (!event) return;
      dispatch(
        setToPublish({
          eventInitEx: event,
          allRelays: relaysToPublish,
        })
      );

      setTimeout(() => {
        setIsLoading(false);
        setVote("");
        setCauses([]);
        setTimestamp(Date.now());
      }, 3000);
    } catch (err) {
      setIsLoading(true);
      console.log(err);
      dispatch(
        setToast({
          type: 2,
          desc: t("AOSllJU"),
        })
      );
    }
  };
  const handleUndo = async () => {
    try {
      setIsLoading(true);
      let relaysToPublish = userRelays;
      let tags = [];
      let created_at = Math.floor(Date.now() / 1000);

      tags.push(["e", isVoted.id]);
      tags.push(["l", "FLASH NEWS", "r"]);
      tags.push(["yaki_flash_news", encryptEventData(`${created_at}`)]);

      let event = {
        kind: 5,
        content: vote,
        created_at,
        tags,
      };
      event = await InitEvent(
        event.kind,
        event.content,
        event.tags,
        event.created_at
      );
      if (!event) return;
      dispatch(
        setToPublish({
          eventInitEx: event,
          allRelays: relaysToPublish,
        })
      );

      setTimeout(() => {
        setIsLoading(false);
        setVote("");
        setCauses([]);
        setTimestamp(Date.now());
        setTriggerUndo(false);
      }, 3000);
    } catch (err) {
      setIsLoading(true);
      console.log(err);
      dispatch(
        setToast({
          type: 2,
          desc: t("AOSllJU"),
        })
      );
    }
  };

  if (state === "new") return null;
  return (
    <>
      <div
        className="fit-container sc-s-18 fx-centered fx-col"
        style={{ rowGap: 0, overflow: "visible" }}
      >
        <div className="fit-container  box-pad-h-m box-pad-v-s">
          <div className="fit-container fx-scattered">
            <div className="fx-centered fit-container fx-start-h">
              {state === "nmh" && (
                <>
                  <div
                    style={{
                      minWidth: "12px",
                      minHeight: "12px",
                      borderRadius: "var(--border-r-50)",
                      backgroundColor: "var(--gray)",
                    }}
                  ></div>
                  <p className="p-bold p-medium gray-c">{t("Ak8B1oL")}</p>
                </>
              )}
              {state === "sealed" && (
                <>
                  <div
                    style={{
                      minWidth: "12px",
                      minHeight: "12px",
                    }}
                    className="checkmark"
                  ></div>
                  <p className="p-bold p-medium green-c">{t("ALbnctt")}</p>
                </>
              )}
              {state === "nh" && (
                <>
                  <div
                    style={{
                      minWidth: "12px",
                      minHeight: "12px",
                      borderRadius: "var(--border-r-50)",
                      backgroundColor: "var(--red-main)",
                    }}
                  ></div>
                  <p className="p-bold p-medium red-c">{t("ALpC6I3")}</p>
                </>
              )}
            </div>
            {state === "nmh" && (
              <div
                className="sticker sticker-small sticker-gray-black"
                style={{ minWidth: "max-content" }}
              >
                {t("AqpIQ2O")}
              </div>
            )}
            {state === "sealed" && (
              <div
                className="sticker sticker-small sticker-green"
                style={{ minWidth: "max-content" }}
              >
                {t("AyBaapX")}
              </div>
            )}
            {state === "nh" && (
              <div
                className="sticker sticker-small sticker-red"
                style={{ minWidth: "max-content" }}
              >
                {t("AVuxQjo")}
              </div>
            )}
          </div>
        </div>
        <hr />
        <div
          className="fit-container fx-centered fx-start-v fx-col box-pad-h-m box-pad-v-s"
          style={{ rowGap: "0px" }}
        >
          <div className="fit-container fx-centered fx-start-h">
            <p className="gray-c p-medium">
              {t("Published", {
                date: convertDate(new Date(data.created_at * 1000)),
              })}
            </p>
            {source && (
              <>
                <span>&#x2022;</span>
                <a
                  target={"_blank"}
                  href={source}
                  onClick={(e) => e.stopPropagation()}
                  className="btn-text-gray pointer p-medium"
                >
                  <span>{t("AhkzJxL")}</span>
                </a>
              </>
            )}
          </div>
          <div
            className={`fx-centered fx-start-h fx-wrap ${
              scaled ? "p-medium" : ""
            }`}
            style={{ rowGap: 0, columnGap: "4px" }}
          >
            {content}
          </div>
        </div>
        {state !== "sealed" && action && (
          <>
            <hr />
            <div className="fit-container fx-scattered box-pad-h-m box-pad-v-s">
              {data.pubkey === userKeys.pub && (
                <p className="gray-c p-medium">{t("Aoihw3S")}</p>
              )}
              {flashNewsAuthor === userKeys.pub && (
                <p className="gray-c p-medium">{t("AMn82xo")}</p>
              )}
              {data.pubkey !== userKeys.pub &&
                flashNewsAuthor !== userKeys.pub && (
                  <>
                    {!isVoted && (
                      <>
                        <p className="gray-c">{t("ADFU6zW")}</p>
                        <div className="fx-centered">
                          <div
                            className="round-icon round-icon-tooltip"
                            data-tooltip={t("A9pv8x7")}
                            onClick={handleYes}
                            style={{
                              borderColor: vote === "+" ? "var(--gray)" : "",
                              backgroundColor:
                                vote === "+" ? "var(--dim-gray)" : "",
                            }}
                          >
                            <div className="thumbsup-24"></div>
                          </div>
                          <div
                            className="round-icon round-icon-tooltip"
                            data-tooltip={t("AL2oT3w")}
                            onClick={handleNo}
                            style={{
                              borderColor: vote === "-" ? "var(--gray)" : "",
                              backgroundColor:
                                vote === "-" ? "var(--dim-gray)" : "",
                            }}
                          >
                            <div className="thumbsdown-24"></div>
                          </div>
                        </div>
                      </>
                    )}
                    {isVoted && (
                      <div
                        className="fx-scattered fit-container if pointer"
                        style={{
                          border: "none",
                          backgroundColor: "var(--dim-gray)",
                        }}
                      >
                        <div className="fx-centered">
                          <div
                            className="checkmark"
                            style={{ filter: "grayscale(100%)" }}
                          ></div>
                          <p className="p-medium">
                            {t(isVoted.content === "+" ? "AyfQZnM" : "AEFDTqE")}
                          </p>
                        </div>
                        {!triggerUndo && revotingPermission && (
                          <div>
                            <p
                              className="btn-text p-medium"
                              onClick={() => setTriggerUndo(true)}
                            >
                              {t("Ay2FSU5")}{" "}
                              <span className="orange-c">
                                (
                                <Counter
                                  date={isVoted.created_at}
                                  onClick={() => setRevotingPermission(false)}
                                />
                                )
                              </span>
                            </p>
                          </div>
                        )}
                        {triggerUndo && revotingPermission && (
                          <div className="fx-centered slide-right">
                            <button
                              className="btn btn-small btn-gst-red"
                              disabled={isLoading}
                              onClick={() => setTriggerUndo(false)}
                            >
                              {isLoading ? <LoadingDots /> : t("AB4BSCe")}
                            </button>
                            <button
                              className="btn btn-small btn-normal"
                              disabled={isLoading}
                              onClick={handleUndo}
                            >
                              {isLoading ? <LoadingDots /> : t("Ay2FSU5")}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
            </div>
            {vote && (
              <div className="fit-container fx-centered fx-start-v fx-col box-pad-h-m box-pad-v-s">
                <p className="p-medium gray-c">{t("AFMqxUW")}</p>
                {platformCauses[vote].map((cause) => {
                  return (
                    <label className="fit-container fx-scattered" key={cause}>
                      <p>{cause}</p>
                      <input
                        type="checkbox"
                        onClick={() => handleCauses(cause)}
                      />
                    </label>
                  );
                })}
                <hr />
                <div className="box-pad-v-s">
                  <p className="p-medium gray-c">{t("Az5ftet")}</p>
                  <p className="p-medium orange-c">{t("AuXe5F6")}</p>
                </div>
              </div>
            )}
            {vote && (
              <>
                <hr />
                <div className="fit-container fx-centered box-pad-h-m box-pad-v-s">
                  <button
                    className="btn btn-normal fx"
                    onClick={handlePublishing}
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingDots /> : t("A0hPAcy")}
                  </button>
                </div>
              </>
            )}
          </>
        )}
        {(state === "sealed" || state === "nh") && sealedCauses.length > 0 && (
          <>
            <hr />
            <div className="fit-container fx-centered fx-start-h box-pad-h-m box-pad-v-s">
              <div
                className="msg-bubbles round-icon-tooltip"
                data-tooltip={state === "sealed" ? t("AIjRDx9") : t("Ac6NF3G")}
              ></div>
              <div
                className="fx-centered fx-start-h fx-wrap"
                style={{ columnGap: "8px", rowGap: 0 }}
              >
                {sealedCauses.map((cause, index) => {
                  return (
                    <Fragment key={`${cause}-${index}`}>
                      <p className={scaled ? "p-small" : "p-medium"}>{cause}</p>
                      {index + 1 < sealedCauses.length && <span>&#x2022;</span>}
                    </Fragment>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
