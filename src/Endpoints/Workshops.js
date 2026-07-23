import axiosInstance from "@/Helpers/HTTP_Client";

export const getWorkshop = async (id) => {
  const { data } = await axiosInstance.get(`/api/v1/workshops/${id}`);
  return data;
};

export const registerToWorkshop = async (id) => {
  const { data } = await axiosInstance.post(`/api/v1/workshops/${id}/register`);
  return data;
};
