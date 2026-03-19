package com.example.order_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrderItem {
    private String vendorId;
    private String vendorName;
    private List<MenuItem> menuItems;
    private Double vendorPrice;
}
