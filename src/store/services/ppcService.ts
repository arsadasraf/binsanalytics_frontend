import { binsApi } from "./binsApi";

export const ppcService = binsApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<any[], void>({
      query: () => "/api/ppc/order",
      transformResponse: (response: any) => response.orders || [],
      providesTags: ["Orders"],
    }),
    getRouteCards: builder.query<any[], void>({
      query: () => "/api/ppc/route-card",
      transformResponse: (response: any) => response.routeCards || [],
      providesTags: ["RouteCards"],
    }),
    getJobs: builder.query<any[], void>({
      query: () => "/api/ppc/job",
      transformResponse: (response: any) => response.jobs || [],
      providesTags: ["Jobs"],
    }),
    getMachines: builder.query<any[], void>({
      query: () => "/api/ppc/machine",
      transformResponse: (response: any) => response.machines || [],
      providesTags: ["Machines"],
    }),
    getManpower: builder.query<any[], void>({
      query: () => "/api/ppc/manpower",
      transformResponse: (response: any) => response.manpower || [],
      providesTags: ["Manpower"],
    }),
    getBoms: builder.query<any[], void>({
      query: () => "/api/store/bom",
      transformResponse: (response: any) => response.boms || [],
      providesTags: ["Boms"],
    }),
    createOrder: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/ppc/order",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),
    createRouteCard: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/ppc/route-card",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteCards"],
    }),
    createMachine: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/ppc/machine",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Machines"],
    }),
    createManpower: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/ppc/manpower",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Manpower"],
    }),
    autoSchedule: builder.mutation<any, { orderId: string }>({
      query: ({ orderId }) => ({
        url: `/api/ppc/auto-schedule/${orderId}`,
        method: "POST",
      }),
      invalidatesTags: ["Orders", "Jobs", "RouteCards"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersQuery,
  useGetRouteCardsQuery,
  useGetJobsQuery,
  useGetMachinesQuery,
  useGetManpowerQuery,
  useGetBomsQuery,
  useCreateOrderMutation,
  useCreateRouteCardMutation,
  useCreateMachineMutation,
  useCreateManpowerMutation,
  useAutoScheduleMutation,
} = ppcService;


