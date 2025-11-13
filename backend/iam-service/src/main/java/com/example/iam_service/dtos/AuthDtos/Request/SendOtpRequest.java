package com.example.iam_service.dtos.AuthDtos.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendOtpRequest {
    @NotBlank
    private String email;
}
