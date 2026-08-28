import { baseApi } from "@/redux/api/baseApi";
import type { Coupon, DiscountType } from "@/lib/coupon";
import { TResponse } from "@/types";

export type CouponPayload = {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive: boolean;
};

export type CouponListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  discountType?: string;
};

const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCouponsAdmin: builder.query<TResponse<Coupon[]>, CouponListParams>({
      query: (params) => ({
        url: "/coupons/admin",
        method: "GET",
        params,
      }),
      providesTags: ["coupons"],
    }),
    getSingleCouponAdmin: builder.query<TResponse<Coupon>, string>({
      query: (id) => ({
        url: `/coupons/admin/${id}`,
        method: "GET",
      }),
      providesTags: ["coupons"],
    }),
    createCoupon: builder.mutation<TResponse<Coupon>, Partial<CouponPayload>>({
      query: (data) => ({
        url: "/coupons/admin",
        method: "POST",
        data,
      }),
      invalidatesTags: ["coupons"],
    }),
    updateCoupon: builder.mutation<
      TResponse<Coupon>,
      { id: string; data: Partial<CouponPayload> }
    >({
      query: ({ id, data }) => ({
        url: `/coupons/admin/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["coupons"],
    }),
    deleteCoupon: builder.mutation<TResponse<Coupon>, string>({
      query: (id) => ({
        url: `/coupons/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["coupons"],
    }),
  }),
});

export const {
  useGetAllCouponsAdminQuery,
  useGetSingleCouponAdminQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
