import { useQuery } from "@tanstack/react-query";
import { GetMeApi } from "./user.api";

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
  
  