import { API_GATEWAY_BASE_URL } from "@/lib/constants";
import { handleResponse } from "@/lib/handle-response";
import { LoginObject, LoginResponse, RegisterObject, RegisterResponse } from "../config/auth.config";

const BASE_URL = `${API_GATEWAY_BASE_URL}/iam/auth`;


export const LoginApi = async (payload: LoginObject) => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const responseDTO = await handleResponse<LoginResponse>(response);

    return responseDTO.data;
    
};

export const RegisterApi = async (payload: RegisterObject) => {
    const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('Registration failed');
    }

    console.log(response.status, response.ok);
    const text = await response.text();
    console.log(text);

    const responseDTO = await handleResponse<RegisterResponse>(response);

    return responseDTO;
};