import { baseApi } from "@/redux/api/baseApi";
import { TResponse } from "@/types";

export interface IReview {
  _id: string;
  user?: string;
  reviewerName: string;
  reviewerPhoto?: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

export interface IReviewListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllReviewsAdmin: builder.query<TResponse<IReview[]>, IReviewListQuery>({
      query: (params) => ({
        url: "/reviews/admin",
        method: "GET",
        params,
      }),
      providesTags: ["reviews"],
    }),
    createReview: builder.mutation<TResponse<IReview>, FormData>({
      query: (data) => ({
        url: "/reviews/admin",
        method: "POST",
        data,
      }),
      invalidatesTags: ["reviews"],
    }),
    updateReview: builder.mutation<TResponse<IReview>, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/reviews/admin/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["reviews"],
    }),
    updateReviewStatus: builder.mutation<
      TResponse<IReview>,
      { id: string; status: "approved" | "rejected" }
    >({
      query: ({ id, status }) => {
        const fd = new FormData();
        fd.append("data", JSON.stringify({ status }));
        return {
          url: `/reviews/admin/${id}`,
          method: "PATCH",
          data: fd,
        };
      },
      invalidatesTags: ["reviews"],
    }),
    deleteReview: builder.mutation<TResponse<IReview>, string>({
      query: (id) => ({
        url: `/reviews/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["reviews"],
    }),
  }),
});

export const {
  useGetAllReviewsAdminQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useUpdateReviewStatusMutation,
  useDeleteReviewMutation,
} = reviewApi;
