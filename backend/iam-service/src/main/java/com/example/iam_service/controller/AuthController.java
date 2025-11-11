package com.example.iam_service.controller;

import com.example.iam_service.dtos.ApiResponse;
import com.example.iam_service.dtos.UserDtos.CreateUserRequest;
import com.example.iam_service.dtos.UserDtos.UserDto;
import com.example.iam_service.dtos.UserDtos.UserDtoConverter;
import com.example.iam_service.model.User;
import com.example.iam_service.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {
    private final UserService userService;
    private final UserDtoConverter userDtoConverter;

    public AuthController(UserService userService, UserDtoConverter userDtoConverter){
        this.userService=userService;
        this.userDtoConverter=userDtoConverter;
    }
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@RequestBody @Valid CreateUserRequest createUserRequest) {
        try {
            UserDto userDto = userDtoConverter.convert(userService.createUser(createUserRequest));

            ApiResponse<UserDto> response = new ApiResponse<>(
                    HttpStatus.CREATED.value(),
                    "Account registered successfully",
                    userDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
        catch (IllegalArgumentException e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to create user", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}
