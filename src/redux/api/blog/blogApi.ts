import { baseApi } from "@/redux/api/baseApi";
import { TResponse } from "@/types";

export interface IBlog {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  category: string;
  tags: string[];
  authorName: string;
  status: "draft" | "published";
  publishedAt?: string;
  views: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBlogListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBlogsAdmin: builder.query<TResponse<IBlog[]>, IBlogListQuery>({
      query: (params) => ({
        url: "/blogs/admin",
        method: "GET",
        params,
      }),
      providesTags: ["blogs"],
    }),
    getSingleBlogAdmin: builder.query<TResponse<IBlog>, string>({
      query: (id) => ({
        url: `/blogs/admin/${id}`,
        method: "GET",
      }),
      providesTags: ["blogs"],
    }),
    createBlog: builder.mutation<TResponse<IBlog>, FormData>({
      query: (data) => ({
        url: "/blogs",
        method: "POST",
        data,
      }),
      invalidatesTags: ["blogs"],
    }),
    updateBlog: builder.mutation<TResponse<IBlog>, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/blogs/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["blogs"],
    }),
    deleteBlog: builder.mutation<TResponse<IBlog>, string>({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["blogs"],
    }),
  }),
});

export const {
  useGetAllBlogsAdminQuery,
  useGetSingleBlogAdminQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
