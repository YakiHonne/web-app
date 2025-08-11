import React, { useMemo } from "react";
import Date_ from "@/Components/Date_";
import { useTranslation } from "react-i18next";

export default function DynamicIndicator({ item }) {
  const { t } = useTranslation();
  const getDynamicIndicator = () => {
    let dynElem = "";
    if (item.kind === 30023)
      dynElem = t("ASlFfRX", {
        min: Math.floor(item.content.split(" ").length / 200) || 1,
      });
    if (item.kind === 30004)
      dynElem = t("AkamgHX", { count: item.items.length });
    if (item.kind === 30005)
      dynElem = t("APXDxmq", { count: item.items.length });
    if (item.kind === 34235) dynElem = t("A8Ewal4");
    return (
      <p className="gray-c p-medium">
        <Date_ toConvert={new Date(item.created_at * 1000)} /> &#x2022;{"  "}
        <span className="orange-c">{dynElem}</span>
      </p>
    );
  };
  let dynamicIndicator = useMemo(() => {
    return getDynamicIndicator();
  }, []);
  return <div className="fx-centered fx-start-h ">{dynamicIndicator}</div>;
}
