# BKafeteria API Documentation

> **Base URL (qua API Gateway):** `http://localhost:8080`
>
> **Giao thức:** REST API (HTTP/HTTPS) — Không có WebSocket endpoint cho frontend.
>
> **Auth:** JWT Bearer Token — Gửi header `Authorization: Bearer <access_token>`

---

## Cấu trúc Response chung

Mọi API đều trả về dạng:

```json
{
  "status": 200,
  "message": "Success message",
  "data": { ... }   // hoặc null
}
```

---

## Enum Values

| Enum | Values |
|------|--------|
| **Gender** | `MALE`, `FEMALE` |
| **SystemRole** | `ADMIN`, `MANAGER`, `STAFF`, `CUSTOMER` |
| **UserStatus** | `INACTIVE`, `ACTIVE` |
| **VendorStatus** | `PENDING`, `ACCEPTED`, `REJECTED`, `CLOSED` |
| **OrderStatus** | `PENDING`, `PURCHASED`, `PROCESSING`, `COMPLETED`, `DELIVERED`, `CANCELED` |
| **Category** | `BEVERAGES`, `PASTRIES`, `SNACKS`, `MEALS`, `DESSERTS` |

---

## 1. IAM Service — Authentication (`/api/iam/auth/*`)

### 1.1 Đăng ký tài khoản

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/iam/auth/register` |
| **Auth** | ❌ Không cần |

**Request Body:**
```json
{
  "email": "user@example.com",       // @Email, required
  "phoneNumber": "0901234567",       // required
  "fullName": "Nguyen Van A",        // required
  "studentId": "2210001",            // required
  "gender": "MALE",                  // enum: MALE | FEMALE, required
  "dateOfBirth": "2002-01-15",       // yyyy-MM-dd, past/present, required
  "password": "mypassword"           // required
}
```

**Response Data:** `UserDto` (xem mục 2.6)

---

### 1.2 Đăng nhập

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/iam/auth/login` |
| **Auth** | ❌ Không cần |

**Request Body:**
```json
{
  "email": "user@example.com",    // required
  "password": "mypassword"        // required
}
```

**Response Data:**
```json
{
  "accessToken": "eyJhbGciOiJI..."
}
```

> **Lưu ý:** Response cũng set cookie `refresh_token` (HttpOnly, Secure, SameSite=Strict, 7 ngày).

---

### 1.3 Refresh Token

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/iam/auth/refresh` |
| **Auth** | ❌ Không cần (dùng cookie `refresh_token`) |

**Request Body:** Không có (token lấy từ cookie `refresh_token` tự động gửi)

**Response Data:**
```json
{
  "accessToken": "eyJhbGciOiJI..."
}
```

> **Lưu ý:** Cookie `refresh_token` được rotate (token cũ bị xóa, token mới set lại vào cookie).

---

### 1.4 Đăng xuất

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/iam/auth/logout` |
| **Auth** | ✅ Bearer Token (optional, nếu có sẽ blacklist) |

**Request Body:** Không có

**Response Data:** `null`

> **Lưu ý:** Blacklist access token + xóa refresh token khỏi Redis + xóa cookie.

---

### 1.5 Gửi OTP (quên mật khẩu)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/iam/auth/send-otp` |
| **Auth** | ❌ Không cần |

**Request Body:**
```json
{
  "email": "user@example.com"    // required
}
```

**Response Data:** `null`

---

### 1.6 Xác minh OTP

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/iam/auth/verify-otp` |
| **Auth** | ❌ Không cần |

**Request Body:**
```json
{
  "email": "user@example.com",    // required
  "otp": "123456"                 // required
}
```

**Response Data:**
```json
{
  "otpToken": "eyJhbGciOiJI..."
}
```

> **Lưu ý:** `otpToken` dùng cho bước reset password tiếp theo.

---

### 1.7 Reset mật khẩu

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/iam/auth/reset-password` |
| **Auth** | ✅ Bearer Token (dùng `otpToken` từ bước verify-otp) |

**Request Body:**
```json
{
  "email": "user@example.com",      // required
  "newPassword": "newpassword123"    // required
}
```

**Response Data:** `null`

---

### 1.8 Kích hoạt tài khoản (qua email link)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/iam/auth/account-activation` |
| **Auth** | ❌ Không cần |

