package com.example.vendor_service.repository;

import com.example.shared.enums.OrderStatus;
import com.example.vendor_service.model.VendorOrderNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorOrderNotificationRepository extends JpaRepository<VendorOrderNotification, String> {
    List<VendorOrderNotification> findByVendorId(String vendorId);
    List<VendorOrderNotification> findByVendorIdAndStatus(String vendorId, OrderStatus status);
}
