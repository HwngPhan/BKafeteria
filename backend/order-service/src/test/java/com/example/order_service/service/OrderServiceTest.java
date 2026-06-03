package com.example.order_service.service;

import com.example.order_service.dtos.UserInfoDto;
import com.example.order_service.dtos.VendorInfoDto;
import com.example.order_service.dtos.VoucherInfoDto;
import com.example.order_service.helper.IamClient;
import com.example.order_service.helper.MenuClient;
import com.example.order_service.helper.VendorClient;
import com.example.order_service.helper.producer.KafkaProducerService;
import com.example.order_service.model.Order;
import com.example.order_service.model.OrderItem;
import com.example.order_service.model.VendorOrder;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.repository.VendorOrderRepository;
import com.example.shared.enums.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private VendorOrderRepository vendorOrderRepository;
    @Mock private MenuClient menuClient;
    @Mock private IamClient iamClient;
    @Mock private VendorClient vendorClient;
    @Mock private KafkaProducerService kafkaProducerService;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private OrderService orderService;

    private Order pendingOrder;
    private VendorOrder vendorOrder;

    @BeforeEach
    void setUp() {
        pendingOrder = new Order();
        pendingOrder.setOrderId("order1");
        pendingOrder.setCustomerId("customer1");
        pendingOrder.setStatus(OrderStatus.PENDING);
        pendingOrder.setTotalPrice(50000.0);
        pendingOrder.setCreatedAt(LocalDateTime.now());
        pendingOrder.setOrderItems(new ArrayList<>());

        vendorOrder = new VendorOrder();
        vendorOrder.setVendorOrderId("vo1");
        vendorOrder.setOrderId("order1");
        vendorOrder.setVendorId("vendor1");
        vendorOrder.setVendorPrice(50000.0);
        vendorOrder.setStatus(OrderStatus.PENDING);
    }

    // ─── makePayment ────────────────────────────────────────────────────────────

    @Test
    void makePayment_success_noVouchers() {
        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));
        when(vendorOrderRepository.findByOrderId("order1")).thenReturn(List.of(vendorOrder));

        UserInfoDto customer = new UserInfoDto();
        customer.setBalance(100000.0);
        when(iamClient.getUserInfo("customer1")).thenReturn(customer);

        VendorInfoDto vendorInfo = new VendorInfoDto();
        vendorInfo.setManagerId("mgr1");
        when(vendorClient.getVendorInfo("vendor1")).thenReturn(vendorInfo);

        UserInfoDto manager = new UserInfoDto();
        manager.setBalance(0.0);
        when(iamClient.getUserInfo("mgr1")).thenReturn(manager);

        when(orderRepository.save(any())).thenReturn(pendingOrder);
        when(vendorOrderRepository.save(any())).thenReturn(vendorOrder);

        assertDoesNotThrow(() -> orderService.makePayment("order1", "customer1", null));

        verify(iamClient).setBalance(eq("customer1"), anyDouble());
        verify(iamClient).setBalance(eq("mgr1"), anyDouble());
        verify(orderRepository).save(argThat(o -> o.getStatus() == OrderStatus.PURCHASED));
    }

    @Test
    void makePayment_withVouchers_appliesDiscount() {
        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));
        when(vendorOrderRepository.findByOrderId("order1")).thenReturn(List.of(vendorOrder));

        VoucherInfoDto voucher = new VoucherInfoDto("v1", 20.0, "vendor1");
        when(menuClient.validateVoucher(eq("vendor1"), anyList())).thenReturn(List.of(voucher));

        UserInfoDto customer = new UserInfoDto();
        customer.setBalance(100000.0);
        when(iamClient.getUserInfo("customer1")).thenReturn(customer);

        VendorInfoDto vendorInfo = new VendorInfoDto();
        vendorInfo.setManagerId("mgr1");
        when(vendorClient.getVendorInfo("vendor1")).thenReturn(vendorInfo);

        UserInfoDto manager = new UserInfoDto();
        manager.setBalance(0.0);
        when(iamClient.getUserInfo("mgr1")).thenReturn(manager);

        when(orderRepository.save(any())).thenReturn(pendingOrder);
        when(vendorOrderRepository.save(any())).thenReturn(vendorOrder);

        assertDoesNotThrow(() -> orderService.makePayment("order1", "customer1", List.of("v1")));

        // After 20% discount: 50000 * (1 - 20/100) = 40000
        verify(orderRepository).save(argThat(o -> o.getTotalPrice() == 40000.0));
    }

    @Test
    void makePayment_orderNotFound_throws() {
        when(orderRepository.findById("order1")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> orderService.makePayment("order1", "customer1", null));
    }

    @Test
    void makePayment_notPending_throws() {
        pendingOrder.setStatus(OrderStatus.PURCHASED);
        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));
        assertThrows(RuntimeException.class, () -> orderService.makePayment("order1", "customer1", null));
    }

    @Test
    void makePayment_wrongCustomer_throws() {
        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));
        assertThrows(RuntimeException.class, () -> orderService.makePayment("order1", "wrong", null));
    }

    @Test
    void makePayment_insufficientBalance_throws() {
        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));
        when(vendorOrderRepository.findByOrderId("order1")).thenReturn(List.of(vendorOrder));

        UserInfoDto customer = new UserInfoDto();
        customer.setBalance(100.0);
        when(iamClient.getUserInfo("customer1")).thenReturn(customer);

        assertThrows(RuntimeException.class, () -> orderService.makePayment("order1", "customer1", null));
    }

    // ─── cancelOrder ────────────────────────────────────────────────────────────

    @Test
    void cancelOrder_pendingOrder_success() {
        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));
        when(vendorOrderRepository.findByOrderId("order1")).thenReturn(List.of(vendorOrder));
        when(orderRepository.save(any())).thenReturn(pendingOrder);

        Order result = orderService.cancelOrder("order1", "customer1");
        assertEquals(OrderStatus.CANCELED, result.getStatus());
    }

    @Test
    void cancelOrder_purchasedOrder_refunds() {
        pendingOrder.setStatus(OrderStatus.PURCHASED);
        pendingOrder.setTotalPrice(50000.0);

        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));
        when(vendorOrderRepository.findByOrderId("order1")).thenReturn(List.of(vendorOrder));

        UserInfoDto customer = new UserInfoDto();
        customer.setBalance(10000.0);
        when(iamClient.getUserInfo("customer1")).thenReturn(customer);

        VendorInfoDto vendorInfo = new VendorInfoDto();
        vendorInfo.setManagerId("mgr1");
        when(vendorClient.getVendorInfo("vendor1")).thenReturn(vendorInfo);

        UserInfoDto manager = new UserInfoDto();
        manager.setBalance(50000.0);
        when(iamClient.getUserInfo("mgr1")).thenReturn(manager);

        when(orderRepository.save(any())).thenReturn(pendingOrder);

        Order result = orderService.cancelOrder("order1", "customer1");
        assertEquals(OrderStatus.CANCELED, result.getStatus());
        verify(iamClient).setBalance("customer1", 60000.0);
        verify(iamClient).setBalance("mgr1", 0.0);
    }

    @Test
    void cancelOrder_orderNotFound_throws() {
        when(orderRepository.findById("order1")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> orderService.cancelOrder("order1", "customer1"));
    }

    @Test
    void cancelOrder_unauthorized_throws() {
        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));
        assertThrows(RuntimeException.class, () -> orderService.cancelOrder("order1", "otherCustomer"));
    }

    @Test
    void cancelOrder_alreadyCanceled_throws() {
        pendingOrder.setStatus(OrderStatus.CANCELED);
        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));
        assertThrows(RuntimeException.class, () -> orderService.cancelOrder("order1", "customer1"));
    }

    @Test
    void cancelOrder_completed_throws() {
        pendingOrder.setStatus(OrderStatus.COMPLETED);
        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));
        assertThrows(RuntimeException.class, () -> orderService.cancelOrder("order1", "customer1"));
    }

    // ─── cancelVendorOrder ──────────────────────────────────────────────────────

    @Test
    void cancelVendorOrder_notPaid_noRefund() {
        pendingOrder.setStatus(OrderStatus.PENDING);
        vendorOrder.setStatus(OrderStatus.PENDING);

        when(vendorOrderRepository.findById("vo1")).thenReturn(Optional.of(vendorOrder));
        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));

        UserInfoDto mgr = new UserInfoDto();
        mgr.setVendorId("vendor1");
        when(iamClient.getUserInfo("mgr1")).thenReturn(mgr);

        when(vendorOrderRepository.save(any())).thenReturn(vendorOrder);
        when(orderRepository.save(any())).thenReturn(pendingOrder);

        List<VendorOrder> siblings = List.of(vendorOrder);
        when(vendorOrderRepository.findByOrderId("order1")).thenReturn(siblings);

        Order result = orderService.cancelVendorOrder("vo1", "mgr1");
        assertNotNull(result);
        verify(iamClient, never()).setBalance(anyString(), anyDouble());
    }

    @Test
    void cancelVendorOrder_paid_refundsCustomerAndManager() {
        pendingOrder.setStatus(OrderStatus.PURCHASED);
        vendorOrder.setStatus(OrderStatus.PURCHASED);

        when(vendorOrderRepository.findById("vo1")).thenReturn(Optional.of(vendorOrder));
        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));

        UserInfoDto mgr = new UserInfoDto();
        mgr.setVendorId("vendor1");
        when(iamClient.getUserInfo("mgr1")).thenReturn(mgr);

        UserInfoDto customer = new UserInfoDto();
        customer.setBalance(0.0);
        when(iamClient.getUserInfo("customer1")).thenReturn(customer);

        VendorInfoDto vendorInfo = new VendorInfoDto();
        vendorInfo.setManagerId("mgr1");
        when(vendorClient.getVendorInfo("vendor1")).thenReturn(vendorInfo);

        UserInfoDto vendorMgr = new UserInfoDto();
        vendorMgr.setBalance(50000.0);
        vendorMgr.setVendorId("vendor1");
        when(iamClient.getUserInfo("mgr1")).thenReturn(vendorMgr);

        when(vendorOrderRepository.save(any())).thenReturn(vendorOrder);
        when(orderRepository.save(any())).thenReturn(pendingOrder);

        VendorOrder canceledSibling = new VendorOrder();
        canceledSibling.setStatus(OrderStatus.CANCELED);
        when(vendorOrderRepository.findByOrderId("order1")).thenReturn(List.of(canceledSibling));

        orderService.cancelVendorOrder("vo1", "mgr1");
        verify(iamClient, atLeastOnce()).setBalance(anyString(), anyDouble());
    }

    @Test
    void cancelVendorOrder_notFound_throws() {
        when(vendorOrderRepository.findById("vo1")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> orderService.cancelVendorOrder("vo1", "mgr1"));
    }

    @Test
    void cancelVendorOrder_unauthorized_throws() {
        vendorOrder.setStatus(OrderStatus.PENDING);
        when(vendorOrderRepository.findById("vo1")).thenReturn(Optional.of(vendorOrder));

        UserInfoDto mgr = new UserInfoDto();
        mgr.setVendorId("differentVendor");
        when(iamClient.getUserInfo("mgr1")).thenReturn(mgr);

        assertThrows(RuntimeException.class, () -> orderService.cancelVendorOrder("vo1", "mgr1"));
    }

    // ─── cancelUnpaidOrders ─────────────────────────────────────────────────────

    @Test
    void cancelUnpaidOrders_cancelsPendingOrders() {
        pendingOrder.setCreatedAt(LocalDateTime.now().minusMinutes(5));
        pendingOrder.setOrderItems(new ArrayList<>());

        when(orderRepository.findByStatusAndCreatedAtBefore(eq(OrderStatus.PENDING), any()))
                .thenReturn(List.of(pendingOrder));
        when(vendorOrderRepository.findByOrderId("order1")).thenReturn(List.of(vendorOrder));
        when(vendorOrderRepository.save(any())).thenReturn(vendorOrder);
        when(orderRepository.save(any())).thenReturn(pendingOrder);

        orderService.cancelUnpaidOrders();

        verify(orderRepository).save(argThat(o -> o.getStatus() == OrderStatus.CANCELED));
        verify(vendorOrderRepository).save(argThat(vo -> vo.getStatus() == OrderStatus.CANCELED));
    }

    @Test
    void cancelUnpaidOrders_noPendingOrders_doesNothing() {
        when(orderRepository.findByStatusAndCreatedAtBefore(eq(OrderStatus.PENDING), any()))
                .thenReturn(Collections.emptyList());

        orderService.cancelUnpaidOrders();

        verify(orderRepository, never()).save(any());
    }

    // ─── applyVoucherDiscounts: no applicable vouchers → no discount ─────────────

    @Test
    void makePayment_noApplicableVouchers_noDiscount() {
        when(orderRepository.findById("order1")).thenReturn(Optional.of(pendingOrder));
        when(vendorOrderRepository.findByOrderId("order1")).thenReturn(List.of(vendorOrder));

        when(menuClient.validateVoucher(eq("vendor1"), anyList())).thenReturn(Collections.emptyList());

        UserInfoDto customer = new UserInfoDto();
        customer.setBalance(100000.0);
        when(iamClient.getUserInfo("customer1")).thenReturn(customer);

        VendorInfoDto vendorInfo = new VendorInfoDto();
        vendorInfo.setManagerId("mgr1");
        when(vendorClient.getVendorInfo("vendor1")).thenReturn(vendorInfo);

        UserInfoDto manager = new UserInfoDto();
        manager.setBalance(0.0);
        when(iamClient.getUserInfo("mgr1")).thenReturn(manager);

        when(orderRepository.save(any())).thenReturn(pendingOrder);
        when(vendorOrderRepository.save(any())).thenReturn(vendorOrder);

        assertDoesNotThrow(() -> orderService.makePayment("order1", "customer1", List.of("v1")));
        // No discount applied, total price stays at 50000
        verify(orderRepository).save(argThat(o -> o.getTotalPrice() == 50000.0));
    }
}
