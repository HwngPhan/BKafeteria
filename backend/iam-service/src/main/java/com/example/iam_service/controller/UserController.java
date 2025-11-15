package com.example.iam_service.controller;

import com.example.iam_service.dtos.UserDtos.*;
import com.example.iam_service.service.UserService;
import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import com.example.shared.dtos.PageDtos.PageDto;
import com.example.shared.dtos.PageDtos.PageDtoConverter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.Objects;

@Slf4j
@RestController
@RequestMapping("/users")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    private final UserService userService;
    private final UserDtoConverter userDtoConverter;
    private final PageDtoConverter pageDtoConverter;


    public UserController(UserService userService, UserDtoConverter userDtoConverter, PageDtoConverter pageDtoConverter) {
        this.userService = userService;
        this.userDtoConverter = userDtoConverter;
        this.pageDtoConverter = pageDtoConverter;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getMe(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        try {
            UserDto userDto = userDtoConverter
                    .convert(userService.getUserById(customUserDetails.getId()));

            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.OK.value(), "User retrieved successfully",
                    userDto);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to retrieve user", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateMe(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody @Valid UpdateUserRequest updateUserRequest){
        try {
            String userId = customUserDetails.getId();
            UserDto userDto = userDtoConverter.convert(userService.updateUser(userId, updateUserRequest));

            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.OK.value(), "User updated successfully",
                    userDto);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to update user", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageDto<UserDto>>> getAllUsers(
            @ParameterObject @Valid UserFilterRequest userFilterDto,
            @ParameterObject @PageableDefault(size = 10, sort = "fullName", direction = org.springframework.data.domain.Sort.Direction.DESC) org.springframework.data.domain.Pageable pageable) {
        try {
            PageDto<UserDto> pageDto = pageDtoConverter.convert(userService.getAllUsers(userFilterDto, pageable),
                    userDtoConverter::convert);

            ApiResponse<PageDto<UserDto>> response = new ApiResponse<>(HttpStatus.OK.value(),
                    "Users retrieved successfully", pageDto);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse<PageDto<UserDto>> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to retrieve users", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable String id) {
        try {
            UserDto userDto = userDtoConverter.convert(userService.getUserById(id));
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.OK.value(), "User retrieved successfully", userDto);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to retrieve user", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable String id,
            @RequestBody @Valid UpdateUserRequestAdmin updateUserRequest,
            Authentication authentication) {
        try {
            // Extract caller role (first non-null role)
            String callerRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(Objects::nonNull)
                    .map(auth -> auth.replace("ROLE_", ""))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("Caller has no role"));

            UserDto userDto = userDtoConverter.convert(userService.updateUserAdmin(id, updateUserRequest, callerRole));
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.OK.value(), "User updated successfully", userDto);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to update user", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> deleteUser(@PathVariable String id,
                                                           @RequestParam(required = false, defaultValue = "true", name = "soft-delete") Boolean softDelete) {
        try {
            userService.deleteUser(id, softDelete);
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.OK.value(), "User deleted successfully", null);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to delete user", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}


