import { baseApi } from "@/redux/api/baseApi";
import type { IncomeSource } from "@/lib/income-source";
import { TResponse } from "@/types";

export type IncomeSourcePayload = {
  value: string;
  title: { en: string; bn: string };
  required_files: string[];
  order?: number;
  isActive: boolean;
};

const incomeSourceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllIncomeSources: builder.query<TResponse<IncomeSource[]>, void>({
      query: () => ({
        url: "/income-sources",
        method: "GET",
      }),
      providesTags: ["incomeSources"],
    }),
    getAllIncomeSourcesAdmin: builder.query<TResponse<IncomeSource[]>, void>({
      query: () => ({
        url: "/income-sources/admin",
        method: "GET",
      }),
      providesTags: ["incomeSources"],
    }),
    createIncomeSource: builder.mutation<
      TResponse<IncomeSource>,
      Partial<IncomeSourcePayload>
    >({
      query: (data) => ({
        url: "/income-sources/admin",
        method: "POST",
        data,
      }),
      invalidatesTags: ["incomeSources"],
    }),
    updateIncomeSource: builder.mutation<
      TResponse<IncomeSource>,
      { id: string; data: Partial<IncomeSourcePayload> }
    >({
      query: ({ id, data }) => ({
        url: `/income-sources/admin/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["incomeSources"],
    }),
    deleteIncomeSource: builder.mutation<TResponse<IncomeSource>, string>({
      query: (id) => ({
        url: `/income-sources/admin/${id}`,
        method: "DELETE",
      }),
      // Deleting frees the file names it held, so the catalog view can change.
      invalidatesTags: ["incomeSources", "fileNames"],
    }),
  }),
});

export const {
  useGetAllIncomeSourcesQuery,
  useGetAllIncomeSourcesAdminQuery,
  useCreateIncomeSourceMutation,
  useUpdateIncomeSourceMutation,
  useDeleteIncomeSourceMutation,
} = incomeSourceApi;
