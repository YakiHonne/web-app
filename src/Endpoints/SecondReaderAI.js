import axiosInstance from "@/Helpers/HTTP_Client";

const throwPlanAwareError = (err, fallback) => {
  const status = err?.response?.status;
  if (status === 403 || status === 429) {
    const planError = new Error(
      err?.response?.data?.message || err?.response?.data?.error || fallback,
    );
    planError.status = status;
    throw planError;
  }
  throw new Error(err?.response?.data?.error || err.message || fallback);
};

export const analyzeFullArticle = async (article, personaId) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/v1/chat/second-reader/full",
      { article, personaId },
    );
    if (!data.success) throw new Error(data.error || "Analysis failed");
    return data.data;
  } catch (err) {
    throwPlanAwareError(err, "Analysis failed");
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
    throwPlanAwareError(err, "Paragraph analysis failed");
  }
};
