import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GetActiveVendorsApi,
  GetVendorByIdApi,
  GetMyVendorApi,
  GetAllVendorsApi,
  RegisterVendorApi,
  ApproveVendorApi,
  UpdateVendorApi,
  UpdateVendorImageApi,
  GetVendorDashboardApi
} from "./vendor.api";
import { VendorDto } from "../config/vendor.config";

export const vendorKeys = {
  all: ['vendors'] as const,
  active: () => [...vendorKeys.all, 'active'] as const,
  detail: (id: string) => [...vendorKeys.all, 'detail', id] as const,
  mine: () => [...vendorKeys.all, 'mine'] as const,
  dashboard: () => [...vendorKeys.all, 'dashboard'] as const,
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

export const useAllVendors = () => {
  return useQuery({
    queryKey: vendorKeys.all,
    queryFn: GetAllVendorsApi,
  });
};

export const useRegisterVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<VendorDto>) => RegisterVendorApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
};

export const useApproveVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ApproveVendorApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VendorDto> }) => UpdateVendorApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorKeys.mine() });
    },
  });
};

export const useUpdateVendorImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { imgUrl: string } }) => UpdateVendorImageApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorKeys.mine() });
    },
  });
};

export const useVendorDashboard = () => {
  return useQuery({
    queryKey: vendorKeys.dashboard(),
    queryFn: GetVendorDashboardApi,
  });
};
