import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountActivationApi, LoginApi, LogoutApi, RegisterApi, ResetPasswordApi, SendOtpApi, VerifyOtpApi } from "./auth.api";

export const authKeys = {
    all: ['auth'] as const,
    login: () => [...authKeys.all, 'login'] as const,
    register: () => [...authKeys.all, 'register'] as const,
}

export const useSendOtp = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: SendOtpApi,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      },
      onError: (error: any) => {
        console.error('Send OTP failed:', error?.message || error);
      }
    });
}

export const useVerifyOtp = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: VerifyOtpApi,
      onSuccess: (data) => {
        if (data.otpToken !== null) {
          if (typeof window !== "undefined") {
            localStorage.setItem('otpToken', data.otpToken);
          }
        }
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      },
      onError: (error: any) => {
        console.error('Verify OTP failed:', error?.message || error);
      }
    });
}

export const useResetPassword = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ResetPasswordApi,
      onSuccess: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem('otpToken');
        }
        queryClient.invalidateQueries({ queryKey: authKeys.all });
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
        if (data.accessToken !== null) {
          if (typeof window !== "undefined") {
            localStorage.setItem('authToken', data.accessToken);
          }
          queryClient.invalidateQueries({ queryKey: authKeys.all });
        } 
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
          localStorage.removeItem('authToken');
        }
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      },
      onError: (error: any) => {
        console.error('Logout failed:', error?.message || error);
      }
    });
}
  

export const useRegister = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: RegisterApi,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      },
      onError: (error: any) => {
        console.error('Register failed:', error?.message || error);
      }
    });
  }

export const useAccountActivation = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: AccountActivationApi,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      },
      onError: (error: any) => {
        console.error('Account activation failed:', error?.message || error);
      }
    });
  }
  