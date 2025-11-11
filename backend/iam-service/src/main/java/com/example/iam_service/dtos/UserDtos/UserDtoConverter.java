package com.example.iam_service.dtos.UserDtos;

import com.example.iam_service.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserDtoConverter {
    public UserDto convert(User from){
        return new UserDto(
                from.getUserId(),
                from.getFullName(),
                from.getPhoneNumber(),
                from.getEmail(),
                from.getGender(),
                from.getDateOfBirth(),
                from.getStudentId(),
                from.getStatus().name(),
                from.getPassword(),
                from.getCreatedAt(),
                from.getUpdatedAt(),
                from.getLastLogin(),
                from.getIsDeleted(),
                from.getRoles());
    }// class User -> UserDto
}
