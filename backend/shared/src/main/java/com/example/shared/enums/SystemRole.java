package com.example.shared.enums;

import java.util.Arrays;

public enum SystemRole {
    ADMIN,
    MANAGER,
    STAFF,
    CUSTOMER;

    public static boolean isProtected(String roleName) {
        return Arrays.stream(values()).anyMatch(r -> r.name().equalsIgnoreCase(roleName));
    }
}
