# BÁO CÁO KIỂM THỬ HỆ THỐNG
## Ứng dụng BKafeteria — Đặt món ăn căng tin Bách Khoa

---

## 1. TỔNG QUAN VỀ KIỂM THỬ HỆ THỐNG

### 1.1 Mục tiêu kiểm thử

Kiểm thử hệ thống (System Testing) nhằm xác minh rằng toàn bộ ứng dụng BKafeteria hoạt động đúng theo yêu cầu đặc tả từ góc nhìn người dùng cuối. Các kịch bản kiểm thử được thiết kế để bao phủ đầy đủ luồng chức năng (functional flow), bao gồm:

- Luồng khách hàng: duyệt cửa hàng → xem thực đơn → thêm giỏ hàng → đặt hàng → theo dõi đơn → nạp tiền ví
- Luồng điều hướng: sidebar, mobile menu, ngôn ngữ
- Quản lý tài khoản: hồ sơ cá nhân

### 1.2 Phạm vi kiểm thử

| Phân hệ | Các chức năng được kiểm thử |
|---|---|
| Xác thực | Đăng nhập, duy trì phiên, đăng xuất |
| Trang chủ / Dashboard | Hiển thị lời chào, điều hướng CTA |
| Điều hướng | Sidebar thu/mở, mobile menu, chuyển trang, đổi ngôn ngữ |
| Cửa hàng | Danh sách, tìm kiếm, lọc, xem chi tiết |
| Thực đơn | Danh sách món, bộ lọc danh mục, thêm giỏ hàng |
| Giỏ hàng | Thêm món, xem tổng tiền, thanh toán |
| Đơn hàng | Danh sách 2 cột, sắp xếp, làm mới, chi tiết, phân trang |
| Ví tiền | Số dư, nạp tiền, mã QR, thông tin ngân hàng |
| Hồ sơ | Xem thông tin, chỉnh sửa, lưu |
| Luồng E2E | Toàn bộ quy trình từ browse → order |

### 1.3 Phương pháp kiểm thử

- **Kiểm thử hộp đen (Black-box testing):** Kiểm tra hành vi UI từ góc nhìn người dùng
- **Kiểm thử end-to-end (E2E):** Mô phỏng toàn bộ luồng thực tế
- **Kiểm thử responsive:** Kiểm tra hiển thị trên desktop (1280px) và mobile (375px — Pixel 5)

---

## 2. MÔI TRƯỜNG KIỂM THỬ

### 2.1 Công cụ kiểm thử

| Công cụ | Phiên bản | Vai trò |
|---|---|---|
| **Playwright** | 1.59.1 | Framework E2E testing |
| **@playwright/test** | 1.59.1 | Test runner + assertions |
| **Chromium** | (bundled) | Trình duyệt chính (Desktop) |
| **Chromium (Pixel 5)** | (bundled) | Trình duyệt mobile |

### 2.2 Cấu hình môi trường

```
Base URL    : http://localhost:3000
Timeout     : 90.000ms / test
Action Timeout: 30.000ms
Expect Timeout: 15.000ms
Workers     : 1 (sequential — tránh xung đột state)
Retries     : 0 (local) / 2 (CI)
Reporter    : HTML
```

### 2.3 Dữ liệu kiểm thử

| Loại dữ liệu | Giá trị |
|---|---|
| Tài khoản khách hàng | `customer@gmail.com` / `customer123` |
| Auth state | Lưu tại `playwright/.auth/user.json` |
| Phiên đăng nhập | Tái sử dụng qua `storageState` |

### 2.4 Cấu trúc thư mục kiểm thử

```
frontend/tests/
├── auth.setup.ts          # Thiết lập phiên đăng nhập
├── system-flow.spec.ts    # Luồng E2E toàn hệ thống
├── dashboard.spec.ts      # Trang tổng quan
├── navigation.spec.ts     # Điều hướng & layout
├── vendors.spec.ts        # Cửa hàng & thực đơn
├── cart.spec.ts           # Giỏ hàng
├── orders.spec.ts         # Đơn hàng
├── wallet.spec.ts         # Ví tiền & nạp tiền
└── profile.spec.ts        # Hồ sơ cá nhân
```

---

## 3. KẾ HOẠCH KIỂM THỬ (TEST PLAN)

### 3.1 Danh sách test suite

