package com.example.order_service.service;

import com.example.order_service.dtos.KafkaMessage.OrderStatusUpdateMessage;
import com.example.order_service.model.VendorOrder;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.repository.VendorOrderRepository;
import com.example.shared.enums.OrderStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderStatusConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(OrderStatusConsumerService.class);

    private final VendorOrderRepository vendorOrderRepository;
    private final OrderRepository orderRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public OrderStatusConsumerService(VendorOrderRepository vendorOrderRepository,
                                      OrderRepository orderRepository,
                                      SimpMessagingTemplate messagingTemplate) {
        this.vendorOrderRepository = vendorOrderRepository;
        this.orderRepository = orderRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(
            topics = "order-status-updates",
            groupId = "order-service-group",
            containerFactory = "orderStatusKafkaListenerContainerFactory"
    )
    @Transactional
    public void handleOrderStatusUpdate(OrderStatusUpdateMessage update) {
        try {
            logger.info("Received status update for order: {}, vendorOrder: {}, status: {}",
                    update.getOrderId(), update.getVendorOrderId(), update.getStatus());

            VendorOrder vendorOrder = vendorOrderRepository.findById(update.getVendorOrderId()).orElse(null);
            if (vendorOrder == null) {
                logger.error("VendorOrder not found: {}", update.getVendorOrderId());
                return;
            }
            vendorOrder.setStatus(update.getStatus());
            vendorOrderRepository.save(vendorOrder);

            if (update.getStatus() == OrderStatus.COMPLETED) {
                handleCompleted(update.getOrderId());
            } else if (update.getStatus() == OrderStatus.CANCELED) {
                handleCanceled(update.getOrderId());
            }

            messagingTemplate.convertAndSend(
                    "/topic/customer/" + update.getCustomerId(),
                    update
            );
            logger.info("Pushed status update to customer WS topic: {}", update.getCustomerId());

        } catch (Exception e) {
            logger.error("Error processing order status update for vendorOrder: {}",
                    update.getVendorOrderId(), e);
        }
    }

    private void handleCompleted(String orderId) {
        if (orderId == null) return;
        List<VendorOrder> siblings = vendorOrderRepository.findByOrderId(orderId);
        boolean allDone = siblings.stream().allMatch(vo -> vo.getStatus() == OrderStatus.COMPLETED);
        if (!allDone) return;
        orderRepository.findById(orderId).ifPresent(order -> {
            order.setStatus(OrderStatus.COMPLETED);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
        });
    }

    private void handleCanceled(String orderId) {
        if (orderId == null) return;
        List<VendorOrder> siblings = vendorOrderRepository.findByOrderId(orderId);
        boolean allCanceled = siblings.stream().allMatch(vo -> vo.getStatus() == OrderStatus.CANCELED);
        boolean onlyCanceledOrCompleted = siblings.stream()
                .allMatch(vo -> vo.getStatus() == OrderStatus.CANCELED || vo.getStatus() == OrderStatus.COMPLETED);
        boolean hasCompleted = siblings.stream().anyMatch(vo -> vo.getStatus() == OrderStatus.COMPLETED);

        orderRepository.findById(orderId).ifPresent(order -> {
            if (allCanceled) {
                order.setStatus(OrderStatus.CANCELED);
                order.setUpdatedAt(LocalDateTime.now());
                orderRepository.save(order);
                logger.info("All VendorOrders cancelled — order {} marked CANCELED", orderId);
            } else if (onlyCanceledOrCompleted && hasCompleted) {
                order.setStatus(OrderStatus.COMPLETED);
                order.setUpdatedAt(LocalDateTime.now());
                orderRepository.save(order);
                logger.info("Remaining VendorOrders done — order {} marked COMPLETED", orderId);
            }
        });
    }
}
