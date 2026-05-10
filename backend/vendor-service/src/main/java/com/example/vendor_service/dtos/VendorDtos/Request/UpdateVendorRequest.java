package com.example.vendor_service.dtos.VendorDtos.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateVendorRequest {
    @NotBlank(message = "Vendor name must not be blank")
    private String name;

    private String description;

    private LocalTime workingHourFrom;
    private LocalTime workingHourTo;
    private String certification;
}
