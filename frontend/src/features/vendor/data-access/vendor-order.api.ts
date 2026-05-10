import { API_GATEWAY_BASE_URL, TokenType } from "@/lib/constants";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { handleResponse } from "@/lib/handle-response";
import { throwApiError } from "@/lib/throwApiError";
import { PageDto, VendorOrderNotification } from "../config/vendor-order.types";

const BASE_URL = `${API_GATEWAY_BASE_URL}/vendor/vendor-orders`;

export const GetVendorOrderNotificationsApi = async (): Promise<VendorOrderNotification[]> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/notifications`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: VendorOrderNotification[] }>(response);
  return responseDTO.data;
};

export const GetVendorOrdersApi = async (page = 0, size = 10, statuses?: string[]): Promise<PageDto<VendorOrderNotification>> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy: 'createdAt',
    direction: 'desc',
  });
  if (statuses?.length) params.set('statuses', statuses.join(','));
  const response = await fetchWithToken(
    TokenType.authToken,
    `${BASE_URL}/get-vendor-order?${params}`,
    { method: 'GET' }
  );
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: PageDto<VendorOrderNotification> }>(response);
  return responseDTO.data;
};

export const MarkOrderFinishedApi = async (vendorOrderId: string): Promise<VendorOrderNotification> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/${vendorOrderId}/mark-finished`, {
    method: 'POST',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: VendorOrderNotification }>(response);
  return responseDTO.data;
};
