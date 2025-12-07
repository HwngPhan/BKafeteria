package com.example.vendor_service.controller;

import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;

import com.example.vendor_service.dtos.VendorDtos.Request.CreateVendorRequest;

import com.example.vendor_service.dtos.VendorDtos.VendorDto;
import com.example.vendor_service.dtos.VendorDtos.VendorDtoConverter;
import com.example.vendor_service.helper.IamClient;

import com.example.vendor_service.service.VendorService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendors")
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class VendorController {


    private final VendorService vendorService;
    private final VendorDtoConverter vendorDtoConverter;
    private final IamClient iamClient;


    @PostMapping("/create")
//    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<VendorDto>> create(@RequestBody @Valid CreateVendorRequest createVendorRequest,
                                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {

            String managerId = userDetails.getId();
            VendorDto vendorDto = vendorDtoConverter.convert(vendorService.createVendor(createVendorRequest,managerId));

            ApiResponse<VendorDto> response = new ApiResponse<>(
                    HttpStatus.CREATED.value(),
                    "Vendor registered successfully",
                    vendorDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
        catch (IllegalArgumentException e) {
            ApiResponse<VendorDto> response = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<VendorDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to create vendor", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}
