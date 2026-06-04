import React, { useEffect, useState } from "react";
import LoadingDots from "@/Components/LoadingDots";
import { LoginToAPI } from "@/Helpers/Helpers";
import { useDispatch, useSelector } from "react-redux";
import { initiFirstLoginStats } from "@/Helpers/Controlers";
import { setIsConnectedToYaki } from "@/Store/Slides/YakiChest";
import { setToast } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";
import Overlay from "@/Components/Overlay";

export default function LoginWithAPI({ exit }) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (userKeys && !(userKeys.ext || userKeys.sec || userKeys.bunker)) exit();
  }, [userKeys]);

  const connect = async (e) => {
    try {
      e.stopPropagation();
      setIsLoading(true);

      let data = await LoginToAPI(userKeys.pub, userKeys);
      if (data) {
        localStorage.setItem("connect_yc", `${new Date().getTime()}`);
        if (data.is_new) {
          initiFirstLoginStats(data);
        }
        dispatch(setIsConnectedToYaki(true));
        exit();
      }
      if (!data)
        dispatch(
          setToast({
            type: 2,
            desc: t("AJY8vLC"),
          })
        );
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      dispatch(
        setToast({
          type: 2,
          desc: t("AJY8vLC"),
        })
      );
    }
  };

  return (
    <Overlay exit={exit} width={400}>
      <div
        className="fx-centered fx-col slide-up"
        style={{ padding: "2rem" }}
      >
        <h4>{t("AzVvVt5")}</h4>
        <p className="gray-c p-centered">{t("AbE7B3Z")}</p>
        <div className="chest"></div>
        <button
          className="btn btn-normal btn-full"
          onClick={connect}
          disabled={isLoading}
        >
          {isLoading ? <LoadingDots /> : t("Amdv4GO")}
        </button>
        {!isLoading && (
          <button className="btn btn-text btn-normal" onClick={exit}>
            {t("ATSr8gI")}
          </button>
        )}
      </div>
    </Overlay>
  );
}
