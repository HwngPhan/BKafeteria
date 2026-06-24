import { API_GATEWAY_BASE_URL, TokenType } from "@/lib/constants";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { handleResponse } from "@/lib/handle-response";
import { throwApiError } from "@/lib/throwApiError";
import { CreateFeedbackRequest, FeedbackDto, UpdateFeedbackRequest } from "../config/feedback.types";

const BASE_URL = `${API_GATEWAY_BASE_URL}/menu/feedbacks`;

export const CreateFeedbackApi = async (data: CreateFeedbackRequest): Promise<FeedbackDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: FeedbackDto }>(response);
  return responseDTO.data;
};

export const UpdateFeedbackApi = async (id: string, data: UpdateFeedbackRequest): Promise<FeedbackDto> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: FeedbackDto }>(response);
  return responseDTO.data;
};

export const DeleteFeedbackApi = async (id: string): Promise<void> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/delete/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) await throwApiError(response);
};

export const GetMyFeedbacksApi = async (): Promise<FeedbackDto[]> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/my-feedbacks`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: FeedbackDto[] }>(response);
  return responseDTO.data || [];
};

export const GetFeedbacksByMenuItemApi = async (menuItemId: string): Promise<FeedbackDto[]> => {
  const response = await fetchWithToken(TokenType.authToken, `${BASE_URL}/item/${menuItemId}`, {
    method: 'GET',
  });
  if (!response.ok) await throwApiError(response);
  const responseDTO = await handleResponse<{ data: FeedbackDto[] }>(response);
  return responseDTO.data || [];
};
