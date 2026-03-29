package com.example.order_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorInfoDto {
    String vendorId;
    String name;
    String managerId;
}
