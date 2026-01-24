package com.example.menu_service.repository;

import com.example.menu_service.model.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem,String> , JpaSpecificationExecutor<MenuItem> {
  List<MenuItem> findByVendorId(String vendorId);

  Page<MenuItem> findByNameContainingIgnoreCase(
          String name, Pageable pageable);

  Page<MenuItem> findByCategory(
          String category, Pageable pageable);

  Page<MenuItem> findByNameContainingIgnoreCaseAndCategory(
          String name, String category, Pageable pageable);
}
