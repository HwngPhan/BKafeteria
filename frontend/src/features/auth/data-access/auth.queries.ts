import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginApi, RegisterApi } from "./auth.api";

export const authKeys = {
    all: ['auth'] as const,
    login: () => [...authKeys.all, 'login'] as const,
    register: () => [...authKeys.all, 'register'] as const,
}

export const useLogin = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: LoginApi,
      onSuccess: (data) => {
        if (typeof window !== "undefined") {
          localStorage.setItem('token', data.accessToken);
        }
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      },
      onError: (error: any) => {
        console.error('Login failed:', error?.message || error);
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
  