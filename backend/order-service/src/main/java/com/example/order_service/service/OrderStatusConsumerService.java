package com.example.order_service.service;

import com.example.order_service.dtos.KafkaMessage.OrderStatusUpdateMessage;
import com.example.order_service.model.Order;
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
                List<VendorOrder> siblings = vendorOrderRepository.findByOrderId(update.getOrderId());
                boolean allDone = siblings.stream().allMatch(vo -> vo.getStatus() == OrderStatus.COMPLETED);
                if (allDone) {
                    Order order = orderRepository.findById(update.getOrderId()).orElse(null);
                    if (order != null) {
                        order.setStatus(OrderStatus.COMPLETED);
                        order.setUpdatedAt(LocalDateTime.now());
                        orderRepository.save(order);
                    }
                }
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
}
