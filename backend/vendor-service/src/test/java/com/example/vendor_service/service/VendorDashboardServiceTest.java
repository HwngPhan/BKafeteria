package com.example.vendor_service.service;

import com.example.shared.enums.OrderStatus;
import com.example.vendor_service.dtos.VendorDashboardDto;
import com.example.vendor_service.model.MenuItem;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.model.VendorOrderNotification;
import com.example.vendor_service.repository.VendorOrderNotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendorDashboardServiceTest {

    @Mock private VendorOrderNotificationRepository notificationRepository;

    @InjectMocks
    private VendorDashboardService dashboardService;

    private Vendor buildVendor(String id, String name) {
        Vendor v = new Vendor();
        v.setVendorId(id);
        v.setName(name);
        v.setManagerId("mgr1");
        return v;
    }

    private VendorOrderNotification buildNotification(String vendorId, OrderStatus status,
                                                       double price, int qty, String itemId) {
        VendorOrderNotification n = new VendorOrderNotification();
        n.setVendorOrderId("vo-" + vendorId);
        n.setVendorId(vendorId);
        n.setStatus(status);
        n.setCreatedAt(LocalDateTime.now());

        MenuItem item = new MenuItem(itemId, "Item " + itemId, qty, price);
        n.setMenuItems(List.of(item));
        return n;
    }

    // ─── buildDashboard ──────────────────────────────────────────────────────────

    @Test
    void buildDashboard_singleVendor_usesVendorNameAndId() {
        Vendor vendor = buildVendor("v1", "Canteen A");
        List<String> ids = List.of("v1");

        stubAllRepoCallsEmpty(ids);

        VendorDashboardDto dto = dashboardService.buildDashboard(List.of(vendor));

        assertEquals("v1", dto.getVendorId());
        assertEquals("Canteen A", dto.getVendorName());
    }

    @Test
    void buildDashboard_multipleVendors_nullIdAndCountName() {
        Vendor v1 = buildVendor("v1", "A");
        Vendor v2 = buildVendor("v2", "B");
        List<String> ids = List.of("v1", "v2");

        stubAllRepoCallsEmpty(ids);

        VendorDashboardDto dto = dashboardService.buildDashboard(List.of(v1, v2));

        assertNull(dto.getVendorId());
        assertEquals("2 vendors", dto.getVendorName());
    }

    @Test
    void buildDashboard_computesIncome() {
        Vendor vendor = buildVendor("v1", "Canteen A");
        List<String> ids = List.of("v1");

        VendorOrderNotification n = buildNotification("v1", OrderStatus.COMPLETED, 10000.0, 2, "item1");

        when(notificationRepository.findByVendorIdInAndStatus(ids, OrderStatus.COMPLETED))
                .thenReturn(List.of(n));
        when(notificationRepository.findByVendorIdInAndStatusAndCreatedAtAfter(eq(ids), eq(OrderStatus.COMPLETED), any()))
                .thenReturn(List.of(n));
        when(notificationRepository.findTop50ByVendorIdInOrderByCreatedAtDesc(ids)).thenReturn(List.of(n));
        when(notificationRepository.countByVendorIdIn(ids)).thenReturn(1L);
        when(notificationRepository.countByVendorIdInAndStatus(eq(ids), any())).thenReturn(1L);

        VendorDashboardDto dto = dashboardService.buildDashboard(List.of(vendor));

        assertEquals(20000.0, dto.getTodayIncome());
        assertEquals(20000.0, dto.getAverageOrderValue());
    }

    @Test
    void buildDashboard_emptyNotifications_zeroIncome() {
        Vendor vendor = buildVendor("v1", "Canteen A");
        List<String> ids = List.of("v1");

        stubAllRepoCallsEmpty(ids);

        VendorDashboardDto dto = dashboardService.buildDashboard(List.of(vendor));

        assertEquals(0.0, dto.getTodayIncome());
        assertEquals(0.0, dto.getWeekIncome());
        assertEquals(0.0, dto.getMonthIncome());
        assertEquals(0.0, dto.getAverageOrderValue());
        assertTrue(dto.getTopDishes().isEmpty());
    }

    @Test
    void buildDashboard_avgPrepTime_computedFromReadyAt() {
        Vendor vendor = buildVendor("v1", "Canteen A");
        List<String> ids = List.of("v1");

        VendorOrderNotification n = buildNotification("v1", OrderStatus.COMPLETED, 10000.0, 1, "item1");
        n.setCreatedAt(LocalDateTime.now().minusMinutes(30));
        n.setReadyAt(LocalDateTime.now());

        when(notificationRepository.findByVendorIdInAndStatus(ids, OrderStatus.COMPLETED))
                .thenReturn(List.of(n));
        when(notificationRepository.findByVendorIdInAndStatusAndCreatedAtAfter(eq(ids), eq(OrderStatus.COMPLETED), any()))
                .thenReturn(Collections.emptyList());
        when(notificationRepository.findTop50ByVendorIdInOrderByCreatedAtDesc(ids))
                .thenReturn(Collections.emptyList());
        when(notificationRepository.countByVendorIdIn(ids)).thenReturn(1L);
        when(notificationRepository.countByVendorIdInAndStatus(eq(ids), any())).thenReturn(0L);

        VendorDashboardDto dto = dashboardService.buildDashboard(List.of(vendor));

        assertEquals(30.0, dto.getAveragePrepTimeMinutes(), 1.0);
    }

    // ─── topDishes ───────────────────────────────────────────────────────────────

    @Test
    void buildDashboard_topDishes_sortedByQuantityDesc() {
        Vendor vendor = buildVendor("v1", "Canteen A");
        List<String> ids = List.of("v1");

        VendorOrderNotification n1 = buildNotification("v1", OrderStatus.COMPLETED, 5000.0, 3, "item1");
        VendorOrderNotification n2 = buildNotification("v1", OrderStatus.COMPLETED, 5000.0, 7, "item2");

        when(notificationRepository.findByVendorIdInAndStatus(ids, OrderStatus.COMPLETED))
                .thenReturn(List.of(n1, n2));
        when(notificationRepository.findByVendorIdInAndStatusAndCreatedAtAfter(eq(ids), eq(OrderStatus.COMPLETED), any()))
                .thenReturn(Collections.emptyList());
        when(notificationRepository.findTop50ByVendorIdInOrderByCreatedAtDesc(ids))
                .thenReturn(List.of(n1, n2));
        when(notificationRepository.countByVendorIdIn(ids)).thenReturn(2L);
        when(notificationRepository.countByVendorIdInAndStatus(eq(ids), any())).thenReturn(1L);

        VendorDashboardDto dto = dashboardService.buildDashboard(List.of(vendor));

        List<VendorDashboardDto.DishFrequency> topDishes = dto.getTopDishes();
        assertEquals(2, topDishes.size());
        assertEquals("item2", topDishes.get(0).getItemId());
        assertEquals(7, topDishes.get(0).getTotalQuantity());
        assertEquals("item1", topDishes.get(1).getItemId());
    }

    @Test
    void buildDashboard_topDishes_nullMenuItems_skipped() {
        Vendor vendor = buildVendor("v1", "Canteen A");
        List<String> ids = List.of("v1");

        VendorOrderNotification n = new VendorOrderNotification();
        n.setVendorOrderId("vo1");
        n.setVendorId("v1");
        n.setStatus(OrderStatus.COMPLETED);
        n.setCreatedAt(LocalDateTime.now());
        n.setMenuItems(null);

        when(notificationRepository.findByVendorIdInAndStatus(ids, OrderStatus.COMPLETED))
                .thenReturn(Collections.emptyList());
        when(notificationRepository.findByVendorIdInAndStatusAndCreatedAtAfter(eq(ids), eq(OrderStatus.COMPLETED), any()))
                .thenReturn(Collections.emptyList());
        when(notificationRepository.findTop50ByVendorIdInOrderByCreatedAtDesc(ids)).thenReturn(List.of(n));
        when(notificationRepository.countByVendorIdIn(ids)).thenReturn(0L);
        when(notificationRepository.countByVendorIdInAndStatus(eq(ids), any())).thenReturn(0L);

        VendorDashboardDto dto = dashboardService.buildDashboard(List.of(vendor));
        assertTrue(dto.getTopDishes().isEmpty());
    }

    // ─── private stub helper ─────────────────────────────────────────────────────

    private void stubAllRepoCallsEmpty(List<String> ids) {
        when(notificationRepository.findByVendorIdInAndStatus(ids, OrderStatus.COMPLETED))
                .thenReturn(Collections.emptyList());
        when(notificationRepository.findByVendorIdInAndStatusAndCreatedAtAfter(eq(ids), eq(OrderStatus.COMPLETED), any()))
                .thenReturn(Collections.emptyList());
        when(notificationRepository.findTop50ByVendorIdInOrderByCreatedAtDesc(ids))
                .thenReturn(Collections.emptyList());
        when(notificationRepository.countByVendorIdIn(ids)).thenReturn(0L);
        when(notificationRepository.countByVendorIdInAndStatus(eq(ids), any())).thenReturn(0L);
    }
}
