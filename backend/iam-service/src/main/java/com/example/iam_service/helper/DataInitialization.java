package com.example.iam_service.helper;

import com.example.iam_service.model.User;
import com.example.iam_service.repository.UserRepository;
import com.example.shared.enums.Gender;
import com.example.shared.enums.UserStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitialization implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitialization.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitialization(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("Starting data initialization...");
        createUserIfNotExists();
        logger.info("Data initialization completed successfully!");
    }

    private void createUserIfNotExists() {
        if (userRepository.count() == 0) {
            logger.info("Initializing admin user...");
            createAdmin();
            createManager();
            createCustomer();
            logger.info("Users initialized successfully!");
        } else {
            logger.info("Users already exists, skipping initialization.");
        }
    }

    private void createAdmin() {
        User adminUser = new User();
        adminUser.setUserId("U-12345678");
        adminUser.setFullName("admin");
        adminUser.setRole("ADMIN");
        adminUser.setGender(Gender.MALE);
        adminUser.setEmail("admin@gmail.com");
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setStudentId("111111");
        adminUser.setDateOfBirth(LocalDate.of(2000, 1, 1));
        adminUser.setPhoneNumber("0831231234");
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser.setCreatedAt(LocalDateTime.now());
        adminUser.setUpdatedAt(LocalDateTime.now());

        userRepository.save(adminUser);
    }

    private void createManager() {
        User managerUser = new User();
        managerUser.setUserId("U-22345678");
        managerUser.setFullName("manager");
        managerUser.setRole("MANAGER");
        managerUser.setGender(Gender.FEMALE);
        managerUser.setEmail("manager@gmail.com");
        managerUser.setPassword(passwordEncoder.encode("manager123"));
        managerUser.setStudentId("222222");
        managerUser.setDateOfBirth(LocalDate.of(2001, 2, 2));
        managerUser.setPhoneNumber("0842342345");
        managerUser.setStatus(UserStatus.ACTIVE);
        managerUser.setVendorId("V-21420247");
        managerUser.setCreatedAt(LocalDateTime.now());
        managerUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(managerUser);
    }

    private void createCustomer() {
        User customerUser = new User();
        customerUser.setFullName("customer");
        customerUser.setRole("CUSTOMER");
        customerUser.setGender(Gender.MALE);
        customerUser.setEmail("customer@gmail.com");
        customerUser.setPassword(passwordEncoder.encode("customer123"));
        customerUser.setStudentId("333333");
        customerUser.setDateOfBirth(LocalDate.of(2002, 3, 3));
        customerUser.setPhoneNumber("0853453456");
        customerUser.setStatus(UserStatus.ACTIVE);
        customerUser.setCreatedAt(LocalDateTime.now());
        customerUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(customerUser);
    }
}