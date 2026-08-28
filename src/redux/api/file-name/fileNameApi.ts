import { baseApi } from "@/redux/api/baseApi";
import { TResponse } from "@/types";

export interface IFileName {
  _id: string;
  /**
   * Canonical name. It is what the client and app show as an upload slot and
   * what an uploaded file's `type` is matched against, so renaming it orphans
   * files already uploaded under the old name.
   */
  name: string;
  label: { en: string; bn: string };
  isCommon: boolean;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const fileNameApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFileNames: builder.query<TResponse<IFileName[]>, void>({
      query: () => ({
        url: "/file-names",
        method: "GET",
      }),
      providesTags: ["fileNames"],
    }),
    getAllFileNamesAdmin: builder.query<TResponse<IFileName[]>, void>({
      query: () => ({
        url: "/file-names/admin",
        method: "GET",
      }),
      providesTags: ["fileNames"],
    }),
    createFileName: builder.mutation<TResponse<IFileName>, Partial<IFileName>>({
      query: (data) => ({
        url: "/file-names/admin",
        method: "POST",
        data,
      }),
      invalidatesTags: ["fileNames"],
    }),
    updateFileName: builder.mutation<
      TResponse<IFileName>,
      { id: string; data: Partial<IFileName> }
    >({
      query: ({ id, data }) => ({
        url: `/file-names/admin/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["fileNames"],
    }),
    reorderFileNames: builder.mutation<
      TResponse<IFileName[]>,
      { items: { id: string; order: number }[] }
    >({
      query: (data) => ({
        url: "/file-names/admin/reorder",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["fileNames"],
    }),
    deleteFileName: builder.mutation<TResponse<IFileName>, string>({
      query: (id) => ({
        url: `/file-names/admin/${id}`,
        method: "DELETE",
      }),
      // A delete can free a name up for a tax type edit, so refresh both.
      invalidatesTags: ["fileNames", "taxTypes"],
    }),
  }),
});

export const {
  useGetAllFileNamesQuery,
  useGetAllFileNamesAdminQuery,
  useCreateFileNameMutation,
  useUpdateFileNameMutation,
  useReorderFileNamesMutation,
  useDeleteFileNameMutation,
} = fileNameApi;
