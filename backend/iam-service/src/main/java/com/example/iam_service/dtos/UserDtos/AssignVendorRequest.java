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
public class AssignVendorRequest {

    @Email
    @NotBlank
    private String email;
    @NotBlank
    private String role;

}
