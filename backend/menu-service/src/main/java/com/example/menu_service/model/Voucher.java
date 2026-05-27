package com.example.menu_service.model;

import com.example.shared.hepler.CustomIdGenerator;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "vouchers")
public class Voucher {
    @Id
    String voucherId;

    @PrePersist
    public void assignIdIfMissing() {
        if (voucherId == null || voucherId.isBlank()) {
            this.voucherId = CustomIdGenerator.generateVoucherId();
        }
    }

    @NotNull
    Double discountPercentage;
    
    @NotNull
    LocalDateTime startDate;
    @NotNull
    LocalDateTime expiryDate;

    String vendorId;
}
