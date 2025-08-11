import React from "react";
import { useTranslation } from "react-i18next";
import { timeAgo } from "@/Helpers/Encryptions";

export default function Date_({ toConvert }) {
  const { t } = useTranslation();
  const date = timeAgo(toConvert, t);
  return <>{date}</>;
}
