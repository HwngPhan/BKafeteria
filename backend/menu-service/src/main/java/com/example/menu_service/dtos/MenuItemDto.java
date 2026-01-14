package com.example.menu_service.dtos;

import java.time.LocalDateTime;

public record MenuItemDto (
  String menuItemid,
  String name,
  String description,
  double price,
  Integer remaining,
  String category,
  double rating,
  LocalDateTime createdAt,
  LocalDateTime updatedAt
  // String imageUrl;
){}
