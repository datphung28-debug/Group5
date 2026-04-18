# PHÂN TÍCH VÀ THIẾT KẾ DỰ ÁN

## PHẦN MỀM QUẢN LÝ NHÀ THUỐC GPP

---

## 1. Người dùng mục tiêu

### 1.1 Quản trị viên

**Mô tả:**  
Là người dùng có quyền hạn cao nhất trong hệ thống. Quản trị viên chịu trách nhiệm thiết lập, quản lý và giám sát toàn bộ hoạt động của hệ thống.

**Các quyền hạn chính:**

- Quản lý người dùng và phân quyền:
  - Tạo, sửa, xóa tài khoản dược sĩ/nhân viên
  - Thiết lập vai trò và quyền truy cập
- Cài đặt hệ thống:
  - Danh mục thuốc, nhóm thuốc
  - Đơn vị tính, nhà cung cấp
- Quản lý danh mục thuốc:
  - Thêm mới, chỉnh sửa, xóa thuốc
  - Quản lý giá bán, hạn sử dụng, tồn kho
- Theo dõi hoạt động hệ thống:
  - Bán hàng, nhập hàng, tồn kho, giao dịch
- Xem báo cáo:
  - Doanh thu, tồn kho, thuốc sắp hết hạn, tài chính

---

### 1.2 Dược sĩ / Nhân viên

**Mô tả:**  
Người sử dụng hệ thống để bán thuốc và tra cứu thông tin.

**Các quyền hạn chính:**

- Quản lý bán hàng
- Tra cứu thông tin thuốc
- Quản lý đơn thuốc
- Quản lý khách hàng
- Theo dõi tồn kho

---

### 1.3 Khách hàng

**Mô tả:**  
Người dùng tìm kiếm và mua thuốc qua website.

**Các quyền hạn chính:**

- Đăng ký / đăng nhập
- Tìm kiếm thuốc
- Đặt mua thuốc
- Xem lịch sử đơn hàng
- Cập nhật thông tin cá nhân

---

## 2. Phạm vi dự án

### 2.1 Quản lý hệ thống và phân quyền

- Quản lý người dùng
- Quản lý vai trò
- Cấu hình hệ thống

### 2.2 Quản lý khách hàng

- Lưu trữ thông tin khách hàng
- Theo dõi lịch sử mua thuốc
- Cập nhật thông tin

### 2.3 Quản lý thuốc

- Danh mục thuốc
- Thông tin chi tiết thuốc
- Phân loại thuốc

### 2.4 Quản lý kho và giao dịch

- Nhập thuốc
- Bán thuốc
- Theo dõi tồn kho
- Cảnh báo tồn kho

### 2.5 Quản lý đơn thuốc

- Lưu trữ đơn thuốc
- Kiểm tra thuốc theo đơn
- Tuân thủ GPP

### 2.6 Tạo và xuất chứng từ

- Hóa đơn
- Phiếu nhập
- Xuất PDF

### 2.7 Báo cáo và thống kê

- Dashboard tổng quan
- Doanh thu
- Tồn kho
- Phân tích kinh doanh

---

## 3. Mô hình hóa chức năng

### 3.1 Các yêu cầu chức năng

#### R1. Khởi tạo hệ thống

- R1.1 Đăng nhập
- R1.2 Quản lý vai trò
  - R1.2.1 Tạo vai trò
  - R1.2.2 Sửa/xóa vai trò
  - R1.2.3 Gán quyền
- R1.3 Quản lý người dùng
  - R1.3.1 Tạo người dùng
  - R1.3.2 Phân quyền
  - R1.3.3 Khóa/xóa tài khoản
- R1.4 Cấu hình hệ thống
  - Đơn vị tính
  - Nhóm thuốc
  - Nhà cung cấp

---

#### R2. Quản lý khách hàng

- Thêm/sửa/xóa/tìm kiếm khách hàng
- Xem lịch sử mua
- Cập nhật thông tin

---

#### R3. Quản lý thuốc

- Quản lý đơn vị tính
- Quản lý danh mục thuốc
- Quản lý thông tin thuốc
- Phân loại thuốc

---

#### R4. Quản lý kho và giao dịch

- Dashboard kho
- Nhập thuốc
- Bán thuốc
- Theo dõi tồn kho

---

#### R5. Quản lý đơn thuốc

- Lưu trữ đơn thuốc
- Kiểm tra đơn thuốc
- Đảm bảo quy định GPP

---

#### R6. Chứng từ

- Tạo hóa đơn
- Tạo phiếu nhập
- Xuất PDF

---

#### R7. Báo cáo

- Dashboard
- Doanh thu
- Tồn kho
- Phân tích

---
