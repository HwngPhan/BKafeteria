import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { RefreshTokenApi } from "@/features/auth/data-access/auth.api";
import { TokenType } from "./constants";

export async function fetchWithToken(tokenType: string, input: RequestInfo, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});
  let token = getCookie(tokenType);
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  let response = await fetch(input, requestInit);

  // If token expired (401)
  if (response.status === 401 && tokenType === TokenType.authToken) {
    console.warn("Token expired → attempting refresh...");

    try {
      // 1. Call refresh token
      const refreshResult = await RefreshTokenApi();

      // 2. Save new token
      setCookie(TokenType.authToken, refreshResult.accessToken, { maxAge: 60 * 60 * 24 * 7 });

      // 3. Retry original request with new token
      const newHeaders = new Headers(init?.headers || {});
      newHeaders.set("Authorization", `Bearer ${refreshResult.accessToken}`);

      const retryInit: RequestInit = {
        ...init,
        headers: newHeaders,
      };

      console.info("Retrying original request with refreshed token...");
      return fetch(input, retryInit);
    } catch (err) {
      console.error("Refresh token failed → forcing logout");

      deleteCookie(TokenType.authToken);

      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }

  return response;
}
