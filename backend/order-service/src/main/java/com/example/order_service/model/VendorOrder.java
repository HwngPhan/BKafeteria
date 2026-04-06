package com.example.order_service.model;

import com.example.shared.enums.OrderStatus;
import com.example.shared.hepler.CustomIdGenerator;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "vendor_orders")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class VendorOrder {
    @Id
    private String vendorOrderId;

    @PrePersist
    public void assignIdIfMissing() {
        if (vendorOrderId == null || vendorOrderId.isBlank()) {
            this.vendorOrderId = CustomIdGenerator.generateVendorOrderId();
        }
    }

    private String orderId;
    private String vendorId;
    private String vendorName;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<MenuItem> menuItems;
    private Double vendorPrice;
}
