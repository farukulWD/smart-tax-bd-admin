import { TResponse } from "@/types";
import { baseApi } from "../baseApi";

export enum IncomeSource {
  GovtJob = "Income from Govt.Job",
  PrivateJob = "Income from Private Job",
  Business = "Income from Business",
  Rent = "Income from Rent",
  Agriculture = "Income from Agriculture",
  FinancialAsset = "Income from Financial Asset",
  CapitalGain = "Income from Capital Gain",
  OthersSource = "Income from others Source",
  ForignRemitance = "Income from Forign Remitance",
}

export interface IPersonalInformation {
  name: string;
  email: string;
  phone: string;
  are_you_student: boolean;
  are_you_house_wife: boolean;
}

export interface IOrder {
  _id?: string;
  userId?: string;
  personal_iformation: IPersonalInformation;
  status: string;
  current_step: 1 | 2 | 3;
  are_you_get_notice_from_tax_office: boolean;
  income_from_partnership_firm: boolean;
  income_from_ldt_company: boolean;
  source_of_income: IncomeSource[];
  tax_year: string;
  documents?: string[];
  tax_payable_amount: number;
  is_tax_payable_amount_paid: boolean;
  tax_paid_amount: number;
  fee_amount: number;
  is_fee_amount_paid: boolean;
  fee_due_amount: number;
  is_fee_due_amount_paid: boolean;
  total_amount: number;
  total_paid_amount: number;
  tax_paid_date?: string;
  createdAt?: string;
}

export interface ISingleOrder {
  tax_order: IOrder;
  required_documents: string[];
}

interface IPayment {
  _id: string;
  userId: string;
  orderId: string;
  order: IOrder;
  amount: number;
  paymentFor:
    | "fee_amount"
    | "fee_due_amount"
    | "tax_payable_amount"
    | "remaining_all_amount";
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  transaction_id?: string;
  payment_method?: string;
}

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query<TResponse<IOrder[]>, undefined>({
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
    getAllTaxOrders: builder.query<TResponse<IOrder[]>, void>({
      query: () => ({
        url: "/tax-orders/all-orders",
        method: "GET",
      }),
      providesTags: ["orders"],
    }),
    getSingleTaxOrder: builder.query<TResponse<ISingleOrder>, string>({
      query: (id) => ({
        url: `/tax-orders/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "orders", id }],
    }),
    updateTaxOrder: builder.mutation<
      TResponse<any>,
      {
        id: string;
        data: Partial<
          Pick<IOrder, "status" | "tax_payable_amount" | "fee_due_amount">
        >;
      }
    >({
      query: ({ id, data }) => ({
        url: `/tax-orders/update-tax-order/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "orders",
        { type: "orders", id },
      ],
    }),
    paymentsByOrderId: builder.query<TResponse<IPayment[]>, string>({
      query: (id) => ({
        url: `/payments/payments-by-order-id/${id}`,
        method: "GET",
      }),
      providesTags: ["payments"],
    }),
  }),
});

export const {
  useGetMyOrdersQuery,
  useCreateOrderMutation,
  useGetTaxTypesQuery,
  useGetAllTaxOrdersQuery,
  useGetSingleTaxOrderQuery,
  useUpdateTaxOrderMutation,
  usePaymentsByOrderIdQuery,
} = orderApi;
