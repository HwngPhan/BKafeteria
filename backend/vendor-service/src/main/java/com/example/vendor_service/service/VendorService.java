package com.example.vendor_service.service;

import com.example.shared.enums.VendorStatus;
import com.example.vendor_service.dtos.UserInfoDto;
import com.example.vendor_service.dtos.VendorDtos.Request.CreateVendorRequest;
import com.example.vendor_service.helper.IamClient;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.repository.VendorRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VendorService {

    private final IamClient iamClient;
    private final VendorRepository vendorRepository;
    @Value("${jwt.account.expiration}")
    private long expirationTime;

    public VendorService(VendorRepository vendorRepository,IamClient iamClient){
        this.vendorRepository=vendorRepository;
        this.iamClient=iamClient;
    }

    public List<Vendor> getPatientsByIds(List<String> ids) {
        return vendorRepository.findAllById(ids);
    }

    @Transactional
    public Vendor createVendor(CreateVendorRequest request, String managerId){

        UserInfoDto manager = iamClient.getUserInfo(managerId);

        if (manager == null || !manager.getRole().equals("MANAGER")) {
            throw new IllegalArgumentException("managerId is incorrect");
        }


        Vendor vendor = new Vendor();
        vendor.setCreatedAt(LocalDateTime.now());
        vendor.setUpdatedAt(LocalDateTime.now());
        vendor.setStatus(VendorStatus.INACTIVE);
        vendor.setName(request.getName());
        vendor.setDescription(request.getDescription());
        vendor.setManagerId(managerId);
        vendor.setWorkingHourFrom(request.getWorkingHourFrom());
        vendor.setWorkingHourTo(request.getWorkingHourTo());

        return vendorRepository.save(vendor);
    }


}