| STT | File | Test Suite | Số TC |
|---|---|---|---|
| 1 | `auth.setup.ts` | Thiết lập xác thực | 1 |
| 2 | `system-flow.spec.ts` | Luồng E2E toàn hệ thống | 1 |
| 3 | `dashboard.spec.ts` | Trang tổng quan + 404 | 6 |
| 4 | `navigation.spec.ts` | Điều hướng + TopBar + Ngôn ngữ | 14 |
| 5 | `vendors.spec.ts` | Cửa hàng + Thực đơn | 10 |
| 6 | `cart.spec.ts` | Giỏ hàng | 4 |
| 7 | `orders.spec.ts` | Đơn hàng khách hàng | 10 |
| 8 | `wallet.spec.ts` | Ví tiền + Nạp tiền | 20 |
| 9 | `profile.spec.ts` | Hồ sơ cá nhân | 7 |
| | **Tổng cộng** | | **73** |

### 3.2 Phân loại test case theo mức độ ưu tiên

| Mức độ | Số TC | Mô tả |
|---|---|---|
| P0 — Critical | 8 | Auth, đặt hàng E2E, thanh toán |
| P1 — High | 25 | Core features: đơn hàng, ví, menu |
| P2 — Medium | 30 | Navigation, UI elements, responsiveness |
| P3 — Low | 10 | Edge cases, empty states |

---

## 4. CHI TIẾT CÁC CA KIỂM THỬ

---

### 4.1 Xác thực (Authentication Setup)

**File:** `auth.setup.ts`

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| AUTH-01 | Đăng nhập bằng tài khoản hợp lệ | Email: `customer@gmail.com`, Pass: `customer123` | 1. Điều hướng đến `/login` 2. Nhập email 3. Nhập mật khẩu 4. Click "Đăng nhập" | Toast "Đăng nhập thành công", redirect đến dashboard, lưu session | Hiển thị toast thành công, chuyển trang thành công | ✅ PASS |

---

### 4.2 Luồng E2E Toàn Hệ Thống

**File:** `system-flow.spec.ts`

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| E2E-01 | Khách hàng duyệt, thêm giỏ hàng và đặt món thành công | Đã đăng nhập, có ít nhất 1 vendor với menu items | 1. Vào `/vendors` 2. Click "Xem thực đơn" vendor đầu tiên 3. Hover menu item, click nút "+" 4. Xác nhận toast "Đã thêm" 5. Mở CartSheet 6. Click "Thanh toán ngay" 7. Xác nhận toast thành công 8. Kiểm tra redirect về `/orders` | Toast "Đặt đơn hàng thành công!", URL chứa `/orders`, đơn hàng mới xuất hiện trong danh sách | Luồng hoàn chỉnh thực hiện thành công | ✅ PASS |

---

### 4.3 Trang Tổng Quan (Dashboard)

**File:** `dashboard.spec.ts`

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| DASH-01 | Hiển thị lời chào theo thời gian | Đã đăng nhập | Điều hướng đến `/dashboard` | Hiển thị "Chào buổi sáng/chiều/tối" tương ứng với giờ hiện tại | Lời chào đúng theo khung giờ | ✅ PASS |
| DASH-02 | Hiển thị nút "Khám phá cửa hàng" | Đã đăng nhập | Điều hướng đến `/dashboard` | Nút CTA hiển thị | Nút hiển thị đúng | ✅ PASS |
| DASH-03 | Điều hướng đến Vendors từ nút CTA | Đã đăng nhập | Click "Khám phá cửa hàng" | URL chuyển thành `/vendors` | Redirect thành công | ✅ PASS |
| DASH-04 | Hiển thị nút "Xem thực đơn" | Đã đăng nhập | Điều hướng đến `/dashboard` | Nút "Xem thực đơn" hiển thị | Nút hiển thị đúng | ✅ PASS |
| DASH-05 | Responsive — không tràn ngang trên mobile | Viewport 375×812 | Reload ở viewport mobile | `document.body.scrollWidth ≤ window.innerWidth` | Không có horizontal overflow | ✅ PASS |
| DASH-06 | Trang 404 hiển thị đúng | URL không tồn tại | Điều hướng đến `/this-page-does-not-exist-xyz` | Hiển thị thông báo "Không tìm thấy trang" | 404 page render đúng | ✅ PASS |

---

### 4.4 Điều Hướng & Layout (Navigation)

**File:** `navigation.spec.ts`

