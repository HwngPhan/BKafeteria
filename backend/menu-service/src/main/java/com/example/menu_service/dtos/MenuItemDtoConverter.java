package com.example.menu_service.dtos;

import com.example.menu_service.model.MenuItem;
import org.springframework.stereotype.Component;

import java.util.List;
@Component
public class MenuItemDtoConverter {
  public MenuItemDto convert(MenuItem from){
    return new MenuItemDto(
      from.getMenuItemid(),
      from.getName(),
      from.getDescription(),
      from.getPrice(),
      from.getRemaining(),
      from.getCategory(),
      from.getRating(),
      from.getCreatedAt(),
      from.getUpdatedAt()
      // from.getImageUrl()
    );
  }

  public List<MenuItemDto> convertList(List<MenuItem> menuItems){
    return menuItems.stream().map(this::convert).toList();
  }
}
