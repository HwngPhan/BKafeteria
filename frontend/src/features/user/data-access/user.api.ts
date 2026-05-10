import { API_GATEWAY_BASE_URL, TokenType } from "@/lib/constants";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { handleResponse } from "@/lib/handle-response";
import { throwApiError } from "@/lib/throwApiError";
import { UserDto } from "@/features/auth/config/auth.schema";

const BASE_URL = `${API_GATEWAY_BASE_URL}/iam/users`;

export const GetMeApi = async (): Promise<UserDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ message: string; data: UserDto }>(response);
  return responseDTO.data;
};

export const UpdateMeApi = async (userData: Partial<UserDto>): Promise<UserDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ message: string; data: UserDto }>(response);
  return responseDTO.data;
};

export const GetUserByIdApi = async (id: string): Promise<UserDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/${id}`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ message: string; data: UserDto }>(response);
  return responseDTO.data;
};

export interface UserPageDto {
  content: UserDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const GetAllUsersApi = async (params: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<UserPageDto> => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.role) query.append('role', params.role);
  if (params.status) query.append('status', params.status);
  if (params.page !== undefined) query.append('page', params.page.toString());
  if (params.size !== undefined) query.append('size', params.size.toString());

  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}?${query.toString()}`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: UserPageDto }>(response);
  return responseDTO.data;
};

export const UpdateUserApi = async (id: string, userData: Partial<UserDto>): Promise<UserDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: UserDto }>(response);
  return responseDTO.data;
};

export const DeleteUserApi = async (id: string, softDelete = true): Promise<void> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/${id}?soft-delete=${softDelete}`, {
    method: 'DELETE',
  });
  if (!response.ok) await throwApiError(response);
};

export const AssignVendorApi = async (vendorId: string, email: string, role: string = 'STAFF'): Promise<UserDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/assign-vendor/${vendorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role }),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: UserDto }>(response);
  return responseDTO.data;
};