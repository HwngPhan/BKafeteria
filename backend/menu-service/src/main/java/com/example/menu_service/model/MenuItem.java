package com.example.menu_service.model;


import java.time.LocalDateTime;

import com.example.shared.hepler.CustomIdGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "menuitems")
public class MenuItem {
    @Id
    private String menuItemid;

    @PrePersist
    public void assignIdIfMissing() {
        if (menuItemid == null || menuItemid.isBlank()) {
            this.menuItemid = CustomIdGenerator.generateItemId();
        }
    }
    @Column(nullable = false)
    private String name;
    private String description;

    @Column(nullable = false)
    private double price;

    private String vendorId;

    private Integer remaining;
    private String category;
    private double rating;
    // private String imageUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
