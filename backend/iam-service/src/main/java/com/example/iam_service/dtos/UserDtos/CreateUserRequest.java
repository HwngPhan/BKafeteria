package com.example.iam_service.dtos.UserDtos;


import java.time.LocalDate;


import com.example.iam_service.model.enums.Gender;
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
public class CreateUserRequest {
    @Email
    private String email;

    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String fullName;

    @NotBlank
    private String studentId;

    @NotNull
    private Gender gender;

    @NotNull
    @PastOrPresent
    private LocalDate dateOfBirth;

    @NotBlank
    private String password;
}
