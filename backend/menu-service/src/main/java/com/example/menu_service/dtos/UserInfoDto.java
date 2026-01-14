package com.example.menu_service.dtos;

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
	private String vendorId;
}
