package com.example.iam_service.dtos.AuthDtos.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerificationRequest {
    @NotBlank
    private String otp;
    @NotBlank
    private String email;
}