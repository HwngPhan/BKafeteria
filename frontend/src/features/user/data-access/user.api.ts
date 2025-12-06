import { API_GATEWAY_BASE_URL, TokenType } from "@/lib/constants";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { handleResponse } from "@/lib/handle-response";
import { User } from "../config/user.config";

const BASE_URL = `${API_GATEWAY_BASE_URL}/iam/users`;

export const GetMeApi = async () => {

    const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error('Fetching user info failed');
    }

    const responseDTO = await handleResponse<{ message: string, data: User }>(response);
    return responseDTO.data;
}