package com.example.order_service.dtos;

import com.example.order_service.model.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Collections;

@Component
public class OrderDtoConverter {
    public OrderDto convert(Order order, List<VendorOrderDto> vendorOrders) {
        return new OrderDto(
                order.getOrderId(),
                order.getStatus().name(),
                // order.getOrderItems(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getTotalPrice(),
                order.getCustomerId(),
                order.getIsDeleted(),
                vendorOrders);
    }

    public OrderDto convert(Order order) {
        return convert(order, Collections.emptyList());
    }
}
