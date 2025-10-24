import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { User, LoginPayload, RegisterPayload } from "../../types/auth";
import type { RootState } from "../../store";
const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${ENDPOINT}/api/auth`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<{ user: User; accessToken: string }, LoginPayload>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<
      { user: User; accessToken: string },
      RegisterPayload
    >({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
    }),
    me: builder.query<unknown, void>({
      query: () => ({
        url: "/me",
        method: "GET",
        headers: {},
      }),
    }),
    refresh: builder.mutation<{ accessToken: string }, void>({
      query: () => ({
        url: "/refresh",
        method: "POST",
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useRefreshMutation,
  useLogoutMutation,
} = authApi;
