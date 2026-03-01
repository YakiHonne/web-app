import React, { useMemo, useState } from "react";
import Select from "./Select";
import { useTranslation } from "react-i18next";
import { setToast } from "@/Store/Slides/Publishers";
import { useDispatch } from "react-redux";

const currentYear = new Date().getFullYear();

const months = [
  { display_name: "January", value: 1 },
  { display_name: "February", value: 2 },
  { display_name: "March", value: 3 },
  { display_name: "April", value: 4 },
  { display_name: "May", value: 5 },
  { display_name: "June", value: 6 },
  { display_name: "July", value: 7 },
  { display_name: "August", value: 8 },
  { display_name: "September", value: 9 },
  { display_name: "October", value: 10 },
  { display_name: "November", value: 11 },
  { display_name: "December", value: 12 },
];

const years = Array.from({ length: 3 }, (_, i) => ({
  display_name: String(currentYear + i),
  value: currentYear + i,
}));

const getDaysForMonth = (month, year) => {
  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => ({
    display_name: String(i + 1),
    value: i + 1,
  }));
};

const hours = Array.from({ length: 12 }, (_, i) => ({
  display_name: String(i + 1),
  value: i + 1,
}));

const minutes = Array.from({ length: 61 }, (_, i) => ({
  display_name: String(i),
  value: i,
}));

const dayTime = [
  { display_name: "AM", value: "am" },
  { display_name: "PM", value: "pm" },
];

export default function DatePicker({
  close,
  onSelect,
  selected,
  remove = true,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const now = selected ? new Date(selected * 1000) : new Date();

  const currentHour24 = now.getHours();
  const currentHour12 = currentHour24 % 12 || 12;
  const currentPeriod = currentHour24 >= 12 ? "pm" : "am";

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedHour, setSelectedHour] = useState(currentHour12);
  const [selectedMinute, setSelectedMinute] = useState(now.getMinutes());
  const [selectedDayPeriod, setSelectedDayPeriod] = useState(currentPeriod);

  const days = useMemo(() => {
    return getDaysForMonth(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const convertTo24h = (hour, period) => {
    if (period === "pm" && hour !== 12) return hour + 12;
    if (period === "am" && hour === 12) return 0;
    return hour;
  };

  const getUnixTimestamp = ({ year, month, day, hour, minute, period }) => {
    const hour24 = convertTo24h(hour, period);

    const date = new Date(year, month - 1, day, hour24, minute, 0, 0);

    return Math.floor(date.getTime() / 1000);
  };

  const isFutureTimestamp = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    return timestamp > now;
  };

  const handleOnSelect = () => {
    const timestamp = getUnixTimestamp({
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay,
      hour: selectedHour,
      minute: selectedMinute,
      period: selectedDayPeriod,
    });

    if (!isFutureTimestamp(timestamp)) {
      dispatch(setToast({ type: 2, desc: t("AByyESy") }));
    } else {
      onSelect(timestamp);
    }
  };

  return (
    <div
      className="fixed-container fx-centered box-pad"
      onClick={(e) => {
        e.stopPropagation();
        close();
      }}
      id="date-picker"
    >
      <div
        className="box-pad-h box-pad-v fx-centered fx-col fx-start-h fx-start-v sc-s bg-sp slide-up"
        style={{ width: "min(100%, 500px)", overflow: "visible" }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="fit-container fx-centered">
          <h4>{t("AzRd5Qy")}</h4>
        </div>
        <p className="gray-c">{t("AsPJI19")}</p>
        <div className="fit-container fx-scattered">
          <Select
            options={months}
            value={selectedMonth}
            setSelectedValue={setSelectedMonth}
            fullWidth={true}
            label={t("AVxOoea")}
          />
          <Select
            options={days}
            value={selectedDay}
            setSelectedValue={setSelectedDay}
            fullWidth={true}
            label={t("AV2ajri")}
          />
          <Select
            options={years}
            value={selectedYear}
            setSelectedValue={setSelectedYear}
            fullWidth={true}
            label={t("Atf0LPo")}
          />
        </div>
        <p className="gray-c">{t("AH37JFz")}</p>
        <div className="fit-container fx-scattered">
          <Select
            options={hours}
            value={selectedHour}
            setSelectedValue={setSelectedHour}
            fullWidth={true}
            label={t("AA8oVIN")}
          />
          <Select
            options={minutes}
            value={selectedMinute}
            setSelectedValue={setSelectedMinute}
            fullWidth={true}
            label={t("AWtyemP")}
          />
          <Select
            options={dayTime}
            value={selectedDayPeriod}
            setSelectedValue={setSelectedDayPeriod}
            fullWidth={true}
            label={t("AQ2Xrtv")}
          />
        </div>
        <div className="fit-container fx-scattered">
          {selected && remove && (
            <button
              className="btn btn-gst-red"
              onClick={() => onSelect(undefined)}
            >
              {t("AzkTxuy")}
            </button>
          )}
          <button className="btn btn-normal btn-full" onClick={handleOnSelect}>
            {t("AISWF5R")}
          </button>
        </div>
      </div>
    </div>
  );
}
