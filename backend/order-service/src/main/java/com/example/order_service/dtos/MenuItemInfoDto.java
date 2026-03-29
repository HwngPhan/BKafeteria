package com.example.order_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemInfoDto {
    private String menuItemId;
    private String name;
    private String description;
    private double price;
    private int remaining;
    private String category;
    private String vendorId;
}
