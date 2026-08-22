import axiosInstance from "@/Helpers/HTTP_Client";

export const getSubscriptionStatus = async () => {
  const { data } = await axiosInstance.get("/api/v1/subscription-status");
  return data;
};

export const getUsage = async () => {
  const { data } = await axiosInstance.get("/api/v1/usage");
  return data;
};

export const cancelSubscription = async () => {
  const { data } = await axiosInstance.post("/api/v1/subscription-cancel");
  return data;
};

export const resumeSubscription = async () => {
  const { data } = await axiosInstance.post("/api/v1/subscription-resume");
  return data;
};

export const changeSubscriptionPlan = async ({ new_plan, new_price_id }) => {
  const { data } = await axiosInstance.post("/api/v1/subscription-change", {
    new_plan,
    new_price_id,
  });
  return data;
};

export const cancelPendingChange = async () => {
  const { data } = await axiosInstance.post("/api/v1/subscription-change-cancel");
  return data;
};

export const getSubscriptionLink = async ({ plan, main = true }) => {
  const { data } = await axiosInstance.post("/api/v1/subscription-link", { plan, main });
  if (data?.url) window.open(data.url);
  return data;
};

export const openBillingPortal = async () => {
  const { data } = await axiosInstance.post("/api/v1/billing-portal", { main: true });
  if (data?.url) window.open(data.url);
  return data;
};

export const getSubscriberSubscriptions = async () => {
  const { data } = await axiosInstance.get("/api/v1/subscriber/subscriptions");
  return data;
};

export const getSubscriberBillingPortal = async ({ creator_pubkey, return_url }) => {
  const { data } = await axiosInstance.post("/api/v1/subscriber/billing-portal", {
    creator_pubkey,
    return_url,
  });
  return data;
};

let _plansCache = null;

export const getPlans = async () => {
  if (_plansCache) return _plansCache;
  const { data } = await axiosInstance.get("/api/v1/plans");
  _plansCache = data.plans ?? [];
  return _plansCache;
};

export const clearPlansCache = () => { _plansCache = null; };
