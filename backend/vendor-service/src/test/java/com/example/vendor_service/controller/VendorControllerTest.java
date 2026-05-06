package com.example.vendor_service.controller;

import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import com.example.vendor_service.dtos.VendorDtos.VendorDto;
import com.example.vendor_service.dtos.VendorDtos.VendorDtoConverter;
import com.example.vendor_service.dtos.VendorDtos.Request.CreateVendorRequest;
import com.example.vendor_service.helper.IamClient;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.repository.VendorRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VendorControllerTest {

    @Mock
    private VendorService vendorService;
    @Mock
    private VendorDtoConverter vendorDtoConverter;
    @Mock
    private IamClient iamClient;
    @Mock
    private VendorRepository vendorRepository;

    @InjectMocks
    private VendorController vendorController;

    private VendorDto createDummyVendorDto() {
        return new VendorDto(
                "v1", "Vendor 1", "Desc", null, null, null, null, "m1", null, null, null);
    }

    @Test
    void register_Success() {
        CreateVendorRequest request = new CreateVendorRequest();
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("m1");
        when(userDetails.getEmail()).thenReturn("test@test.com");

        Vendor vendor = new Vendor();
        VendorDto vendorDto = createDummyVendorDto();

        when(vendorService.createVendor(any(CreateVendorRequest.class), eq("m1"))).thenReturn(vendor);
        when(vendorDtoConverter.convert(vendor)).thenReturn(vendorDto);
        doNothing().when(iamClient).assignVendor(anyString(), anyString(), anyString());

        ResponseEntity<ApiResponse<VendorDto>> response = vendorController.register(request, userDetails);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Vendor registered successfully", response.getBody().getMessage());
        verify(iamClient, times(1)).assignVendor("v1", "test@test.com", "MANAGER");
    }

    // @Test
    // void approveRequest_Success() {
    // CustomUserDetails userDetails = mock(CustomUserDetails.class);
    // when(userDetails.getId()).thenReturn("admin1");

    // doNothing().when(vendorService).approveVendorRequest("v1", "admin1");

    // ResponseEntity<ApiResponse<VendorDto>> response =
    // vendorController.approveRequest("v1", userDetails);

    // assertEquals(HttpStatus.OK, response.getStatusCode());
    // assertEquals("Vendor request approved successfully",
    // response.getBody().getMessage());
    // }

    @Test
    void getMyVendor_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("m1");

        Vendor vendor = new Vendor();
        VendorDto vendorDto = createDummyVendorDto();

        when(vendorService.getVendorByManagerId("m1")).thenReturn(vendor);
        when(vendorDtoConverter.convert(vendor)).thenReturn(vendorDto);

        ResponseEntity<ApiResponse<VendorDto>> response = vendorController.getMyVendor(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Vendor retrieved successfully", response.getBody().getMessage());
    }

    @Test
    void getAllVendors_Success() {
        Vendor vendor = new Vendor();
        VendorDto vendorDto = createDummyVendorDto();

        when(vendorService.getAllVendors()).thenReturn(Collections.singletonList(vendor));
        when(vendorDtoConverter.convert(vendor)).thenReturn(vendorDto);

        ResponseEntity<ApiResponse<List<VendorDto>>> response = vendorController.getAllVendors();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void getActiveVendors_Success() {
        Vendor vendor = new Vendor();
        VendorDto vendorDto = createDummyVendorDto();

        when(vendorService.getAllActiveVendors()).thenReturn(Collections.singletonList(vendor));
        when(vendorDtoConverter.convert(vendor)).thenReturn(vendorDto);

        ResponseEntity<ApiResponse<List<VendorDto>>> response = vendorController.getActiveVendors();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void getVendorById_Success() {
        Vendor vendor = new Vendor();
        VendorDto vendorDto = createDummyVendorDto();

        when(vendorService.getVendorById("v1")).thenReturn(vendor);
        when(vendorDtoConverter.convert(vendor)).thenReturn(vendorDto);

        ResponseEntity<ApiResponse<VendorDto>> response = vendorController.getVendorById("v1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Vendor retrieved successfully", response.getBody().getMessage());
    }
}
