import axiosInstance from "@/Helpers/HTTP_Client";

export const askArticleAI = async (message, article) => {
  try {
    const { data } = await axiosInstance.post("/api/v1/chat/articles", {
      message,
      article,
    });
    if (!data.success) throw new Error(data.error || "AI request failed");
    return data.data;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message || "AI request failed");
  }
};
