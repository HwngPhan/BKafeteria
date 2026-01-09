package com.example.vendor_service.dtos.VendorDtos.Response;

import com.example.shared.enums.VendorStatus;

import java.time.LocalDateTime;
import java.time.LocalTime;

public class CreateVendorResponse {
    private String vendorId;
    private String name;
    private String description;
    private VendorStatus status;

    private LocalTime workingHourFrom;
    private LocalTime workingHourTo;
    private String certification;


    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
