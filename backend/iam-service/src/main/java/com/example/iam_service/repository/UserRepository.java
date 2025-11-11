package com.example.iam_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.iam_service.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
		// Define custom query methods if needed

}
