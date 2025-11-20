package com.example.iam_service.dtos.UserDtos;

import java.time.LocalDate;

import com.example.shared.enums.Gender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRequestAdmin {
    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String studentId;

    @NotNull
    private Gender gender;

    @NotNull
    @PastOrPresent
    private LocalDate dateOfBirth;

    // Assign role
    @NotNull
    private String role;
}
