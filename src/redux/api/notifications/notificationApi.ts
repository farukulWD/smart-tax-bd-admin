import { TResponse } from "@/types";
import { baseApi } from "../baseApi";

export type TNotificationType =
  | "USER_REGISTERED"
  | "PASSWORD_CHANGED"
  | "PASSWORD_RESET"
  | "TAX_ORDER_CREATED"
  | "TAX_ORDER_UPDATED"
  | "DOCUMENTS_UPLOADED"
  | "TAX_ORDER_PLACED"
  | "TAX_AMOUNTS_UPDATED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "PAYMENT_CANCELLED"
  | "FILE_UPLOADED"
  | "FILE_DELETED"
  | "NEWS_PUBLISHED"
  | "NEWS_UPDATED";

export interface INotification {
  _id: string;
  recipientId: { _id: string; name: string; email: string; mobile: string } | null;
  type: TNotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TNotificationListResponse {
  success: boolean;
  message: string;
  meta: { total: number; page: number; limit: number; totalPage: number };
  data: INotification[];
}

interface TUnreadCountResponse {
  success: boolean;
  message: string;
  data: { count: number };
}

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNotifications: builder.query<TNotificationListResponse, { page?: number; limit?: number; type?: string }>({
      query: ({ page = 1, limit = 50, type } = {}) => ({
        url: "/notifications/all",
        method: "GET",
        params: { page, limit, ...(type ? { type } : {}) },
      }),
      providesTags: ["notifications"],
    }),
    getUnreadCount: builder.query<TUnreadCountResponse, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["notifications"],
    }),
    markAsRead: builder.mutation<TResponse<INotification>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["notifications"],
    }),
    markAllAsRead: builder.mutation<TResponse<null>, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["notifications"],
    }),
    deleteNotification: builder.mutation<TResponse<null>, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["notifications"],
    }),
  }),
});

export const {
  useGetAllNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
