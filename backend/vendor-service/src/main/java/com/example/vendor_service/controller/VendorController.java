package com.example.vendor_service.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import com.example.vendor_service.dtos.VendorDtos.VendorDto;
import com.example.vendor_service.dtos.VendorDtos.VendorDtoConverter;
import com.example.vendor_service.dtos.VendorDtos.Request.CreateVendorRequest;
import com.example.vendor_service.dtos.VendorDtos.Request.UpdateVendorRequest;
import com.example.vendor_service.helper.IamClient;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.repository.VendorRepository;
import com.example.vendor_service.service.VendorService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
            iamClient.assignVendor(vendorDto.vendorId(), userDetails.getEmail(), "MANAGER");
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

    @GetMapping("/get-my-vendor")
    @PreAuthorize("hasAnyRole('MANAGER')")
    public ResponseEntity<ApiResponse<VendorDto>> getMyVendor(@AuthenticationPrincipal CustomUserDetails userDetails){
        try{
            Vendor vendor = vendorService.getVendorByManagerId(userDetails.getId());
            if (vendor == null) {
                throw new RuntimeException("Vendor not found for manager ID: " + userDetails.getId());
            }
            VendorDto vendorDto = vendorDtoConverter.convert(vendor);
            return ResponseEntity.ok(new ApiResponse<>(200, "Vendor retrieved successfully", vendorDto));
        } catch (RuntimeException e){
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(500, "Failed to retrieve vendor", null));
        }

    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<VendorDto>>> getAllVendors() {
        List<VendorDto> vendors = vendorService.getAllVendors()
                .stream()
                .map(vendorDtoConverter::convert)
                .toList();

        return ResponseEntity.ok(
                new ApiResponse<>(200, "All vendors retrieved successfully", vendors)
        );
    }

    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<VendorDto>>> getActiveVendors() {
        List<VendorDto> vendors = vendorService.getAllActiveVendors()
                .stream()
                .map(vendorDtoConverter::convert)
                .toList();

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Active vendors retrieved successfully", vendors)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER')")
    public ResponseEntity<ApiResponse<VendorDto>> updateVendor(@PathVariable String id,
                                                               @RequestBody @Valid UpdateVendorRequest request,
                                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            VendorDto vendorDto = vendorDtoConverter.convert(
                    vendorService.updateVendor(id, request, userDetails.getId()));
            return ResponseEntity.ok(new ApiResponse<>(200, "Vendor updated successfully", vendorDto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(500, "Failed to update vendor", null));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<VendorDto>> getVendorById(@PathVariable String id) {
        try{
            Vendor vendor = vendorService.getVendorById(id);
            if (vendor == null) {
                throw new RuntimeException("Vendor not found for ID: " + id);
            }
            VendorDto vendorDto = vendorDtoConverter.convert(vendor);
            return ResponseEntity.ok(new ApiResponse<>(200, "Vendor retrieved successfully", vendorDto));
        } catch (RuntimeException e){
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(500, "Failed to retrieve vendor", null));
        }
    }
}
