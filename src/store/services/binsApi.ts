import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://35.194.18.160:8000";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const binsApi = createApi({
  reducerPath: "binsApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Orders",
    "RouteCards",
    "Jobs",
    "Machines",
    "Manpower",
    "Boms",
    "StoreDc",
    "StoreInvoice",
    "StoreGrn",
    "StoreMaterialIssue",
    "StoreBom",
    "StoreInventory",
    "StoreMaterialRequest",
    "Employees",
    "Attendance",
    "Auth",
  ],
  endpoints: () => ({}),
});