**Query Params:**

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `token` | String | ✅ | Token kích hoạt (gửi qua email) |

**Response Data:** `null`

---

## 2. IAM Service — User Management (`/api/iam/users/*`)

> **Tất cả endpoint trong nhóm này đều yêu cầu Auth** ✅ Bearer Token

### 2.1 Lấy thông tin user đang đăng nhập

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/iam/users/me` |
| **Auth** | ✅ Bearer Token |
| **Role** | Bất kỳ (đã đăng nhập) |

**Response Data:** `UserDto` (xem mục 2.6)

---

### 2.2 Cập nhật thông tin cá nhân

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/iam/users/me` |
| **Auth** | ✅ Bearer Token |
| **Role** | Bất kỳ (đã đăng nhập) |

**Request Body:**
```json
{
  "fullName": "Nguyen Van B",           // required
  "email": "newmail@example.com",       // @Email, required
  "phoneNumber": "0901234567",          // required
  "studentId": "2210001",               // required
  "gender": "MALE",                     // enum: MALE | FEMALE, required
  "dateOfBirth": "2002-01-15"           // yyyy-MM-dd, required
}
```

**Response Data:** `UserDto`

---

### 2.3 Danh sách tất cả users (Admin)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/iam/users` |
| **Auth** | ✅ Bearer Token |
| **Role** | `ADMIN` |

**Query Params:**

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `search` | String | ❌ | Tìm theo tên, SĐT, MSSV, email |
| `gender` | String | ❌ | Enum: `MALE`, `FEMALE` |
| `status` | String | ❌ | Enum: `ACTIVE`, `INACTIVE` |
| `isDeleted` | Boolean | ❌ | Mặc định `false` |
| `role` | String | ❌ | Enum: `ADMIN`, `MANAGER`, `STAFF`, `CUSTOMER` |
| `page` | Integer | ❌ | Trang (mặc định 0) |
| `size` | Integer | ❌ | Số phần tử/trang (mặc định 10) |
| `sort` | String | ❌ | Sắp xếp (mặc định `fullName,desc`) |

**Response Data:** `PageDto<UserDto>`
```json
{
  "content": [ UserDto, ... ],
  "totalElements": 100,
  "totalPages": 10,
  "number": 0,
  "size": 10
}
```

---

### 2.4 Lấy user theo ID (Admin/Internal)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/iam/users/{id}` |
| **Auth** | ✅ Bearer Token |
| **Role** | `ADMIN` hoặc `INTERNAL_SERVICE` |

**Path Params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | String (UUID) | ID của user |

**Response Data:** `UserDto`

---

### 2.5 Cập nhật user (Admin/Manager)

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/iam/users/{id}` |
| **Auth** | ✅ Bearer Token |
| **Role** | `ADMIN` hoặc `MANAGER` |

**Path Params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | String (UUID) | ID của user |

**Request Body:**
```json
{
  "fullName": "Nguyen Van B",           // required
  "email": "mail@example.com",         // @Email, required
  "phoneNumber": "0901234567",          // required
  "studentId": "2210001",               // required
  "gender": "MALE",                     // enum, required
  "dateOfBirth": "2002-01-15",          // required
  "role": "MANAGER"                     // enum SystemRole, required
}
```

**Response Data:** `UserDto`

---

### 2.6 Xóa user (Admin)

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/iam/users/{id}` |
| **Auth** | ✅ Bearer Token |
| **Role** | `ADMIN` |

**Path Params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | String (UUID) | ID của user |

**Query Params:**

| Param | Type | Required | Default | Mô tả |
|-------|------|----------|---------|-------|
| `soft-delete` | Boolean | ❌ | `true` | `true` = soft delete, `false` = hard delete |

**Response Data:** `null`

---

### 2.7 Gán vendor cho user (Internal/Manager)

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/iam/users/assign-vendor/{vendorId}` |
| **Auth** | ✅ Bearer Token |
| **Role** | `INTERNAL_SERVICE` hoặc `MANAGER` |

**Path Params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `vendorId` | String (UUID) | ID của vendor |

**Request Body:**
```json
{
  "email": "staff@example.com"   // @Email, required
}
```

**Response Data:** `UserDto`

---

### 2.8 Set balance cho user (Internal)

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/iam/users/set-balance` |
| **Auth** | ✅ Bearer Token |
| **Role** | `INTERNAL_SERVICE` |

