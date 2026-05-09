import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  GetAllMenuItemsApi, 
  GetAllMenuItemsByVendorApi, 
  GetMenuItemByIdApi,
  GetMyMenuApi,
  CreateMenuItemApi,
  UpdateMenuItemApi,
  DeleteMenuItemApi
} from "./menu.api";
import { MenuItemDto } from "../config/menu.types";

export interface MenuQueryParams {
  name?: string;
  category?: string;
  page?: number;
  size?: number;
}

export const menuKeys = {
  all: ['menu-items'] as const,
  list: (params: MenuQueryParams) => [...menuKeys.all, 'list', params] as const,
  listVendor: (vendorId: string) => [...menuKeys.all, 'list', vendorId] as const,
  detail: (id: string) => [...menuKeys.all, 'detail', id] as const,
  mine: () => [...menuKeys.all, 'mine'] as const,
};

export const useMenuItems = (params: MenuQueryParams) => {
  return useQuery({
    queryKey: menuKeys.list(params),
    queryFn: () => GetAllMenuItemsApi(params),
  });
};

export const useMenuItemsByVendorId = (vendorId: string) => {
  return useQuery({
    queryKey: menuKeys.listVendor(vendorId),
    queryFn: () => GetAllMenuItemsByVendorApi(vendorId),
    enabled: !!vendorId,
  });
};

export const useMenuItemById = (id: string) => {
  return useQuery({
    queryKey: menuKeys.detail(id),
    queryFn: () => GetMenuItemByIdApi(id),
    enabled: !!id,
  });
};

export const useMyMenu = () => {
  return useQuery({
    queryKey: menuKeys.mine(),
    queryFn: GetMyMenuApi,
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MenuItemDto>) => CreateMenuItemApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
      queryClient.invalidateQueries({ queryKey: menuKeys.mine() });
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItemDto> }) => UpdateMenuItemApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
      queryClient.invalidateQueries({ queryKey: menuKeys.mine() });
      queryClient.invalidateQueries({ queryKey: menuKeys.detail('') }); // Invalidate all details
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DeleteMenuItemApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
      queryClient.invalidateQueries({ queryKey: menuKeys.mine() });
    },
  });
};
