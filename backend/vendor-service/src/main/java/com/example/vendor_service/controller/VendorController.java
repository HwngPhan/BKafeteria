package com.example.vendor_service.controller;

import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;

import com.example.vendor_service.dtos.VendorDtos.Request.CreateVendorRequest;

import com.example.vendor_service.dtos.VendorDtos.VendorDto;
import com.example.vendor_service.dtos.VendorDtos.VendorDtoConverter;
import com.example.vendor_service.helper.IamClient;

import com.example.vendor_service.repository.VendorRepository;
import com.example.vendor_service.service.VendorService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vendors")
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class VendorController {


    private final VendorService vendorService;
    private final VendorDtoConverter vendorDtoConverter;
    private final IamClient iamClient;
    private final VendorRepository vendorRepository;


    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('MANAGER')")
    public ResponseEntity<ApiResponse<VendorDto>> register(@RequestBody @Valid CreateVendorRequest createVendorRequest,
                                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {

            String managerId = userDetails.getId();
            VendorDto vendorDto = vendorDtoConverter.convert(vendorService.createVendor(createVendorRequest,managerId));

            ApiResponse<VendorDto> response = new ApiResponse<>(
                    HttpStatus.CREATED.value(),
                    "Vendor registered successfully",
                    vendorDto);

//            iamClient.assignVendor(vendorDto.vendorId(), userDetails.getEmail());
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

    @PutMapping("/approve/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<VendorDto>> approveRequest(@PathVariable String id,@AuthenticationPrincipal CustomUserDetails userDetails){
        try{
            vendorService.approveVendorRequest(id,userDetails.getId());
            return ResponseEntity.ok(new ApiResponse<>(200, "Vendor request approved successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        } catch (RuntimeException e){
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(500, "Failed to approve vendor request", null));
        }

    }
}