**Request Body:**
```json
{
  "userId": "uuid-string",
  "balance": 150000.0
}
```

**Response Data:** `UserDto`

---

### UserDto (Response shape)

```json
{
  "userId": "uuid",
  "fullName": "Nguyen Van A",
  "phoneNumber": "0901234567",
  "email": "user@example.com",
  "gender": "MALE",
  "dateOfBirth": "2002-01-15",
  "studentId": "2210001",
  "status": "ACTIVE",
  "vendorId": "uuid or null",
  "createdAt": "2025-01-01T00:00:00",
  "updatedAt": "2025-01-01T00:00:00",
  "lastLogin": "2025-01-01T00:00:00",
  "balance": 100000.0,
  "isDeleted": false,
  "role": "CUSTOMER"
}
```

---

## 3. Vendor Service (`/api/vendor/vendors/*`)

> **Tất cả endpoint đều yêu cầu Auth** ✅ Bearer Token

### 3.1 Đăng ký vendor mới

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/vendor/vendors/register` |
| **Auth** | ✅ Bearer Token |
| **Role** | `MANAGER` |

**Request Body:**
```json
{
  "name": "Quán Cơm ABC",                 // required
  "description": "Cơm trưa sinh viên",    // optional
  "workingHourFrom": "07:00:00",           // HH:mm:ss, optional
  "workingHourTo": "21:00:00",             // HH:mm:ss, optional
  "certification": "VSATTP-123"            // optional
}
```

**Response Data:** `VendorDto` (xem mục 3.7)

---

### 3.2 Duyệt vendor (Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/vendor/vendors/approve/{id}` |
| **Auth** | ✅ Bearer Token |
| **Role** | `ADMIN` |

**Path Params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | String (UUID) | ID của vendor |

**Response Data:** `null`

---

### 3.3 Lấy vendor của tôi

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/vendor/vendors/get-my-vendor` |
| **Auth** | ✅ Bearer Token |
| **Role** | `MANAGER` |

**Response Data:** `VendorDto`

---

### 3.4 Danh sách tất cả vendor (Admin)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/vendor/vendors` |
| **Auth** | ✅ Bearer Token |
| **Role** | `ADMIN` |

**Response Data:** `List<VendorDto>`

---

### 3.5 Danh sách vendor đang hoạt động

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/vendor/vendors/active` |
| **Auth** | ✅ Bearer Token |
| **Role** | Bất kỳ (đã đăng nhập) |

**Response Data:** `List<VendorDto>`

---

### 3.6 Lấy vendor theo ID

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/vendor/vendors/{id}` |
| **Auth** | ✅ Bearer Token |
| **Role** | Bất kỳ (đã đăng nhập) |

**Path Params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | String (UUID) | ID của vendor |

**Response Data:** `VendorDto`

---

### 3.7 VendorDto (Response shape)

```json
{
  "vendorId": "uuid",
  "name": "Quán Cơm ABC",
  "description": "Cơm trưa sinh viên",
  "status": "ACCEPTED",
  "workingHourFrom": "07:00:00",
  "workingHourTo": "21:00:00",
  "certification": "VSATTP-123",
  "managerId": "uuid",
  "createdAt": "2025-01-01T00:00:00",
  "updatedAt": "2025-01-01T00:00:00",
  "approvedBy": "uuid or null"
}
```

---

## 4. Menu Service (`/api/menu/items/*`)

> **Tất cả endpoint đều yêu cầu Auth** ✅ Bearer Token

### 4.1 Tạo món ăn mới

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/menu/items/create` |
| **Auth** | ✅ Bearer Token |
| **Role** | `MANAGER` |

**Request Body:**
```json
{
  "name": "Cơm sườn",               // required
  "description": "Cơm sườn nướng",  // optional
  "price": 35000.0,                  // double
  "remaining": 50,                   // Integer, optional
  "category": "MEALS"               // optional (string)
}
```

**Response Data:** `MenuItemDto` (xem mục 4.7)

---

### 4.2 Lấy menu của vendor hiện tại (Manager)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/menu/items/get-my-menu` |
| **Auth** | ✅ Bearer Token |
| **Role** | `MANAGER` |

