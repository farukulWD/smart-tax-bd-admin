import { TResponse } from "@/types";
import { baseApi } from "../baseApi";

export interface IOrder {
  mobile: string;
  userId: string;
  tax_or_vat_number: string;
  is_taxable_income: boolean;
  tax_types: string[];
  status: string;
  isPaid: boolean;
  payable_amount: number;
  tax_year: string;
}

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query<TResponse<any>, undefined>({
      query: () => ({
        url: "/tax-orders/get-user-order",
        method: "GET",
      }),
      providesTags: ["orders"],
    }),
    getTaxTypes: builder.query<TResponse<any>, undefined>({
      query: () => ({
        url: "/tax-types/get-all-tax-types",
        method: "GET",
      }),
    }),
    createOrder: builder.mutation<TResponse<any>, IOrder>({
      query: (data) => ({
        url: "/tax-orders/order-tax",
        method: "POST",
        data,
      }),
      invalidatesTags: ["orders"],
    }),
    getAllTaxOrders: builder.query<TResponse<any>, void>({
      query: () => ({
        url: "/tax-orders/get-tax",
        method: "GET",
      }),
      providesTags: ["orders"],
    }),
    getSingleTaxOrder: builder.query<TResponse<any>, string>({
      query: (id) => ({
        url: `/tax-orders/get-tax/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "orders", id }],
    }),
  }),
});

export const {
  useGetMyOrdersQuery,
  useCreateOrderMutation,
  useGetTaxTypesQuery,
  useGetAllTaxOrdersQuery,
  useGetSingleTaxOrderQuery,
} = orderApi;


// const taxModel = new Schema(
//   {
//     mobile: {
//       type: String,
//       required: true,
//     },
//     tax_or_vat_number: {
//       type: String,
//       required: true,
//     },

//     is_taxable_income: {
//       type: Boolean,
//       default: false,
//       required: true,
//     },
//     tax_types: [
//       {
//         ref: "TaxType",
//         type: Schema.Types.ObjectId,
//         required: true,
//       },
//     ],
//     status: {
//       type: String,
//       default: "pending",
//     },
//     isPaid: {
//       type: Boolean,
//       default: false,
//     },
//     payable_amount: {
//       type: Number,
//       default: 0,
//     },
//     tax_year: {
//       type: String,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
