package com.example.menu_service.controller;

import com.example.menu_service.dtos.Request.CreateVoucherRequest;
import com.example.menu_service.dtos.Request.UpdateVoucherRequest;
import com.example.menu_service.dtos.Request.ValidateVoucherRequest;
import com.example.menu_service.dtos.UserInfoDto;
import com.example.menu_service.dtos.VoucherDto;
import com.example.menu_service.helper.IamClient;
import com.example.menu_service.service.VoucherService;
import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoucherControllerTest {

    @Mock private VoucherService voucherService;
    @Mock private IamClient iamClient;

    @InjectMocks
    private VoucherController voucherController;

    private VoucherDto sampleDto() {
        return new VoucherDto("v1", 10.0, LocalDateTime.now(), LocalDateTime.now().plusDays(7), "vendor1");
    }

    private CreateVoucherRequest createReq() {
        CreateVoucherRequest r = new CreateVoucherRequest();
        r.setDiscountPercentage(10.0);
        r.setStartDate(LocalDateTime.now());
        r.setExpiryDate(LocalDateTime.now().plusDays(7));
        return r;
    }

    // ─── create ─────────────────────────────────────────────────────────────────

    @Test
    void create_success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("mgr1");

        UserInfoDto userInfo = new UserInfoDto();
        userInfo.setVendorId("vendor1");
        when(iamClient.getUserInfo("mgr1")).thenReturn(userInfo);
        when(voucherService.createVoucher(any(), eq("vendor1"))).thenReturn(sampleDto());

        ResponseEntity<ApiResponse<VoucherDto>> response = voucherController.create(createReq(), userDetails);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Voucher created successfully", response.getBody().getMessage());
    }

    @Test
    void create_illegalArgument_returns400() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("mgr1");

        UserInfoDto userInfo = new UserInfoDto();
        userInfo.setVendorId("vendor1");
        when(iamClient.getUserInfo("mgr1")).thenReturn(userInfo);
        when(voucherService.createVoucher(any(), any())).thenThrow(new IllegalArgumentException("bad input"));

        ResponseEntity<ApiResponse<VoucherDto>> response = voucherController.create(createReq(), userDetails);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("bad input", response.getBody().getMessage());
    }

    @Test
    void create_unexpectedException_returns500() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("mgr1");
        when(iamClient.getUserInfo("mgr1")).thenThrow(new RuntimeException("connection error"));

        ResponseEntity<ApiResponse<VoucherDto>> response = voucherController.create(createReq(), userDetails);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    // ─── getById ─────────────────────────────────────────────────────────────────

    @Test
    void getById_success() {
        when(voucherService.getById("v1")).thenReturn(sampleDto());

        ResponseEntity<ApiResponse<VoucherDto>> response = voucherController.getById("v1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("v1", response.getBody().getData().getVoucherId());
    }

    @Test
    void getById_notFound_returns400() {
        when(voucherService.getById("bad")).thenThrow(new IllegalArgumentException("Voucher not found"));

        ResponseEntity<ApiResponse<VoucherDto>> response = voucherController.getById("bad");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Voucher not found", response.getBody().getMessage());
    }

    // ─── getByVendor ─────────────────────────────────────────────────────────────

    @Test
    void getByVendor_success() {
        when(voucherService.getByVendorId("vendor1")).thenReturn(List.of(sampleDto()));

        ResponseEntity<ApiResponse<List<VoucherDto>>> response = voucherController.getByVendor("vendor1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void getByVendor_exception_returns500() {
        when(voucherService.getByVendorId("v")).thenThrow(new RuntimeException("db error"));

        ResponseEntity<ApiResponse<List<VoucherDto>>> response = voucherController.getByVendor("v");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    // ─── validate ────────────────────────────────────────────────────────────────

    @Test
    void validate_success() {
        ValidateVoucherRequest req = new ValidateVoucherRequest();
        req.setVendorId("vendor1");
        req.setVoucherIds(List.of("v1"));
        when(voucherService.validate("vendor1", List.of("v1"))).thenReturn(List.of(sampleDto()));

        ResponseEntity<ApiResponse<List<VoucherDto>>> response = voucherController.validate(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Vouchers are valid", response.getBody().getMessage());
    }

    @Test
    void validate_invalid_returns400() {
        ValidateVoucherRequest req = new ValidateVoucherRequest();
        req.setVendorId("vendor1");
        req.setVoucherIds(List.of("v1"));
        when(voucherService.validate(any(), any())).thenThrow(new IllegalArgumentException("not applicable"));

        ResponseEntity<ApiResponse<List<VoucherDto>>> response = voucherController.validate(req);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("not applicable", response.getBody().getMessage());
    }

    // ─── update ──────────────────────────────────────────────────────────────────

    @Test
    void update_success() {
        UpdateVoucherRequest req = new UpdateVoucherRequest();
        req.setDiscountPercentage(20.0);
        req.setStartDate(LocalDateTime.now());
        req.setExpiryDate(LocalDateTime.now().plusDays(14));
        when(voucherService.updateVoucher("v1", req)).thenReturn(sampleDto());

        ResponseEntity<ApiResponse<VoucherDto>> response = voucherController.update("v1", req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Voucher updated successfully", response.getBody().getMessage());
    }

    @Test
    void update_notFound_returns400() {
        UpdateVoucherRequest req = new UpdateVoucherRequest();
        when(voucherService.updateVoucher(eq("bad"), any())).thenThrow(new IllegalArgumentException("Voucher not found"));

        ResponseEntity<ApiResponse<VoucherDto>> response = voucherController.update("bad", req);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    // ─── delete ──────────────────────────────────────────────────────────────────

    @Test
    void delete_success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        doNothing().when(voucherService).deleteVoucher("v1");

        ResponseEntity<ApiResponse<Void>> response = voucherController.delete("v1", userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Voucher deleted", response.getBody().getMessage());
    }

    @Test
    void delete_notFound_returns400() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        doThrow(new IllegalArgumentException("Voucher not found")).when(voucherService).deleteVoucher("bad");

        ResponseEntity<ApiResponse<Void>> response = voucherController.delete("bad", userDetails);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Voucher not found", response.getBody().getMessage());
    }
}
