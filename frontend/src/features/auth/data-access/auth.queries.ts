import { userKeys } from "@/features/user/data-access/user.queries";
import { TokenType } from "@/lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountActivationApi, LoginApi, LogoutApi, RegisterApi, ResetPasswordApi, SendOtpApi, VerifyOtpApi } from "./auth.api";
import { ApiRegisterRequest, LoginRequest } from "../config/auth.schema";

export const useSendOtp = () => {
    return useMutation({
      mutationFn: SendOtpApi,
      onError: (error: Error) => {
        console.error('Send OTP failed:', error.message);
      }
    });
}

export const useVerifyOtp = () => {
    return useMutation({
      mutationFn: VerifyOtpApi,
      onSuccess: (data) => {
        if (data.otpToken !== null && typeof window !== "undefined") {
            localStorage.setItem(TokenType.otpToken, data.otpToken);
        }
      },
      onError: (error: Error) => {
        console.error('Verify OTP failed:', error.message);
      }
    });
}

export const useResetPassword = () => {
    return useMutation({
      mutationFn: ResetPasswordApi,
      onSuccess: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(TokenType.otpToken);
        }
      },
      onError: (error: Error) => {
        console.error('Reset password failed:', error.message);
      }
    });
}

export const useLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: LoginRequest) => LoginApi(payload),
      onSuccess: (data) => {
        if (data.accessToken !== null && typeof window !== "undefined") {
          localStorage.setItem(TokenType.authToken, data.accessToken);
        } 
        queryClient.invalidateQueries({ queryKey: userKeys.me() });
      },
      onError: (error: Error) => {
        console.error('Login failed:', error.message);
      }
    });
}

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: LogoutApi,
      onSuccess: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(TokenType.authToken);
        }
        queryClient.invalidateQueries({ queryKey: userKeys.me() });
      },
      onError: (error: Error) => {
        console.error('Logout failed:', error.message);
      }
    });
}
  

export const useRegister = () => {  
    return useMutation({
      mutationFn: (payload: ApiRegisterRequest) => RegisterApi(payload),
      onError: (error: Error) => {
        console.error('Register failed:', error.message);
      }
    });
  }

export const useAccountActivation = () => {
    return useMutation({
      mutationFn: AccountActivationApi,
      onError: (error: Error) => {
        console.error('Account activation failed:', error.message);
      }
    });
  }