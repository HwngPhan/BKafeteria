package com.example.menu_service.dtos.Request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateFeedbackRequest {
    private String comment;
    
    @NotNull(message = "Rating is required")
    private Double rating;
}
