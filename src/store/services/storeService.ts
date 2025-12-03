import { binsApi } from "./binsApi";

const storeEndpoints = [
  { key: "dc", url: "/api/store/dc", tag: "StoreDc", dataKey: "dcs" },
  { key: "invoice", url: "/api/store/invoice", tag: "StoreInvoice", dataKey: "invoices" },
  { key: "grn", url: "/api/store/grn", tag: "StoreGrn", dataKey: "grns" },
  { key: "material-issue", url: "/api/store/material-issue", tag: "StoreMaterialIssue", dataKey: "materialIssues" },
  { key: "bom", url: "/api/store/bom", tag: "StoreBom", dataKey: "boms" },
  { key: "inventory", url: "/api/store/inventory", tag: "StoreInventory", dataKey: "inventory" },
  { key: "material-request", url: "/api/store/material-request", tag: "StoreMaterialRequest", dataKey: "materialRequests" },
];

export type StoreTab = (typeof storeEndpoints)[number]["key"];

export const storeService = binsApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreData: builder.query<any, StoreTab>({
      query: (tab) => storeEndpoints.find((endpoint) => endpoint.key === tab)?.url ?? "/api/store/dc",
      providesTags: (_result, _error, tab) => {
        const current = storeEndpoints.find((endpoint) => endpoint.key === tab);
        return current ? [current.tag as any] : [];
      },
      transformResponse: (response: any, _meta, tab) => {
        const current = storeEndpoints.find((endpoint) => endpoint.key === tab);
        if (!current) return [];
        return response[current.dataKey] || [];
      },
    }),
    createStoreRecord: builder.mutation<any, { tab: StoreTab; body: any; isFormData?: boolean }>({
      query: ({ tab, body, isFormData }) => {
        const endpoint = storeEndpoints.find((entry) => entry.key === tab);
        return {
          url: endpoint?.url ?? "/api/store/dc",
          method: "POST",
          body,
          headers: isFormData ? undefined : { "Content-Type": "application/json" },
        };
      },
      invalidatesTags: (_result, _error, { tab }) => {
        const endpoint = storeEndpoints.find((entry) => entry.key === tab);
        return endpoint ? [endpoint.tag as any] : [];
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetStoreDataQuery, useLazyGetStoreDataQuery, useCreateStoreRecordMutation } = storeService;


