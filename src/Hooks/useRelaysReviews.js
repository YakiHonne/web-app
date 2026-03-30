import { getSubData } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import { getParsedRelayReview } from "@/Helpers/Encryptions";
import {
  getRelaysReviews,
  setRelaysReviews,
} from "@/Helpers/utils/relaysReviewsCache";
import { useEffect, useState } from "react";

export default function useRelaysReviews({ relay }) {
  const [relayReviews, setRelayReviews] = useState([]);
  const [relayRating, setRelayRating] = useState(0);
  const [isReviewLoading, setIsReviewsLoading] = useState(false);

  useEffect(() => {
    setIsReviewsLoading(true);
    let oldEvents = getRelaysReviews({ relay });
    setRelayReviews(oldEvents);
    setRelayRating(getRating({ reviews: oldEvents }));
    getSubData([{ kinds: [31987], "#d": [relay] }])
      .then((data) => {
        let reviews = data.data;
        let parsedEvents = reviews.map((review) =>
          getParsedRelayReview(review),
        );
        setRelayReviews(parsedEvents);
        setRelaysReviews({ relay, reviews: parsedEvents });
        setRelayRating(getRating({ reviews }));
        saveUsers(reviews.pubkeys);
        setIsReviewsLoading(false);
      })
      .catch((err) => {
        setIsReviewsLoading(false);
      });
  }, []);

  const getRating = ({ reviews }) => {
    let ratings = reviews.map((review) => {
      const rating = review.tags.find((tag) => tag[0] === "rating");
      return rating ? parseFloat(rating[1]) : 0;
    });
    return parseFloat(
      ((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 5).toFixed(1),
    );
  };

  const handleSubmittedReview = ({ review }) => {
    let parsedReview = getParsedRelayReview(review);
    let updatedList = [parsedReview, ...relayReviews];
    setRelayReviews(updatedList);
    setRelaysReviews({ relay, reviews: updatedList });
  };

  return {
    relayReviews,
    setRelayReviews,
    relayRating,
    isReviewLoading,
    handleSubmittedReview,
  };
}
