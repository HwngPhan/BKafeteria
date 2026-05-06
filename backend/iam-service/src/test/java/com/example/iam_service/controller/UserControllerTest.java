package com.example.iam_service.controller;

import com.example.iam_service.dtos.UserDtos.*;
import com.example.iam_service.service.UserService;
import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import com.example.shared.dtos.PageDtos.PageDto;
import com.example.shared.dtos.PageDtos.PageDtoConverter;
import com.example.iam_service.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserService userService;
    @Mock
    private UserDtoConverter userDtoConverter;
    @Mock
    private PageDtoConverter pageDtoConverter;

    @InjectMocks
    private UserController userController;

    @Test
    void getMe_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("1");
        
        User user = new User();
        UserDto userDto = new UserDto(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

        when(userService.getUserById("1")).thenReturn(user);
        when(userDtoConverter.convert(user)).thenReturn(userDto);

        ResponseEntity<ApiResponse<UserDto>> response = userController.getMe(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("User retrieved successfully", response.getBody().getMessage());
    }

    @Test
    void updateMe_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("1");
        
        UpdateUserRequest request = new UpdateUserRequest();
        User user = new User();
        UserDto userDto = new UserDto(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

        when(userService.updateUser(eq("1"), any(UpdateUserRequest.class))).thenReturn(user);
        when(userDtoConverter.convert(user)).thenReturn(userDto);

        ResponseEntity<ApiResponse<UserDto>> response = userController.updateMe(userDetails, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User updated successfully", response.getBody().getMessage());
    }

    @Test
    void getAllUsers_Success() {
        UserFilterRequest filter = new UserFilterRequest();
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> page = new PageImpl<>(Collections.emptyList());
        PageDto<UserDto> pageDto = PageDto.empty();

        when(userService.getAllUsers(any(), any())).thenReturn(page);
        doReturn(pageDto).when(pageDtoConverter).convert(any(), any());

        ResponseEntity<ApiResponse<PageDto<UserDto>>> response = userController.getAllUsers(filter, pageable);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getUserById_Success() {
        String id = "1";
        User user = new User();
        UserDto userDto = new UserDto(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

        when(userService.getUserById(id)).thenReturn(user);
        when(userDtoConverter.convert(user)).thenReturn(userDto);

        ResponseEntity<ApiResponse<UserDto>> response = userController.getUserById(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void updateUserAdmin_Success() {
        String id = "1";
        UpdateUserRequestAdmin request = new UpdateUserRequestAdmin();
        Authentication auth = mock(Authentication.class);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))).when(auth).getAuthorities();

        User user = new User();
        UserDto userDto = new UserDto(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

        when(userService.updateUserAdmin(eq(id), any(UpdateUserRequestAdmin.class), eq("ADMIN"))).thenReturn(user);
        when(userDtoConverter.convert(user)).thenReturn(userDto);

        ResponseEntity<ApiResponse<UserDto>> response = userController.updateUser(id, request, auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void deleteUser_Success() {
        String id = "1";
        doNothing().when(userService).deleteUser(id, true);

        ResponseEntity<ApiResponse<UserDto>> response = userController.deleteUser(id, true);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userService, times(1)).deleteUser(id, true);
    }

    @Test
    void assignVendor_Success() {
        String vendorId = "vendor1";
        AssignVendorRequest request = new AssignVendorRequest();
        Authentication auth = mock(Authentication.class);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_MANAGER"))).when(auth).getAuthorities();

        User user = new User();
        UserDto userDto = new UserDto(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

        when(userService.assignVendor(eq(vendorId), any(AssignVendorRequest.class))).thenReturn(user);
        when(userDtoConverter.convert(user)).thenReturn(userDto);

        ResponseEntity<ApiResponse<UserDto>> response = userController.assignVendor(vendorId, request, auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void setBalance_Success() {
        SetBalanceRequest request = new SetBalanceRequest();
        request.setUserId("1");
        request.setBalance(100.0);
        Authentication auth = mock(Authentication.class);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_INTERNAL_SERVICE"))).when(auth).getAuthorities();

        User user = new User();
        UserDto userDto = new UserDto(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

        when(userService.setBalance(anyString(), anyDouble())).thenReturn(user);
        when(userDtoConverter.convert(user)).thenReturn(userDto);

        ResponseEntity<ApiResponse<UserDto>> response = userController.setBalance(request, auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void addPoints_Success() {
        AddPointsRequest request = new AddPointsRequest();
        request.setUserId("1");
        request.setPoints(10);
        Authentication auth = mock(Authentication.class);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_INTERNAL_SERVICE"))).when(auth).getAuthorities();

        User user = new User();
        UserDto userDto = new UserDto(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

        when(userService.addPoints(anyString(), anyInt())).thenReturn(user);
        when(userDtoConverter.convert(user)).thenReturn(userDto);

        ResponseEntity<ApiResponse<UserDto>> response = userController.addPoints(request, auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
