package com.example.iam_service.service;

import com.example.iam_service.dtos.UserDtos.CreateUserRequest;
import com.example.iam_service.dtos.UserDtos.UpdateUserRequest;
import com.example.iam_service.dtos.UserDtos.UpdateUserRequestAdmin;
import com.example.iam_service.dtos.UserDtos.UserFilterRequest;
import com.example.iam_service.model.User;
import com.example.iam_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.shared.enums.UserStatus;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Consumer;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate stringRedisTemplate;
    private final ActivationService activateService;


    @Value("${jwt.account.expiration}")
    private long expirationTime;


    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,StringRedisTemplate stringRedisTemplate,
    ActivationService activateService){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.stringRedisTemplate=stringRedisTemplate;
        this.activateService=activateService;
    }

    public User createUser (CreateUserRequest createUserRequest,String token){
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
        user.setRole("CUSTOMER");

        stringRedisTemplate.opsForValue().set("activate:" + token, user.getEmail(), java.time.Duration.ofMillis(expirationTime));

        activateService.sendActivationEmail(createUserRequest, token, user);

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

    @Transactional
    public User updateUserAdmin(String userId, UpdateUserRequestAdmin req, String callerRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (req.getEmail() != null) {
            if (!req.getEmail().equals(user.getEmail()) &&
                    userRepository.existsByEmailAndUserIdNot(req.getEmail(), userId)) {
                throw new IllegalArgumentException("Email is already in use");
            }
        }

        String requestedRole = normalizeRole(req.getRole());
        String currentTargetRole = normalizeRole(user.getRole());

        if (requestedRole != null
                && currentTargetRole != null
                && !requestedRole.equals(currentTargetRole)) {

            validateRoleAssignment(callerRole, currentTargetRole, requestedRole);
        }

        copyIfPresent(req.getFullName(), user::setFullName);
        copyIfPresent(req.getPhoneNumber(), user::setPhoneNumber);
        if (req.getEmail() != null) {
            user.setEmail(req.getEmail());
        }
        copyIfPresent(req.getGender(), user::setGender);
        copyIfPresent(req.getDateOfBirth(), user::setDateOfBirth);
        if (requestedRole != null && !Objects.equals(requestedRole, currentTargetRole)) {
            user.setRole(requestedRole);
        }
        user.setUpdatedAt(LocalDateTime.now());

        return user;
    }

    private String normalizeRole(String role) {
        return role == null ? null : role.trim().toUpperCase();
    }

    private void validateRoleAssignment(String callerRoleRaw, String targetCurrentRoleRaw, String requestedRoleRaw) {
        String callerRole = normalizeRole(callerRoleRaw);
        String targetRole = normalizeRole(targetCurrentRoleRaw);
        String requestedRole = normalizeRole(requestedRoleRaw);

        if (requestedRole == null || requestedRole.isEmpty()) {
            throw new IllegalArgumentException("Requested role must be provided");
        }

        if (callerRole == null) {
            throw new IllegalArgumentException("Unable to determine caller role (not authenticated)");
        }

        switch (callerRole) {

            // ADMIN CAN ASSIGN ANY ROLE CHANGE
            case "ADMIN":
                return;

            // MANAGER ROLE RULES
            case "MANAGER":

                // MANAGER cannot modify ADMIN users at all
                if ("ADMIN".equals(targetRole)) {
                    throw new IllegalArgumentException("MANAGER cannot modify ADMIN accounts");
                }

                // MANAGER cannot assign ADMIN or MANAGER to anyone
                if ("ADMIN".equals(requestedRole) || "MANAGER".equals(requestedRole)) {
                    throw new IllegalArgumentException("MANAGER cannot assign ADMIN or MANAGER roles");
                }

                // CUSTOMER → STAFF
                if ("CUSTOMER".equals(targetRole) && "STAFF".equals(requestedRole)) {
                    return;
                }

                // STAFF → CUSTOMER
                if ("STAFF".equals(targetRole) && "CUSTOMER".equals(requestedRole)) {
                    return;
                }

                throw new IllegalArgumentException("MANAGER can only promote CUSTOMER→STAFF or demote STAFF→CUSTOMER");

            default:
                throw new IllegalArgumentException("You do not have permission to assign roles");
        }
    }


    private Optional<String> getCallerHighestRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) {
            return Optional.empty();
        }

        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)   // e.g. "ROLE_ADMIN"
                .filter(Objects::nonNull)
                .map(a -> a.replaceFirst("^ROLE_", ""))
                .map(String::toUpperCase)
                .findFirst();
    }

    @Transactional
    public void deleteUser(String userId, Boolean softDelete) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (softDelete) {
            user.setIsDeleted(true);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        } else {
            userRepository.delete(user);
        }
    }

    public org.springframework.data.domain.Page<User> getAllUsers(UserFilterRequest userFilterRequest,
                                                                  org.springframework.data.domain.Pageable pageable) {
        return userRepository.findAll(userFilterRequest.toSpecification(), pageable);
    }

    @Transactional
    public boolean resetPassword(String email, String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(newPassword, user.getPassword())) {
                throw new IllegalArgumentException("This is the same as the old password!");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }
        return false;
    }

}
