package com.example.order_service.service;

import com.example.order_service.dtos.KafkaMessage.OrderStatusUpdateMessage;
import com.example.order_service.model.Order;
import com.example.order_service.model.VendorOrder;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.repository.VendorOrderRepository;
import com.example.shared.enums.OrderStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderStatusConsumerServiceTest {

    @Mock private VendorOrderRepository vendorOrderRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private OrderStatusConsumerService service;

    private OrderStatusUpdateMessage buildMessage(String vendorOrderId, String orderId, OrderStatus status) {
        OrderStatusUpdateMessage msg = new OrderStatusUpdateMessage();
        msg.setVendorOrderId(vendorOrderId);
        msg.setOrderId(orderId);
        msg.setCustomerId("customer1");
        msg.setStatus(status);
        return msg;
    }

    @Test
    void handleOrderStatusUpdate_vendorOrderNotFound_logsAndReturns() {
        when(vendorOrderRepository.findById("vo1")).thenReturn(Optional.empty());
        OrderStatusUpdateMessage msg = buildMessage("vo1", "order1", OrderStatus.PROCESSING);

        service.handleOrderStatusUpdate(msg);

        verify(vendorOrderRepository, never()).save(any());
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    @Test
    void handleOrderStatusUpdate_processingStatus_updatesVendorOrder() {
        VendorOrder vo = new VendorOrder();
        vo.setVendorOrderId("vo1");
        vo.setOrderId("order1");
        vo.setStatus(OrderStatus.PURCHASED);

        when(vendorOrderRepository.findById("vo1")).thenReturn(Optional.of(vo));
        when(vendorOrderRepository.save(any())).thenReturn(vo);

        Order order = new Order();
        order.setOrderId("order1");
        order.setStatus(OrderStatus.PROCESSING);

        OrderStatusUpdateMessage msg = buildMessage("vo1", "order1", OrderStatus.PROCESSING);
        service.handleOrderStatusUpdate(msg);

        verify(vendorOrderRepository).save(argThat(v -> v.getStatus() == OrderStatus.PROCESSING));
        verify(messagingTemplate).convertAndSend(eq("/topic/customer/customer1"), any(Object.class));
    }

    @Test
    void handleOrderStatusUpdate_completedStatus_allDone_marksOrderCompleted() {
        VendorOrder vo = new VendorOrder();
        vo.setVendorOrderId("vo1");
        vo.setOrderId("order1");
        vo.setStatus(OrderStatus.PURCHASED);

        when(vendorOrderRepository.findById("vo1")).thenReturn(Optional.of(vo));
        when(vendorOrderRepository.save(any())).thenReturn(vo);

        VendorOrder sibling = new VendorOrder();
        sibling.setStatus(OrderStatus.COMPLETED);
        when(vendorOrderRepository.findByOrderId("order1")).thenReturn(List.of(sibling));

        Order order = new Order();
        order.setOrderId("order1");
        order.setStatus(OrderStatus.PROCESSING);
        when(orderRepository.findById("order1")).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        OrderStatusUpdateMessage msg = buildMessage("vo1", "order1", OrderStatus.COMPLETED);
        service.handleOrderStatusUpdate(msg);

        verify(orderRepository).save(argThat(o -> o.getStatus() == OrderStatus.COMPLETED));
    }

    @Test
    void handleOrderStatusUpdate_completedStatus_notAllDone_doesNotMarkOrder() {
        VendorOrder vo = new VendorOrder();
        vo.setVendorOrderId("vo1");
        vo.setOrderId("order1");
        vo.setStatus(OrderStatus.PURCHASED);

        when(vendorOrderRepository.findById("vo1")).thenReturn(Optional.of(vo));
        when(vendorOrderRepository.save(any())).thenReturn(vo);

        VendorOrder stillProcessing = new VendorOrder();
        stillProcessing.setStatus(OrderStatus.PROCESSING);
        when(vendorOrderRepository.findByOrderId("order1")).thenReturn(List.of(stillProcessing));

        OrderStatusUpdateMessage msg = buildMessage("vo1", "order1", OrderStatus.COMPLETED);
        service.handleOrderStatusUpdate(msg);

        verify(orderRepository, never()).save(any());
    }

    @Test
    void handleOrderStatusUpdate_canceledStatus_allCanceled_marksOrderCanceled() {
        VendorOrder vo = new VendorOrder();
        vo.setVendorOrderId("vo1");
        vo.setOrderId("order1");
        vo.setStatus(OrderStatus.PURCHASED);

        when(vendorOrderRepository.findById("vo1")).thenReturn(Optional.of(vo));
        when(vendorOrderRepository.save(any())).thenReturn(vo);

        VendorOrder canceledSibling = new VendorOrder();
        canceledSibling.setStatus(OrderStatus.CANCELED);
        when(vendorOrderRepository.findByOrderId("order1")).thenReturn(List.of(canceledSibling));

        Order order = new Order();
        order.setOrderId("order1");
        order.setStatus(OrderStatus.PURCHASED);
        when(orderRepository.findById("order1")).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        OrderStatusUpdateMessage msg = buildMessage("vo1", "order1", OrderStatus.CANCELED);
        service.handleOrderStatusUpdate(msg);

        verify(orderRepository).save(argThat(o -> o.getStatus() == OrderStatus.CANCELED));
    }

    @Test
    void handleOrderStatusUpdate_canceledStatus_mixedWithCompleted_marksOrderCompleted() {
        VendorOrder vo = new VendorOrder();
        vo.setVendorOrderId("vo1");
        vo.setOrderId("order1");
        vo.setStatus(OrderStatus.PURCHASED);

        when(vendorOrderRepository.findById("vo1")).thenReturn(Optional.of(vo));
        when(vendorOrderRepository.save(any())).thenReturn(vo);

        VendorOrder completedSibling = new VendorOrder();
        completedSibling.setStatus(OrderStatus.COMPLETED);
        VendorOrder canceledSibling = new VendorOrder();
        canceledSibling.setStatus(OrderStatus.CANCELED);
        when(vendorOrderRepository.findByOrderId("order1"))
                .thenReturn(List.of(completedSibling, canceledSibling));

        Order order = new Order();
        order.setOrderId("order1");
        order.setStatus(OrderStatus.PROCESSING);
        when(orderRepository.findById("order1")).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        OrderStatusUpdateMessage msg = buildMessage("vo1", "order1", OrderStatus.CANCELED);
        service.handleOrderStatusUpdate(msg);

        verify(orderRepository).save(argThat(o -> o.getStatus() == OrderStatus.COMPLETED));
    }

    @Test
    void handleOrderStatusUpdate_nullOrderId_doesNotCrash() {
        VendorOrder vo = new VendorOrder();
        vo.setVendorOrderId("vo1");
        vo.setOrderId(null);
        vo.setStatus(OrderStatus.PURCHASED);

        when(vendorOrderRepository.findById("vo1")).thenReturn(Optional.of(vo));
        when(vendorOrderRepository.save(any())).thenReturn(vo);

        OrderStatusUpdateMessage msg = buildMessage("vo1", null, OrderStatus.COMPLETED);
        service.handleOrderStatusUpdate(msg);

        verify(orderRepository, never()).findById(any());
    }
}
