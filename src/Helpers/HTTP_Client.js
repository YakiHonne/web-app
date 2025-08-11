import axios from "axios";

const axiosInstance = axios.create();

axiosInstance.defaults.headers["yakihonne-api-key"] =
  process.env.REACT_APP_API_KEY;
export default axiosInstance;
