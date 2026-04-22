package com.example.vendor_service.model;

import com.example.shared.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vendor_order_notifications")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VendorOrderNotification {

    @Id
    private String vendorOrderId;

    private String orderId;
    private String vendorId;
    private String customerId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<MenuItem> menuItems;

    private LocalDateTime createdAt;
    private LocalDateTime readyAt;
}
