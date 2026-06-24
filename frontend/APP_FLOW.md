# BKafeteria Application Flow

This document outlines the complete user journey and technical flow of the BKafeteria system.

## 1. Registration & Authentication Flow
- **Customer Registration**: Users sign up via `/register`. The system creates an `INACTIVE` account and sends an OTP email. 
- **Account Verification**: Users enter the OTP on `/verify` to activate their account, which changes their status to `ACTIVE`.
- **Login**: Users authenticate on `/login`. The system returns an Access Token and a Refresh Token, which the frontend stores to maintain the session. Roles (`CUSTOMER`, `STAFF`, `MANAGER`, `ADMIN`) are decoded from the JWT to restrict access.

## 2. Customer Journey (Ordering)
- **Browsing Menus**: Customers visit `/dashboard` to view available vendors, then proceed to `/menu` to explore food items.
- **Cart Management**: Customers add items to their cart (`CartSheet`), specifying quantities. The cart state is managed globally using Zustand.
- **Checkout**: When placing an order, the system verifies the user's `balance`. If sufficient, the order is created and split into multiple `VendorOrder`s based on the different vendors involved.

## 3. Vendor Processing (Real-time)
- **Notification**: Upon successful payment, a WebSocket message is pushed to the respective `/topic/vendor/{vendorId}` channels.
- **Manager Dashboard**: Vendor Managers and Staff see a red badge in their TopBar. They navigate to the Vendor Orders management page.
- **Order Lifecycle**: 
  1. The Manager accepts the order -> Status changes to `PROCESSING`.
  2. The kitchen prepares the food.
  3. The Manager marks the order as ready -> Status changes to `COMPLETED` (or `DELIVERED`).

## 4. Customer Tracking (Real-time)
- **Status Updates**: The Customer is subscribed to `/topic/customer/{customerId}`. When the Manager updates a Vendor Order status, the backend broadcasts this update.
- **Live Notifications**: The Customer receives a toast notification and a badge alert in their TopBar. Their local cache is optimistically updated, and a background refetch ensures consistency.

## 5. Wallet & Points
- **Top-up**: Users can view their current balance and points in the TopBar wallet dropdown and navigate to `/wallet` to initiate a top-up (simulated/integrated payment gateway).
- **Points Accumulation**: For every successful purchase, users earn loyalty points which can be tracked in the UI.

## 6. Administration
- **Admin Role**: Admins manage system-wide operations, such as approving new Vendor registrations and managing user roles.
- **Vendor Registration**: Managers apply to create a vendor profile. This profile remains inactive until an Admin explicitly approves it.
