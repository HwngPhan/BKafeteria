import { USE_POLLING } from "@/lib/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetVendorOrderNotificationsApi,
  GetVendorOrdersApi,
  ConfirmOrderApi,
  MarkOrderFinishedApi
} from "./vendor-order.api";

export const vendorOrderKeys = {
  all: ['vendor-orders'] as const,
  notifications: () => [...vendorOrderKeys.all, 'notifications'] as const,
  list: () => [...vendorOrderKeys.all, 'list'] as const,
};

export const useVendorOrderNotifications = (enabled: boolean = true) => {
  return useQuery({
    queryKey: vendorOrderKeys.notifications(),
    queryFn: GetVendorOrderNotificationsApi,
    refetchInterval: USE_POLLING ? 5000 : false,
    enabled,
  });
};

export const useVendorOrders = (page = 0, size = 10, statuses?: string[]) => {
  return useQuery({
    queryKey: [...vendorOrderKeys.list(), page, size, statuses],
    queryFn: () => GetVendorOrdersApi(page, size, statuses),
    refetchInterval: USE_POLLING ? 5000 : false,
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
