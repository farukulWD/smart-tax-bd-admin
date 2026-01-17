import { TResponse } from "@/types";
import { baseApi } from "../baseApi";

const taxTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTaxType: builder.mutation<TResponse<any>, any>({
      query: (data) => ({
        url: "/tax-types/create-tax-type",
        method: "POST",
        data,
      }),
      invalidatesTags: ["taxTypes"],
    }),
    getAllTaxTypes: builder.query<TResponse<any>, void>({
      query: () => ({
        url: "/tax-types/get-all-tax-types",
        method: "GET",
      }),
      providesTags: ["taxTypes"],
    }),
    updateTaxType: builder.mutation<TResponse<any>, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/tax-types/update-tax-type/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["taxTypes"],
    }),
    deleteTaxType: builder.mutation<TResponse<any>, string>({
      query: (id) => ({
        url: `/tax-types/delete-tax-type/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["taxTypes"],
    }),
  }),
});

export const {
  useCreateTaxTypeMutation,
  useGetAllTaxTypesQuery,
  useUpdateTaxTypeMutation,
  useDeleteTaxTypeMutation,
} = taxTypeApi;
