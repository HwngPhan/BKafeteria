import { API_GATEWAY_BASE_URL, TokenType } from "@/lib/constants";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { handleResponse } from "@/lib/handle-response";
import { throwApiError } from "@/lib/throwApiError";
import { ApiRegisterRequest, LoginRequest, LoginResponse, VerifyOtpResponse } from "../config/auth.schema";

const BASE_URL = `${API_GATEWAY_BASE_URL}/iam/auth`;

export const LoginApi = async (payload: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ message: string; data: LoginResponse }>(response);
  localStorage.setItem(TokenType.authToken, responseDTO.data.accessToken);
  return responseDTO.data;
};

export const RefreshTokenApi = async (): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/refresh`, {
    method: 'POST',
    credentials: 'include', // Send the refresh_token HTTP-only cookie
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ message: string; data: LoginResponse }>(response);
  return responseDTO.data;
};


export const RegisterApi = async (payload: ApiRegisterRequest): Promise<void> => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response);
};

export const LogoutApi = async (): Promise<void> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/logout`, {
    method: 'POST',
  });
  if (!response.ok) await throwApiError(response);
};

export const SendOtpApi = async (email: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) await throwApiError(response);
};

export const VerifyOtpApi = async (payload: { email: string, otp: string }): Promise<VerifyOtpResponse> => {
  const response = await fetch(`${BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: VerifyOtpResponse }>(response);
  return responseDTO.data;
};

export const ResetPasswordApi = async (payload: { email: string, newPassword: string }): Promise<void> => {
  const response = await fetchWithToken(TokenType.otpToken, `${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response);
};

export const AccountActivationApi = async (token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/account-activation?token=${token}`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
};
