import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveVendorApi, getActiveVendorsApi, getAllVendorsApi, getMyVendorApi, registerVendorApi } from "./vendor.api";

export const vendorKeys = {
    all: ['vendor'] as const,
    active: () => [...vendorKeys.all, 'active'] as const,
    details: () => [...vendorKeys.all, 'details'] as const,
    me: () => [...vendorKeys.details(), 'me'] as const,
}

export const useGetMyVendor = () => {
    return useQuery({
        queryKey: vendorKeys.me(),
        queryFn: getMyVendorApi,
        enabled: true,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export const useGetAllVendors = () => {
    return useQuery({
        queryKey: vendorKeys.details(),
        queryFn: getAllVendorsApi,
        enabled: true,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export const useGetActiveVendors = () => {
    return useQuery({
        queryKey: [...vendorKeys.details(), 'active'],
        queryFn: getActiveVendorsApi,
        enabled: true,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export const useRegisterVendor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: registerVendorApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.me() });
        },
        onError: (error: any) => {
            console.error('Create vendor failed:', error?.message || error);
        }
    })
}

export const useApproveVendor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: approveVendorApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.details() });
        },
        onError: (error: any) => {
            console.error('Approve vendor failed:', error?.message || error);
        }
    })
}
