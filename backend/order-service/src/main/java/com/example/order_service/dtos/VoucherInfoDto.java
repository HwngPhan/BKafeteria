package com.example.order_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoucherInfoDto {
    private String voucherId;
    private Double discountPercentage;
    private String vendorId;
}
