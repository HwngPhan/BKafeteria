package com.example.iam_service.service;

import com.example.iam_service.dtos.UserDtos.CreateUserRequest;
import com.example.iam_service.dtos.UserDtos.UpdateUserRequest;
import com.example.iam_service.model.User;
import com.example.iam_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.shared.enums.UserStatus;

import java.time.LocalDateTime;
import java.util.function.Consumer;

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

    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    private <T> void copyIfPresent(T value, Consumer<T> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }

    @Transactional
    public User updateUser(String userId, UpdateUserRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        copyIfPresent(req.getFullName(), user::setFullName);
        copyIfPresent(req.getPhoneNumber(), user::setPhoneNumber);

        if (req.getEmail() != null) {
            if (!req.getEmail().equals(user.getEmail()) &&
                    userRepository.existsByEmailAndUserIdNot(req.getEmail(), userId)) {
                throw new IllegalArgumentException("Email is already in use");
            }
            user.setEmail(req.getEmail());
        }
        copyIfPresent(req.getGender(), user::setGender);
        copyIfPresent(req.getDateOfBirth(), user::setDateOfBirth);
        user.setUpdatedAt(LocalDateTime.now());

        return user;
    }
}
