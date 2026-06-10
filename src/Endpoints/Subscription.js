import axiosInstance from "@/Helpers/HTTP_Client";

export const getSubscriptionStatus = async () => {
  const { data } = await axiosInstance.get("/api/v1/subscription-status");
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

export const getSubscriptionLink = async ({ plan, price_id }) => {
  const { data } = await axiosInstance.post("/api/v1/subscription-link", { plan, price_id, main: true });
  if (data?.url) window.open(data.url);
  return data;
};
