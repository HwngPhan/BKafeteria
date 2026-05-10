package com.example.order_service.dtos;

import com.example.order_service.model.VendorOrder;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class VendorOrderDtoConverter {
    public VendorOrderDto convert(VendorOrder from) {
        return new VendorOrderDto(
                from.getVendorOrderId(),
                from.getVendorId(),
                from.getVendorName(),
                from.getOrderId(),
                from.getStatus(),
                from.getVendorPrice(),
                from.getMenuItems());
    }

    public List<VendorOrderDto> convert(List<VendorOrder> fromList) {
        return fromList.stream().map(this::convert).toList();
    }
}
