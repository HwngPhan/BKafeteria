package com.example.order_service.controller;


import com.example.order_service.dtos.OrderDto;
import com.example.order_service.dtos.OrderDtoConverter;
import com.example.order_service.dtos.Request.OrderRequest;
import com.example.order_service.helper.IamClient;
import com.example.order_service.model.Order;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.service.OrderService;
import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable String id) {
        try{
            OrderDto orderDto = orderDtoConverter.convert(orderService.getOrderById(id));
            return ResponseEntity.ok(
                new ApiResponse<>(200, "Order retrieved successfully", orderDto)
            );
        }catch(Exception e){
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
    // public ResponseEntity<ApiResponse<OrderDto>> updateOrder(@PathVariable String id, @RequestBody OrderDto orderDto) {
    //     try{

    //         return ResponseEntity.ok(
    //             new ApiResponse<>(200, "Order updated successfully", orderDto)
    //         );
    //     }catch(Exception e){
    //         log.error("Error updating order: {}", e.getMessage());
    //         ApiResponse<OrderDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to update order: " + e.getMessage(), null);
    //         return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(@RequestBody OrderRequest orderRequest,
                                                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        try{

            Order order = orderService.createOrder(orderRequest,userDetails.getId());
            OrderDto orderDto = orderDtoConverter.convert(order);
            return ResponseEntity.ok(
                new ApiResponse<>(200, "Order created successfully", orderDto)
            );
        }catch(Exception e){
            log.error("Error creating order: {}", e.getMessage());
            ApiResponse<OrderDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to create order: " + e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/payment")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDto>> makePayment(@PathVariable String id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        try{
            orderService.makePayment(id, userDetails.getId());
            OrderDto orderDto = orderDtoConverter.convert(orderService.getOrderById(id));
            return ResponseEntity.ok(
                new ApiResponse<>(200, "Order paid successfully", orderDto)
            );
        }catch(Exception e){
            log.error("Error making payment: {}", e.getMessage());
            ApiResponse<OrderDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to make payment: " + e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get-my-order")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getOrders(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try{
            List<Order> orders = orderService.getOrders(userDetails.getId());
            List<OrderDto> orderDtos = orders.stream().map(orderDtoConverter::convert).collect(Collectors.toList());
            return ResponseEntity.ok(
                new ApiResponse<>(200, "Orders retrieved successfully", orderDtos)
            );
        }catch(Exception e){
            log.error("Error retrieving orders: {}", e.getMessage());
            ApiResponse<List<OrderDto>> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to retrieve orders: " + e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
