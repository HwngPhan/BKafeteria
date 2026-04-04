
// export async function fetchWithToken(input: RequestInfo, init?: RequestInit): Promise<Response> {
//     let token = localStorage.getItem("token");

//     const headers = new Headers(init?.headers || {});

//     if (token) headers.set("Authorization", `Bearer ${token}`);

//     const requestInit: RequestInit = {
//       ...init,
//       headers,
//     };

//     let response = await fetch(input, requestInit);

//     // Nếu token hết hạn (401)
//     if (response.status === 401) {
//       console.warn("Token expired → attempting refresh...");

//       try {
//         // 1. Gọi refresh token
//         const refreshResult = await RefreshTokenApi();

//         // 2. Lưu token mới
//         localStorage.setItem("token", refreshResult.accessToken);

//         // 3. Retry request với token mới
//         const newHeaders = new Headers(init?.headers || {});
//         newHeaders.set("Authorization", `Bearer ${refreshResult.accessToken}`);

//         const retryInit: RequestInit = {
//           ...init,
//           headers: newHeaders,
//         };

//         console.info("Retrying original request with refreshed token...");
//         return fetch(input, retryInit);
//       } catch (err) {
//         console.error("Refresh token failed → forcing logout");

//         localStorage.removeItem("token");

//         throw new Error("Session expired. Please log in again.");
//       }
//     }

//     return response;
//   }

export async function fetchWithToken(tokenType: string, input: RequestInfo, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});
  const token = localStorage.getItem(tokenType);
  // console.log("Fetched token:", token);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  return fetch(input, requestInit);
}
