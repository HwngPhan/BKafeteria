package com.example.vendor_service.service;

import com.example.shared.enums.OrderStatus;
import com.example.vendor_service.helper.producer.KafkaProducerService;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.model.VendorOrderNotification;
import com.example.vendor_service.repository.VendorOrderNotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendorOrderStatusServiceTest {

    @Mock private VendorOrderNotificationRepository notificationRepository;
    @Mock private VendorService vendorService;
    @Mock private KafkaProducerService kafkaProducerService;

    @InjectMocks
    private VendorOrderStatusService service;

    private VendorOrderNotification buildRow(String vendorOrderId, String vendorId) {
        VendorOrderNotification row = new VendorOrderNotification();
        row.setVendorOrderId(vendorOrderId);
        row.setOrderId("order1");
        row.setVendorId(vendorId);
        row.setCustomerId("customer1");
        row.setStatus(OrderStatus.PURCHASED);
        return row;
    }

    private Vendor buildVendor(String id, String managerId) {
        Vendor v = new Vendor();
        v.setVendorId(id);
        v.setManagerId(managerId);
        return v;
    }

    // ─── confirmOrder ────────────────────────────────────────────────────────────

    @Test
    void confirmOrder_success() {
        VendorOrderNotification row = buildRow("vo1", "v1");
        when(notificationRepository.findById("vo1")).thenReturn(Optional.of(row));
        when(vendorService.getVendorById("v1")).thenReturn(buildVendor("v1", "mgr1"));
        when(notificationRepository.save(any())).thenReturn(row);

        VendorOrderNotification result = service.confirmOrder("vo1", "mgr1");

        assertEquals(OrderStatus.PROCESSING, result.getStatus());
        verify(kafkaProducerService).sendStatusUpdate(anyString(), any());
    }

    @Test
    void confirmOrder_notFound_throws() {
        when(notificationRepository.findById("bad")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.confirmOrder("bad", "mgr1"));
    }

    @Test
    void confirmOrder_vendorNull_throws() {
        VendorOrderNotification row = buildRow("vo1", "v1");
        when(notificationRepository.findById("vo1")).thenReturn(Optional.of(row));
        when(vendorService.getVendorById("v1")).thenReturn(null);
        assertThrows(RuntimeException.class, () -> service.confirmOrder("vo1", "mgr1"));
    }

    @Test
    void confirmOrder_wrongManager_throws() {
        VendorOrderNotification row = buildRow("vo1", "v1");
        when(notificationRepository.findById("vo1")).thenReturn(Optional.of(row));
        when(vendorService.getVendorById("v1")).thenReturn(buildVendor("v1", "mgr1"));
        assertThrows(RuntimeException.class, () -> service.confirmOrder("vo1", "otherMgr"));
    }

    @Test
    void confirmOrder_kafkaFailure_doesNotThrow() {
        VendorOrderNotification row = buildRow("vo1", "v1");
        when(notificationRepository.findById("vo1")).thenReturn(Optional.of(row));
        when(vendorService.getVendorById("v1")).thenReturn(buildVendor("v1", "mgr1"));
        when(notificationRepository.save(any())).thenReturn(row);
        doThrow(new RuntimeException("kafka down")).when(kafkaProducerService)
                .sendStatusUpdate(anyString(), any());

        assertDoesNotThrow(() -> service.confirmOrder("vo1", "mgr1"));
    }

    // ─── markFinished ────────────────────────────────────────────────────────────

    @Test
    void markFinished_success() {
        VendorOrderNotification row = buildRow("vo1", "v1");
        when(notificationRepository.findById("vo1")).thenReturn(Optional.of(row));
        when(vendorService.getVendorById("v1")).thenReturn(buildVendor("v1", "mgr1"));
        when(notificationRepository.save(any())).thenReturn(row);

        VendorOrderNotification result = service.markFinished("vo1", "mgr1");

        assertEquals(OrderStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getReadyAt());
        verify(kafkaProducerService).sendStatusUpdate(anyString(), any());
    }

    @Test
    void markFinished_notFound_throws() {
        when(notificationRepository.findById("bad")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.markFinished("bad", "mgr1"));
    }

    @Test
    void markFinished_wrongManager_throws() {
        VendorOrderNotification row = buildRow("vo1", "v1");
        when(notificationRepository.findById("vo1")).thenReturn(Optional.of(row));
        when(vendorService.getVendorById("v1")).thenReturn(buildVendor("v1", "mgr1"));
        assertThrows(RuntimeException.class, () -> service.markFinished("vo1", "wrongMgr"));
    }

    @Test
    void markFinished_kafkaFailure_doesNotThrow() {
        VendorOrderNotification row = buildRow("vo1", "v1");
        when(notificationRepository.findById("vo1")).thenReturn(Optional.of(row));
        when(vendorService.getVendorById("v1")).thenReturn(buildVendor("v1", "mgr1"));
        when(notificationRepository.save(any())).thenReturn(row);
        doThrow(new RuntimeException("kafka down")).when(kafkaProducerService)
                .sendStatusUpdate(anyString(), any());

        assertDoesNotThrow(() -> service.markFinished("vo1", "mgr1"));
    }
}
