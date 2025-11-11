package com.example.iam_service.controller;

import com.example.iam_service.dtos.ApiResponse;
import com.example.iam_service.dtos.UserDtos.CreateUserRequest;
import com.example.iam_service.dtos.UserDtos.UserDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/users")
public class UserController {

}


