package com.example.vendor_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorDashboardDto {

    private String vendorId;
    private String vendorName;

    // Income
    private Double todayIncome;
    private Double weekIncome;
    private Double monthIncome;

    // Order counts
    private long totalOrders;
    private long completedOrders;
    private long canceledOrders;
    private long pendingOrders;
    private long processingOrders;
    private long purchasedOrders;

    // Derived
    private Double averageOrderValue;
    private Double averagePrepTimeMinutes;

    // Most popular dishes (from recent 50 orders)
    private List<DishFrequency> topDishes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DishFrequency {
        private String itemId;
        private String itemName;
        private int totalQuantity;
    }
}
