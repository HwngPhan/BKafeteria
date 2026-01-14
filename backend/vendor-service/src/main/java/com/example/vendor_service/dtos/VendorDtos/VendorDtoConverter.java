package com.example.vendor_service.dtos.VendorDtos;

import com.example.vendor_service.model.Vendor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class VendorDtoConverter {
    public VendorDto convert(Vendor from) {

        return new VendorDto(
                from.getVendorId(),
                from.getName(),
                from.getDescription(),
                from.getStatus(),
                from.getWorkingHourFrom(),
                from.getWorkingHourTo(),
                from.getCertification(),
                from.getManagerId(),
                from.getCreatedAt(),
                from.getUpdatedAt(),
                from.getApprovedBy());
    }

    public List<VendorDto> convert(List<Vendor> fromList) {
        return fromList.stream().map(this::convert).toList();
    }

    public Optional<VendorDto> convert(Optional<Vendor> fromOptional) {
        return fromOptional.map(this::convert);
    }
}
