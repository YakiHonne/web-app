import React, { useState } from "react";
import LoadingDots from "@/Components/LoadingDots";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";
import { InitEvent } from "@/Helpers/Controlers";

export default function ToDeleteGeneral({
  title,
  description,
  aTag = "",
  eventId,
  refresh,
  cancel,
}) {
  const dispatch = useDispatch();
  const userRelays = useSelector((state) => state.userRelays);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const deleteEvent = async () => {
    try {
      setIsLoading(true);
      const created_at = Math.floor(new Date().getTime() / 1000);
      let relaysToPublish = userRelays;

      let tempEvent = {
        created_at,
        kind: 5,
        content: "This event will be deleted!",
        tags: [["e", eventId]],
      };
      let eventInitEx = await InitEvent(
        tempEvent.kind,
        tempEvent.content,
        tempEvent.tags,
        tempEvent.created_at
      );
      if (!eventInitEx) return;
      dispatch(
        setToPublish({
          eventInitEx: eventInitEx,
          allRelays: relaysToPublish,
          aTag,
        })
      );
      dispatch(setToast({ type: 1, desc: t("Armbzm8") }));
      refresh(eventId);
    } catch (err) {
      console.log(err);
      dispatch(
        setToast({
          type: 2,
          desc: t("AT94ell"),
        })
      );
      setIsLoading(false);
    }
  };

  return (
    <section className="fixed-container fx-centered box-pad-h">
      <section
        className="fx-centered fx-col sc-s-18 bg-sp box-pad-h box-pad-v"
        style={{ width: "450px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="fx-centered box-marg-s"
          style={{
            minWidth: "54px",
            minHeight: "54px",
            borderRadius: "var(--border-r-50)",
            backgroundColor: "var(--red-main)",
          }}
        >
          <div className="warning"></div>
        </div>
        {title && (
          <h3 className="p-centered" style={{ wordBreak: "break-word" }}>
            {t("A59GAeQ", {
              item: title.substring(0, 20) + (title.length > 20 ? "..." : ""),
            })}
          </h3>
        )}
        {!title && (
          <h3 className="p-centered" style={{ wordBreak: "break-word" }}>
            {t("AQ9Wcw7")}
          </h3>
        )}
        <p className="p-centered gray-c box-pad-v-m">{description || t("A2QosxI")}</p>
        <div className="fx-centered fit-container">
          <button
            className="fx btn btn-gst-red"
            onClick={deleteEvent}
            disabled={isLoading}
          >
            {isLoading ? <LoadingDots /> : t("Almq94P")}
          </button>
          <button className="fx btn btn-red" onClick={cancel}>
            {isLoading ? <LoadingDots /> : t("AB4BSCe")}
          </button>
        </div>
      </section>
    </section>
  );
}
