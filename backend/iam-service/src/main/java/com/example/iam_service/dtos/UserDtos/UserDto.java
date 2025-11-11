package com.example.iam_service.dtos.UserDtos;


import com.example.iam_service.model.enums.Gender;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserDto(
        Long userId,
        String fullName,
        String phoneNumber,
        String email,
        Gender gender,
        LocalDate dateOfBirth,
        String studentId,
        String status,
        String password,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime lastLogin,
        Boolean isDeleted,
        String role){}
