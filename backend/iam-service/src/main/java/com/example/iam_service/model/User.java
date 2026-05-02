package com.example.iam_service.model;

import com.example.shared.enums.Gender;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.shared.enums.UserStatus;
import com.example.shared.hepler.CustomIdGenerator;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Data
@NoArgsConstructor
@Table(name = "users")
public class User {
    @Id
    private String userId;

    @PrePersist
    public void assignIdIfMissing() {
        if (userId == null || userId.isBlank()) {
            this.userId = CustomIdGenerator.generateUserId();
        }
    }

    private String fullName;

    @Column(nullable = false, unique = true)
    private String phoneNumber;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private LocalDate dateOfBirth;

    @Column(nullable = false, unique = true)
    private String studentId;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @Column(nullable = false)
    private String password;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;

    private String role;

    private String vendorId;

    @Column(nullable = false)
    @ColumnDefault("false")
    private Boolean isDeleted = false;

    private Double balance;

    // Membership
    // 50 points => Bronze - 5%
    // 100 points => Silver - 10%
    // 500 points => Gold - 15%
    // 2000 points => Platinum - 20%
    // Order >= 10000 total 1 point, >= 20000 total 2 points, etc.
    private Integer points;
}