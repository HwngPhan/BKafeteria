package com.example.menu_service.repository;

import com.example.menu_service.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem,String> , JpaSpecificationExecutor<MenuItem> {
  List<MenuItem> findByVendorId(String vendorId);
}
