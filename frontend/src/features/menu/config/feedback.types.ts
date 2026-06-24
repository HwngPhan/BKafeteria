export interface FeedbackDto {
  feedbackId: string;
  comment?: string;
  rating: number;
  userId: string;
  menuItemId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackRequest {
  menuItemId: string;
  comment?: string;
  rating: number;
}

export interface UpdateFeedbackRequest {
  comment?: string;
  rating: number;
}
