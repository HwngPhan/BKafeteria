import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetMyOrdersApi, GetOrderByIdApi, CreateOrderApi, PayOrderApi } from "./order.api";
import { OrderDto, CreateOrderRequest } from "../config/order.types";
import { USE_POLLING } from "@/lib/constants";
import { userKeys } from "@/features/user/data-access/user.queries";

export const orderKeys = {
  all: ['orders'] as const,
  mine: () => [...orderKeys.all, 'mine'] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

export const useMyOrders = (page = 0, size = 9) => {
  return useQuery({
    queryKey: [...orderKeys.mine(), page, size],
    queryFn: () => GetMyOrdersApi(page, size),
    refetchInterval: USE_POLLING ? 5000 : false,
  });
};

export const useOrderById = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => GetOrderByIdApi(id),
    enabled: !!id,
    refetchInterval: (query) => {
      if (!USE_POLLING) return false;
      const order = query.state.data as OrderDto | undefined;
      if (order && !['COMPLETED', 'CANCELED', 'DELIVERED'].includes(order.status)) {
        return 3000;
      }
      return false;
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderRequest) => CreateOrderApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.mine() });
    },
  });
};

export const usePayOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PayOrderApi(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.mine() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};
