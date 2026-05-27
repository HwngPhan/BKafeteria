import { RefreshTokenApi } from "@/features/auth/data-access/auth.api";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { TokenType } from "./constants";

function prepareHeaders(init?: RequestInit, token?: string | null): Headers {
  const headers = new Headers(init?.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Automatically set Content-Type to application/json if there's a body and it's a string
  if (
    init?.body &&
    typeof init.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

export async function fetchWithToken(
  tokenType: string,
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const token = getCookie(tokenType) as string | null;
  const headers = prepareHeaders(init, token);

  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  const response = await fetch(input, requestInit);

  // If token expired (401)
  if (response.status === 401 && tokenType === TokenType.authToken) {
    console.warn("Token expired → attempting refresh...");

    try {
      // 1. Call refresh token
      const refreshResult = await RefreshTokenApi();

      // 2. Save new token
      setCookie(TokenType.authToken, refreshResult.accessToken, {
        maxAge: 60 * 60 * 24 * 7,
      });

      // 3. Retry original request with new token
      const retryHeaders = prepareHeaders(init, refreshResult.accessToken);

      const retryInit: RequestInit = {
        ...init,
        headers: retryHeaders,
      };

      console.info("Retrying original request with refreshed token...");
      return fetch(input, retryInit);
    } catch {
      // Refresh token failed → forcing logout

      deleteCookie(TokenType.authToken);

      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }

  return response;
}
