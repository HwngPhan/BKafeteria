package com.example.order_service.dtos.Request;

import java.util.List;
import lombok.Data;

@Data
public class OrderRequest {
    List<VendorOrderRequest> vendorOrders;
}
