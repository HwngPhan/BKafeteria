package com.example.order_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoDto {
	private String userId;
	private String fullName;
	private String phoneNumber;
	private String email;
	private String role;
	private Double balance;
	private Integer points;
	private String vendorId;
}
