package com.example.order_service.controller;

import com.example.order_service.dtos.OrderDto;
import com.example.order_service.dtos.OrderDtoConverter;
import com.example.order_service.dtos.Request.OrderRequest;
import com.example.order_service.dtos.VendorOrderDtoConverter;
import com.example.order_service.model.Order;
import com.example.order_service.model.VendorOrder;
import com.example.order_service.service.OrderService;
import com.example.order_service.service.VendorOrderService;
import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import com.example.shared.dtos.PageDtos.PageDto;
import com.example.shared.dtos.PageDtos.PageDtoConverter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderControllerTest {

    @Mock
    private OrderService orderService;
    @Mock
    private OrderDtoConverter orderDtoConverter;
    @Mock
    private VendorOrderService vendorOrderService;
    @Mock
    private VendorOrderDtoConverter vendorOrderDtoConverter;
    @Mock
    private PageDtoConverter pageDtoConverter;

    @InjectMocks
    private OrderController orderController;

    @Test
    void getOrderById_Success() {
        VendorOrder vendorOrder = new VendorOrder();
        
        Order order = new Order();

        when(vendorOrderService.getVendorOrdersByOrderId("order1")).thenReturn(Collections.singletonList(vendorOrder));
        when(vendorOrderDtoConverter.convert(vendorOrder)).thenReturn(null);
        when(orderService.getOrderById("order1")).thenReturn(order);
        when(orderDtoConverter.convert(eq(order), anyList())).thenReturn(null);

        ResponseEntity<ApiResponse<OrderDto>> response = orderController.getOrderById("order1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Order retrieved successfully", response.getBody().getMessage());
    }

    @Test
    void createOrder_Success() {
        OrderRequest request = new OrderRequest();
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("user1");

        Order order = new Order();

        when(orderService.createOrder(any(OrderRequest.class), eq("user1"))).thenReturn(order);
        when(orderDtoConverter.convert(order)).thenReturn(null);

        ResponseEntity<ApiResponse<OrderDto>> response = orderController.createOrder(request, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Order created successfully", response.getBody().getMessage());
    }

    @Test
    void makePayment_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("user1");

        doNothing().when(orderService).makePayment("order1", "user1", null);

        VendorOrder vendorOrder = new VendorOrder();
        
        Order order = new Order();

        when(vendorOrderService.getVendorOrdersByOrderId("order1")).thenReturn(Collections.singletonList(vendorOrder));
        when(vendorOrderDtoConverter.convert(vendorOrder)).thenReturn(null);
        when(orderService.getOrderById("order1")).thenReturn(order);
        when(orderDtoConverter.convert(eq(order), anyList())).thenReturn(null);

        ResponseEntity<ApiResponse<OrderDto>> response = orderController.makePayment("order1", null, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Order paid successfully", response.getBody().getMessage());
    }

    @Test
    @SuppressWarnings("unchecked")
    void getOrders_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("user1");

        Order order = new Order();
        order.setOrderId("order1");

        when(orderService.getOrders(eq("user1"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.singletonList(order)));
        PageDto<OrderDto> pageDto = new PageDto<>(
                Collections.singletonList(null), 0, 10, 1, 1, true, false, false);
        doReturn(pageDto).when(pageDtoConverter).convert(any(PageImpl.class), any());

        ResponseEntity<ApiResponse<PageDto<OrderDto>>> response =
                orderController.getOrders(userDetails, 0, 10, "createdAt", "desc");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().content().size());
    }
}
