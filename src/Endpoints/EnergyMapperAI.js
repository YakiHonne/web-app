import axiosInstance from "@/Helpers/HTTP_Client";
import { throwPlanAwareError } from "@/Helpers/PlanErrors";

export const analyzeEnergyMap = async (article) => {
  try {
    const { data } = await axiosInstance.post("/api/v1/chat/energy-mapper", {
      article,
    });
    if (!data.success) throw new Error(data.error || "Energy mapping failed");
    return data.data;
  } catch (err) {
    throwPlanAwareError(err, "Energy mapping failed");
  }
};
