package com.example.vendor_service.helper;

import com.example.shared.enums.VendorStatus;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.repository.VendorRepository;

import java.time.LocalDateTime;
import java.time.LocalTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitialization implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitialization.class);
    private VendorRepository vendorRepository;
    
    public DataInitialization(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("Starting data initialization...");
        createVendorIfNotExist();
        logger.info("Data initialization completed successfully!");
    }

    private void createVendorIfNotExist() {
        if (vendorRepository.count() == 0) {
            logger.info("Initializing admin user...");
            createVendor();
            logger.info("Users initialized successfully!");
        } else {
            logger.info("Vendors already exists, skipping initialization.");
        }
    }
    private void createVendor(){
        Vendor vendor=new Vendor();
        vendor.setVendorId("V-21420247");
        vendor.setName("Test");
        vendor.setStatus(VendorStatus.ACCEPTED);
        vendor.setCreatedAt(LocalDateTime.now());
        vendor.setUpdatedAt(LocalDateTime.now());
        vendor.setManagerId("U-22345678");
        vendor.setDescription("Test");
        vendor.setApprovedBy("U-12345678");
        vendor.setWorkingHourFrom(LocalTime.of(8,0));
        vendor.setWorkingHourTo(LocalTime.of(17,0));
        vendor.setCertification("ISO 9001");
        vendorRepository.save(vendor);
    }
}
