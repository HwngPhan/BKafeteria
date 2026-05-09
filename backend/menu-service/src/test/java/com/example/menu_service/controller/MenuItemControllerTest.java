package com.example.menu_service.controller;

import com.example.menu_service.dtos.MenuItemDto;
import com.example.menu_service.dtos.MenuItemDtoConverter;
import com.example.menu_service.dtos.Request.CreateMenuItemRequest;
import com.example.menu_service.dtos.Request.UpdateImageRequest;
import com.example.menu_service.dtos.Request.UpdateRemainingRequest;
import com.example.menu_service.helper.IamClient;
import com.example.menu_service.model.MenuItem;
import com.example.menu_service.service.MenuItemService;
import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
public class MenuItemControllerTest {

    @Mock
    private MenuItemService menuItemService;
    @Mock
    private IamClient iamClient;
    @Mock
    private MenuItemDtoConverter menuItemDtoConverter;

    @InjectMocks
    private MenuItemController menuItemController;

    @Test
    void register_Success() {
        CreateMenuItemRequest request = new CreateMenuItemRequest();
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");

        MenuItem menuItem = new MenuItem();

        when(menuItemService.createMenuItem(any(CreateMenuItemRequest.class), eq("manager1"))).thenReturn(menuItem);
        when(menuItemDtoConverter.convert(menuItem)).thenReturn(null);

        ResponseEntity<ApiResponse<MenuItemDto>> response = menuItemController.register(request, userDetails);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Menu item created successfully", response.getBody().getMessage());
    }

    @Test
    void getMenuItemsByVendor_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");

        MenuItem menuItem = new MenuItem();

        when(menuItemService.getMenuItemsByVendor("manager1")).thenReturn(Collections.singletonList(menuItem));
        when(menuItemDtoConverter.convertList(anyList())).thenReturn(Collections.singletonList(null));

        ResponseEntity<ApiResponse<List<MenuItemDto>>> response = menuItemController.getMenuItemsByVendor(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void getMenuItemById_Success() {
        MenuItem menuItem = new MenuItem();

        when(menuItemService.getMenuItemById("item1")).thenReturn(menuItem);
        when(menuItemDtoConverter.convert(menuItem)).thenReturn(null);

        ResponseEntity<ApiResponse<MenuItemDto>> response = menuItemController.getMenuItemById("item1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Menu item retrieved successfully", response.getBody().getMessage());
    }

    @Test
    void updateMenuItem_Success() {
        CreateMenuItemRequest request = new CreateMenuItemRequest();
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");

        MenuItem menuItem = new MenuItem();

        when(menuItemService.createMenuItem(any(CreateMenuItemRequest.class), eq("manager1"))).thenReturn(menuItem);
        when(menuItemDtoConverter.convert(menuItem)).thenReturn(null);

        ResponseEntity<ApiResponse<MenuItemDto>> response = menuItemController.updateMenuItem(request, userDetails, "item1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Menu item updated successfully", response.getBody().getMessage());
    }

    @Test
    void deleteMenuItem_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");

        doNothing().when(menuItemService).deleteMenuItem("item1", "manager1");

        ResponseEntity<ApiResponse<Void>> response = menuItemController.deleteMenuItem(userDetails, "item1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Menu item deleted successfully", response.getBody().getMessage());
    }

    @Test
    void getAllMenuItems_Success() {
        Page<MenuItem> page = new PageImpl<>(Collections.emptyList());
        
        when(menuItemService.searchMenuItems(any(), any(), any(Pageable.class))).thenReturn(page);

        ResponseEntity<ApiResponse<Page<MenuItemDto>>> response = menuItemController.getAllMenuItems(null, null, 0, 10, "name", "asc");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void updateMenuItemImage_Success() {
        UpdateImageRequest request = new UpdateImageRequest();
        request.setImageUrl("http://image.url");
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("manager1");

        MenuItem menuItem = new MenuItem();

        when(menuItemService.updateMenuItemImage("item1", "manager1", "http://image.url")).thenReturn(menuItem);
        when(menuItemDtoConverter.convert(menuItem)).thenReturn(null);

        ResponseEntity<ApiResponse<MenuItemDto>> response = menuItemController.updateMenuItemImage(userDetails, "item1", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Menu item image updated successfully", response.getBody().getMessage());
    }

    @Test
    void updateMenuItemRemaining_Success() {
        UpdateRemainingRequest request = new UpdateRemainingRequest();
        request.setRemain(10);

        MenuItem menuItem = new MenuItem();

        when(menuItemService.updateMenuItemRemaining("item1", 10)).thenReturn(menuItem);
        when(menuItemDtoConverter.convert(menuItem)).thenReturn(null);

        ResponseEntity<ApiResponse<MenuItemDto>> response = menuItemController.updateMenuItemRemaining("item1", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Menu item remaining updated successfully", response.getBody().getMessage());
    }

    @Test
    void getMenuItemsByVendorId_Success() {
        MenuItem menuItem = new MenuItem();

        when(menuItemService.getMenuItemsByVendorId("vendor1")).thenReturn(Collections.singletonList(menuItem));
        when(menuItemDtoConverter.convertList(anyList())).thenReturn(Collections.singletonList(null));

        ResponseEntity<ApiResponse<List<MenuItemDto>>> response = menuItemController.getMenuItemsByVendorId("vendor1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }
}
