package com.example.menu_service.helper;

import com.example.menu_service.model.MenuItem;
import com.example.shared.enums.VendorStatus;
import com.example.menu_service.repository.MenuItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DataInitialization implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitialization.class);
    private final MenuItemRepository menuItemRepository;
    
    public DataInitialization(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("Starting data initialization...");
        createMenuItemIfNotExist();
        logger.info("Data initialization completed successfully!");
    }

    private void createMenuItemIfNotExist() {
        if (menuItemRepository.count() == 0) {
            logger.info("Initializing admin user...");
            createMenuItem();
            logger.info("Menu initialized successfully!");
        } else {
            logger.info("Menu already exists, skipping initialization.");
        }
    }
    private void createMenuItem(){
        MenuItem menuItem=new MenuItem();
        menuItem.setMenuItemId("I-12345678");
        menuItem.setName("test");
        menuItem.setCreatedAt(LocalDateTime.now());
        menuItem.setCategory("Food");
        menuItem.setDescription("test");
        menuItem.setPrice(10000);
        menuItem.setRemaining(10);
        menuItem.setUpdatedAt(LocalDateTime.now());
        menuItem.setVendorId("V-21420247");
        menuItemRepository.save(menuItem);
    }
}