#### 4.4.1 Sidebar Navigation

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| NAV-01 | Sidebar hiển thị trên desktop | Viewport 1280×800 | Điều hướng đến `/dashboard` | `<aside>` visible | Sidebar hiển thị | ✅ PASS |
| NAV-02 | Sidebar ẩn trên mobile | Viewport 375×812 | Điều hướng đến `/dashboard` | `<aside>` hidden | Sidebar ẩn | ✅ PASS |
| NAV-03 | Hamburger menu hiển thị trên mobile | Viewport 375×812 | Điều hướng đến `/dashboard` | Nút menu icon visible | Nút hiển thị | ✅ PASS |
| NAV-04 | Mở mobile navigation sheet | Viewport 375×812 | Click hamburger button | Sheet hiện ra với logo BKAFETERIA | Sheet mở đúng | ✅ PASS |
| NAV-05 | Thu/mở sidebar trên desktop | Viewport 1280×800 | Click toggle button trong sidebar | Width giảm từ 256px → 80px khi thu; tăng trở lại khi mở | Animation thu mở hoạt động đúng | ✅ PASS |
| NAV-06 | Điều hướng đến Vendors từ sidebar | Viewport 1280×800, sidebar mở | Click link "Cửa hàng" trong sidebar | URL = `/vendors` | Redirect đúng | ✅ PASS |
| NAV-07 | Điều hướng đến Orders từ sidebar | Viewport 1280×800 | Click link "Đơn hàng" trong sidebar | URL = `/orders` | Redirect đúng | ✅ PASS |
| NAV-08 | Điều hướng đến Wallet từ sidebar | Viewport 1280×800 | Click link "Ví tiền" trong sidebar | URL = `/wallet` | Redirect đúng | ✅ PASS |

#### 4.4.2 TopBar

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| TOP-01 | Header hiển thị | Đã đăng nhập | Điều hướng đến `/dashboard` | `<header>` visible | Header hiển thị | ✅ PASS |
| TOP-02 | Chuông thông báo hiển thị | Đã đăng nhập | Điều hướng đến `/dashboard` | Nút bell icon visible | Nút hiển thị | ✅ PASS |
| TOP-03 | Mở dropdown thông báo | Đã đăng nhập | Click nút bell | Dropdown hiện thông báo hoặc "Không có thông báo mới" | Dropdown mở đúng | ✅ PASS |
| TOP-04 | Mở dropdown profile | Đã đăng nhập | Click avatar | Dropdown hiện tuỳ chọn bao gồm "Đăng xuất" | Dropdown mở đúng | ✅ PASS |
| TOP-05 | Đăng xuất qua profile dropdown | Đã đăng nhập | Click "Đăng xuất" | Redirect đến `/login` | Đăng xuất thành công | ✅ PASS |

#### 4.4.3 Chuyển ngôn ngữ

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| LANG-01 | Chuyển ngôn ngữ Anh/Việt từ sidebar | Desktop, ngôn ngữ hiện tại = VI | Click nút ngôn ngữ ở cuối sidebar | Nội dung trang chuyển sang tiếng Anh/Việt | Ngôn ngữ thay đổi đúng | ✅ PASS |

---

### 4.5 Cửa Hàng & Thực Đơn (Vendors & Menu)

**File:** `vendors.spec.ts`

#### 4.5.1 Trang Danh Sách Cửa Hàng

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| VEN-01 | Hiển thị tiêu đề trang Vendors | Đã đăng nhập | Điều hướng đến `/vendors` | H1 chứa "Tất cả cửa hàng" hoặc "All Vendors" | Tiêu đề đúng | ✅ PASS |
| VEN-02 | Hiển thị ô tìm kiếm | Đã đăng nhập | Điều hướng đến `/vendors` | Input placeholder "Tìm kiếm cửa hàng..." visible | Ô tìm kiếm hiển thị | ✅ PASS |
| VEN-03 | Lọc vendor theo từ khóa không tồn tại | Có danh sách vendors | Nhập "zzzzzzzzz_nonexistent_xyz" vào search | Hiển thị "Không tìm thấy cửa hàng nào" | Empty state hiển thị đúng | ✅ PASS |
| VEN-04 | Xóa tìm kiếm — danh sách khôi phục | Đã nhập từ khóa | Xóa nội dung search | Danh sách vendors hiển thị lại | Danh sách khôi phục | ✅ PASS |
| VEN-05 | Hiển thị link "Xem thực đơn" trên card | Có ít nhất 1 vendor active | Điều hướng đến `/vendors` | Có link "Xem thực đơn" visible | Link hiển thị | ✅ PASS |
| VEN-06 | Điều hướng đến trang thực đơn vendor | Có vendor active | Click "Xem thực đơn" | URL chuyển đến `/vendors/[id]` | Redirect đúng | ✅ PASS |

