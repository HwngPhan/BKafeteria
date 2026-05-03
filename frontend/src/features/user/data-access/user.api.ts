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