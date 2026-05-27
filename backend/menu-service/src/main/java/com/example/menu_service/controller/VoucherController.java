package com.example.menu_service.controller;

import com.example.menu_service.dtos.Request.CreateVoucherRequest;
import com.example.menu_service.dtos.Request.UpdateVoucherRequest;
import com.example.menu_service.dtos.Request.ValidateVoucherRequest;
import com.example.menu_service.dtos.VoucherDto;
import com.example.menu_service.service.VoucherService;
import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.example.menu_service.helper.IamClient;
import com.example.menu_service.dtos.UserInfoDto;

import java.util.List;

@RestController
@RequestMapping("/vouchers")
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;
    private final IamClient iamClient;
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER')")
    public ResponseEntity<ApiResponse<VoucherDto>> create(
            @RequestBody @Valid CreateVoucherRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            UserInfoDto userInfo = iamClient.getUserInfo(userDetails.getId());
            VoucherDto dto = voucherService.createVoucher(request, userInfo.getVendorId());
            return new ResponseEntity<>(new ApiResponse<>(201, "Voucher created successfully", dto), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error creating voucher: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(500, "Failed to create voucher", null));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<VoucherDto>> getById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(200, "Voucher retrieved", voucherService.getById(id)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error retrieving voucher {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(500, "Failed to retrieve voucher", null));
        }
    }

    @GetMapping("/vendor/{vendorId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<VoucherDto>>> getByVendor(@PathVariable String vendorId) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(200, "Vouchers retrieved",
                    voucherService.getByVendorId(vendorId)));
        } catch (Exception e) {
            log.error("Error retrieving vouchers for vendor {}: {}", vendorId, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(500, "Failed to retrieve vouchers", null));
        }
    }

    /**
     * Validates a voucher against an order's vendor list.
     * The client passes the vendorIds present in the order — no cross-service call needed.
     * Returns the voucher (including discountAmount) if valid; 400 otherwise.
     */
    @PostMapping("/validate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<VoucherDto>> validate(
            @RequestBody @Valid ValidateVoucherRequest request) {
        try {
            VoucherDto dto = voucherService.validate(request.getVoucherId(), request.getVendorIds());
            return ResponseEntity.ok(new ApiResponse<>(200, "Voucher is valid", dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error validating voucher {}: {}", request.getVoucherId(), e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(500, "Failed to validate voucher", null));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VoucherDto>> update(
            @PathVariable String id,
            @RequestBody @Valid UpdateVoucherRequest request) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(200, "Voucher updated successfully", voucherService.updateVoucher(id, request)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error updating voucher {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(500, "Failed to update voucher", null));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            voucherService.deleteVoucher(id);
            return ResponseEntity.ok(new ApiResponse<>(200, "Voucher deleted", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error deleting voucher {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(500, "Failed to delete voucher", null));
        }
    }
}
