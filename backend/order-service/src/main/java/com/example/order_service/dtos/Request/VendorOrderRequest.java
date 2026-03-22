package com.example.order_service.dtos.Request;

import java.util.List;
import lombok.Data;

@Data
public class VendorOrderRequest {
    String vendorId;
    List<ItemRequest> items;
}
