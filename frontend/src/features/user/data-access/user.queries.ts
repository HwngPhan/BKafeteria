import { getCookie } from "cookies-next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TokenType } from "@/lib/constants";
import { UserDto } from "@/features/auth/config/auth.schema";
import { 
  GetMeApi, 
  UpdateMeApi, 
  GetAllUsersApi, 
  UpdateUserApi, 
  DeleteUserApi, 
  AssignVendorApi,
  UserPageDto
} from "./user.api";

export const userKeys = {
    all: ['user'] as const,
    details: () => [...userKeys.all, 'details'] as const,
    me: () => [...userKeys.details(), 'me'] as const,
    list: (params: any) => [...userKeys.all, 'list', params] as const,
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
  })
};

export const useAllUsers = (params: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => GetAllUsersApi(params),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserDto> }) => UpdateUserApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, softDelete }: { id: string; softDelete?: boolean }) => DeleteUserApi(id, softDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useAssignVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, email }: { vendorId: string; email: string }) => AssignVendorApi(vendorId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};