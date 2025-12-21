import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetMeApi, UpdateMeApi } from "./user.api";

export const userKeys = {
    all: ['user'] as const,
    details: () => [...userKeys.all, 'details'] as const,
    me: () => [...userKeys.details(), 'me'] as const,
}

export const useGetMe = () => { 
    return useQuery({
      queryKey: userKeys.me(),
      queryFn: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        if (!token) {
            return null;
        }
        const data = await GetMeApi();
        console.log("Fetched user data:", data);
        return data;
      },
      enabled: true,
      retry: false,
    });
  };
  
export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UpdateMeApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
    onError: (error: any) => {
      console.error('Update user info failed:', error?.message || error);
    }
  })
};
  