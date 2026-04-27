package com.example.vendor_service.dtos.KafkaMessage;

import com.example.vendor_service.model.MenuItem;
import com.example.shared.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VendorNotificationMessage {
    private String orderId;
    private String vendorOrderId;
    private String vendorId;
    private String customerId;
    private OrderStatus status;
    private String message;
    private List<MenuItem> menuItems;
}
