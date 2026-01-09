package com.example.vendor_service.dtos.VendorDtos.Request;

import com.example.shared.enums.VendorStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateVendorRequest {
        @NotNull(message = "Vendor name must not be null")
        private String name;

        private String description;

        private LocalTime workingHourFrom;
        private LocalTime workingHourTo;
        private String certification;
    }


