package com.example.vendor_service.model;

import com.example.shared.enums.VendorStatus;
import com.example.shared.hepler.CustomIdGenerator;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "vendors")
public class Vendor {
    @Id
    private String vendorId;

    @PrePersist
    public void assignIdIfMissing() {
        if (vendorId == null || vendorId.isBlank()) {
            this.vendorId = CustomIdGenerator.generateVendorId();
        }
    }
    @Column(nullable = false, unique = true)
    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private VendorStatus status;

    private LocalTime workingHourFrom;
    private LocalTime workingHourTo;

    @Column(nullable = false)
    private String managerId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

//    @Column(nullable = false)
//    private String approvedBy;
}
