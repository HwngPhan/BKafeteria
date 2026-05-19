import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ConfirmOrderApi,
  GetVendorOrderByIdApi,
  GetVendorOrderNotificationsApi,
  GetVendorOrdersApi,
  MarkOrderFinishedApi
} from "./vendor-order.api";

export const vendorOrderKeys = {
  all: ['vendor-orders'] as const,
  notifications: () => [...vendorOrderKeys.all, 'notifications'] as const,
  list: () => [...vendorOrderKeys.all, 'list'] as const,
  detail: (id: string) => [...vendorOrderKeys.all, 'detail', id] as const,
};

export const useVendorOrderNotifications = (enabled: boolean = true) => {
  return useQuery({
    queryKey: vendorOrderKeys.notifications(),
    queryFn: GetVendorOrderNotificationsApi,
    enabled,
  });
};

export const useVendorOrders = (page = 0, size = 10, statuses?: string[]) => {
  return useQuery({
    queryKey: [...vendorOrderKeys.list(), page, size, statuses],
    queryFn: () => GetVendorOrdersApi(page, size, statuses),
  });
};

export const useVendorOrderById = (vendorOrderId: string) => {
  return useQuery({
    queryKey: vendorOrderKeys.detail(vendorOrderId),
    queryFn: () => GetVendorOrderByIdApi(vendorOrderId),
    enabled: !!vendorOrderId,
  });
};

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ConfirmOrderApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorOrderKeys.all });
    },
  });
};

export const useMarkOrderFinished = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => MarkOrderFinishedApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorOrderKeys.all });
    },
  });
};
