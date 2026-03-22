package com.example.order_service.dtos.Request;

import lombok.Data;

@Data
public class ItemRequest {
    String itemId;
    Integer quantity;
}
