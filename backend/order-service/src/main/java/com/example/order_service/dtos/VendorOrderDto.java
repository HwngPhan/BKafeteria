package com.example.order_service.dtos;

import com.example.order_service.model.MenuItem;
import com.example.shared.enums.OrderStatus;

import java.util.List;

public record VendorOrderDto(
                String vendorOrderId,
                String vendorId,
                String orderId,
                OrderStatus status,
                Double vendorPrice,
                List<MenuItem> orderItems) {
}
