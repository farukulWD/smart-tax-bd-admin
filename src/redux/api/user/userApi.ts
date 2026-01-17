import { TResponse } from "@/types";
import { baseApi } from "../baseApi";

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<TResponse<any>, void>({
      query: () => ({
        url: "/users/get-users",
        method: "GET",
      }),
      providesTags: ["users"],
    }),
    getUserByMobile: builder.query<TResponse<any>, string>({
      query: (mobile) => ({
        url: `/users/get-user/${mobile}`,
        method: "GET",
      }),
      providesTags: (result, error, mobile) => [{ type: "users", id: mobile }],
    }),
    updateUser: builder.mutation<TResponse<any>, { mobile: string; data: any }>({
      query: ({ mobile, data }) => ({
        url: `/users/update/${mobile}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { mobile }) => ["users", { type: "users", id: mobile }],
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByMobileQuery, useUpdateUserMutation } = userApi;
