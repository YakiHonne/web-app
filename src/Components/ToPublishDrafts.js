import React, { useState } from "react";
import LoadingDots from "@/Components/LoadingDots";
import { nanoid } from "nanoid";
import { useDispatch } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { InitEvent } from "@/Helpers/Controlers";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

export default function ToPublishDrafts({
  postContent = "",
  postTitle = "",
  edit = false,
  exit,
  warning = false,
  userKeys,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const Submit = async (kind = 30023) => {
    try {
      setIsLoading(true);
      let tags = [
        [
          "client",
          "Yakihonne",
          "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
        ],
        ["published_at", `${Math.floor(Date.now() / 1000)}`],
        ["d", edit || nanoid()],
        ["image", ""],
        ["title", postTitle],
        ["summary", ""],
      ];

      let eventInitEx = await InitEvent(
        kind,
        postContent,
        tags,
        undefined,
        userKeys
      );
      if (!eventInitEx) {
        setIsLoading(false);
        return;
      }
      dispatch(
        setToPublish({
          eventInitEx,
          allRelays: [],
        })
      );
      router.push({
        pathname: "/dashboard",
        query: { tabNumber: 2, filter: "drafts" }
      });
      exit();
      setIsLoading(false);
      return;
    } catch (err) {
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        })
      );
      setIsLoading(false);
    }
  };

  return (
    <section className="fixed-container fx-centered">
      <div
        className="fx-centered fx-col slide-up box-pad-h sc-s-18 box-pad-v bg-sp"
        style={{
          width: "500px",
        }}
      >
        <div className="fx-centered fx-col">
          <h4 className="p-centered">{t("AmcaCBU")}</h4>
          <p className="gray-c box-pad-v-s">{t("A0xeQYk")}</p>
        </div>
        {warning && (
          <div className="sc-s-18 box-pad-v-s box-pad-h-s box-marg-s">
            <p className="orange-c p-medium p-centered">{t("APW25Bv")}</p>
            <p className="gray-c p-medium p-centered">{t("AkcTysw")}</p>
          </div>
        )}
        <div className="fx-centered fit-container">
          <button
            className={`btn btn-full btn-normal`}
            onClick={() => Submit(30024)}
            disabled={isLoading}
          >
            {isLoading ? <LoadingDots /> : t("AjbW7pt")}
          </button>
          <button className="btn btn-gst-red btn-full" onClick={exit}>
            {t("AB4BSCe")}
          </button>
        </div>
      </div>
    </section>
  );
}
