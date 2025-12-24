import { API_GATEWAY_BASE_URL, TokenType } from "@/lib/constants";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { handleResponse } from "@/lib/handle-response";
import { throwApiError } from "@/lib/throwApiError";
import { LoginObject, LoginResponse, RegisterObject, RegisterResponse } from "../config/auth.config";

const BASE_URL = `${API_GATEWAY_BASE_URL}/iam/auth`;

export const SendOtpApi = async (email: string) => {
    const response = await fetch(`${BASE_URL}/send-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) {
        await throwApiError(response);
    }
    const responseDTO = await handleResponse<{ message: string, data: string }>(response);
    return responseDTO.data;
}

export const VerifyOtpApi = async (payload: {email: string, otp: string}) => {
    const response = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        await throwApiError(response);
    }
    const responseDTO = await handleResponse<{ message: string, data: {
        otpToken: string
    } }>(response);
    return responseDTO.data;
}

export const ResetPasswordApi = async (payload: {email: string, newPassword: string}) => {
    const response = await fetchWithToken(TokenType.otpToken, `${BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        await throwApiError(response);
    }
    const responseDTO = await handleResponse<{ message: string, data: string }>(response);
    return responseDTO.data;
}

export const AccountActivationApi = async (token: string) => {
    const response = await fetch(`${BASE_URL}/account-activation?token=${token}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        await throwApiError(response);
    }
    const responseDTO = await handleResponse<{ message: string, data: string }>(response);
    return responseDTO.data;
}


export const LoginApi = async (payload: LoginObject) => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        await throwApiError(response);
    }
    const responseDTO = await handleResponse<LoginResponse>(response);
    return responseDTO.data;
    
};

export const LogoutApi = async () => {
    const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        await throwApiError(response);
    }
    const responseDTO = await handleResponse<{message: string; data: string}>(response);
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
        await throwApiError(response);
    }
    const responseDTO = await handleResponse<RegisterResponse>(response);
    return responseDTO;
};

// export const RefreshTokenApi = async () => {

//     const response = await fetch(`${BASE_URL}/refresh`, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         credentials: "include",
//     });

//     if (!response.ok) {
//         throw new Error("Token refresh failed");
//     }

//     const responseDTO = await handleResponse<LoginResponse>(response);
//     return responseDTO.data;
// };
