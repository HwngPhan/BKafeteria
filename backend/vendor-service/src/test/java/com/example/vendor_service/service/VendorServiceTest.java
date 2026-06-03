package com.example.vendor_service.service;

import com.example.vendor_service.dtos.UserInfoDto;
import com.example.vendor_service.dtos.VendorDtos.Request.CreateVendorRequest;
import com.example.vendor_service.dtos.VendorDtos.Request.UpdateVendorRequest;
import com.example.vendor_service.helper.IamClient;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.repository.VendorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendorServiceTest {

    @Mock private VendorRepository vendorRepository;
    @Mock private IamClient iamClient;

    @InjectMocks
    private VendorService vendorService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(vendorService, "expirationTime", 3600000L);
    }

    private Vendor buildVendor(String id, String managerId) {
        Vendor v = new Vendor();
        v.setVendorId(id);
        v.setManagerId(managerId);
        v.setName("Test Vendor");
        return v;
    }

    private UserInfoDto buildManagerInfo() {
        UserInfoDto info = new UserInfoDto();
        info.setUserId("mgr1");
        info.setRole("MANAGER");
        info.setEmail("mgr@mail.com");
        return info;
    }

    // ─── createVendor ────────────────────────────────────────────────────────────

    @Test
    void createVendor_success() {
        when(iamClient.getUserInfo("mgr1")).thenReturn(buildManagerInfo());
        Vendor saved = buildVendor("v1", "mgr1");
        when(vendorRepository.save(any())).thenReturn(saved);

        CreateVendorRequest req = new CreateVendorRequest();
        req.setName("Test Vendor");
        req.setDescription("desc");

        Vendor result = vendorService.createVendor(req, "mgr1");
        assertNotNull(result);
        assertEquals("mgr1", result.getManagerId());
    }

    @Test
    void createVendor_managerNotFound_throws() {
        when(iamClient.getUserInfo("mgr1")).thenReturn(null);

        CreateVendorRequest req = new CreateVendorRequest();
        assertThrows(IllegalArgumentException.class, () -> vendorService.createVendor(req, "mgr1"));
    }

    @Test
    void createVendor_notManagerRole_throws() {
        UserInfoDto info = new UserInfoDto();
        info.setRole("CUSTOMER");
        when(iamClient.getUserInfo("mgr1")).thenReturn(info);

        CreateVendorRequest req = new CreateVendorRequest();
        assertThrows(IllegalArgumentException.class, () -> vendorService.createVendor(req, "mgr1"));
    }

    // ─── approveVendorRequest ────────────────────────────────────────────────────

    @Test
    void approveVendorRequest_success() {
        Vendor vendor = buildVendor("v1", "mgr1");
        when(vendorRepository.findById("v1")).thenReturn(Optional.of(vendor));
        when(iamClient.getUserInfo("mgr1")).thenReturn(buildManagerInfo());
        when(vendorRepository.save(any())).thenReturn(vendor);

        Vendor result = vendorService.approveVendorRequest("v1", "admin1");
        assertNotNull(result);
        verify(iamClient).assignVendor(eq("v1"), eq("mgr@mail.com"), eq("MANAGER"));
    }

    @Test
    void approveVendorRequest_notFound_throws() {
        when(vendorRepository.findById("bad")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> vendorService.approveVendorRequest("bad", "admin1"));
    }

    // ─── updateVendor ────────────────────────────────────────────────────────────

    @Test
    void updateVendor_success() {
        Vendor vendor = buildVendor("v1", "mgr1");
        when(vendorRepository.findById("v1")).thenReturn(Optional.of(vendor));
        when(vendorRepository.save(any())).thenReturn(vendor);

        UpdateVendorRequest req = new UpdateVendorRequest();
        req.setName("Updated Name");
        req.setDescription("new desc");

        Vendor result = vendorService.updateVendor("v1", req, "mgr1");
        assertEquals("Updated Name", result.getName());
    }

    @Test
    void updateVendor_unauthorized_throws() {
        Vendor vendor = buildVendor("v1", "mgr1");
        when(vendorRepository.findById("v1")).thenReturn(Optional.of(vendor));

        UpdateVendorRequest req = new UpdateVendorRequest();
        assertThrows(IllegalArgumentException.class,
                () -> vendorService.updateVendor("v1", req, "otherManager"));
    }

    @Test
    void updateVendor_notFound_throws() {
        when(vendorRepository.findById("bad")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class,
                () -> vendorService.updateVendor("bad", new UpdateVendorRequest(), "mgr1"));
    }

    // ─── updateVendorImage ───────────────────────────────────────────────────────

    @Test
    void updateVendorImage_success() {
        Vendor vendor = buildVendor("v1", "mgr1");
        when(vendorRepository.findById("v1")).thenReturn(Optional.of(vendor));
        when(vendorRepository.save(any())).thenReturn(vendor);

        Vendor result = vendorService.updateVendorImage("v1", "http://img.url/img.png", "mgr1");
        assertEquals("http://img.url/img.png", result.getImgUrl());
    }

    @Test
    void updateVendorImage_unauthorized_throws() {
        Vendor vendor = buildVendor("v1", "mgr1");
        when(vendorRepository.findById("v1")).thenReturn(Optional.of(vendor));
        assertThrows(IllegalArgumentException.class,
                () -> vendorService.updateVendorImage("v1", "url", "wrongMgr"));
    }

    // ─── queries ─────────────────────────────────────────────────────────────────

    @Test
    void getVendorsByIds_delegatesToRepo() {
        Vendor v = buildVendor("v1", "mgr1");
        when(vendorRepository.findAllById(List.of("v1"))).thenReturn(List.of(v));
        List<Vendor> result = vendorService.getVendorsByIds(List.of("v1"));
        assertEquals(1, result.size());
    }

    @Test
    void getAllVendors_returnsAll() {
        when(vendorRepository.findAll()).thenReturn(List.of(buildVendor("v1", "mgr1")));
        assertEquals(1, vendorService.getAllVendors().size());
    }

    @Test
    void getAllActiveVendors_returnsAccepted() {
        when(vendorRepository.findAllByStatus(any())).thenReturn(Collections.emptyList());
        assertTrue(vendorService.getAllActiveVendors().isEmpty());
    }
}
