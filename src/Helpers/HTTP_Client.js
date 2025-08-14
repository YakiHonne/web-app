import axios from "axios";

const axiosInstance = axios.create();

axiosInstance.defaults.headers["yakihonne-api-key"] =
  process.env.NEXT_PUBLIC_API_KEY;
export default axiosInstance;