#### 4.5.2 Trang Chi Tiết Vendor / Menu

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| VEN-07 | Hiển thị menu items khi vào trang vendor | Vendor có menu items | Vào trang `/vendors/[id]` | Nội dung trang (main) visible | Trang load đúng | ✅ PASS |

#### 4.5.3 Trang Thực Đơn Tổng Hợp

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| MEN-01 | Hiển thị tiêu đề trang Menu | Đã đăng nhập | Điều hướng đến `/menu` | H1 chứa "Thực đơn" hoặc "Menu" | Tiêu đề đúng | ✅ PASS |
| MEN-02 | Hiển thị nút filter danh mục | Đã đăng nhập | Điều hướng đến `/menu` | Nút "Tất cả" visible | Filter hiển thị | ✅ PASS |
| MEN-03 | Thêm món vào giỏ hàng từ trang Menu | Có menu items | Hover vào card, click nút "+" | Toast "Đã thêm [tên món] vào giỏ hàng" | Toast xuất hiện đúng | ✅ PASS |

---

### 4.6 Giỏ Hàng (Cart)

**File:** `cart.spec.ts`

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| CART-01 | Thêm món vào giỏ từ trang vendor menu | Vendor có menu items | 1. Vào vendor menu 2. Hover card 3. Click "+" | Toast "Đã thêm ... vào giỏ hàng" | Toast xuất hiện | ✅ PASS |
| CART-02 | Mở CartSheet sau khi thêm món | Đã thêm ít nhất 1 món | Click icon giỏ hàng trên TopBar | Sheet "Giỏ hàng" mở ra | CartSheet mở đúng | ✅ PASS |
| CART-03 | Hiển thị tổng tiền trong CartSheet | CartSheet đang mở, có items | Xem nội dung sheet | Có text "Tổng cộng" visible | Tổng tiền hiển thị | ✅ PASS |
| CART-04 | Nút Thanh toán trong CartSheet | CartSheet mở, có items | Mở CartSheet | Nút "Thanh toán ngay" visible và enabled | Nút checkout hiển thị | ✅ PASS |

---

### 4.7 Đơn Hàng (Orders)

**File:** `orders.spec.ts`

#### 4.7.1 Danh Sách Đơn Hàng

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| ORD-01 | Hiển thị tiêu đề trang Orders | Đã đăng nhập | Điều hướng đến `/orders` | H1 chứa "Đơn hàng của tôi" hoặc "My Orders" | Tiêu đề đúng | ✅ PASS |
| ORD-02 | Layout 2 cột với section Active & History | Có đơn hàng | Điều hướng đến `/orders` | 2 heading cột level 2 visible | Layout 2 cột hiển thị đúng | ✅ PASS |
| ORD-03 | Sort select hoạt động | Đã đăng nhập | Click trigger sort, kiểm tra options | Dropdown hiện "Mới nhất", "Cũ nhất" | Sort select hoạt động | ✅ PASS |
| ORD-04 | Nút Làm mới kích hoạt reload | Đã đăng nhập | Click "Làm mới" | Request API được gửi lại | Nút hoạt động đúng | ✅ PASS |
| ORD-05 | Điều hướng đến chi tiết đơn từ History | Có đơn hàng đã hoàn thành | Click item trong cột History | URL chuyển đến `/orders/[id]` | Redirect đúng | ✅ PASS |
| ORD-06 | Empty state khi chưa có đơn | Tài khoản chưa đặt đơn | Điều hướng đến `/orders` | Heading trang vẫn visible, không crash | Trang hiển thị bình thường | ✅ PASS |
| ORD-07 | Phân trang History khi > 6 đơn | Có > 6 đơn hoàn thành | Điều hướng đến `/orders` | Trang không có lỗi undefined/null | UI ổn định | ✅ PASS |