**Response Data:** `List<MenuItemDto>`

---

### 4.3 Lấy món ăn theo ID

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/menu/items/{id}` |
| **Auth** | ✅ Bearer Token |
| **Role** | Bất kỳ (đã đăng nhập) |

**Path Params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | String (UUID) | ID của menu item |

**Response Data:** `MenuItemDto`

---

### 4.4 Cập nhật món ăn

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/menu/items/update/{id}` |
| **Auth** | ✅ Bearer Token |
| **Role** | `MANAGER` |

**Path Params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | String (UUID) | ID của menu item |

**Request Body:** (giống CreateMenuItemRequest)
```json
{
  "name": "Cơm sườn update",
  "description": "Cơm sườn nướng mới",
  "price": 40000.0,
  "remaining": 30,
  "category": "MEALS"
}
```

**Response Data:** `MenuItemDto`

---

### 4.5 Xóa món ăn

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/menu/items/delete/{id}` |
| **Auth** | ✅ Bearer Token |
| **Role** | `MANAGER` |

**Path Params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | String (UUID) | ID của menu item |

**Response Data:** `null`

---

### 4.6 Tìm kiếm toàn bộ menu (có phân trang)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/menu/items/get-all` |
| **Auth** | ✅ Bearer Token |
| **Role** | Bất kỳ (đã đăng nhập) |

**Query Params:**

| Param | Type | Required | Default | Mô tả |
|-------|------|----------|---------|-------|
| `name` | String | ❌ | — | Tìm theo tên |
| `category` | String | ❌ | — | Lọc theo category |
| `page` | Integer | ❌ | `0` | Trang |
| `size` | Integer | ❌ | `10` | Số phần tử/trang |
| `sortBy` | String | ❌ | `name` | Trường sắp xếp |
| `direction` | String | ❌ | `asc` | `asc` hoặc `desc` |

**Response Data:** `Page<MenuItemDto>` (Spring Page format)

---

### 4.7 MenuItemDto (Response shape)

```json
{
  "menuItemId": "uuid",
  "name": "Cơm sườn",
  "description": "Cơm sườn nướng",
  "price": 35000.0,
  "remaining": 50,
  "category": "MEALS",
  "rating": 4.5,
  "createdAt": "2025-01-01T00:00:00",
  "updatedAt": "2025-01-01T00:00:00",
  "vendorId": "uuid"
}
```

---

## 5. Order Service (`/api/order/orders/*`)

> **Tất cả endpoint đều yêu cầu Auth** ✅ Bearer Token

### 5.1 Tạo đơn hàng

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/order/orders` |
| **Auth** | ✅ Bearer Token |
| **Role** | Bất kỳ (đã đăng nhập) |

**Request Body:**
```json
{
  "vendorOrders": [
    {
      "vendorId": "uuid-of-vendor",
      "items": [
        {
          "itemId": "uuid-of-menu-item",
          "quantity": 2
        },
        {
          "itemId": "uuid-of-another-item",
          "quantity": 1
        }
      ]
    }
  ]
}
```

**Response Data:** `OrderDto` (xem mục 5.5)

---

### 5.2 Lấy đơn hàng theo ID

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/order/orders/{id}` |
| **Auth** | ✅ Bearer Token |
| **Role** | Bất kỳ (đã đăng nhập) |

**Path Params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | String (UUID) | ID của order |

**Response Data:** `OrderDto`

---

### 5.3 Thanh toán đơn hàng

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/order/orders/{id}/payment` |
| **Auth** | ✅ Bearer Token |
| **Role** | Bất kỳ (đã đăng nhập) |

**Path Params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | String (UUID) | ID của order |

**Request Body:** Không có

**Response Data:** `OrderDto`

---

### 5.4 Lấy danh sách đơn hàng của tôi

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/order/orders/get-my-order` |
| **Auth** | ✅ Bearer Token |
| **Role** | Bất kỳ (đã đăng nhập) |

**Response Data:** `List<OrderDto>`

---

### 5.5 OrderDto (Response shape)

