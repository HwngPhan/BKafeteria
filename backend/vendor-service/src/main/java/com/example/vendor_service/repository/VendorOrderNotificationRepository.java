package com.example.vendor_service.repository;

import com.example.shared.enums.OrderStatus;
import com.example.vendor_service.model.VendorOrderNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VendorOrderNotificationRepository extends JpaRepository<VendorOrderNotification, String> {
    List<VendorOrderNotification> findByVendorId(String vendorId);
    List<VendorOrderNotification> findByVendorIdAndStatus(String vendorId, OrderStatus status);
    Page<VendorOrderNotification> findByVendorIdIn(List<String> vendorIds, Pageable pageable);
    Page<VendorOrderNotification> findByVendorIdInAndStatusIn(List<String> vendorIds, List<OrderStatus> statuses, Pageable pageable);

    // Dashboard queries
    long countByVendorIdIn(List<String> vendorIds);
    long countByVendorIdInAndStatus(List<String> vendorIds, OrderStatus status);
    List<VendorOrderNotification> findByVendorIdInAndStatus(List<String> vendorIds, OrderStatus status);
    List<VendorOrderNotification> findByVendorIdInAndStatusAndCreatedAtAfter(List<String> vendorIds, OrderStatus status, LocalDateTime after);
    List<VendorOrderNotification> findTop50ByVendorIdInOrderByCreatedAtDesc(List<String> vendorIds);
}
