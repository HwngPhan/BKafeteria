import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MenuItemDto } from "../config/menu.config";
import {
  CreateMenuItemApi,
  DeleteMenuItemApi,
  GetAllMenuItemsApi,
  GetAllMenuItemsByVendorApi,
  GetMenuItemByIdApi,
  GetMyMenuApi,
  UpdateMenuItemApi,
  UpdateMenuItemImageApi
} from "./menu.api";

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

export const useUpdateMenuItemImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data} : {id: string; data: {imageUrl: string} }) => UpdateMenuItemImageApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
      queryClient.invalidateQueries({ queryKey: menuKeys.mine() });
      queryClient.invalidateQueries({ queryKey: menuKeys.detail('') }); // Invalidate all details
    },
  });
}

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
