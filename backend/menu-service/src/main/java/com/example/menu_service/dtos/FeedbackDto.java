package com.example.menu_service.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FeedbackDto {
    private String feedbackId;
    private String comment;
    private Double rating;
    private String userId;
    private String menuItemId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
