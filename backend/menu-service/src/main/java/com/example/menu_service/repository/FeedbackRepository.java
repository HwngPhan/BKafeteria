package com.example.menu_service.repository;

import com.example.menu_service.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, String> {
    @Query("SELECT f FROM Feedback f WHERE f.menuItemId = :menuItemId AND (f.isDeleted = false OR f.isDeleted IS NULL)")
    List<Feedback> findActiveByMenuItemId(@Param("menuItemId") String menuItemId);

    @Query("SELECT f FROM Feedback f WHERE f.userId = :userId AND (f.isDeleted = false OR f.isDeleted IS NULL)")
    List<Feedback> findActiveByUserId(@Param("userId") String userId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.menuItemId = :menuItemId AND (f.isDeleted = false OR f.isDeleted IS NULL)")
    Double getAverageRatingByMenuItemId(@Param("menuItemId") String menuItemId);
}
