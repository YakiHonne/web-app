import React, { useState } from "react";
import RatingPreview from "./RatingPreview";
import { useTranslation } from "react-i18next";
import { InitEvent } from "@/Helpers/Controlers";
import LoadingDots from "../LoadingDots";
import { useDispatch } from "react-redux";
import { setToPublish } from "@/Store/Slides/Publishers";

export default function SubmitReview({ exit, relay, handleSubmittedReview }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [rating, setRating] = useState(1);
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitReview = async () => {
    setIsLoading(true);
    let event = {
      kind: 31987,
      content: review,
      tags: [
        ["d", relay],
        ["rating", (rating * 0.2).toFixed(1)],
      ],
    };
    const eventInitEx = await InitEvent(event.kind, event.content, event.tags);
    if (!eventInitEx) {
      setIsLoading(false);
      return;
    }
    dispatch(
      setToPublish({
        eventInitEx,
      }),
    );
    handleSubmittedReview({ review: eventInitEx });
    setIsLoading(false);
  };

  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="sc-s bg-sp box-pad-h box-pad-v fx-centered fx-col"
        style={{ width: "min(100%,500px)", position: "relative" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close">
          <div onClick={exit}></div>
        </div>
        <h4>{t("AKzczuT")}</h4>
        <textarea
          className="txt-area ifs-full"
          placeholder={t("AKzczuT")}
          value={review}
          onChange={(e) => setReview(e.target.value)}
        ></textarea>
        <div className="fit-container fx-centered box-pad-v-s">
          <RatingPreview
            rating={rating}
            onClick={setRating}
            enableHovering={true}
          />
        </div>
        <button
          className="btn btn-normal btn-full"
          onClick={handleSubmitReview}
          disabled={isLoading}
        >
          {isLoading ? <LoadingDots /> : t("AKzczuT")}
        </button>
      </div>
    </div>
  );
}
