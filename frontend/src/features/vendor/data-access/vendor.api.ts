import { API_GATEWAY_BASE_URL, TokenType } from "@/lib/constants";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { handleResponse } from "@/lib/handle-response";
import { throwApiError } from "@/lib/throwApiError";
import { VendorDashboardDto, VendorDto } from "../config/vendor.config";

const BASE_URL = `${API_GATEWAY_BASE_URL}/vendor/vendors`;

export const GetActiveVendorsApi = async (): Promise<VendorDto[]> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/active`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: VendorDto[] }>(response);
  return responseDTO.data;
};

export const GetVendorByIdApi = async (id: string): Promise<VendorDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/${id}`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: VendorDto }>(response);
  return responseDTO.data;
};

export const GetMyVendorApi = async (): Promise<VendorDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/get-my-vendor`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: VendorDto }>(response);
  return responseDTO.data;
};
export const GetAllVendorsApi = async (): Promise<VendorDto[]> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: VendorDto[] }>(response);
  return responseDTO.data;
};

export const RegisterVendorApi = async (vendorData: Partial<VendorDto>): Promise<VendorDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vendorData),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: VendorDto }>(response);
  return responseDTO.data;
};

export const ApproveVendorApi = async (id: string): Promise<void> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/approve/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) await throwApiError(response);
};

export const UpdateVendorApi = async (id: string, vendorData: Partial<VendorDto>): Promise<VendorDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vendorData),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: VendorDto }>(response);
  return responseDTO.data;
};

export const UpdateVendorImageApi = async (id: string, data: { imgUrl: string }): Promise<VendorDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/img/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: VendorDto }>(response);
  return responseDTO.data;
};

export const GetVendorDashboardApi = async (): Promise<VendorDashboardDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/dashboard`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: VendorDashboardDto }>(response);
  return responseDTO.data;
};
