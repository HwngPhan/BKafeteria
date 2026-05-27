package com.example.menu_service.service;

import com.example.menu_service.dtos.Request.CreateVoucherRequest;
import com.example.menu_service.dtos.Request.UpdateVoucherRequest;
import com.example.menu_service.dtos.VoucherDto;
import com.example.menu_service.model.Voucher;
import com.example.menu_service.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private static final String VOUCHER_NOT_FOUND = "Voucher not found";

    private final VoucherRepository voucherRepository;

    public VoucherDto createVoucher(CreateVoucherRequest request, String vendorId) {
        Voucher voucher = new Voucher();
        voucher.setDiscountPercentage(request.getDiscountPercentage());
        voucher.setStartDate(request.getStartDate());
        voucher.setExpiryDate(request.getExpiryDate());
        voucher.setVendorId(vendorId);
        return toDto(voucherRepository.save(voucher));
    }

    public VoucherDto updateVoucher(String voucherId, UpdateVoucherRequest request) {
        if (voucherId == null) throw new IllegalArgumentException("Voucher ID must not be null");
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new IllegalArgumentException(VOUCHER_NOT_FOUND));
        voucher.setDiscountPercentage(request.getDiscountPercentage());
        voucher.setStartDate(request.getStartDate());
        voucher.setExpiryDate(request.getExpiryDate());
        return toDto(voucherRepository.save(voucher));
    }

    public VoucherDto getById(String voucherId) {
        if (voucherId == null) throw new IllegalArgumentException("Voucher ID must not be null");
        return voucherRepository.findById(voucherId)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException(VOUCHER_NOT_FOUND));
    }

    public List<VoucherDto> getByVendorId(String vendorId) {
        return voucherRepository.findByVendorId(vendorId)
                .stream().map(this::toDto).toList();
    }

    public VoucherDto validate(String voucherId, List<String> orderVendorIds) {
        if (voucherId == null) throw new IllegalArgumentException("Voucher ID must not be null");
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new IllegalArgumentException(VOUCHER_NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(voucher.getStartDate()) || now.isAfter(voucher.getExpiryDate())) {
            throw new IllegalArgumentException("Voucher is expired or not yet active");
        }

        if (voucher.getVendorId() == null || !orderVendorIds.contains(voucher.getVendorId())) {
            throw new IllegalArgumentException("Voucher is not applicable for any vendor in this order");
        }

        return toDto(voucher);
    }

    public void deleteVoucher(String voucherId) {
        if (voucherId == null) throw new IllegalArgumentException("Voucher ID must not be null");
        if (!voucherRepository.existsById(voucherId))
            throw new IllegalArgumentException(VOUCHER_NOT_FOUND);
        voucherRepository.deleteById(voucherId);
    }

    private VoucherDto toDto(Voucher v) {
        return new VoucherDto(v.getVoucherId(), v.getDiscountPercentage(),
                v.getStartDate(), v.getExpiryDate(), v.getVendorId());
    }
}
