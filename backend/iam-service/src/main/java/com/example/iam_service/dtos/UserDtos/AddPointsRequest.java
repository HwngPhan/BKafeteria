package com.example.iam_service.dtos.UserDtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddPointsRequest {
    @NotNull
    private String userId;
    
    @NotNull
    private Integer points;
}
