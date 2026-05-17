import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateFeedbackRequest, UpdateFeedbackRequest } from "../config/feedback.types";
import {
  CreateFeedbackApi,
  DeleteFeedbackApi,
  GetFeedbacksByMenuItemApi,
  GetMyFeedbacksApi,
  UpdateFeedbackApi
} from "./feedback.api";

export const feedbackKeys = {
  all: ['feedbacks'] as const,
  mine: () => [...feedbackKeys.all, 'mine'] as const,
  item: (menuItemId: string) => [...feedbackKeys.all, 'item', menuItemId] as const,
};

export const useMyFeedbacks = () => {
  return useQuery({
    queryKey: feedbackKeys.mine(),
    queryFn: GetMyFeedbacksApi,
  });
};

export const useFeedbacksByMenuItem = (menuItemId: string) => {
  return useQuery({
    queryKey: feedbackKeys.item(menuItemId),
    queryFn: () => GetFeedbacksByMenuItemApi(menuItemId),
    enabled: !!menuItemId,
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFeedbackRequest) => CreateFeedbackApi(data),
    onSuccess: (newFeedback) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.mine() });
      if (newFeedback?.menuItemId) {
        queryClient.invalidateQueries({ queryKey: feedbackKeys.item(newFeedback.menuItemId) });
      }
    },
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeedbackRequest }) => UpdateFeedbackApi(id, data),
    onSuccess: (updatedFeedback) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.mine() });
      if (updatedFeedback?.menuItemId) {
        queryClient.invalidateQueries({ queryKey: feedbackKeys.item(updatedFeedback.menuItemId) });
      }
    },
  });
};

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, menuItemId }: { id: string; menuItemId?: string }) => DeleteFeedbackApi(id).then(() => menuItemId),
    onSuccess: (menuItemId) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.mine() });
      if (menuItemId) {
        queryClient.invalidateQueries({ queryKey: feedbackKeys.item(menuItemId) });
      }
    },
  });
};
