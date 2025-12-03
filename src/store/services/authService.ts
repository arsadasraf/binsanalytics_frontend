import { binsApi } from "./binsApi";

export const authService = binsApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, { type: "company" | "user"; credentials: { userId: string; password: string } }>(
      {
        query: ({ type, credentials }) => ({
          url: type === "company" ? "/api/company/login" : "/api/user/login",
          method: "POST",
          body: credentials,
        }),
        invalidatesTags: ["Auth"],
      },
    ),
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authService;


