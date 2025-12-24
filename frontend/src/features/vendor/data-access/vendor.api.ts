import { API_GATEWAY_BASE_URL, TokenType } from "@/lib/constants";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { handleResponse } from "@/lib/handle-response";
import { throwApiError } from "@/lib/throwApiError";
import { VendorDto, VendorEntity } from "../config/vendor.config";

const BASE_URL = `${API_GATEWAY_BASE_URL}/vendors`;

export const GetMyVendorApi = async () => {
    const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/get-my-vendor`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        await throwApiError(response);
    }

    const responseDTO = await handleResponse<{ message: string, data: VendorEntity }>(response);
    return responseDTO.data;
}

export const CreateVendorApi = async (vendorData: VendorDto) => {
    const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
    })

    if (!response.ok) {
        await throwApiError(response);
    }

    const responseDTO = await handleResponse<{ message: string, data: VendorEntity }>(response);
    return responseDTO.data;
}

export const approveVendorApi = async (vendorId: string) => {
    const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/approve/${vendorId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        await throwApiError(response);
    }

    const responseDTO = await handleResponse<{ message: string, data: VendorEntity }>(response);
    return responseDTO.data;
}