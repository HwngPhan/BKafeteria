package com.example.vendor_service.dtos.KafkaMessage;

import com.example.shared.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatusUpdateMessage {
    private String orderId;
    private String vendorOrderId;
    private String vendorId;
    private String customerId;
    private OrderStatus status;
    private String message;
    private LocalDateTime timestamp;
}
