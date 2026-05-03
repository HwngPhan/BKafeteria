import { useQuery } from "@tanstack/react-query";
import { GetActiveVendorsApi, GetVendorByIdApi, GetMyVendorApi } from "./vendor.api";

export const vendorKeys = {
  all: ['vendors'] as const,
  active: () => [...vendorKeys.all, 'active'] as const,
  detail: (id: string) => [...vendorKeys.all, 'detail', id] as const,
  mine: () => [...vendorKeys.all, 'mine'] as const,
};

export const useActiveVendors = () => {
  return useQuery({
    queryKey: vendorKeys.active(),
    queryFn: GetActiveVendorsApi,
  });
};

export const useVendorById = (id: string) => {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => GetVendorByIdApi(id),
    enabled: !!id,
  });
};

export const useMyVendor = () => {
  return useQuery({
    queryKey: vendorKeys.mine(),
    queryFn: GetMyVendorApi,
  });
};
