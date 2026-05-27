import { API_GATEWAY_BASE_URL, TokenType } from "@/lib/constants";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { handleResponse } from "@/lib/handle-response";
import { throwApiError } from "@/lib/throwApiError";
import { CreateOrderRequest, OrderDto, PageDto } from "../config/order.config";

const BASE_URL = `${API_GATEWAY_BASE_URL}/order/orders`;

export const GetMyOrdersApi = async (page = 0, size = 9): Promise<PageDto<OrderDto>> => {
  const response = await fetchWithToken(
    TokenType.authToken,
    `${BASE_URL}/get-my-order?page=${page}&size=${size}&sortBy=createdAt&direction=desc`,
    { method: 'GET' }
  );
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: PageDto<OrderDto> }>(response);
  return responseDTO.data;
};

export const GetOrderByIdApi = async (id: string): Promise<OrderDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/${id}`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: OrderDto }>(response);
  return responseDTO.data;
};

export const CreateOrderApi = async (payload: CreateOrderRequest): Promise<OrderDto> => {
  const response = await fetchWithToken(TokenType.authToken, BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: OrderDto }>(response);
  return responseDTO.data;
};

export const PayOrderApi = async (id: string, voucherIds: string[] = []): Promise<OrderDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/${id}/payment`, {
    method: 'PUT',
    body: JSON.stringify({ voucherIds }),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: OrderDto }>(response);
  return responseDTO.data;
};
