import { getCustomSettings } from "@/Helpers/ClientHelpers";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function useCustomizationSettings() {
  const userKeys = useSelector((state) => state.userKeys);
  const refreshAppSettings = useSelector((state) => state.refreshAppSettings);
  const [customSettings, setCustomSettings] = useState(getCustomSettings());

  useEffect(() => {
    if (userKeys.pub) {
      let userSettings = getCustomSettings();
      
      setCustomSettings(userSettings);
    }
  }, [userKeys, refreshAppSettings]);
  return { ...customSettings };
}
