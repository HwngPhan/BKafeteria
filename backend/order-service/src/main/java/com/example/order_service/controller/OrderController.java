package com.example.order_service.controller;

import com.example.order_service.dtos.*;
import com.example.order_service.dtos.Request.OrderRequest;
import com.example.order_service.dtos.Request.PaymentRequest;
import com.example.order_service.model.Order;
import com.example.order_service.service.OrderService;
import com.example.order_service.service.VendorOrderService;
import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import com.example.shared.dtos.PageDtos.PageDto;
import com.example.shared.dtos.PageDtos.PageDtoConverter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/orders")
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final OrderDtoConverter orderDtoConverter;
    private final VendorOrderService vendorOrderService;
    private final VendorOrderDtoConverter vendorOrderDtoConverter;
    private final PageDtoConverter pageDtoConverter;

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable String id) {
        try {
            Order order = orderService.getOrderById(id);
            if (order == null) {
                return new ResponseEntity<>(
                        new ApiResponse<>(404, "Order not found", null),
                        HttpStatus.NOT_FOUND);
            }
            List<VendorOrderDto> vendorOrders = vendorOrderService.getVendorOrdersByOrderId(id)
                    .stream()
                    .map(vendorOrderDtoConverter::convert)
                    .collect(Collectors.toList());
            OrderDto orderDto = orderDtoConverter.convert(order, vendorOrders);
            return ResponseEntity.ok(
                    new ApiResponse<>(200, "Order retrieved successfully", orderDto));
        } catch (Exception e) {
            log.error("Error retrieving order: {}", e.getMessage());
            ApiResponse<OrderDto> response = new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to retrieve order: " + e.getMessage(),
                    null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // @PutMapping("/{id}")
    // @PreAuthorize("isAuthenticated()")
    // public ResponseEntity<ApiResponse<OrderDto>> updateOrder(@PathVariable String
    // id, @RequestBody OrderDto orderDto) {
    // try{

    // return ResponseEntity.ok(
    // new ApiResponse<>(200, "Order updated successfully", orderDto)
    // );
    // }catch(Exception e){
    // log.error("Error updating order: {}", e.getMessage());
    // ApiResponse<OrderDto> response = new
    // ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to update
    // order: " + e.getMessage(), null);
    // return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    // }
    // }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(@RequestBody OrderRequest orderRequest,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {

            Order order = orderService.createOrder(orderRequest, userDetails.getId());
            OrderDto orderDto = orderDtoConverter.convert(order);
            return ResponseEntity.ok(
                    new ApiResponse<>(200, "Order created successfully", orderDto));
        } catch (Exception e) {
            log.error("Error creating order: {}", e.getMessage());
            ApiResponse<OrderDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to create order: " + e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/payment")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDto>> makePayment(@PathVariable String id,
            @RequestBody(required = false) PaymentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            List<String> voucherIds = request != null ? request.getVoucherIds() : null;
            orderService.makePayment(id, userDetails.getId(), voucherIds);
            List<VendorOrderDto> vendorOrders = vendorOrderService.getVendorOrdersByOrderId(id)
                    .stream()
                    .map(vendorOrderDtoConverter::convert)
                    .collect(Collectors.toList());
            OrderDto orderDto = orderDtoConverter.convert(orderService.getOrderById(id), vendorOrders);
            return ResponseEntity.ok(
                    new ApiResponse<>(200, "Order paid successfully", orderDto));
        } catch (Exception e) {
            log.error("Error making payment: {}", e.getMessage());
            ApiResponse<OrderDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to make payment: " + e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/customer-refund/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(@PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Order order = orderService.cancelOrder(id, userDetails.getId());
            List<VendorOrderDto> vendorOrders = vendorOrderService.getVendorOrdersByOrderId(id)
                    .stream()
                    .map(vendorOrderDtoConverter::convert)
                    .collect(Collectors.toList());
            OrderDto orderDto = orderDtoConverter.convert(order, vendorOrders);
            return ResponseEntity.ok(new ApiResponse<>(200, "Order cancelled successfully", orderDto));
        } catch (RuntimeException e) {
            log.error("Error cancelling order {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error cancelling order {}: {}", id, e.getMessage());
            return new ResponseEntity<>(
                    new ApiResponse<>(500, "Failed to cancel order: " + e.getMessage(), null),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/manager-refund/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<OrderDto>> cancelVendorOrder(@PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Order order = orderService.cancelVendorOrder(id, userDetails.getId());
            List<VendorOrderDto> vendorOrders = vendorOrderService.getVendorOrdersByOrderId(order.getOrderId())
                    .stream()
                    .map(vendorOrderDtoConverter::convert)
                    .collect(Collectors.toList());
            OrderDto orderDto = orderDtoConverter.convert(order, vendorOrders);
            return ResponseEntity.ok(new ApiResponse<>(200, "Vendor order cancelled successfully", orderDto));
        } catch (RuntimeException e) {
            log.error("Error cancelling vendor order {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error cancelling vendor order {}: {}", id, e.getMessage());
            return new ResponseEntity<>(
                    new ApiResponse<>(500, "Failed to cancel vendor order: " + e.getMessage(), null),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get-my-order")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageDto<OrderDto>>> getOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Sort sort = direction.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();
            Page<Order> orders = orderService.getOrders(userDetails.getId(), PageRequest.of(page, size, sort));
            PageDto<OrderDto> result = pageDtoConverter.convert(orders, order -> {
                List<VendorOrderDto> vendorOrders = vendorOrderService.getVendorOrdersByOrderId(order.getOrderId())
                        .stream()
                        .map(vendorOrderDtoConverter::convert)
                        .collect(Collectors.toList());
                return orderDtoConverter.convert(order, vendorOrders);
            });
            return ResponseEntity.ok(new ApiResponse<>(200, "Orders retrieved successfully", result));
        } catch (Exception e) {
            log.error("Error retrieving orders: {}", e.getMessage());
            ApiResponse<PageDto<OrderDto>> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to retrieve orders: " + e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // get order theo vendor
    // @GetMapping("/get-vendor-order")
    // @PreAuthorize("isAuthenticated()")
    // public ResponseEntity<ApiResponse<List<VendorOrderDto>>> getVendorOrders(
    // @AuthenticationPrincipal CustomUserDetails userDetails) {
    // try {
    // List<VendorOrder> vendorOrders =
    // vendorOrderService.getVendorOrdersByVendorId(userDetails.getId());
    // List<VendorOrderDto> vendorOrderDtos =
    // vendorOrderDtoConverter.convert(vendorOrders);
    // return ResponseEntity.ok(
    // new ApiResponse<>(200, "Vendor orders retrieved successfully",
    // vendorOrderDtos));
    // } catch (Exception e) {
    // log.error("Error retrieving vendor orders: {}", e.getMessage());
    // ApiResponse<List<VendorOrderDto>> response = new
    // ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
    // "Failed to retrieve vendor orders: " + e.getMessage(), null);
    // return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    // }
    // }
}
