import { TokenType } from "@/lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setCookie, deleteCookie } from "cookies-next";
import { AccountActivationApi, LoginApi, LogoutApi, RegisterApi, ResetPasswordApi, SendOtpApi, VerifyOtpApi } from "./auth.api";
import { ApiRegisterRequest, LoginRequest } from "../config/auth.schema";

export const useSendOtp = () => {
    return useMutation({
      mutationFn: SendOtpApi,
      onError: () => {
      }
    });
}

export const useVerifyOtp = () => {
    return useMutation({
      mutationFn: VerifyOtpApi,
      onSuccess: (data) => {
        if (data.otpToken !== null) {
            setCookie(TokenType.otpToken, data.otpToken);
        }
      },
      onError: () => {
      }
    });
}

export const useResetPassword = () => {
    return useMutation({
      mutationFn: ResetPasswordApi,
      onSuccess: () => {
        deleteCookie(TokenType.otpToken);
      },
      onError: () => {
      }
    });
}

const isProduction = process.env.NEXT_PUBLIC_PRODUCTION === 'true';

export const useLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: LoginRequest) => LoginApi(payload),
      onSuccess: (data) => {
        if (data.accessToken !== null) {
          setCookie(TokenType.authToken, data.accessToken, {
            maxAge: 60 * 60 * 24 * 7,
            secure: isProduction,
            sameSite: 'lax',
          });
        }
        queryClient.clear();
      },
      onError: () => {
      }
    });
}

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: LogoutApi,
      onSuccess: () => {
        deleteCookie(TokenType.authToken);
        queryClient.clear();
      },
      onError: () => {
      }
    });
}
  

export const useRegister = () => {  
    return useMutation({
      mutationFn: (payload: ApiRegisterRequest) => RegisterApi(payload),
      onError: () => {
      }
    });
  }

export const useAccountActivation = () => {
    return useMutation({
      mutationFn: AccountActivationApi,
      onError: () => {
      }
    });
  }