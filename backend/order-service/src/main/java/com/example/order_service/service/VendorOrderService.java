package com.example.order_service.service;

import com.example.order_service.dtos.UserInfoDto;
import com.example.order_service.helper.IamClient;
import com.example.order_service.model.VendorOrder;
import com.example.order_service.repository.VendorOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VendorOrderService {
    private final VendorOrderRepository vendorOrderRepository;
    private final IamClient iamClient;

    public VendorOrderService(VendorOrderRepository vendorOrderRepository, IamClient iamClient) {
        this.vendorOrderRepository = vendorOrderRepository;
        this.iamClient = iamClient;
    }

    public List<VendorOrder> getVendorOrdersByVendorId(String staffId) {
        UserInfoDto staff = iamClient.getUserInfo(staffId);
        return vendorOrderRepository.findByVendorId(staff.getVendorId());
    }

    public VendorOrder createVendorOrder(VendorOrder vendorOrder) {
        return vendorOrderRepository.save(vendorOrder);
    }

    public void deleteVendorOrder(String vendorOrderId) {
        vendorOrderRepository.deleteById(vendorOrderId);
    }

    public VendorOrder updateVendorOrder(VendorOrder vendorOrder) {
        return vendorOrderRepository.save(vendorOrder);
    }
}
