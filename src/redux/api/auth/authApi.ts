import { TResponse } from "@/types";
import { baseApi } from "../baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<TResponse<any>, any>({
      query: (data) => ({
        url: "/users/register",
        method: "POST",
        data,
      }),
    }),
    login: builder.mutation<TResponse<any>, any>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        data,
      }),
    }),
    resetPassword: builder.mutation<TResponse<any>, any>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        data,
      }),
    }),
    forgotPassword: builder.mutation<TResponse<any>, any>({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        data,
      }),
    }),
    getMe: builder.query<TResponse<any>, any>({
      query: () => ({
        url: "/users/get-me",
        method: "GET",
      }),
    }),
    logout: builder.mutation<TResponse<any>, any>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useForgotPasswordMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;
