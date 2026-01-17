import { axiosBaseQuery } from "@/helpers/axios/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL as string,
  }),
  endpoints: () => ({}),
  tagTypes: ["files", "orders", "users", "taxTypes"],
});
