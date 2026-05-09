import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  GetVendorOrderNotificationsApi, 
  GetVendorOrdersApi, 
  MarkOrderFinishedApi 
} from "./vendor-order.api";
import { USE_POLLING } from "@/lib/constants";

export const vendorOrderKeys = {
  all: ['vendor-orders'] as const,
  notifications: () => [...vendorOrderKeys.all, 'notifications'] as const,
  list: () => [...vendorOrderKeys.all, 'list'] as const,
};

export const useVendorOrderNotifications = (enabled = true) => {
  return useQuery({
    queryKey: vendorOrderKeys.notifications(),
    queryFn: GetVendorOrderNotificationsApi,
    refetchInterval: USE_POLLING ? 5000 : false,
    enabled,
  });
};

export const useVendorOrders = () => {
  return useQuery({
    queryKey: vendorOrderKeys.list(),
    queryFn: GetVendorOrdersApi,
    refetchInterval: USE_POLLING ? 5000 : false,
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
