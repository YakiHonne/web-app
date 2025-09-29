import React, { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import LoginSignup from "@/Components/LoginSignup";
import PostAsNote from "./PostAsNote";

export default function WriteNew({ exit }) {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [redirectLinks, setRedirectLinks] = useState(false);
  const [showPostNote, setShowPostNote] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  return (
    <>
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
      {redirectLinks && (
        <RedictingLinks
          exit={() => {
            setRedirectLinks(false);
            exit();
          }}
          internalExit={() => setRedirectLinks(false)}
          setShowPostNote={() => setShowPostNote(true)}
        />
      )}
      {showPostNote && <PostAsNote exit={() => setShowPostNote(false)} />}
      <button
        className="btn btn-full btn-orange fx-centered "
        style={{ padding: 0 }}
        onClick={() =>
          !(userKeys.ext || userKeys.sec || userKeys.bunker)
            ? setIsLogin(true)
            : setRedirectLinks(true)
        }
      >
        <div className="plus-sign-w"></div>
        <div className="link-label">{t("AAxCaYH")}</div>
      </button>
    </>
  );
}

const RedictingLinks = ({ exit, internalExit, setShowPostNote }) => {
  const { t } = useTranslation();
  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      style={{ zIndex: "1000" }}
      onClick={(e) => {
        e.stopPropagation();
        internalExit();
      }}
    >
      <div
        className="sc-s box-pad-h box-pad-v fx-centered fx-col bg-sp slide-up"
        style={{ width: "min(100%,400px)", position: "relative" }}
      >
        <div
          className="close"
          onClick={(e) => {
            e.stopPropagation();
            internalExit();
          }}
        >
          <div></div>
        </div>
        <h3 className="box-marg-s">{t("AfTMpSr")}</h3>
        <div className="fx-centered fx-wrap" onClick={exit}>
          <div
            // href={{
            //   pathname: "/dashboard",
            //   query: { tabNumber: 1, init: true },
            // }}
            onClick={setShowPostNote}
            // href={() => null}
            className={`pointer fit-container fx-centered fx-col box-pad-h-s box-pad-v-s option sc-s bg-sp`}
            style={{
              width: "48%",
              padding: "2rem",
            }}
          >
            <div
              className="note-plus-24"
              style={{ width: "48px", height: "48px" }}
            ></div>
            <div className="gray-c">{t("Az5ftet")}</div>
          </div>
          <div
            onClick={() => customHistory("/write-article")}
            className={`pointer fit-container fx-centered fx-col box-pad-h-s box-pad-v-s option sc-s bg-sp`}
            style={{
              width: "48%",
              padding: "2rem",
            }}
          >
            <div
              className="posts-plus-24"
              style={{ width: "48px", height: "48px" }}
            ></div>
            <div className="gray-c">{t("AyYkCrS")}</div>
          </div>
          <Link
            href={"/smart-widget-builder"}
            className={`pointer fit-container fx-centered fx-col box-pad-h-s box-pad-v-s option sc-s bg-sp`}
            style={{
              padding: "2rem",
            }}
          >
            <div
              className="smart-widget-add-24"
              style={{ width: "48px", height: "48px" }}
            ></div>
            <div style={{ width: "max-content" }} className="gray-c">
              {t("AkvXmyz")}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
