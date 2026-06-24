package com.example.menu_service.dtos.Request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateVoucherRequest {
    @NotNull
    private Double discountPercentage;
    @NotNull
    private LocalDateTime startDate;
    @NotNull
    private LocalDateTime expiryDate;
}
