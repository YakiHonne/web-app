const relaysReviewsCache = new Map();

export function getRelaysReviews({ relay }) {
  let event = relaysReviewsCache.get(relay);
  if (!event) {
    return [];
  }
  return event.reviews;
}

export function setRelaysReviews({ relay, reviews }) {
  relaysReviewsCache.set(relay, { reviews, seen: Date.now() });

  if (relaysReviewsCache.size > 300) {
    const sorted = [...relaysReviewsCache.entries()].sort(
      (a, b) => b[1].seen - a[1].seen,
    );
    const top300 = sorted.slice(0, 20);
    relaysReviewsCache.clear();
    for (const [k, v] of top300) {
      relaysReviewsCache.set(k, v);
    }
  }
}
