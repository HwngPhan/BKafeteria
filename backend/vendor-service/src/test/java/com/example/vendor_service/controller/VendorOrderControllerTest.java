package com.example.vendor_service.controller;

import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import com.example.shared.dtos.PageDtos.PageDto;
import com.example.shared.dtos.PageDtos.PageDtoConverter;
import com.example.vendor_service.dtos.UserInfoDto;
import com.example.vendor_service.helper.IamClient;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VendorOrderControllerTest {

    @Mock
    private VendorOrderNotificationRepository notificationRepository;
    @Mock
    private VendorOrderStatusService vendorOrderStatusService;
    @Mock
    private VendorService vendorService;
    @Mock
    private PageDtoConverter pageDtoConverter;
    @Mock
    private IamClient iamClient;

    @InjectMocks
    private VendorOrderController vendorOrderController;

    @Test
    void getOrderNotifications_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");

        UserInfoDto userInfo = new UserInfoDto("manager1", "Manager", null, "m@test.com", "MANAGER", "v1");
        when(iamClient.getUserInfo("manager1")).thenReturn(userInfo);

        Vendor vendor = new Vendor();
        vendor.setVendorId("v1");
        when(vendorService.getVendorsByIds(anyList())).thenReturn(Collections.singletonList(vendor));

        VendorOrderNotification notification = new VendorOrderNotification();
        when(notificationRepository.findByVendorId("v1")).thenReturn(Collections.singletonList(notification));

        ResponseEntity<ApiResponse<List<VendorOrderNotification>>> response = vendorOrderController.getOrderNotifications(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void getOrderNotifications_NoVendors() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");

        UserInfoDto userInfo = new UserInfoDto("manager1", "Manager", null, "m@test.com", "MANAGER", "v1");
        when(iamClient.getUserInfo("manager1")).thenReturn(userInfo);
        when(vendorService.getVendorsByIds(anyList())).thenReturn(Collections.emptyList());

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
    @SuppressWarnings("unchecked")
    void getVendorOrders_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");

        UserInfoDto userInfo = new UserInfoDto("manager1", "Manager", null, "m@test.com", "MANAGER", "v1");
        when(iamClient.getUserInfo("manager1")).thenReturn(userInfo);

        Vendor vendor = new Vendor();
        vendor.setVendorId("v1");
        when(vendorService.getVendorsByIds(anyList())).thenReturn(Collections.singletonList(vendor));

        VendorOrderNotification notification = new VendorOrderNotification();

        when(notificationRepository.findByVendorIdIn(anyList(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.singletonList(notification)));
        PageDto<VendorOrderNotification> pageDto = new PageDto<>(
                Collections.singletonList(notification), 0, 10, 1, 1, true, false, false);
        doReturn(pageDto).when(pageDtoConverter).convert(any(PageImpl.class));

        ResponseEntity<ApiResponse<PageDto<VendorOrderNotification>>> response =
                vendorOrderController.getVendorOrders(userDetails, 0, 10, "createdAt", "desc", null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().content().size());
    }
}
