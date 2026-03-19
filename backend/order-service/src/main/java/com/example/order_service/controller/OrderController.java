package com.example.order_service.controller;


import com.example.order_service.dtos.OrderDto;
import com.example.order_service.dtos.OrderDtoConverter;
import com.example.order_service.model.Order;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.service.OrderService;
import com.example.shared.dtos.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final OrderRepository orderRepository;

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
}
