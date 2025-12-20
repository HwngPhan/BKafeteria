package com.example.vendor_service.repository;

import com.example.vendor_service.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor,String> , JpaSpecificationExecutor<Vendor> {
    Optional<Vendor> findByName(String name);
    Optional<Vendor> findByManagerId(String managerId);
}
