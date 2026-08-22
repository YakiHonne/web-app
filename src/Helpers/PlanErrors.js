export const throwPlanAwareError = (err, fallback) => {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (status === 403 || status === 429) {
    const planError = new Error(data?.message || data?.error || fallback);
    planError.status = status;
    planError.reason = data?.reason || null;
    throw planError;
  }

  throw new Error(data?.error || err?.message || fallback);
};
