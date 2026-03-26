import { TResponse } from "@/types";
import { baseApi } from "../baseApi";
import { IOrder } from "../order/orderApi";
import { IUser } from "../user/userApi";

export interface Ifile {
  _id?: string;
  name: string;
  type: string;
  file: string;
  orderId: string;
  order: IOrder;
  userId: string;
  user: IUser;
  createdAt?: Date;
  updatedAt?: Date;
}

const fileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<TResponse<any>, FormData>({
      query: (data) => ({
        url: "/files/create-file",
        method: "POST",
        data,
      }),
      invalidatesTags: ["files"],
    }),
    getMyFiles: builder.query<TResponse<Ifile[]>, void>({
      query: () => ({
        url: "/files/get-user-files",
        method: "GET",
      }),
      providesTags: ["files"],
    }),
    getAllFiles: builder.query<TResponse<Ifile[]>, void>({
      query: () => ({
        url: "/files/get-all-files",
        method: "GET",
      }),
      providesTags: ["files"],
    }),
    getSingleFile: builder.query<TResponse<Ifile>, string>({
      query: (id) => ({
        url: `/files/get-single-file/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "files", id }],
    }),
    deleteFile: builder.mutation<TResponse<any>, string>({
      query: (id) => ({
        url: `/files/delete-file/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["files"],
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetMyFilesQuery,
  useGetAllFilesQuery,
  useGetSingleFileQuery,
  useDeleteFileMutation,
} = fileApi;
