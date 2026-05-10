# BKafeteria Authentication Flow Documentation

This document explains the technical flow for Login, Registration, Password Recovery, and Email Verification in the BKafeteria system.

## 1. Registration Flow (Professional Flow)

1.  **User Input**: User fills out the registration form (Name, Email, Student ID, Phone, Password, DOB, Gender).
2.  **Frontend Validation**: Basic zod/yup validation for required fields and formats.
3.  **API Call**: `POST /api/iam/auth/register`.
4.  **Backend Checks**:
    *   Ensures Email, Phone, and Student ID are unique.
    *   If any exist, returns `400 Bad Request` with an error message.
    *   If successful, creates an `INACTIVE` user and sends an activation email.
5.  **Frontend Handling**:
    *   **On Success**: Redirect user to `/verify-email-pending` page.
    *   **On Error**: Display specific error messages (e.g., "Mã số sinh viên đã được sử dụng").

## 2. Email Verification / Account Activation

1.  **Email Link**: User receives an email with a link: `.../account-activation?token=XYZ`.
2.  **Frontend Route**: The frontend captures the `token` from query parameters.
3.  **API Call**: `GET /api/iam/auth/account-activation?token=XYZ`.
4.  **Feedback**: Show a success message ("Tài khoản đã kích hoạt!") and a link to Login, or an error message if the token is expired/invalid.

## 3. Login Flow

1.  **User Input**: Email and Password.
2.  **API Call**: `POST /api/iam/auth/login`.
3.  **Response**:
    *   Backend returns an `accessToken` (JWT) and sets a `refresh_token` cookie.
4.  **State Management**:
    *   Store `accessToken` in memory/localStorage (or state).
    *   Fetch user profile using `GET /api/iam/users/me`.
    *   Redirect to the appropriate dashboard based on user role (`CUSTOMER`, `MANAGER`, `ADMIN`).

## 4. Forgot Password Flow

1.  **Request OTP**:
    *   User enters email on the "Forgot Password" page.
    *   `POST /api/iam/auth/send-otp` is called.
2.  **Verify OTP**:
    *   User enters the 6-digit code from their email.
    *   `POST /api/iam/auth/verify-otp` is called.
    *   Backend returns an `otpToken` upon success.
3.  **Reset Password**:
    *   User enters a new password.
    *   `POST /api/iam/auth/reset-password` is called using the `otpToken` as authorization.
4.  **Completion**: User is redirected to Login.

## 5. Security & Constraints

*   **Student ID Constraint**: Strictly enforced (1 student ID = 1 account).
*   **Role-Based Access**: Navigation and features are restricted based on the `role` field in the user profile.
*   **Token Refresh**: Handled automatically via interceptors using the `refresh_token` cookie.
