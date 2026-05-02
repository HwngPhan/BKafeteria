package com.example.vendor_service.service;

import com.example.shared.enums.OrderStatus;
import com.example.vendor_service.dtos.KafkaMessage.OrderStatusUpdateMessage;
import com.example.vendor_service.helper.producer.KafkaProducerService;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.model.VendorOrderNotification;
import com.example.vendor_service.repository.VendorOrderNotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class VendorOrderStatusService {

    private static final Logger logger = LoggerFactory.getLogger(VendorOrderStatusService.class);
    private static final String STATUS_TOPIC = "order-status-updates";

    private final VendorOrderNotificationRepository notificationRepository;
    private final VendorService vendorService;
    private final KafkaProducerService kafkaProducerService;

    public VendorOrderStatusService(VendorOrderNotificationRepository notificationRepository,
                                    VendorService vendorService,
                                    KafkaProducerService kafkaProducerService) {
        this.notificationRepository = notificationRepository;
        this.vendorService = vendorService;
        this.kafkaProducerService = kafkaProducerService;
    }

    @Transactional
    public VendorOrderNotification markFinished(String vendorOrderId, String managerId) {
        VendorOrderNotification row = notificationRepository.findById(vendorOrderId)
                .orElseThrow(() -> new RuntimeException("VendorOrder not found: " + vendorOrderId));

        Vendor vendor = vendorService.getVendorById(row.getVendorId());
        if (vendor == null || !managerId.equals(vendor.getManagerId())) {
            throw new RuntimeException("Not authorized to update this order");
        }

        row.setStatus(OrderStatus.COMPLETED);
        row.setReadyAt(LocalDateTime.now());
        VendorOrderNotification saved = notificationRepository.save(row);

        OrderStatusUpdateMessage msg = new OrderStatusUpdateMessage(
                saved.getOrderId(),
                saved.getVendorOrderId(),
                saved.getVendorId(),
                saved.getCustomerId(),
                OrderStatus.COMPLETED,
                "Your dishes are ready",
                LocalDateTime.now()
        );
        try {
            kafkaProducerService.sendStatusUpdate(STATUS_TOPIC, msg);
            logger.info("Published status update for vendorOrder: {} customer: {}",
                    saved.getVendorOrderId(), saved.getCustomerId());
        } catch (Exception e) {
            logger.error("Failed to publish status update for vendorOrder: {}",
                    saved.getVendorOrderId(), e);
        }

        return saved;
    }
}