```json
{
  "orderId": "uuid",
  "status": "PENDING",
  "orderItems": [
    {
      "vendorId": "uuid",
      "vendorName": "Quán Cơm ABC",
      "menuItems": [
        {
          "itemId": "uuid",
          "itemName": "Cơm sườn",
          "quantity": 2,
          "price": 35000.0
        }
      ],
      "vendorPrice": 70000.0
    }
  ],
  "createdAt": "2025-01-01T00:00:00",
  "updatedAt": "2025-01-01T00:00:00",
  "totalPrice": 70000.0,
  "customerId": "uuid",
  "isDeleted": false
}
```

---

## Tổng hợp nhanh

| # | Method | Endpoint | Auth | Role | Mô tả |
|---|--------|----------|------|------|-------|
| 1 | POST | `/api/iam/auth/register` | ❌ | — | Đăng ký |
| 2 | POST | `/api/iam/auth/login` | ❌ | — | Đăng nhập |
| 3 | POST | `/api/iam/auth/refresh` | ❌ | — | Refresh token (cookie) |
| 4 | POST | `/api/iam/auth/logout` | ⚪ | — | Đăng xuất |
| 5 | POST | `/api/iam/auth/send-otp` | ❌ | — | Gửi OTP |
| 6 | POST | `/api/iam/auth/verify-otp` | ❌ | — | Xác minh OTP |
| 7 | POST | `/api/iam/auth/reset-password` | ✅ | — | Reset mật khẩu |
| 8 | GET | `/api/iam/auth/account-activation?token=` | ❌ | — | Kích hoạt tài khoản |
| 9 | GET | `/api/iam/users/me` | ✅ | Any | Thông tin cá nhân |
| 10 | PUT | `/api/iam/users/me` | ✅ | Any | Cập nhật cá nhân |
| 11 | GET | `/api/iam/users` | ✅ | ADMIN | Danh sách users |
| 12 | GET | `/api/iam/users/{id}` | ✅ | ADMIN | User theo ID |
| 13 | PUT | `/api/iam/users/{id}` | ✅ | ADMIN/MANAGER | Cập nhật user |
| 14 | DELETE | `/api/iam/users/{id}` | ✅ | ADMIN | Xóa user |
| 15 | PUT | `/api/iam/users/assign-vendor/{vendorId}` | ✅ | INTERNAL/MANAGER | Gán vendor |
| 16 | PUT | `/api/iam/users/set-balance` | ✅ | INTERNAL | Set balance |
| 17 | POST | `/api/vendor/vendors/register` | ✅ | MANAGER | Đăng ký vendor |
| 18 | PUT | `/api/vendor/vendors/approve/{id}` | ✅ | ADMIN | Duyệt vendor |
| 19 | GET | `/api/vendor/vendors/get-my-vendor` | ✅ | MANAGER | Vendor của tôi |
| 20 | GET | `/api/vendor/vendors` | ✅ | ADMIN | Tất cả vendors |
| 21 | GET | `/api/vendor/vendors/active` | ✅ | Any | Vendors hoạt động |
| 22 | GET | `/api/vendor/vendors/{id}` | ✅ | Any | Vendor theo ID |
| 23 | POST | `/api/menu/items/create` | ✅ | MANAGER | Tạo món ăn |
| 24 | GET | `/api/menu/items/get-my-menu` | ✅ | MANAGER | Menu của tôi |
| 25 | GET | `/api/menu/items/{id}` | ✅ | Any | Món ăn theo ID |
| 26 | PUT | `/api/menu/items/update/{id}` | ✅ | MANAGER | Cập nhật món |
| 27 | DELETE | `/api/menu/items/delete/{id}` | ✅ | MANAGER | Xóa món |
| 28 | GET | `/api/menu/items/get-all` | ✅ | Any | Tìm kiếm menu |
| 29 | POST | `/api/order/orders` | ✅ | Any | Tạo đơn hàng |
| 30 | GET | `/api/order/orders/{id}` | ✅ | Any | Đơn hàng theo ID |
| 31 | PUT | `/api/order/orders/{id}/payment` | ✅ | Any | Thanh toán |
| 32 | GET | `/api/order/orders/get-my-order` | ✅ | Any | Đơn hàng của tôi |

> **Ký hiệu Auth:** ✅ = Bắt buộc | ⚪ = Tùy chọn | ❌ = Không cần
>
> **Ký hiệu Role:** `Any` = Chỉ cần đăng nhập, không giới hạn role
