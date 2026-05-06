import { API_GATEWAY_BASE_URL, TokenType } from "@/lib/constants";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { handleResponse } from "@/lib/handle-response";
import { throwApiError } from "@/lib/throwApiError";
import { MenuItemDto } from "../config/menu.types";

const BASE_URL = `${API_GATEWAY_BASE_URL}/menu/items`;

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const GetAllMenuItemsApi = async (params: {
  name?: string;
  category?: string;
  page?: number;
  size?: number;
}): Promise<PageResponse<MenuItemDto>> => {
  const query = new URLSearchParams();
  if (params.name) query.append('name', params.name);
  if (params.category) query.append('category', params.category);
  if (params.page !== undefined) query.append('page', params.page.toString());
  if (params.size !== undefined) query.append('size', params.size.toString());

  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/get-all?${query.toString()}`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: PageResponse<MenuItemDto> }>(response);
  return responseDTO.data;
};

export const GetMenuItemByIdApi = async (id: string): Promise<MenuItemDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/${id}`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: MenuItemDto }>(response);
  return responseDTO.data;
};

export const GetAllMenuItemsByVendorApi = async (vendorId: string): Promise<MenuItemDto[]> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/get-by-vendor/${vendorId}`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: MenuItemDto[] }>(response);
  return responseDTO.data;
};
