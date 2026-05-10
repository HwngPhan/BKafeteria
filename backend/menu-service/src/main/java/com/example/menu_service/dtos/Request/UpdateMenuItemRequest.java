package com.example.menu_service.dtos.Request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateMenuItemRequest {
    @NotNull(message = "Menu item name cannot be null")
    private String name;
    private String description;
    private double price;
    private Integer remaining;
    private String category;
}
