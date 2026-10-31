import { baseApi } from "@/redux/api/baseApi";
import { TResponse } from "@/types";

export interface ISettings {
  _id: string;
  service_fee: number;
  createdAt?: string;
  updatedAt?: string;
}

const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<TResponse<ISettings>, void>({
      query: () => ({
        url: "/settings",
        method: "GET",
      }),
      providesTags: ["settings"],
    }),
    updateSettings: builder.mutation<
      TResponse<ISettings>,
      Pick<ISettings, "service_fee">
    >({
      query: (data) => ({
        url: "/settings",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["settings"],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
