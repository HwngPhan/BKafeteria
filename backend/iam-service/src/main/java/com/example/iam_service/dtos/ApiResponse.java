package com.example.iam_service.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ApiResponse<T> {
	private Integer status;
	private String message;
	private T data;

	public ApiResponse(Integer status, String message, T data) {
		this.status = status;
		this.message = message;
		this.data = data;
	}
}
