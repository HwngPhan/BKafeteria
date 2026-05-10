export async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error JSON
        const errorMessage = errorData.error || `Lỗi HTTP! Mã trạng thái: ${response.status}`;
        throw new Error(errorMessage);
    }
    return response.json() as Promise<T>;
  }