import { baseApi } from "@/redux/api/baseApi";
import { TResponse } from "@/types";

export interface IHowItWork {
  _id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IHowItWorkSection {
  _id: string;
  badge?: string;
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

const howItWorkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllHowItWorksAdmin: builder.query<TResponse<IHowItWork[]>, void>({
      query: () => ({
        url: "/how-it-works/admin",
        method: "GET",
      }),
      providesTags: ["howItWorks"],
    }),
    createHowItWork: builder.mutation<TResponse<IHowItWork>, Partial<IHowItWork>>({
      query: (data) => ({
        url: "/how-it-works/admin",
        method: "POST",
        data,
      }),
      invalidatesTags: ["howItWorks"],
    }),
    updateHowItWork: builder.mutation<
      TResponse<IHowItWork>,
      { id: string; data: Partial<IHowItWork> }
    >({
      query: ({ id, data }) => ({
        url: `/how-it-works/admin/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["howItWorks"],
    }),
    reorderHowItWorks: builder.mutation<
      TResponse<IHowItWork[]>,
      { items: { id: string; order: number }[] }
    >({
      query: (data) => ({
        url: "/how-it-works/admin/reorder",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["howItWorks"],
    }),
    deleteHowItWork: builder.mutation<TResponse<IHowItWork>, string>({
      query: (id) => ({
        url: `/how-it-works/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["howItWorks"],
    }),
    getHowItWorkSection: builder.query<TResponse<IHowItWorkSection | null>, void>({
      query: () => ({
        url: "/how-it-works/section",
        method: "GET",
      }),
      providesTags: ["howItWorksSection"],
    }),
    updateHowItWorkSection: builder.mutation<
      TResponse<IHowItWorkSection>,
      Partial<IHowItWorkSection>
    >({
      query: (data) => ({
        url: "/how-it-works/section/admin",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["howItWorksSection"],
    }),
  }),
});

export const {
  useGetAllHowItWorksAdminQuery,
  useCreateHowItWorkMutation,
  useUpdateHowItWorkMutation,
  useReorderHowItWorksMutation,
  useDeleteHowItWorkMutation,
  useGetHowItWorkSectionQuery,
  useUpdateHowItWorkSectionMutation,
} = howItWorkApi;
