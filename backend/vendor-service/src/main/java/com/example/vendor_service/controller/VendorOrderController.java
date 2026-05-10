package com.example.vendor_service.controller;

import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import com.example.shared.dtos.PageDtos.PageDto;
import com.example.shared.dtos.PageDtos.PageDtoConverter;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.model.VendorOrderNotification;
import com.example.vendor_service.repository.VendorOrderNotificationRepository;
import com.example.vendor_service.service.VendorOrderStatusService;
import com.example.vendor_service.service.VendorService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/vendor-orders")
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class VendorOrderController {

    private final VendorOrderNotificationRepository notificationRepository;
    private final VendorOrderStatusService vendorOrderStatusService;
    private final VendorService vendorService;
    private final PageDtoConverter pageDtoConverter;

    @GetMapping("/notifications")
    @PreAuthorize("hasAnyRole('MANAGER','STAFF')")
    public ResponseEntity<ApiResponse<List<VendorOrderNotification>>> getOrderNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            List<Vendor> vendors = vendorService.getVendorsByManagerId(userDetails.getId());
            if (vendors.isEmpty()) {
                return ResponseEntity
                        .ok(new ApiResponse<>(404, "No vendor associated with this manager", Collections.emptyList()));
            }
            List<VendorOrderNotification> notifications = vendors.stream()
                    .flatMap(v -> notificationRepository.findByVendorId(v.getVendorId()).stream())
                    .toList();
            return ResponseEntity.ok(new ApiResponse<>(200, "OK", notifications));
        } catch (Exception e) {
            log.error("Error retrieving order notifications for manager: {}", userDetails.getId(), e);
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(500, "Failed to retrieve order notifications", null));
        }
    }

    @PostMapping("/{vendorOrderId}/confirm")
    @PreAuthorize("hasAnyRole('MANAGER','STAFF')")
    public ResponseEntity<ApiResponse<VendorOrderNotification>> confirmOrder(
            @PathVariable String vendorOrderId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            VendorOrderNotification updated = vendorOrderStatusService.confirmOrder(vendorOrderId, userDetails.getId());
            return ResponseEntity.ok(new ApiResponse<>(200, "Order confirmed", updated));
        } catch (RuntimeException e) {
            log.error("Failed to confirm order: {}", vendorOrderId, e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @PostMapping("/{vendorOrderId}/mark-finished")
    @PreAuthorize("hasAnyRole('MANAGER','STAFF')")
    public ResponseEntity<ApiResponse<VendorOrderNotification>> markFinished(
            @PathVariable String vendorOrderId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            VendorOrderNotification updated = vendorOrderStatusService.markFinished(vendorOrderId, userDetails.getId());
            return ResponseEntity.ok(new ApiResponse<>(200, "Order marked as finished", updated));
        } catch (RuntimeException e) {
            log.error("Failed to mark finished: {}", vendorOrderId, e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @GetMapping("/health")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Vendor order service is healthy and listening to Kafka topic 'vendor-orders'",
                null));
    }

    @GetMapping("/get-vendor-order")
    @PreAuthorize("hasAnyRole('MANAGER','STAFF')")
    public ResponseEntity<ApiResponse<PageDto<VendorOrderNotification>>> getVendorOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String statuses) {
        try {
            List<Vendor> vendors = vendorService.getVendorsByManagerId(userDetails.getId());
            if (vendors.isEmpty()) {
                return ResponseEntity
                        .ok(new ApiResponse<>(404, "No vendor associated with this manager", PageDto.empty()));
            }
            List<String> vendorIds = vendors.stream().map(Vendor::getVendorId).toList();
            Sort sort = direction.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<VendorOrderNotification> vendorOrders;
            if (statuses != null && !statuses.isBlank()) {
                List<com.example.shared.enums.OrderStatus> statusList = Arrays.stream(statuses.split(","))
                        .map(com.example.shared.enums.OrderStatus::valueOf)
                        .collect(Collectors.toList());
                vendorOrders = notificationRepository.findByVendorIdInAndStatusIn(vendorIds, statusList, pageable);
            } else {
                vendorOrders = notificationRepository.findByVendorIdIn(vendorIds, pageable);
            }
            return ResponseEntity.ok(
                    new ApiResponse<>(200, "Vendor orders retrieved successfully", pageDtoConverter.convert(vendorOrders)));
        } catch (Exception e) {
            log.error("Error retrieving vendor orders for manager: {}", userDetails.getId(), e);
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(500, "Failed to retrieve vendor orders", null));
        }
    }

    // Processing
    // Cancelled
    // + role Staff to update status
}
