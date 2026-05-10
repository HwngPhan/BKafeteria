package com.example.order_service.repository;

import com.example.order_service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.example.shared.enums.OrderStatus;
import java.time.LocalDateTime;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {

    List<Order> findByCustomerId(String customerId);

    List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime time);
}
