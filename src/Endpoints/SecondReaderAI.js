import axiosInstance from "@/Helpers/HTTP_Client";

export const analyzeFullArticle = async (article, personaId) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/v1/chat/second-reader/full",
      { article, personaId },
    );
    if (!data.success) throw new Error(data.error || "Analysis failed");
    return data.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.error || err.message || "Analysis failed",
    );
  }
};

export const analyzeParagraph = async (
  paragraph,
  contextBefore,
  contextAfter,
  personaId,
) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/v1/chat/second-reader/paragraph",
      { paragraph, contextBefore, contextAfter, personaId },
    );
    if (!data.success)
      throw new Error(data.error || "Paragraph analysis failed");
    return data.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.error ||
        err.message ||
        "Paragraph analysis failed",
    );
  }
};
