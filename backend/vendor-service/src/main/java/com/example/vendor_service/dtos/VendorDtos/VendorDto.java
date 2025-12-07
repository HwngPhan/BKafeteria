package com.example.vendor_service.dtos.VendorDtos;

import com.example.shared.enums.VendorStatus;

import java.time.LocalDateTime;
import java.time.LocalTime;


public record VendorDto (
        String vendorId,
        String name,
        String description,
        VendorStatus status,
        LocalTime workingHourFrom,
        LocalTime workingHourTo,
//        String managerId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
//        String approvedBy
){}
