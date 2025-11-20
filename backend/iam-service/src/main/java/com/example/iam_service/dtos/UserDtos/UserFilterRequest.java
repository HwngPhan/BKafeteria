package com.example.iam_service.dtos.UserDtos;

import java.util.List;

import com.example.shared.enums.SystemRole;
import org.springframework.data.jpa.domain.Specification;

import com.example.iam_service.model.User;
import com.example.iam_service.specification.UserSpecification;
import com.example.shared.dtos.Filterable;
import com.example.shared.enums.Gender;
import com.example.shared.enums.UserStatus;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserFilterRequest implements Filterable<User> {
    @Parameter(description = "Search term for user full name, phone number, student id, or email", required = false)
    private String search;

    // FilterProps
    @Parameter(required = false)
    private Gender gender;

    @Parameter(required = false)
    private UserStatus status;

    @Parameter(required = false, description = "Show deleted users, default is false")
    private Boolean isDeleted = false;

    @Parameter(description = "Role of users", required = false)
    private String role;

    @Override
    public Specification<User> toSpecification() {
        Specification<User> searchSpec = null;
        if (org.apache.commons.lang3.StringUtils.isNotBlank(search)) {
            searchSpec = Specification.anyOf(
                    UserSpecification.hasFullName(search),
                    UserSpecification.hasPhoneNumber(search),
                    UserSpecification.hasStudentId(search),
                    UserSpecification.hasEmailExact(search));
        }

        Specification<User> spec = Specification.allOf(
                searchSpec,
                gender == null ? null : UserSpecification.hasGender(gender),
                status == null ? null : UserSpecification.hasStatus(status),
                role == null || role.isEmpty() ? null : UserSpecification.hasRole(role),
                isDeleted == null || !isDeleted ? UserSpecification.isDeleted(isDeleted) : null);

        return spec;
    }
}
