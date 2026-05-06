import { useQuery } from "@tanstack/react-query";
import { GetAllMenuItemsApi, GetAllMenuItemsByVendorApi, GetMenuItemByIdApi } from "./menu.api";

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
