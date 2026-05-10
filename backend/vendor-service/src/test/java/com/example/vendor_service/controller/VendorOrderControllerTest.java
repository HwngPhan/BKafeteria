package com.example.vendor_service.controller;

import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.model.VendorOrderNotification;
import com.example.vendor_service.repository.VendorOrderNotificationRepository;
import com.example.vendor_service.service.VendorOrderStatusService;
import com.example.vendor_service.service.VendorService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VendorOrderControllerTest {

    @Mock
    private VendorOrderNotificationRepository notificationRepository;
    @Mock
    private VendorOrderStatusService vendorOrderStatusService;
    @Mock
    private VendorService vendorService;

    @InjectMocks
    private VendorOrderController vendorOrderController;

    @Test
    void getOrderNotifications_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");

        Vendor vendor = new Vendor();
        vendor.setVendorId("v1");
        
        VendorOrderNotification notification = new VendorOrderNotification();

        when(vendorService.getVendorsByManagerId("manager1")).thenReturn(Collections.singletonList(vendor));
        when(notificationRepository.findByVendorId("v1")).thenReturn(Collections.singletonList(notification));

        ResponseEntity<ApiResponse<List<VendorOrderNotification>>> response = vendorOrderController.getOrderNotifications(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void getOrderNotifications_NoVendors() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");

        when(vendorService.getVendorsByManagerId("manager1")).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<VendorOrderNotification>>> response = vendorOrderController.getOrderNotifications(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("No vendor associated with this manager", response.getBody().getMessage());
    }

    @Test
    void confirmOrder_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");
        
        VendorOrderNotification notification = new VendorOrderNotification();

        when(vendorOrderStatusService.confirmOrder("order1", "manager1")).thenReturn(notification);

        ResponseEntity<ApiResponse<VendorOrderNotification>> response = vendorOrderController.confirmOrder("order1", userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Order confirmed", response.getBody().getMessage());
    }

    @Test
    void markFinished_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");
        
        VendorOrderNotification notification = new VendorOrderNotification();

        when(vendorOrderStatusService.markFinished("order1", "manager1")).thenReturn(notification);

        ResponseEntity<ApiResponse<VendorOrderNotification>> response = vendorOrderController.markFinished("order1", userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Order marked as finished", response.getBody().getMessage());
    }

    @Test
    void healthCheck_Success() {
        ResponseEntity<ApiResponse<String>> response = vendorOrderController.healthCheck();

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getVendorOrders_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");

        Vendor vendor = new Vendor();
        vendor.setVendorId("v1");
        
        VendorOrderNotification notification = new VendorOrderNotification();

        when(vendorService.getVendorsByManagerId("manager1")).thenReturn(Collections.singletonList(vendor));
        when(notificationRepository.findByVendorId("v1")).thenReturn(Collections.singletonList(notification));

        ResponseEntity<ApiResponse<List<VendorOrderNotification>>> response = vendorOrderController.getVendorOrders(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }
}
