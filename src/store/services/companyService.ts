import { binsApi } from "./binsApi";

export const companyService = binsApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanyProfile: builder.query<any, void>({
      query: () => "/api/company/me",
      providesTags: ["Auth"],
    }),
    registerCompany: builder.mutation<any, Record<string, any>>({
      query: (body) => ({
        url: "/api/company/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCompanyProfileQuery, useRegisterCompanyMutation } = companyService;


