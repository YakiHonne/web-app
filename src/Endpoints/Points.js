import axiosInstance from "@/Helpers/HTTP_Client";

export const getPointsConfig = async () => {
  const { data } = await axiosInstance.get("/api/v1/points/config");
  return data;
};

export const getSubscriptionEligibility = async () => {
  const { data } = await axiosInstance.get("/api/v1/points/subscription-eligibility");
  return data;
};

export const redeemSubscriptionWithPoints = async ({ plan }) => {
  const { data } = await axiosInstance.post("/api/v1/points/subscription-redeem", { plan });
  return data;
};

export const publishPaidNoteWithPoints = async () => {
  const { data } = await axiosInstance.post("/api/v1/points/publish-paid-note");
  return data;
};

export const getRedeemCodes = async () => {
  const { data } = await axiosInstance.get("/api/v1/points/codes");
  return data;
};

export const requestRedeemCode = async () => {
  const { data } = await axiosInstance.post("/api/v1/points/codes/request");
  return data;
};

export const redeemCode = async ({ code, lightning_address }) => {
  const { data } = await axiosInstance.post("/api/v1/points/codes/redeem", { code, lightning_address });
  return data;
};
