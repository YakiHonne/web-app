import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { LoginToAPI } from "@/Helpers/Helpers";
import { initiFirstLoginStats } from "@/Helpers/Controlers";
import { setIsConnectedToYaki } from "@/Store/Slides/YakiChest";
import { setToast } from "@/Store/Slides/Publishers";

export default function useYakiChestConnect() {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    try {
      setIsConnecting(true);
      let data = await LoginToAPI(userKeys.pub, userKeys);
      if (data) {
        localStorage.setItem("connect_yc", `${new Date().getTime()}`);
        if (data.is_new) {
          initiFirstLoginStats(data);
        }
        dispatch(setIsConnectedToYaki(true));
      } else {
        dispatch(setToast({ type: 2, desc: t("AJY8vLC") }));
      }
    } catch (err) {
      console.log(err);
      dispatch(setToast({ type: 2, desc: t("AJY8vLC") }));
    } finally {
      setIsConnecting(false);
    }
  };

  return { connect, isConnecting };
}
