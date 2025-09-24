import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.yakihonne.com",
  headers: {
    "yakihonne-api-key": process.env.NEXT_PUBLIC_API_KEY,
  },
  withCredentials: true,
});

export default axiosInstance;
