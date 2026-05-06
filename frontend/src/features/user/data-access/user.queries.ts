import { getCookie } from "cookies-next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetMeApi, UpdateMeApi } from "./user.api";
import { TokenType } from "@/lib/constants";
import { UserDto } from "@/features/auth/config/auth.schema";

export const userKeys = {
    all: ['user'] as const,
    details: () => [...userKeys.all, 'details'] as const,
    me: () => [...userKeys.details(), 'me'] as const,
}

export const useGetMe = (enabled: boolean = true) => { 
    return useQuery({
      queryKey: userKeys.me(),
      queryFn: async () => {
        const token = getCookie(TokenType.authToken);
        if (!token) {
            return null;
        }
        try {
          const data = await GetMeApi();
          return data;
        } catch (error: unknown) {
          return null;
        }
      },
      enabled,
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
    }
  })
};