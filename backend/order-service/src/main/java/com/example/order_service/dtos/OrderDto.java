package com.example.order_service.dtos;

import com.example.order_service.model.OrderItem;

import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(
    String orderId,
    String status,
    List<OrderItem> orderItems,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Double totalPrice,
    Boolean isDeleted        
) {}
