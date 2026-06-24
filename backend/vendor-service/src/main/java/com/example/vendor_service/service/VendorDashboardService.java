package com.example.vendor_service.service;

import com.example.shared.enums.OrderStatus;
import com.example.vendor_service.dtos.VendorDashboardDto;
import com.example.vendor_service.model.MenuItem;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.model.VendorOrderNotification;
import com.example.vendor_service.repository.VendorOrderNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorDashboardService {

    private final VendorOrderNotificationRepository notificationRepository;

    public VendorDashboardDto buildDashboard(List<Vendor> vendors) {
        List<String> vendorIds = vendors.stream().map(Vendor::getVendorId).toList();
        String vendorName = vendors.size() == 1 ? vendors.get(0).getName() : vendors.size() + " vendors";
        String vendorId = vendors.size() == 1 ? vendors.get(0).getVendorId() : null;

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        List<VendorOrderNotification> completedAll = notificationRepository
                .findByVendorIdInAndStatus(vendorIds, OrderStatus.COMPLETED);
        List<VendorOrderNotification> completedToday = notificationRepository
                .findByVendorIdInAndStatusAndCreatedAtAfter(vendorIds, OrderStatus.COMPLETED, todayStart);
        List<VendorOrderNotification> completedWeek = notificationRepository
                .findByVendorIdInAndStatusAndCreatedAtAfter(vendorIds, OrderStatus.COMPLETED, weekStart);
        List<VendorOrderNotification> completedMonth = notificationRepository
                .findByVendorIdInAndStatusAndCreatedAtAfter(vendorIds, OrderStatus.COMPLETED, monthStart);
        List<VendorOrderNotification> recent50 = notificationRepository
                .findTop50ByVendorIdInOrderByCreatedAtDesc(vendorIds);

        long total = notificationRepository.countByVendorIdIn(vendorIds);
        long completed = notificationRepository.countByVendorIdInAndStatus(vendorIds, OrderStatus.COMPLETED);
        long canceled = notificationRepository.countByVendorIdInAndStatus(vendorIds, OrderStatus.CANCELED);
        long pending = notificationRepository.countByVendorIdInAndStatus(vendorIds, OrderStatus.PENDING);
        long processing = notificationRepository.countByVendorIdInAndStatus(vendorIds, OrderStatus.PROCESSING);
        long purchased = notificationRepository.countByVendorIdInAndStatus(vendorIds, OrderStatus.PURCHASED);

        double avgOrderValue = completedAll.isEmpty() ? 0.0 :
                calcIncome(completedAll) / completedAll.size();

        double avgPrepMinutes = completedAll.stream()
                .filter(n -> n.getReadyAt() != null && n.getCreatedAt() != null)
                .mapToLong(n -> Duration.between(n.getCreatedAt(), n.getReadyAt()).toMinutes())
                .average()
                .orElse(0.0);

        return VendorDashboardDto.builder()
                .vendorId(vendorId)
                .vendorName(vendorName)
                .todayIncome(calcIncome(completedToday))
                .weekIncome(calcIncome(completedWeek))
                .monthIncome(calcIncome(completedMonth))
                .totalOrders(total)
                .completedOrders(completed)
                .canceledOrders(canceled)
                .pendingOrders(pending)
                .processingOrders(processing)
                .purchasedOrders(purchased)
                .averageOrderValue(avgOrderValue)
                .averagePrepTimeMinutes(avgPrepMinutes)
                .topDishes(topDishes(recent50))
                .build();
    }

    private double calcIncome(List<VendorOrderNotification> orders) {
        return orders.stream()
                .filter(n -> n.getMenuItems() != null)
                .flatMap(n -> n.getMenuItems().stream())
                .mapToDouble(item -> item.getPrice() != null && item.getQuantity() != null
                        ? item.getPrice() * item.getQuantity() : 0.0)
                .sum();
    }

    private List<VendorDashboardDto.DishFrequency> topDishes(List<VendorOrderNotification> recent50) {
        Map<String, int[]> quantityMap = new HashMap<>();
        Map<String, String> nameMap = new HashMap<>();

        for (VendorOrderNotification n : recent50) {
            if (n.getMenuItems() == null) continue;
            for (MenuItem item : n.getMenuItems()) {
                if (item.getItemId() == null) continue;
                quantityMap.computeIfAbsent(item.getItemId(), k -> new int[]{0})[0] +=
                        item.getQuantity() != null ? item.getQuantity() : 1;
                nameMap.putIfAbsent(item.getItemId(), item.getItemName());
            }
        }

        return quantityMap.entrySet().stream()
                .map(e -> VendorDashboardDto.DishFrequency.builder()
                        .itemId(e.getKey())
                        .itemName(nameMap.get(e.getKey()))
                        .totalQuantity(e.getValue()[0])
                        .build())
                .sorted(Comparator.comparingInt(VendorDashboardDto.DishFrequency::getTotalQuantity).reversed())
                .collect(Collectors.toList());
    }
}
