package com.example.iam_service.dtos.UserDtos;


import com.example.shared.enums.Gender;
import com.example.shared.enums.SystemRole;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserDto(
        String userId,
        String fullName,
        String phoneNumber,
        String email,
        Gender gender,
        LocalDate dateOfBirth,
        String studentId,
        String status,
        String vendorId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime lastLogin,
        Boolean isDeleted,
        String role){}
