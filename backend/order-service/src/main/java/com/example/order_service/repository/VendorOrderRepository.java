package com.example.order_service.repository;

import com.example.order_service.model.VendorOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorOrderRepository extends JpaRepository<VendorOrder, String>, JpaSpecificationExecutor<VendorOrder> {
    List<VendorOrder> findByOrderId(String orderId);

    List<VendorOrder> findByVendorId(String vendorId);
}
