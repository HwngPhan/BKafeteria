package com.example.order_service.dtos.Request;

import lombok.Data;

import java.util.List;

@Data
public class PaymentRequest {
    private List<String> voucherIds;
}
