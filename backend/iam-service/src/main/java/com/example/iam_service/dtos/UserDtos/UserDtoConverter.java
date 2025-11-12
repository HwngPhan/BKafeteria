package com.example.iam_service.dtos.UserDtos;

import com.example.iam_service.model.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

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
    } // class User -> UserDto

    public List<UserDto> convert(List<User> fromList) {
        return fromList.stream().map(this::convert).toList();
    }

    public Optional<UserDto> convert(Optional<User> fromOptional) {
        return fromOptional.map(this::convert);
    }
}
