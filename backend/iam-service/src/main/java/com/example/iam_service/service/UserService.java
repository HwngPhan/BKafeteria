package com.example.iam_service.service;

import com.example.iam_service.dtos.UserDtos.CreateUserRequest;
import com.example.iam_service.model.User;
import com.example.iam_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.shared.enums.UserStatus;

import java.time.LocalDateTime;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser (CreateUserRequest createUserRequest){
        String email = createUserRequest.getEmail();
        String phone = createUserRequest.getPhoneNumber();
        String studentId = createUserRequest.getStudentId();

        //Unique
//        if (userRepository.existsByEmail(email)) {
//            throw new IllegalArgumentException("Email is already in use");
//        } else if (userRepository.existsByPhoneNumber(phone)) {
//            throw new IllegalArgumentException("Phone number is already in use");
//        } else if (userRepository.existsByIdentityNumber(identity)) {
//            throw new IllegalArgumentException("Identity number is already in use");
//        }
        User user = new User();
        user.setFullName(createUserRequest.getFullName());
        user.setPhoneNumber(phone);
        user.setEmail(email);
        user.setGender(createUserRequest.getGender());
        user.setDateOfBirth(createUserRequest.getDateOfBirth());
        user.setStudentId(studentId);

        user.setStatus(UserStatus.ACTIVE);    //delete and implement a activation module
        user.setPassword(passwordEncoder.encode(createUserRequest.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setLastLogin(null);
        //Default
        user.setRoles("Customer");
        return userRepository.save(user);
    }

    @Transactional
    public void updateLastLogin(String email) {
        userRepository.updateLastLogin(email, LocalDateTime.now());
    }
}
