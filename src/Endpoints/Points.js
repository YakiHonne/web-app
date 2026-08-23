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

export const publishPaidNoteWithPoints = async ({ note_id }) => {
  const { data } = await axiosInstance.post("/api/v1/points/publish-paid-note", { note_id });
  return data;
};

export const getPaidNoteStatus = async ({ note_id }) => {
  const { data } = await axiosInstance.get(`/api/v1/paid-notes/status/${note_id}`);
  return data;
};

export const waitForPaidNote = (note_id) => {
  return new Promise((resolve) => {
    const source = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/paid-notes/payment-stream/${note_id}`,
      { withCredentials: true },
    );

    let timeout;

    const finish = (isPaid) => {
      clearTimeout(timeout);
      source.close();
      resolve(isPaid);
    };

    timeout = setTimeout(() => finish(false), 35000);

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.status === "paid") finish(true);
        if (parsed.status === "unpaid") finish(false);
      } catch (err) {
        finish(false);
      }
    };

    source.onerror = () => finish(false);
  });
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
