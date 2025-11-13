package com.example.iam_service.model;

import java.util.Set;

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

    private String phoneNumber;

    @Column(nullable = false, unique = true)
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

    @Column(nullable = false)
    @ColumnDefault("false")
    private Boolean isDeleted = false;
}