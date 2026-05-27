package com.example.menu_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoucherDto {
    private String voucherId;
    private Double discountPercentage;
    private LocalDateTime startDate;
    private LocalDateTime expiryDate;
    private String vendorId;
}
