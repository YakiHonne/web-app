import React from "react";
import { timeAgo } from "@/Helpers/Encryptions";
import { compactContent } from "@/Helpers/ClientHelpers";
import OptionsDropdown from "@/Components/OptionsDropdown";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";

export default function DraftCardOthers({
  event,
  setPostToNote,
  handleDelete,
}) {
  const { t } = useTranslation();
  const handleRedirect = (e) => {
    e.stopPropagation();
    if (event.kind === 11) {
      setPostToNote("");
      return;
    }
    if (event.kind === 300331) {
      customHistory("/smart-widget-builder");
    }
  };
  const eventKindsDisplayName = {
    1: t("Az5ftet"),
    11: t("Az5ftet"),
    7: t("Alz0E9Y"),
    6: t("Aai65RJ"),
    30023: t("AyYkCrS"),
    30024: t("AsQyoY0"),
    30004: t("Ac6UnVb"),
    30005: t("Ac6UnVb"),
    34235: t("AVdmifm"),
    20: t("Aa73Zgk"),
    21: t("AVdmifm"),
    22: t("AVdmifm"),
    34236: t("AVdmifm"),
    300331: t("AkvXmyz"),
    30033: t("AkvXmyz"),
  };
  return (
    <div
      className="fit-container fx-scattered sc-s-18 box-pad-h-m box-pad-v-m pointer"
      style={{
        backgroundColor: "transparent",
        gap: "32px",
        overflow: "visible",
        borderColor: "var(--c1)",
      }}
      onClick={handleRedirect}
    >
      <div className="fx-centered fx-start-v">
        <div className="round-icon">
          {event.kind === 11 && <div className="note-24"></div>}
          {event.kind === 300331 && !event.content.image && (
            <div className="smart-widget-24"></div>
          )}

          {event.kind === 300331 && event.content.image && (
            <img
              src={event.content.image}
              className="sc-s fx-centered"
              style={{
                width: "45px",
                height: "45px",
                objectFit: "cover",
              }}
            />
          )}
        </div>

        <div className="fx-centered fx-col fx-start-h fx-start-v">
          <div className="fx-centered">
            <p className="gray-c p-medium">
              {t("AcKscQl", {
                date: event.created_at
                  ? timeAgo(new Date(event.created_at * 1000))
                  : t("AiAJcg1"),
              })}
            </p>
            <div className="sticker sticker-normal sticker-gray-black">
              {eventKindsDisplayName[event.kind]}
            </div>
          </div>
          <p className="p-two-lines">
            {event.kind === 11 && (
              <>{compactContent(event.content, event.pubkey)}</>
            )}
            {event.kind === 300331 && (
              <>
                <span>{t("AkvXmyz")}</span>
              </>
            )}
          </p>
        </div>
      </div>
      <OptionsDropdown
        options={[
          <div
            className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
            onClick={handleRedirect}
          >
            <p>{t("Ai4af1h")}</p>
          </div>,
          handleDelete && (
            <div
              className="pointer fx-centered fx-start-h fit-container box-pad-h-s box-pad-v-s option-no-scale"
              onClick={handleDelete}
            >
              <p className="red-c">{t("Almq94P")}</p>
            </div>
          ),
        ]}
      />
    </div>
  );
}
