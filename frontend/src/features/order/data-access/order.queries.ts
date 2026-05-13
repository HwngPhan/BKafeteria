import { userKeys } from "@/features/user/data-access/user.queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateOrderRequest, OrderDto } from "../config/order.types";
import { CreateOrderApi, GetMyOrdersApi, GetOrderByIdApi, PayOrderApi } from "./order.api";

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
