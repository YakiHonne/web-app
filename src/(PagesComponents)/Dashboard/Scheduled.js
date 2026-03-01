import LoadingLogo from "@/Components/LoadingLogo";
import useScheduledEvents from "@/Hooks/useScheduledEvents";
import React from "react";
import { useTranslation } from "react-i18next";
import ScheduledEventCard from "./ScheduledEventCard";

export default function Scheduled() {
  const { t } = useTranslation();
  const { scheduledEvents, isScheduledEventsLoading, setRefreshData } =
    useScheduledEvents();

  return (
    <div className="fit-container">
      <div className="fit-container fx-scattered fx-col fx-start-h fx-start-v box-pad-v-m box-pad-h">
        <h4 className="p-caps">{t("Az2KlKc")}</h4>
        {scheduledEvents.map((event) => {
          return (
            <ScheduledEventCard
              job={event}
              key={event.jobId}
              refreshAfterDeletion={() => setRefreshData(Date.now())}
            />
          );
        })}
      </div>
      {!isScheduledEventsLoading && scheduledEvents.length === 0 && (
        <div
          className="fit-container fx-centered fx-col"
          style={{ height: "40vh" }}
        >
          <h4>{t("AsXYlT7")}</h4>
          <p className="gray-c">{t("AcPmGuk")}</p>
        </div>
      )}
      {isScheduledEventsLoading && (
        <div className="fit-container fx-centered" style={{ height: "40vh" }}>
          <div className="fx-centered">
            <LoadingLogo />
          </div>
        </div>
      )}
    </div>
  );
}
