import useRelaysReviews from "@/Hooks/useRelaysReviews";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import RatingPreview from "./RatingPreview";
import Slider from "../Slider";
import RelayReviewCard from "./RelayReviewCard";
import SubmitReview from "./SubmitReview";

export default function RelayReviews({ relay }) {
  const { t } = useTranslation();
  const { relayRating, relayReviews, isReviewLoading, handleSubmittedReview } =
    useRelaysReviews({
      relay,
    });
  const [showSubmitReview, setShowSubmitReview] = useState(false);

  if (isReviewLoading && relayReviews.length === 0)
    return (
      <div className="fx-scattered fit-container fx-col">
        <div
          className="skeleton-container fit-container sc-s-18 box-pad-v"
          style={{ border: "none" }}
        ></div>
      </div>
    );
  return (
    <>
      {showSubmitReview && (
        <SubmitReview
          relay={relay}
          exit={() => setShowSubmitReview(false)}
          handleSubmittedReview={(data) => {
            handleSubmittedReview(data);
            setShowSubmitReview(false);
          }}
        />
      )}
      <div
        className="fx-scattered fit-container fx-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fx-scattered fit-container">
          <RatingPreview rating={relayRating} count={relayReviews.length} />
          <button
            className="btn btn-gray btn-small"
            onClick={() => setShowSubmitReview(true)}
          >
            {t("AKzczuT")}{" "}
          </button>
        </div>
        {relayReviews.length === 0 && (
          <div className="fit-container f-centered box-pad-v-m">
            <p className="gray-c">{t("ALWEYa5")}</p>
          </div>
        )}
        {relayReviews.length > 0 && (
          <div className="fit-container box-pad-v-s">
            <Slider
              items={relayReviews.map((review) => (
                <RelayReviewCard key={review.id} review={review} />
              ))}
              slideBy={400}
            />
          </div>
        )}
      </div>
    </>
  );
}