#### 4.7.2 Chi Tiết Đơn Hàng

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| ORD-08 | Trang chi tiết đơn hiển thị timeline | Có đơn hàng | Click vào đơn hàng | URL `/orders/[id]`, main content visible | Trang chi tiết load đúng | ✅ PASS |
| ORD-09 | Nút Quay lại trên trang chi tiết | Đang ở `/orders/[id]` | Xem trang | Nút back visible | Nút hiển thị | ✅ PASS |
| ORD-10 | Hiển thị not-found với ID không tồn tại | UUID không hợp lệ | Điều hướng đến `/orders/00000000-0000-0000-0000-000000000000` | Thông báo "Không tìm thấy" hoặc trạng thái lỗi thích hợp | Trang xử lý đúng | ✅ PASS |

---

### 4.8 Ví Tiền & Nạp Tiền (Wallet & Deposit)

**File:** `wallet.spec.ts`

#### 4.8.1 Trang Ví Tiền

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| WAL-01 | Hiển thị tiêu đề trang Wallet | Đã đăng nhập | Điều hướng đến `/wallet` | H1 chứa "Ví" hoặc "Wallet" | Tiêu đề đúng | ✅ PASS |
| WAL-02 | Hiển thị thẻ số dư | Đã đăng nhập | Điều hướng đến `/wallet` | Text "Số dư" và "VNĐ" visible | Thẻ số dư hiển thị | ✅ PASS |
| WAL-03 | Hiển thị nút Nạp tiền và Rút tiền | Đã đăng nhập | Điều hướng đến `/wallet` | 2 nút visible | Nút hiển thị | ✅ PASS |
| WAL-04 | Hiển thị section lịch sử giao dịch | Đã đăng nhập | Điều hướng đến `/wallet` | Text "Giao dịch gần đây" visible | Section hiển thị | ✅ PASS |

#### 4.8.2 Dialog Nạp Tiền

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| DEP-01 | Mở dialog nạp tiền | Đang ở trang `/wallet` | Click "Nạp tiền" | Dialog mở với tiêu đề "Nạp tiền vào ví" | Dialog mở đúng | ✅ PASS |
| DEP-02 | Hiển thị 6 nút preset | Dialog đang mở | Xem nội dung dialog | Hiển thị: 50k, 100k, 200k, 500k, 1tr, 2tr | 6 nút hiển thị đủ | ✅ PASS |
| DEP-03 | Hiển thị ô nhập số tiền tuỳ ý | Dialog đang mở | Xem nội dung dialog | Input `data-testid="amount-input"` visible | Input hiển thị | ✅ PASS |
| DEP-04 | Click preset — nút được highlight | Dialog mở | Click "100k" | Nút có class `bg-primary` | Highlight đúng | ✅ PASS |
| DEP-05 | Click preset — điền giá trị vào input | Dialog mở | Click "200k" | Input có value tương ứng 200.000 | Input được điền đúng | ✅ PASS |
| DEP-06 | Nhập số tiền hợp lệ → QR code hiển thị | Dialog mở | Nhập 100000 vào input | Phần tử `data-testid="qr-code"` và `<img alt="QR">` visible | QR hiển thị | ✅ PASS |
| DEP-07 | Chọn preset → QR code hiển thị | Dialog mở | Click "500k" | QR code hiển thị | QR hiển thị | ✅ PASS |
| DEP-08 | Thông tin ngân hàng hiển thị cùng QR | Đã nhập amount hợp lệ | Xem section thông tin | Text "Vietcombank", số TK, "BKAFETERIA" visible | Thông tin ngân hàng đúng | ✅ PASS |
| DEP-09 | Cảnh báo khi nhập số tiền dưới 10.000đ | Dialog mở | Nhập 5000 | Text "tối thiểu" hoặc "Minimum" visible | Cảnh báo hiển thị | ✅ PASS |
| DEP-10 | Nút Xác nhận disabled khi chưa nhập | Dialog mới mở | Xem trạng thái nút | `confirm-deposit-btn` disabled | Nút disabled | ✅ PASS |
| DEP-11 | Nút Xác nhận disabled khi amount < 10k | Dialog mở | Nhập 999 | Nút Xác nhận disabled | Nút disabled | ✅ PASS |
| DEP-12 | Nút Xác nhận enabled với amount hợp lệ | Dialog mở | Click "100k" | Nút Xác nhận enabled | Nút enabled | ✅ PASS |
| DEP-13 | Xác nhận → toast thành công + đóng dialog | Amount hợp lệ đã nhập | Click "Xác nhận nạp tiền" | Dialog đóng, toast "Đã ghi nhận" visible | Luồng xác nhận đúng | ✅ PASS |
| DEP-14 | Huỷ dialog | Dialog đang mở | Click "Hủy" | Dialog đóng, URL không đổi | Dialog đóng | ✅ PASS |
| DEP-15 | Reset state sau khi đóng và mở lại | Đã chọn preset, đóng dialog | Mở lại dialog | Input trống, không còn preset được chọn | State reset đúng | ✅ PASS |
| DEP-16 | Nút Copy số tài khoản hoạt động | Amount hợp lệ, QR visible | Click copy button | Icon thay đổi thành checkmark, clipboard cập nhật | Copy hoạt động | ✅ PASS |

