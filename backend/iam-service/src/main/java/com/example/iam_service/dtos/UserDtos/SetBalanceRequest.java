package com.example.iam_service.dtos.UserDtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SetBalanceRequest {
    String userId;
    Double balance;
}
