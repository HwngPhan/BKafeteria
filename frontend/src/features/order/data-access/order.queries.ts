import { userKeys } from "@/features/user/data-access/user.queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateOrderRequest, OrderDto, PageDto } from "../config/order.config";
import { CreateOrderApi, CustomerRefundOrderApi, GetMyOrdersApi, GetOrderByIdApi, ManagerRefundVendorOrderApi, PayOrderApi } from "./order.api";

export const orderKeys = {
  all: ['orders'] as const,
  mine: () => [...orderKeys.all, 'mine'] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

export const useMyOrders = (page = 0, size = 9) => {
  return useQuery({
    queryKey: [...orderKeys.mine(), page, size],
    queryFn: () => GetMyOrdersApi(page, size),
  });
};

export const useOrderById = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => GetOrderByIdApi(id),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderRequest) => CreateOrderApi(payload),
    onSuccess: (newOrder) => {
      // Inject the new order at the top of every cached page-0 list immediately
      // so navigating to /orders shows it without waiting for a background refetch.
      queryClient.setQueriesData<PageDto<OrderDto>>(
        { queryKey: orderKeys.mine() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: [newOrder, ...old.content],
            totalElements: (old.totalElements || 0) + 1,
          };
        }
      );
      // Background sync to ensure the list stays consistent with the server.
      queryClient.invalidateQueries({ queryKey: orderKeys.mine() });
    },
  });
};

export const usePayOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, voucherIds }: { id: string; voucherIds?: string[] }) =>
      PayOrderApi(id, voucherIds ?? []),
    onSuccess: (data) => {
      // Update the order in every cached list immediately so status changes appear
      // without waiting for a background refetch.
      queryClient.setQueriesData<PageDto<OrderDto>>(
        { queryKey: orderKeys.mine() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((o) => (o.orderId === data.orderId ? data : o)),
          };
        }
      );
      queryClient.setQueryData(orderKeys.detail(data.orderId), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.mine() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useCustomerRefundOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CustomerRefundOrderApi(id),
    onSuccess: (data) => {
      queryClient.setQueriesData<PageDto<OrderDto>>(
        { queryKey: orderKeys.mine() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((o) => (o.orderId === data.orderId ? data : o)),
          };
        }
      );
      queryClient.setQueryData(orderKeys.detail(data.orderId), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.mine() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useManagerRefundVendorOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vendorOrderId: string) => ManagerRefundVendorOrderApi(vendorOrderId),
    onSuccess: (data) => {
      // data is the parent OrderDto
      queryClient.setQueryData(orderKeys.detail(data.orderId), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};