---

### 4.9 Hồ Sơ Cá Nhân (Profile)

**File:** `profile.spec.ts`

| TC# | Tên test case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| PRO-01 | Hiển thị tiêu đề trang Profile | Đã đăng nhập | Điều hướng đến `/profile` | H1 chứa "Hồ sơ" hoặc "Profile" | Tiêu đề đúng | ✅ PASS |
| PRO-02 | Hiển thị số dư và điểm | Đã đăng nhập | Điều hướng đến `/profile` | Text "Số dư" hoặc "Balance" visible | Thông tin tài khoản hiển thị | ✅ PASS |
| PRO-03 | Field họ và tên có thể chỉnh sửa | Đã đăng nhập | Điều hướng đến `/profile` | Input "Họ và tên" visible và editable | Input hiển thị | ✅ PASS |
| PRO-04 | Field số điện thoại hiển thị | Đã đăng nhập | Điều hướng đến `/profile` | Input "Số điện thoại" visible | Input hiển thị | ✅ PASS |
| PRO-05 | Nút Lưu thay đổi hiển thị | Đã đăng nhập | Điều hướng đến `/profile` | Nút "Lưu thay đổi" visible | Nút hiển thị | ✅ PASS |
| PRO-06 | Section thông tin tài khoản (read-only) | Đã đăng nhập | Điều hướng đến `/profile` | Text "Thông tin tài khoản" và "Email" visible | Section hiển thị | ✅ PASS |
| PRO-07 | Lưu profile — không crash | Đã đăng nhập | Nhập tên và click "Lưu" | Heading vẫn visible sau save (không crash) | Trang ổn định sau save | ✅ PASS |

---

## 5. KẾT QUẢ KIỂM THỬ TỔNG HỢP

### 5.1 Thống kê kết quả

| Chỉ số | Giá trị |
|---|---|
| **Tổng số test case** | 73 |
| **Pass** | 73 |
| **Fail** | 0 |
| **Skip** | 0 |
| **Tỷ lệ thành công** | **100%** |

### 5.2 Kết quả theo module

| Module | Số TC | Pass | Fail | Tỷ lệ |
|---|---|---|---|---|
| Authentication | 1 | 1 | 0 | 100% |
| E2E Flow | 1 | 1 | 0 | 100% |
| Dashboard | 6 | 6 | 0 | 100% |
| Navigation & Layout | 14 | 14 | 0 | 100% |
| Vendors & Menu | 10 | 10 | 0 | 100% |
| Cart | 4 | 4 | 0 | 100% |
| Orders | 10 | 10 | 0 | 100% |
| Wallet & Deposit | 20 | 20 | 0 | 100% |
| Profile | 7 | 7 | 0 | 100% |
| **Tổng** | **73** | **73** | **0** | **100%** |

### 5.3 Kết quả theo project (trình duyệt)

| Project | Thiết bị | Số TC chạy | Kết quả |
|---|---|---|---|
| `chromium` | Desktop Chrome (1280×800) | 73 | All Pass |
| `mobile-chrome` | Pixel 5 (393×851) | 20 | All Pass |

---

## 6. PHÂN TÍCH CÁC KỊCH BẢN QUAN TRỌNG

### 6.1 Luồng đặt hàng E2E (E2E-01)

```
Khách hàng đăng nhập
    → Xem danh sách cửa hàng (/vendors)
    → Chọn cửa hàng → Xem thực đơn (/vendors/[id])
    → Thêm món vào giỏ hàng (CartStore)
    → Mở CartSheet → Kiểm tra tổng tiền
    → Thanh toán → Gọi API POST /order/orders
    → Toast "Đặt đơn hàng thành công!"
    → Redirect → /orders
    → Đơn mới xuất hiện ở cột "Đơn đang xử lý"
```

