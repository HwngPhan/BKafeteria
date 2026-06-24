package com.example.vendor_service.service;

import com.example.shared.enums.OrderStatus;
import com.example.vendor_service.dtos.KafkaMessage.VendorNotificationMessage;
import com.example.vendor_service.model.VendorOrderNotification;
import com.example.vendor_service.repository.VendorOrderNotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class VendorOrderConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(VendorOrderConsumerService.class);

    private final VendorService vendorService;
    private final VendorOrderNotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public VendorOrderConsumerService(VendorService vendorService,
                                      VendorOrderNotificationRepository notificationRepository,
                                      SimpMessagingTemplate messagingTemplate) {
        this.vendorService = vendorService;
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(
            topics = "vendor-orders",
            groupId = "vendor-service-group",
            containerFactory = "vendorOrderKafkaListenerContainerFactory"
    )
    public void handleVendorOrderNotification(VendorNotificationMessage notification) {
        try {
            logger.info("Received order notification for vendor: {}, vendorOrder: {}, order: {}",
                    notification.getVendorId(), notification.getVendorOrderId(), notification.getOrderId());

            var vendor = vendorService.getVendorById(notification.getVendorId());
            if (vendor == null) {
                logger.error("Vendor not found for ID: {}", notification.getVendorId());
                return;
            }

            if (notification.getStatus() == OrderStatus.CANCELED) {
                String vendorOrderId = notification.getVendorOrderId();
                if (vendorOrderId == null) return;
                notificationRepository.findById(vendorOrderId).ifPresent(existing -> {
                    existing.setStatus(OrderStatus.CANCELED);
                    notificationRepository.save(existing);
                    logger.info("Marked VendorOrderNotification as CANCELED: {}", existing.getVendorOrderId());
                });
            } else {
                VendorOrderNotification row = new VendorOrderNotification();
                row.setVendorOrderId(notification.getVendorOrderId());
                row.setOrderId(notification.getOrderId());
                row.setVendorId(notification.getVendorId());
                row.setCustomerId(notification.getCustomerId());
                row.setStatus(notification.getStatus());
                row.setMenuItems(notification.getMenuItems());
                row.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(row);
            }

            messagingTemplate.convertAndSend(
                    "/topic/vendor/" + notification.getVendorId(),
                    notification
            );

            logger.info("Persisted and pushed notification for vendor: {}, vendorOrder: {}",
                    notification.getVendorId(), notification.getVendorOrderId());

        } catch (Exception e) {
            logger.error("Error processing vendor order notification for vendor: {}, order: {}",
                    notification.getVendorId(), notification.getOrderId(), e);
        }
    }
}
