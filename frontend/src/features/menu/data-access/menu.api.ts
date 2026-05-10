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
export const GetMyMenuApi = async (): Promise<MenuItemDto[]> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/get-my-menu`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: MenuItemDto[] }>(response);
  return responseDTO.data;
};

export const CreateMenuItemApi = async (menuItemData: Partial<MenuItemDto>): Promise<MenuItemDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/create`, {
    method: 'POST',
    body: JSON.stringify(menuItemData),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{data: MenuItemDto}>(response);
  // Handle both wrapped { data: ... } and direct object responses
  return responseDTO.data || responseDTO;
};

export const UpdateMenuItemImageApi = async (id: string, data: { imageUrl: string }): Promise<MenuItemDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/img/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{data: MenuItemDto}>(response);
  return responseDTO.data || responseDTO;
};

export const UpdateMenuItemApi = async (id: string, menuItemData: Partial<MenuItemDto>): Promise<MenuItemDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(menuItemData),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{data: MenuItemDto}>(response);
  return responseDTO.data || responseDTO;
};

export const DeleteMenuItemApi = async (id: string): Promise<void> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/delete/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) await throwApiError(response);
};
