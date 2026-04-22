package com.example.vendor_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuItem {
    private String itemId;
    private String itemName;
    private Integer quantity;
    private Double price;
}
