package com.example.iam_service.dtos.AuthDtos.Response;

import lombok.Data;

@Data
public class OtpVerificationResponse {
    private String otpToken;
}
