import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ILoginRequest, ILoginResponse, IRegisterRequest, IRegisterResponse, IDeleteAccountRequest, IDeleteAccountResponse, IUpdateProfilePhotoResponse, IUpdateProfileRequest, IRequestDeleteAccountOtpResponse } from "@/app/types/requests";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "https://api.dreamhouse05.com/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Notifications'],
  endpoints: (build) => ({
    login: build.mutation<ILoginResponse, ILoginRequest>({
      query: (credentials) => ({
        url: "/token/",
        method: "POST",
        body: credentials,
      }),
    }),
    register: build.mutation<IRegisterResponse, IRegisterRequest>({
      query: (credentials) => ({
        url: "/users/register/",
        method: "POST",
        body: credentials,
      }),
    }),
    requestDeleteAccountOtp: build.mutation<IRequestDeleteAccountOtpResponse, void>({
      query: () => ({
        url: "/users/delete-account/request-otp/",
        method: "POST",
      }),
    }),
    deleteAccount: build.mutation<IDeleteAccountResponse, IDeleteAccountRequest>({
      query: (data) => ({
        url: "/users/delete-account/",
        method: "DELETE",
        body: data,
      }),
    }),
    updateProfilePhoto: build.mutation<IUpdateProfilePhotoResponse, FormData>({
      query: (formData) => ({
        url: "/users/update-profile/",
        method: "PUT",
        body: formData,
      }),
    }),
    updateProfile: build.mutation<IUpdateProfilePhotoResponse, IUpdateProfileRequest>({
      query: (data) => {
        const formData = new FormData();
        if (data.name) {
          formData.append("name", data.name);
        }
        if (data.profile_photo) {
          formData.append("profile_photo", data.profile_photo);
        }
        return {
          url: "/users/update-profile/",
          method: "PUT",
          body: formData,
        };
      },
    }),
  }),
});

export const authApi = apiSlice;
export const { useLoginMutation, useRegisterMutation, useDeleteAccountMutation, useRequestDeleteAccountOtpMutation, useUpdateProfilePhotoMutation, useUpdateProfileMutation } = apiSlice;
