package com.example.vendor_service.service;

import com.example.shared.enums.OrderStatus;
import com.example.vendor_service.dtos.KafkaMessage.VendorNotificationMessage;
import com.example.vendor_service.model.MenuItem;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.model.VendorOrderNotification;
import com.example.vendor_service.repository.VendorOrderNotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendorOrderConsumerServiceTest {

    @Mock private VendorService vendorService;
    @Mock private VendorOrderNotificationRepository notificationRepository;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private VendorOrderConsumerService service;

    private VendorNotificationMessage buildMessage(String vendorId, String vendorOrderId, OrderStatus status) {
        VendorNotificationMessage msg = new VendorNotificationMessage();
        msg.setOrderId("order1");
        msg.setVendorOrderId(vendorOrderId);
        msg.setVendorId(vendorId);
        msg.setCustomerId("customer1");
        msg.setStatus(status);
        msg.setMenuItems(List.of(new MenuItem("item1", "Dish", 2, 5000.0)));
        return msg;
    }

    private Vendor buildVendor(String id) {
        Vendor v = new Vendor();
        v.setVendorId(id);
        v.setManagerId("mgr1");
        return v;
    }

    // ─── new PURCHASED order ─────────────────────────────────────────────────────

    @Test
    void handleVendorOrderNotification_newOrder_savesAndPushes() {
        when(vendorService.getVendorById("v1")).thenReturn(buildVendor("v1"));

        VendorNotificationMessage msg = buildMessage("v1", "vo1", OrderStatus.PURCHASED);
        service.handleVendorOrderNotification(msg);

        verify(notificationRepository).save(argThat(n -> "vo1".equals(n.getVendorOrderId())));
        verify(messagingTemplate).convertAndSend(eq("/topic/vendor/v1"), eq(msg));
    }

    // ─── CANCELED order ──────────────────────────────────────────────────────────

    @Test
    void handleVendorOrderNotification_canceled_updatesExistingRow() {
        VendorOrderNotification existing = new VendorOrderNotification();
        existing.setVendorOrderId("vo1");
        existing.setStatus(OrderStatus.PURCHASED);

        when(vendorService.getVendorById("v1")).thenReturn(buildVendor("v1"));
        when(notificationRepository.findById("vo1")).thenReturn(Optional.of(existing));

        VendorNotificationMessage msg = buildMessage("v1", "vo1", OrderStatus.CANCELED);
        service.handleVendorOrderNotification(msg);

        verify(notificationRepository).save(argThat(n -> n.getStatus() == OrderStatus.CANCELED));
        verify(messagingTemplate).convertAndSend(eq("/topic/vendor/v1"), eq(msg));
    }

    @Test
    void handleVendorOrderNotification_canceled_nullVendorOrderId_skipsUpdate() {
        when(vendorService.getVendorById("v1")).thenReturn(buildVendor("v1"));

        VendorNotificationMessage msg = buildMessage("v1", null, OrderStatus.CANCELED);
        service.handleVendorOrderNotification(msg);

        // Early return when vendorOrderId is null — nothing saved, no WS push
        verify(notificationRepository, never()).save(any());
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    // ─── vendor not found ────────────────────────────────────────────────────────

    @Test
    void handleVendorOrderNotification_vendorNotFound_doesNotSave() {
        when(vendorService.getVendorById("unknown")).thenReturn(null);

        VendorNotificationMessage msg = buildMessage("unknown", "vo1", OrderStatus.PURCHASED);
        service.handleVendorOrderNotification(msg);

        verify(notificationRepository, never()).save(any());
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    // ─── PROCESSING status (non-CANCELED, non-new) ───────────────────────────────

    @Test
    void handleVendorOrderNotification_processingStatus_savesNewRow() {
        when(vendorService.getVendorById("v1")).thenReturn(buildVendor("v1"));

        VendorNotificationMessage msg = buildMessage("v1", "vo2", OrderStatus.PROCESSING);
        service.handleVendorOrderNotification(msg);

        verify(notificationRepository).save(argThat(n -> "vo2".equals(n.getVendorOrderId())));
    }
}
