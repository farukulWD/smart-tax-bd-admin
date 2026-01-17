import { isTokenExpired } from "@/lib/utils";
import axios from "axios";
import Cookies from "js-cookie";
// Axios instance setup
const instance = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
});

instance.defaults.headers["Accept"] = "application/json";

// Separate instance for refreshing tokens
export const refreshInstance = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
});

// Refresh access token
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await refreshInstance.post("/auth/refresh-token");

    const accessToken = response?.data?.data?.accessToken;

    Cookies.set("accessToken", accessToken);

    return accessToken;
  } catch (error) {
    console.log("Error in refreshAccessToken", error);
    return null;
  }
};

instance.interceptors.request.use(async (config) => {
  let accessToken = Cookies.get("accessToken");

  if (accessToken && isTokenExpired(accessToken)) {
    accessToken = (await refreshAccessToken()) || "";
  }

  if (accessToken) {
    config.headers["Authorization"] = accessToken;
  }

  return config;
});
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { instance };
