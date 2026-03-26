import { TResponse } from "@/types";
import { baseApi } from "../baseApi";

export interface INews {
  _id: string;
  title: string;
  description: string;
  attachment?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNewsAdmin: builder.query<TResponse<INews[]>, void>({
      query: () => ({
        url: "/update-news/admin/get-all-news",
        method: "GET",
      }),
      providesTags: ["news"],
    }),
    createNews: builder.mutation<TResponse<INews>, FormData>({
      query: (data) => ({
        url: "/update-news/create-news",
        method: "POST",
        data,
      }),
      invalidatesTags: ["news"],
    }),
    updateNews: builder.mutation<TResponse<INews>, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/update-news/update-news/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["news"],
    }),
    deleteNews: builder.mutation<TResponse<any>, string>({
      query: (id) => ({
        url: `/update-news/delete-news/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["news"],
    }),
  }),
});

export const {
  useGetAllNewsAdminQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} = newsApi;
