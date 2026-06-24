package com.example.menu_service.service;

import com.example.menu_service.dtos.Request.CreateVoucherRequest;
import com.example.menu_service.dtos.Request.UpdateVoucherRequest;
import com.example.menu_service.dtos.VoucherDto;
import com.example.menu_service.model.Voucher;
import com.example.menu_service.repository.VoucherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoucherServiceTest {

    @Mock private VoucherRepository voucherRepository;

    @InjectMocks
    private VoucherService voucherService;

    private Voucher validVoucher;

    @BeforeEach
    void setUp() {
        validVoucher = new Voucher();
        validVoucher.setVoucherId("v1");
        validVoucher.setDiscountPercentage(10.0);
        validVoucher.setStartDate(LocalDateTime.now().minusDays(1));
        validVoucher.setExpiryDate(LocalDateTime.now().plusDays(7));
        validVoucher.setVendorId("vendor1");
    }

    // ─── createVoucher ───────────────────────────────────────────────────────────

    @Test
    void createVoucher_success() {
        when(voucherRepository.save(any())).thenReturn(validVoucher);

        CreateVoucherRequest req = new CreateVoucherRequest();
        req.setDiscountPercentage(10.0);
        req.setStartDate(LocalDateTime.now().minusDays(1));
        req.setExpiryDate(LocalDateTime.now().plusDays(7));

        VoucherDto result = voucherService.createVoucher(req, "vendor1");

        assertNotNull(result);
        assertEquals("v1", result.getVoucherId());
        assertEquals(10.0, result.getDiscountPercentage());
        assertEquals("vendor1", result.getVendorId());
    }

    // ─── updateVoucher ───────────────────────────────────────────────────────────

    @Test
    void updateVoucher_success() {
        when(voucherRepository.findById("v1")).thenReturn(Optional.of(validVoucher));
        when(voucherRepository.save(any())).thenReturn(validVoucher);

        UpdateVoucherRequest req = new UpdateVoucherRequest();
        req.setDiscountPercentage(15.0);
        req.setStartDate(LocalDateTime.now().minusDays(2));
        req.setExpiryDate(LocalDateTime.now().plusDays(10));

        VoucherDto result = voucherService.updateVoucher("v1", req);
        assertNotNull(result);
        verify(voucherRepository).save(argThat(v -> v.getDiscountPercentage() == 15.0));
    }

    @Test
    void updateVoucher_nullId_throws() {
        UpdateVoucherRequest req = new UpdateVoucherRequest();
        assertThrows(IllegalArgumentException.class, () -> voucherService.updateVoucher(null, req));
    }

    @Test
    void updateVoucher_notFound_throws() {
        when(voucherRepository.findById("bad")).thenReturn(Optional.empty());
        UpdateVoucherRequest req = new UpdateVoucherRequest();
        assertThrows(IllegalArgumentException.class, () -> voucherService.updateVoucher("bad", req));
    }

    // ─── getById ─────────────────────────────────────────────────────────────────

    @Test
    void getById_success() {
        when(voucherRepository.findById("v1")).thenReturn(Optional.of(validVoucher));
        VoucherDto result = voucherService.getById("v1");
        assertEquals("v1", result.getVoucherId());
    }

    @Test
    void getById_nullId_throws() {
        assertThrows(IllegalArgumentException.class, () -> voucherService.getById(null));
    }

    @Test
    void getById_notFound_throws() {
        when(voucherRepository.findById("missing")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> voucherService.getById("missing"));
    }

    // ─── getByVendorId ───────────────────────────────────────────────────────────

    @Test
    void getByVendorId_returnsAll() {
        when(voucherRepository.findByVendorId("vendor1")).thenReturn(List.of(validVoucher));
        List<VoucherDto> result = voucherService.getByVendorId("vendor1");
        assertEquals(1, result.size());
    }

    @Test
    void getByVendorId_empty_returnsEmpty() {
        when(voucherRepository.findByVendorId("unknown")).thenReturn(List.of());
        List<VoucherDto> result = voucherService.getByVendorId("unknown");
        assertTrue(result.isEmpty());
    }

    // ─── validate ────────────────────────────────────────────────────────────────

    @Test
    void validate_success() {
        when(voucherRepository.findById("v1")).thenReturn(Optional.of(validVoucher));
        List<VoucherDto> result = voucherService.validate("vendor1", List.of("v1"));
        assertEquals(1, result.size());
        assertEquals("vendor1", result.get(0).getVendorId());
    }

    @Test
    void validate_nullId_throws() {
        assertThrows(IllegalArgumentException.class, () -> voucherService.validate(null, List.of("v1")));
    }

    @Test
    void validate_notFound_throws() {
        when(voucherRepository.findById("v1")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> voucherService.validate("vendor1", List.of("v1")));
    }

    @Test
    void validate_expired_throws() {
        validVoucher.setExpiryDate(LocalDateTime.now().minusDays(1));
        when(voucherRepository.findById("v1")).thenReturn(Optional.of(validVoucher));
        assertThrows(IllegalArgumentException.class, () -> voucherService.validate("vendor1", List.of("v1")));
    }

    @Test
    void validate_notYetActive_throws() {
        validVoucher.setStartDate(LocalDateTime.now().plusDays(1));
        when(voucherRepository.findById("v1")).thenReturn(Optional.of(validVoucher));
        assertThrows(IllegalArgumentException.class, () -> voucherService.validate("vendor1", List.of("v1")));
    }

    @Test
    void validate_vendorNotInOrder_throws() {
        when(voucherRepository.findById("v1")).thenReturn(Optional.of(validVoucher));
        assertThrows(IllegalArgumentException.class, () -> voucherService.validate("otherVendor", List.of("v1")));
    }

    @Test
    void validate_nullVendorId_throws() {
        validVoucher.setVendorId(null);
        when(voucherRepository.findById("v1")).thenReturn(Optional.of(validVoucher));
        assertThrows(IllegalArgumentException.class, () -> voucherService.validate("vendor1", List.of("v1")));
    }

    // ─── deleteVoucher ───────────────────────────────────────────────────────────

    @Test
    void deleteVoucher_success() {
        when(voucherRepository.existsById("v1")).thenReturn(true);
        voucherService.deleteVoucher("v1");
        verify(voucherRepository).deleteById("v1");
    }

    @Test
    void deleteVoucher_nullId_throws() {
        assertThrows(IllegalArgumentException.class, () -> voucherService.deleteVoucher(null));
    }

    @Test
    void deleteVoucher_notFound_throws() {
        when(voucherRepository.existsById("bad")).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () -> voucherService.deleteVoucher("bad"));
    }
}
