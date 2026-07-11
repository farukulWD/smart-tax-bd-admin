import { baseApi } from "@/redux/api/baseApi";
import { TResponse } from "@/types";

export interface IFaq {
  _id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFaqsAdmin: builder.query<TResponse<IFaq[]>, void>({
      query: () => ({
        url: "/faqs/admin",
        method: "GET",
      }),
      providesTags: ["faqs"],
    }),
    createFaq: builder.mutation<TResponse<IFaq>, Partial<IFaq>>({
      query: (data) => ({
        url: "/faqs/admin",
        method: "POST",
        data,
      }),
      invalidatesTags: ["faqs"],
    }),
    updateFaq: builder.mutation<TResponse<IFaq>, { id: string; data: Partial<IFaq> }>({
      query: ({ id, data }) => ({
        url: `/faqs/admin/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["faqs"],
    }),
    reorderFaqs: builder.mutation<TResponse<IFaq[]>, { items: { id: string; order: number }[] }>({
      query: (data) => ({
        url: "/faqs/admin/reorder",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["faqs"],
    }),
    deleteFaq: builder.mutation<TResponse<IFaq>, string>({
      query: (id) => ({
        url: `/faqs/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["faqs"],
    }),
  }),
});

export const {
  useGetAllFaqsAdminQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useReorderFaqsMutation,
  useDeleteFaqMutation,
} = faqApi;
