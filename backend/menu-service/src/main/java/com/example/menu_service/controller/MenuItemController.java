package com.example.menu_service.controller;

import com.example.menu_service.dtos.MenuItemDto;
import com.example.menu_service.dtos.Request.CreateMenuItemRequest;
import com.example.menu_service.dtos.Request.UpdateImageRequest;
import com.example.menu_service.dtos.Request.UpdateMenuItemRequest;
import com.example.menu_service.dtos.Request.UpdateRemainingRequest;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.menu_service.dtos.MenuItemDtoConverter;
import com.example.menu_service.helper.IamClient;
import com.example.menu_service.service.MenuItemService;
import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/items")
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class MenuItemController {
  private final MenuItemService menuItemService;
  private final IamClient iamClient;
  private final MenuItemDtoConverter menuItemDtoConverter;

  @PostMapping("/create")
  @PreAuthorize("hasAnyRole('MANAGER')")
  public ResponseEntity<ApiResponse<MenuItemDto>> register(
      @RequestBody @Valid CreateMenuItemRequest createMenuItemRequest,
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    try {
      String managerId = userDetails.getId();
      MenuItemDto menuItemDto = menuItemDtoConverter
          .convert(menuItemService.createMenuItem(createMenuItemRequest, managerId));

      ApiResponse<MenuItemDto> response = new ApiResponse<>(
          HttpStatus.CREATED.value(),
          "Menu item created successfully",
          menuItemDto);
      return new ResponseEntity<>(response, HttpStatus.CREATED);
    } catch (RuntimeException e) {
      log.error("Error creating menu item: {}", e.getMessage());
      ApiResponse<MenuItemDto> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Failed to create menu item: " + e.getMessage(),
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (Exception e) {
      log.error("Unexpected error creating menu item: {}", e.getMessage());
      ApiResponse<MenuItemDto> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Unexpected error occurred",
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  @GetMapping("/get-my-menu")
  @PreAuthorize("hasAnyRole('MANAGER')")
  public ResponseEntity<ApiResponse<List<MenuItemDto>>> getMenuItemsByVendor(
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    try {
      String managerId = userDetails.getId();
      List<MenuItemDto> menuItemDtos = menuItemDtoConverter
          .convertList(menuItemService.getMenuItemsByVendor(managerId));

      return ResponseEntity.ok(
          new ApiResponse<>(200, "Menu items retrieved successfully", menuItemDtos));
    } catch (RuntimeException e) {
      log.error("Error retrieving menu items: {}", e.getMessage());
      ApiResponse<List<MenuItemDto>> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Failed to retrieve menu items: " + e.getMessage(),
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (Exception e) {
      log.error("Unexpected error retrieving menu items: {}", e.getMessage());
      ApiResponse<List<MenuItemDto>> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Unexpected error occurred",
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<MenuItemDto>> getMenuItemById(@PathVariable String id) {
    try {
      MenuItemDto menuItemDto = menuItemDtoConverter.convert(menuItemService.getMenuItemById(id));

      return ResponseEntity.ok(
          new ApiResponse<>(200, "Menu item retrieved successfully", menuItemDto));
    } catch (RuntimeException e) {
      log.error("Error retrieving menu item: {}", e.getMessage());
      ApiResponse<MenuItemDto> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Failed to retrieve menu item: " + e.getMessage(),
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (Exception e) {
      log.error("Unexpected error retrieving menu item: {}", e.getMessage());
      ApiResponse<MenuItemDto> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Unexpected error occurred",
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @PutMapping("/update/{id}")
  @PreAuthorize("hasAnyRole('MANAGER')")
  public ResponseEntity<ApiResponse<MenuItemDto>> updateMenuItem(
      @RequestBody @Valid UpdateMenuItemRequest updateMenuItemRequest,
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable String id) {
    try {
      MenuItemDto menuItemDto = menuItemDtoConverter.convert(
          menuItemService.updateMenuItem(id, updateMenuItemRequest, userDetails.getId()));
      return ResponseEntity.ok(
          new ApiResponse<>(200, "Menu item updated successfully", menuItemDto));
    } catch (RuntimeException e) {
      log.error("Error updating menu item: {}", e.getMessage());
      ApiResponse<MenuItemDto> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Failed to update menu item: " + e.getMessage(),
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (Exception e) {
      log.error("Unexpected error updating menu item: {}", e.getMessage());
      ApiResponse<MenuItemDto> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Unexpected error occurred",
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @DeleteMapping("/delete/{id}")
  @PreAuthorize("hasAnyRole('MANAGER')")
  public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable String id) {
    try {
      menuItemService.deleteMenuItem(id, userDetails.getId());
      return ResponseEntity.ok(
          new ApiResponse<>(200, "Menu item deleted successfully", null));
    } catch (RuntimeException e) {
      log.error("Error deleting menu item: {}", e.getMessage());
      ApiResponse<Void> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Failed to delete menu item: " + e.getMessage(),
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (Exception e) {
      log.error("Unexpected error deleting menu item: {}", e.getMessage());
      ApiResponse<Void> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Unexpected error occurred",
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @GetMapping("/get-all")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<Page<MenuItemDto>>> getAllMenuItems(
      @RequestParam(required = false) String name,
      @RequestParam(required = false) String category,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "name") String sortBy,
      @RequestParam(defaultValue = "asc") String direction) {
    try {
      Pageable pageable = PageRequest.of(
          page,
          size,
          direction.equalsIgnoreCase("desc")
              ? Sort.by(sortBy).descending()
              : Sort.by(sortBy).ascending());

      Page<MenuItemDto> result = menuItemService
          .searchMenuItems(name, category, pageable)
          .map(menuItemDtoConverter::convert);

      return ResponseEntity.ok(
          new ApiResponse<>(200, "Menu items retrieved successfully", result));
    } catch (Exception e) {
      log.error("Error retrieving menu items", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse<>(500, "Failed to retrieve menu items", null));
    }
  }

  @PutMapping("/img/{id}")
  @PreAuthorize("hasAnyRole('MANAGER')")
  public ResponseEntity<ApiResponse<MenuItemDto>> updateMenuItemImage(
      @AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable String id,
      @RequestBody UpdateImageRequest updateImageRequest) {
    try {
      MenuItemDto menuItemDto = menuItemDtoConverter
          .convert(menuItemService.updateMenuItemImage(id, userDetails.getId(), updateImageRequest.getImageUrl()));
      return ResponseEntity.ok(
          new ApiResponse<>(200, "Menu item image updated successfully", menuItemDto));
    } catch (RuntimeException e) {
      log.error("Error updating menu item image: {}", e.getMessage());
      ApiResponse<MenuItemDto> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Failed to update menu item image: " + e.getMessage(),
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (Exception e) {
      log.error("Unexpected error updating menu item image: {}", e.getMessage());
      ApiResponse<MenuItemDto> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Unexpected error occurred",
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @PutMapping("/update-remaining/{id}")
  @PreAuthorize("hasAnyRole('INTERNAL_SERVICE')")
  public ResponseEntity<ApiResponse<MenuItemDto>> updateMenuItemRemaining(@PathVariable String id,
      @RequestBody UpdateRemainingRequest updateRemainingRequest) {
    try {
      MenuItemDto menuItemDto = menuItemDtoConverter
          .convert(menuItemService.updateMenuItemRemaining(id, updateRemainingRequest.getRemain()));
      return ResponseEntity.ok(
          new ApiResponse<>(200, "Menu item remaining updated successfully", menuItemDto));
    } catch (RuntimeException e) {
      log.error("Error updating menu item remaining: {}", e.getMessage());
      ApiResponse<MenuItemDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Failed to update menu item remaining: " + e.getMessage(),
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (Exception e) {
      log.error("Unexpected error updating menu item remaining: {}", e.getMessage());
      ApiResponse<MenuItemDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Unexpected error occurred",
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @GetMapping("/get-by-vendor/{vendorId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<List<MenuItemDto>>> getMenuItemsByVendorId(
      @PathVariable String vendorId) {
    try {
      List<MenuItemDto> menuItemDtos = menuItemDtoConverter
          .convertList(menuItemService.getMenuItemsByVendorId(vendorId));
      return ResponseEntity.ok(
          new ApiResponse<>(200, "Menu items retrieved successfully", menuItemDtos));
    } catch (RuntimeException e) {
      log.error("Error getting menu items by vendorId: {}", e.getMessage());
      ApiResponse<List<MenuItemDto>> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Failed to get menu items by vendorId: " + e.getMessage(),
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (Exception e) {
      log.error("Unexpected error getting menu items by vendorId: {}", e.getMessage());
      ApiResponse<List<MenuItemDto>> response = new ApiResponse<>(
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          "Unexpected error occurred",
          null);
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
