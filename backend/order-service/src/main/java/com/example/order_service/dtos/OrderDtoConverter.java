package com.example.order_service.dtos;

import com.example.order_service.model.Order;
import org.springframework.stereotype.Component;

@Component
public class OrderDtoConverter {
    public OrderDto convert(Order order){
        return new OrderDto(
            order.getOrderId(),
            order.getStatus().name(),
            order.getOrderItems(),
            order.getCreatedAt(),
            order.getUpdatedAt(),
            order.getTotalPrice(),
            order.getCustomerId(),
            order.getIsDeleted()
        );
    }
}
