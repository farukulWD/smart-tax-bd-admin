import { TResponse } from "@/types";
import { baseApi } from "../baseApi";

export type TDashboardRange = "7d" | "30d" | "12m";

export interface IDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  ordersInProgress: number;
  totalTaxTypes: number;
  totalFiles: number;
  /** Cash actually received — sum of completed payments. */
  totalCollected: number;
  /** Coupon-adjusted fee income on settled orders. */
  feeRevenue: number;
  totalOutstanding: number;
}

export interface ITimePoint {
  date: string;
  count: number;
}

export interface IRevenuePoint {
  date: string;
  collected: number;
  outstanding: number;
}

export interface ICategoryPoint {
  label: string;
  count: number;
}

export interface IStatusPoint {
  status: string;
  count: number;
}

export interface IDashboardCharts {
  range: TDashboardRange;
  ordersOverTime: ITimePoint[];
  usersOverTime: ITimePoint[];
  revenueOverTime: IRevenuePoint[];
  statusBreakdown: IStatusPoint[];
  incomeSourceMix: ICategoryPoint[];
  taxTypeMix: ICategoryPoint[];
}

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<TResponse<IDashboardStats>, void>({
      query: () => ({ url: "/dashboard/stats", method: "GET" }),
      providesTags: ["dashboard"],
    }),
    getDashboardCharts: builder.query<
      TResponse<IDashboardCharts>,
      TDashboardRange
    >({
      query: (range) => ({
        url: "/dashboard/charts",
        method: "GET",
        params: { range },
      }),
      providesTags: ["dashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetDashboardChartsQuery } =
  dashboardApi;
