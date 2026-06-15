import axiosInstance from "@/Helpers/HTTP_Client";

export const analyzeEnergyMap = async (article) => {
  try {
    const { data } = await axiosInstance.post("/api/v1/chat/energy-mapper", {
      article,
    });
    if (!data.success) throw new Error(data.error || "Energy mapping failed");
    return data.data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 403 || status === 429) {
      const planError = new Error(
        err?.response?.data?.message || err?.response?.data?.error || "Energy mapping failed",
      );
      planError.status = status;
      throw planError;
    }
    throw new Error(err?.response?.data?.error || err.message || "Energy mapping failed");
  }
};