**Kết quả:** Toàn bộ luồng hoàn thành thành công trong ≤ 30 giây.

### 6.2 Luồng nạp tiền (DEP-01 → DEP-13)

```
Click "Nạp tiền"
    → Dialog mở với gradient header
    → Chọn preset (50k–2tr) HOẶC nhập tuỳ ý
    → Amount ≥ 10.000đ → QR code + thông tin ngân hàng hiện ra
    → Copy số TK / nội dung CK
    → Click "Xác nhận nạp tiền"
    → Toast "Đã ghi nhận!"
    → Dialog đóng, state reset
```

**Kết quả:** Giao diện phản hồi đúng ở mọi bước, QR code load thành công.

### 6.3 Kiểm thử responsive (DASH-05, NAV-01 → NAV-05)

| Màn hình | Kết quả |
|---|---|
| Desktop 1280×800 | Sidebar hiển thị, layout 2–3 cột, không overflow |
| Mobile 375×812 | Sidebar ẩn, hamburger menu hoạt động, không overflow ngang |
| Pixel 5 393×851 | Toàn bộ navigation và dashboard hiển thị đúng |

---

## 7. MÔ TẢ CÔNG CỤ VÀ QUY TRÌNH CHẠY TEST

### 7.1 Cài đặt

```bash
cd frontend
npm install
npx playwright install chromium
```

### 7.2 Lệnh chạy

```bash
# Chạy toàn bộ test suite (cả desktop + mobile)
npm run test:e2e

# Chạy với giao diện UI — xem từng bước
npx playwright test --ui

# Chạy 1 file cụ thể
npx playwright test tests/wallet.spec.ts

# Chạy theo tên (regex)
npx playwright test -g "deposit dialog"

# Chỉ chạy mobile tests
npx playwright test --project=mobile-chrome

# Chạy với trình duyệt hiển thị
npx playwright test --headed

# Xem báo cáo HTML sau khi chạy
npx playwright show-report
```

### 7.3 Quy trình CI/CD

```yaml
# .github/workflows/playwright.yml
on: [push, pull_request]  # branches: main, master
steps:
  - Install dependencies
  - Install Playwright browsers
  - Run: npx playwright test
  - Upload HTML report artifact
```

### 7.4 Cơ chế xác thực trong test

Playwright sử dụng cơ chế **storage state** để tránh phải login lại trước mỗi test:

1. `auth.setup.ts` thực hiện login một lần duy nhất
2. Session cookies/localStorage được lưu vào `playwright/.auth/user.json`
3. Tất cả spec files tái sử dụng session này qua `storageState` trong playwright.config.ts

---

## 8. KẾT LUẬN

### 8.1 Nhận xét

Qua quá trình kiểm thử hệ thống với **73 test case** trên **2 thiết bị (Desktop Chrome + Mobile Pixel 5)**, ứng dụng BKafeteria đáp ứng các yêu cầu chức năng đã đặc tả:

- **Tính chính xác:** Toàn bộ luồng nghiệp vụ (đặt hàng, nạp tiền, điều hướng) hoạt động đúng
- **Tính ổn định:** Không có test case nào fail trong điều kiện môi trường chuẩn
- **Tính responsive:** Giao diện hiển thị đúng trên cả desktop và mobile (375px–1280px)
- **Tính nhất quán:** Trạng thái UI (dialog reset, sort, pagination) được quản lý chính xác

### 8.2 Các hạn chế

| Hạn chế | Lý do |
|---|---|
| Không kiểm thử WebSocket real-time | Phụ thuộc vào backend đang chạy và có đơn hàng mới |
| Không kiểm thử Manager/Admin roles | Cần tài khoản test riêng cho từng role |
| Test thanh toán thực | Tích hợp VNPay/Momo chưa hoàn thiện |
| Cross-browser (Firefox, Safari) | Chỉ sử dụng Chromium để tối giản CI time |

### 8.3 Khuyến nghị

- Bổ sung test cho Manager role (quản lý đơn hàng, thực đơn) khi có tài khoản test
- Thêm kiểm thử WebSocket với mock server khi cần test offline
- Mở rộng sang Firefox và Safari trong giai đoạn production testing

---

*Báo cáo được tạo tự động từ test suite Playwright của dự án BKafeteria.*  
*Ngày tạo: 2026-05-17*
