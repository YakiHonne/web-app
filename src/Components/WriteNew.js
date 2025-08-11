import React, { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import LoginSignup from "@/Components/LoginSignup";

export default function WriteNew({ exit }) {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [redirectLinks, setRedirectLinks] = useState(false);
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
        />
      )}

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

const RedictingLinks = ({ exit, internalExit }) => {
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
        className="sc-s-18 box-pad-h-m box-pad-v fx-centered fx-col bg-sp"
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
        <h4 className="box-marg-s">{t("AfTMpSr")}</h4>
        <div className="fx-centered fx-wrap" onClick={exit}>
          <Link
            href="/dashboard"
            state={{ tabNumber: 1, filter: "notes", init: true }}
            className={`pointer fit-container fx-centered fx-col box-pad-h-s box-pad-v-s option sc-s-18`}
            style={{
              width: "48%",
              padding: "2rem",
              backgroundColor: "transparent",
            }}
          >
            <div
              className="note-plus-24"
              style={{ width: "32px", height: "32px" }}
            ></div>
            <div>{t("Az5ftet")}</div>
          </Link>
          <div
            onClick={() => customHistory("/write-article")}
            className={`pointer fit-container fx-centered fx-col box-pad-h-s box-pad-v-s option sc-s-18`}
            style={{
              width: "48%",
              padding: "2rem",
              backgroundColor: "transparent",
            }}
          >
            <div
              className="posts-plus-24"
              style={{ width: "32px", height: "32px" }}
            ></div>
            <div>{t("AyYkCrS")}</div>
          </div>
          {/* 
          <Link
            href="/dashboard"
            state={{ tabNumber: 1, filter: "curations", init: true }}
            className={`pointer fit-container fx-centered fx-col box-pad-h-s box-pad-v-s option sc-s-18`}
            style={{
              width: "48%",
              padding: "2rem",
              backgroundColor: "transparent",
            }}
          >
            <div
              className="curation-plus-24"
              style={{ width: "32px", height: "32px" }}
            ></div>
            <div>{t("Ac6UnVb")}</div>
          </Link> */}

          <Link
            href={"/smart-widget-builder"}
            className={`pointer fit-container fx-centered fx-col box-pad-h-s box-pad-v-s option sc-s-18`}
            style={{
              padding: "2rem",
              backgroundColor: "transparent",
            }}
          >
            <div
              className="smart-widget-add-24"
              style={{ width: "32px", height: "32px" }}
            ></div>
            <div style={{ width: "max-content" }}>{t("AkvXmyz")}</div>
          </Link>
          {/* <Link
            href="/dashboard"
            state={{ tabNumber: 1, filter: "videos", init: true }}
            className={`pointer fit-container fx-centered fx-col box-pad-h-s box-pad-v-s option sc-s-18`}
            style={{
              width: "48%",
              padding: "2rem",
              backgroundColor: "transparent",
            }}
          >
            <div
              className="play-plus-24"
              style={{ width: "32px", height: "32px" }}
            ></div>
            <div>{t("AVdmifm")}</div>
          </Link>
          <Link
            href="/dashboard"
            state={{
              tabNumber: 1,
              filter: "notes",
              init: true,
              triggerCP: true,
            }}
            className={`pointer fit-container fx-centered fx-col box-pad-h-s box-pad-v-s option sc-s-18`}
            style={{
              width: "48%",
              padding: "2rem",
              backgroundColor: "transparent",
            }}
          >
            <div
              className="polls-24"
              style={{ width: "32px", height: "32px" }}
            ></div>
            <div>{t("A91LHJy")}</div>
          </Link> */}
        </div>
      </div>
    </div>
  );
};
