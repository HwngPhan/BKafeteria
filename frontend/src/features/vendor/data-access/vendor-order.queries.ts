import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ConfirmOrderApi,
  GetVendorOrderByIdApi,
  GetVendorOrderNotificationsApi,
  GetVendorOrdersApi,
  MarkOrderFinishedApi
} from "./vendor-order.api";
import { PageDto, VendorOrderNotification } from "../config/vendor-order.config";

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
    staleTime: 0,
  });
};

export const useVendorOrderById = (vendorOrderId: string) => {
  return useQuery({
    queryKey: vendorOrderKeys.detail(vendorOrderId),
    queryFn: () => GetVendorOrderByIdApi(vendorOrderId),
    enabled: !!vendorOrderId,
    staleTime: 0,
  });
};

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ConfirmOrderApi(id),
    onSuccess: (data) => {
      queryClient.setQueryData(vendorOrderKeys.detail(data.vendorOrderId), data);
      queryClient.setQueriesData<PageDto<VendorOrderNotification>>(
        { queryKey: vendorOrderKeys.list() },
        (old) => {
          if (!old) return old;
          return { ...old, content: old.content.map((o) => (o.vendorOrderId === data.vendorOrderId ? data : o)) };
        }
      );
      queryClient.invalidateQueries({ queryKey: vendorOrderKeys.all });
    },
  });
};

export const useMarkOrderFinished = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => MarkOrderFinishedApi(id),
    onSuccess: (data) => {
      queryClient.setQueryData(vendorOrderKeys.detail(data.vendorOrderId), data);
      queryClient.setQueriesData<PageDto<VendorOrderNotification>>(
        { queryKey: vendorOrderKeys.list() },
        (old) => {
          if (!old) return old;
          return { ...old, content: old.content.map((o) => (o.vendorOrderId === data.vendorOrderId ? data : o)) };
        }
      );
      queryClient.invalidateQueries({ queryKey: vendorOrderKeys.all });
    },
  });
};
