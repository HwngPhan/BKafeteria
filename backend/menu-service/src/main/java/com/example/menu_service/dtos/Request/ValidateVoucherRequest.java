package com.example.menu_service.dtos.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ValidateVoucherRequest {
    @NotBlank
    private String voucherId;
    @NotEmpty
    private List<String> vendorIds;
}
