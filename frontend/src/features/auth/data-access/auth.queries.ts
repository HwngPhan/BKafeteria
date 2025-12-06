import { userKeys } from "@/features/user/data-access/user.queries";
import { TokenType } from "@/lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountActivationApi, LoginApi, LogoutApi, RegisterApi, ResetPasswordApi, SendOtpApi, VerifyOtpApi } from "./auth.api";

export const useSendOtp = () => {
    return useMutation({
      mutationFn: SendOtpApi,
      onError: (error: any) => {
        console.error('Send OTP failed:', error?.message || error);
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
      onError: (error: any) => {
        console.error('Verify OTP failed:', error?.message || error);
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
      onError: (error: any) => {
        console.error('Reset password failed:', error?.message || error);
      }
    });
}

export const useLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: LoginApi,
      onSuccess: (data) => {
        if (data.accessToken !== null && typeof window !== "undefined") {
          localStorage.setItem(TokenType.authToken, data.accessToken);
        } 
        queryClient.invalidateQueries({ queryKey: userKeys.me() });
      },
      onError: (error: any) => {
        console.error('Login failed:', error?.message || error);
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
      onError: (error: any) => {
        console.error('Logout failed:', error?.message || error);
      }
    });
}
  

export const useRegister = () => {  
    return useMutation({
      mutationFn: RegisterApi,
      onError: (error: any) => {
        console.error('Register failed:', error?.message || error);
      }
    });
  }

export const useAccountActivation = () => {
    return useMutation({
      mutationFn: AccountActivationApi,
      onError: (error: any) => {
        console.error('Account activation failed:', error?.message || error);
      }
    });
  }
  