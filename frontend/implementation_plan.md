# Frontend Implementation Plan - BKafeteria Modernization

This document outlines the planned frontend enhancements for the BKafeteria project.

## 1. UI/UX Architecture
*   **Framework**: Next.js (App Router).
*   **Styling**: Tailwind CSS v4 + Shadcn UI.
*   **Layout Components**:
    *   `SideNav`: Fixed left sidebar for main navigation features.
    *   `TopBar`: Header containing Logo, Search, Cart trigger, and Profile menu.
    *   **Theme**: Modern "Glassmorphism" design with smooth transitions using Framer Motion.

## 2. Authentication Enhancements
*   **Registration**: Enhanced validation and multi-step feedback.
*   **Activation**: New `/account-activation` route to handle email verification.
*   **Security**: Implementation of persistent login using refresh tokens and secure local storage for the access token.

## 3. State Management (Cart)
*   **Library**: Zustand.
*   **Features**:
    *   Add/Remove/Update quantities.
    *   **Multi-Vendor Support**: Items are automatically grouped by vendor.
    *   **Distinct Billing**: UI clearly separates costs and items per vendor.
    *   **Persistence**: Cart state persists across page reloads using Zustand middleware.

## 4. Feature Pages
*   **Vendors Dashboard**: `/vendors` - High-quality cards showing vendor status, hours, and descriptions.
*   **Menu Browser**: `/vendors/[id]` - Interactive menu with category filtering and item details.
*   **Wallet**: `/wallet` - User balance card and points tracking.
*   **Orders**: `/orders` - Real-time list of orders with status labels (Pending, Processing, Completed, etc.).

## 5. Development Workflow
*   **Icons**: Lucide React for consistent and professional iconography.
*   **Feedback**: Sonner (toasts) for all user actions (Success/Error).
*   **Types**: Strict TypeScript interfaces for all API responses to ensure data integrity.
