package com.example.order_service.model;

import com.example.shared.hepler.CustomIdGenerator;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import com.example.shared.enums.OrderStatus;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Data
@NoArgsConstructor
@Table(name = "orders")
public class Order {
    @Id
    private String orderId;

    @PrePersist
    public void assignIdIfMissing() {
        if (orderId == null || orderId.isBlank()) {
            this.orderId = CustomIdGenerator.generateOrderId();
        }
    }

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<OrderItem> orderItems;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Double totalPrice;

    @Column(nullable = false)
    @ColumnDefault("false")
    private Boolean isDeleted = false;
}