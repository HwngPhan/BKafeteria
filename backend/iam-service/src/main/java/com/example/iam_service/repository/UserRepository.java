package com.example.iam_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.iam_service.model.User;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
	// Define custom query methods if needed
    @Modifying
    @Query("UPDATE User u SET u.lastLogin = :time WHERE u.email = :email")
    void updateLastLogin(@Param("email") String email, @Param("time") LocalDateTime time);

    boolean existsByEmailAndUserIdNot(String email, String userId);

    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByStudentId(String studentId);
}
