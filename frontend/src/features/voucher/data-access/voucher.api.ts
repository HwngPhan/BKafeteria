import { API_GATEWAY_BASE_URL, TokenType } from '@/lib/constants'
import { fetchWithToken } from '@/lib/fetchWithToken'
import { handleResponse } from '@/lib/handle-response'
import { throwApiError } from '@/lib/throwApiError'
import {
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherDto,
} from '../config/voucher.config'

const BASE_URL = `${API_GATEWAY_BASE_URL}/menu/vouchers`

export const GetVouchersByVendorApi = async (vendorId: string): Promise<VoucherDto[]> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/vendor/${vendorId}`, {
    method: 'GET',
  })
  if (!response.ok) await throwApiError(response)
  const responseDTO = await handleResponse<{ data: VoucherDto[] }>(response)
  return responseDTO.data
}

export const GetVoucherByIdApi = async (id: string): Promise<VoucherDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/${id}`, {
    method: 'GET',
  })
  if (!response.ok) await throwApiError(response)
  const responseDTO = await handleResponse<{ data: VoucherDto }>(response)
  return responseDTO.data
}

export const CreateVoucherApi = async (data: CreateVoucherRequest): Promise<VoucherDto> => {
  const response = await fetchWithToken(TokenType.authToken, BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!response.ok) await throwApiError(response)
  const responseDTO = await handleResponse<{ data: VoucherDto }>(response)
  return responseDTO.data
}

export const UpdateVoucherApi = async (
  id: string,
  data: UpdateVoucherRequest
): Promise<VoucherDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (!response.ok) await throwApiError(response)
  const responseDTO = await handleResponse<{ data: VoucherDto }>(response)
  return responseDTO.data
}

export const DeleteVoucherApi = async (id: string): Promise<void> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) await throwApiError(response)
}
