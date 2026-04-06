package com.example.shared.hepler;

import java.util.UUID;

public class CustomIdGenerator {

    public static String generateOrderId() {
        return "O-" + randomShortUUID();
    }
    public static String generateVendorOrderId() {
        return "VO-" + randomShortUUID();
    }
    public static String generateItemId() {
        return "I-" + randomShortUUID();
    }

    public static String generateFeedbackId() {
        return "FB-" + randomShortUUID();
    }

    public static String generateVendorId() {
        return "V-" + randomShortUUID();
    }

    public static String generateUserId() {
        return "U-" + randomShortUUID();
    }

    public static String generateBarcode() {
        return "BC-" + randomShortUUID();
    }

    private static String randomShortUUID() {
        return UUID.randomUUID().toString().split("-")[0].toUpperCase();
    }
}
