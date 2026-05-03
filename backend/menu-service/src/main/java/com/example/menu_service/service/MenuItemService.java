package com.example.menu_service.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.menu_service.helper.IamClient;
import com.example.menu_service.repository.MenuItemRepository;

import jakarta.transaction.Transactional;

import com.example.menu_service.model.MenuItem;
import com.example.menu_service.dtos.UserInfoDto;
import com.example.menu_service.dtos.Request.CreateMenuItemRequest;
// import com.example.menu_service.exception.UnauthorizedException;
import java.util.List;
import java.time.LocalDateTime;

@Service
public class MenuItemService {
  private final MenuItemRepository menuItemRepository;
  private final IamClient iamClient;

  public MenuItemService(MenuItemRepository menuItemRepository, IamClient iamClient) {
    this.menuItemRepository = menuItemRepository;
    this.iamClient = iamClient;
  }

  public List<MenuItem> getMenuItemsByVendor(String userId) {
    // Validate token and get user info
    UserInfoDto userInfo = iamClient.getUserInfo(userId);

    // // Check if the user has access to the requested vendor's menu items
    // if (!userInfo.getVendorId().equals(vendorId) &&
    // !userInfo.getRole().equals("ADMIN")) {
    // throw new UnauthorizedException("You do not have access to this vendor's menu
    // items.");
    // }

    // Fetch and return menu items for the specified vendor
    return menuItemRepository.findByVendorId(userInfo.getVendorId());
  }

  public List<MenuItem> getMenuItemsByVendorId(String vendorId) {
    return menuItemRepository.findByVendorId(vendorId);
  }

  @Transactional
  public MenuItem createMenuItem(CreateMenuItemRequest createMenuItemRequest, String userId) {
    // Validate token and get user info
    UserInfoDto userInfo = iamClient.getUserInfo(userId);

    // Create new MenuItem
    MenuItem menuItem = new MenuItem();
    menuItem.setName(createMenuItemRequest.getName());
    menuItem.setDescription(createMenuItemRequest.getDescription());
    menuItem.setPrice(createMenuItemRequest.getPrice());
    menuItem.setCategory(createMenuItemRequest.getCategory());
    menuItem.setRemaining(createMenuItemRequest.getRemaining());
    menuItem.setVendorId(userInfo.getVendorId()); // bug
    menuItem.setRating(0.0);
    menuItem.setCreatedAt(LocalDateTime.now());
    menuItem.setUpdatedAt(LocalDateTime.now());
    menuItem.setImageUrl("");

    // Save and return the new MenuItem
    return menuItemRepository.save(menuItem);
  }

  public MenuItem getMenuItemById(String itemId) {
    return menuItemRepository.findById(itemId).orElse(null);
  }

  @Transactional
  public MenuItem updateMenuItem(String itemId, CreateMenuItemRequest updateMenuItemRequest, String userId) {
    // Validate token and get user info
    UserInfoDto userInfo = iamClient.getUserInfo(userId);

    // Fetch existing MenuItem
    MenuItem menuItem = menuItemRepository.findById(itemId).orElse(null);
    if (menuItem == null) {
      return null; // Or throw an exception if preferred
    }

    // Check if the user has access to update this menu item
    if (!menuItem.getVendorId().equals(userInfo.getVendorId())) {
      throw new RuntimeException("You do not have access to update this menu item.");
    }

    // Update MenuItem fields
    menuItem.setName(updateMenuItemRequest.getName());
    menuItem.setDescription(updateMenuItemRequest.getDescription());
    menuItem.setPrice(updateMenuItemRequest.getPrice());
    menuItem.setCategory(updateMenuItemRequest.getCategory());
    menuItem.setRemaining(updateMenuItemRequest.getRemaining());
    menuItem.setUpdatedAt(LocalDateTime.now());

    // Save and return the updated MenuItem
    return menuItemRepository.save(menuItem);
  }

  @Transactional
  public void deleteMenuItem(String itemId, String userId) {
    // Validate token and get user info
    UserInfoDto userInfo = iamClient.getUserInfo(userId);

    // Fetch existing MenuItem
    MenuItem menuItem = menuItemRepository.findById(itemId).orElse(null);
    if (menuItem == null) {
      throw new RuntimeException("Menu item not found.");
    }

    // Check if the user has access to delete this menu item
    if (!menuItem.getVendorId().equals(userInfo.getVendorId())) {
      throw new RuntimeException("You do not have access to delete this menu item.");
    }

    // Delete the MenuItem
    menuItemRepository.delete(menuItem);
  }

  public Page<MenuItem> searchMenuItems(String name, String category, Pageable pageable) {
    if (name != null && category != null) {
      return menuItemRepository
          .findByNameContainingIgnoreCaseAndCategory(name, category, pageable);
    }

    if (name != null) {
      return menuItemRepository
          .findByNameContainingIgnoreCase(name, pageable);
    }

    if (category != null) {
      return menuItemRepository
          .findByCategory(category, pageable);
    }

    return menuItemRepository.findAll(pageable);
  }

  @Transactional
  public MenuItem updateMenuItemImage(String itemId, String userId, String imageUrl) {
    // Validate token and get user info
    UserInfoDto userInfo = iamClient.getUserInfo(userId);

    // Fetch existing MenuItem
    MenuItem menuItem = menuItemRepository.findById(itemId).orElse(null);
    if (menuItem == null) {
      return null; // Or throw an exception if preferred
    }

    // Check if the user has access to update this menu item
    if (!menuItem.getVendorId().equals(userInfo.getVendorId())) {
      throw new RuntimeException("You do not have access to update this menu item.");
    }

    // Update MenuItem fields
    menuItem.setImageUrl(imageUrl);
    menuItem.setUpdatedAt(LocalDateTime.now());

    // Save and return the updated MenuItem
    return menuItemRepository.save(menuItem);
  }

  @Transactional
  public MenuItem updateMenuItemRemaining(String itemId, Integer remaining) {
    // Fetch existing MenuItem
    MenuItem menuItem = menuItemRepository.findById(itemId).orElse(null);
    if (menuItem == null) {
      return null; // Or throw an exception if preferred
    }
    // Update MenuItem fields
    menuItem.setRemaining(remaining);
    menuItem.setUpdatedAt(LocalDateTime.now());

    // Save and return the updated MenuItem
    return menuItemRepository.save(menuItem);
  }
}
