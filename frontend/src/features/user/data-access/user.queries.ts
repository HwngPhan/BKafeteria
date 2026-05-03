import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetMeApi, UpdateMeApi } from "./user.api";
import { TokenType } from "@/lib/constants";
import { UserDto } from "@/features/auth/config/auth.schema";

export const userKeys = {
    all: ['user'] as const,
    details: () => [...userKeys.all, 'details'] as const,
    me: () => [...userKeys.details(), 'me'] as const,
}

export const useGetMe = () => { 
    return useQuery({
      queryKey: userKeys.me(),
      queryFn: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem(TokenType.authToken) : null;
        if (!token) {
            return null;
        }
        try {
          const data = await GetMeApi();
          return data;
        } catch (error: unknown) {
          console.error("GetMe failed:", error);
          return null;
        }
      },
      enabled: true,
      retry: false,
    });
  };
  
export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<UserDto>) => UpdateMeApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
    onError: (error: Error) => {
      console.error('Update user info failed:', error.message);
    }
  })
};