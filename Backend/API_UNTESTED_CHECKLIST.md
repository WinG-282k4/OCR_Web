## API Chưa Test Hoặc Mới Test Một Phần

**Ngày cập nhật:** 2026-03-02  
**Nguồn tổng hợp:** `TESTING_CHECKLIST.md` + `API_TEST_REPORT.md`

---

### 1. Auth – Negative Cases

- [ ] **Register với email đã tồn tại**  
  - `POST /api/auth/register/`  
  - Kỳ vọng: `400 Bad Request` với thông báo email đã được dùng.

- [ ] **Login sai password**  
  - `POST /api/auth/login/`  
  - Kỳ vọng: `401 Unauthorized`, thông báo sai email/password.

- [ ] **Access protected endpoint không có token**  
  - Ví dụ: `GET /api/projects/` không gửi `Authorization`  
  - Kỳ vọng: `401 Unauthorized`.

- [ ] **Access với token hết hạn**  
  - Dùng access token cũ đã hết hạn để gọi `GET /api/projects/`  
  - Kỳ vọng: `401 Unauthorized`.

---

### 2. Projects

- [ ] **Get project details**  
  - `GET /api/projects/{project_id}/` (đã tạo bằng API)  
  - Kỳ vọng: trả screens_total, members_total, screens/members embed như README.

- [ ] **Update project**  
  - `PATCH /api/projects/{project_id}/`  
  - Kỳ vọng: 200, cập nhật name/description/theme.

- [ ] **Delete project**  
  - `DELETE /api/projects/{project_id}/` (với project dummy)  
  - Kỳ vọng: 204, cascade xoá screens/members.

- [ ] **Get project không tồn tại**  
  - `GET /api/projects/{fake_id}/`  
  - Kỳ vọng: `404 Not Found`.

- [ ] **Update/Delete project không phải owner**  
  - Gọi bằng token của member không phải owner  
  - Kỳ vọng: `403 Forbidden`.

---

### 3. Screens & Export Screen

- [ ] **Create screen (case chuẩn)**  
  - `POST /api/projects/{project_id}/screens/` với components hợp lệ (khác seed hiện tại)  
  - Kỳ vọng: 201, tạo version v1 tự động.

- [ ] **Get screen details**  
  - `GET /api/projects/{project_id}/screens/{screen_id}/` cho screen tạo mới  
  - Kỳ vọng: trả components, current_version, versions summary.

- [ ] **Update components (screen tạo mới)**  
  - `POST /api/projects/{project_id}/screens/{screen_id}/update_components/`  
  - Kỳ vọng: 200, tạo thêm version mới.

- [ ] **Export screen – HTML**  
  - `GET /api/projects/{project_id}/screens/{screen_id}/export/?format=html`  
  - Kỳ vọng: 200, body `{ format, code, filename }`.

- [ ] **Export screen – React**  
  - `GET /api/projects/{project_id}/screens/{screen_id}/export/?format=react`  
  - Kỳ vọng: 200, trả JSX.

- [ ] **Export screen – Vue**  
  - `GET /api/projects/{project_id}/screens/{screen_id}/export/?format=vue`  
  - Kỳ vọng: 200, trả component Vue.

- [ ] **Screens – Negative**  
  - Tạo screen với width/height ngoài range cho phép → `400`.  
  - Tạo/update components với JSON sai schema (không phải list / thiếu id/type/position/size) → `400`.

---

### 4. Members – Negative Cases

- [ ] **Invite non-existent user email**  
  - `POST /api/projects/{project_id}/members/` với email không tồn tại  
  - Kỳ vọng: `400 "User with this email does not exist"`.

- [ ] **Invite user đã là member**  
  - Mời lại `tester3` hoặc `tester4` sau khi đã là member  
  - Kỳ vọng: `400 "User is already a member of this project"`.

- [ ] **Non-owner invite/update/transfer**  
  - Dùng token editor/viewer để:
    - `POST /members/` (invite)  
    - `PATCH /members/{member_id}/` (update role)  
    - `POST /members/transfer_ownership/`  
  - Kỳ vọng: `403 Forbidden`.

- [ ] **Transfer ownership tới non-member**  
  - `POST /members/transfer_ownership/` với `new_owner_id` không thuộc project  
  - Kỳ vọng: `400 "User is not a member of this project"`.

- [ ] **Leave project – non-owner**  
  - Case chưa test: viewer/editor tự `leave` project (không phải owner)  
  - Kỳ vọng: 200, membership bị xoá.

---

### 5. Versions

- [ ] **Get version details**  
  - `GET /api/projects/{project_id}/screens/{screen_id}/versions/{version_id}/`  
  - Kỳ vọng: 200, trả chi tiết components, created_by, created_at.

- [ ] **Compare versions (2 phiên bản khác nhau)**  
  - `POST /versions/compare/` với `{ "version_a": 1, "version_b": 2 }`  
  - Kỳ vọng: trả diff số components thêm/bớt.

- [ ] **Restore version**  
  - `POST /versions/{version_id}/restore/`  
  - Kỳ vọng: cập nhật screen.components theo version, optional tạo version mới.

- [ ] **Versions – Negative**  
  - Compare versions không tồn tại → 404 / error JSON.  
  - Restore version không tồn tại → 404.  
  - Compare cùng 1 version (1,1) → 200, diff = 0.

---

### 6. OCR

- [ ] **Upload image**  
  - `POST /api/projects/{project_id}/ocr/upload/` (multipart)  
  - Kỳ vọng: 201, tạo `OCRAnalysis`, status `pending/processing/completed`.

- [ ] **List OCR analyses**  
  - `GET /api/projects/{project_id}/ocr/`  
  - Kỳ vọng: liệt kê các OCRAnalysis theo project.

- [ ] **Get OCR details**  
  - `GET /api/projects/{project_id}/ocr/{ocr_id}/`.

- [ ] **Check OCR status**  
  - `GET /api/projects/{project_id}/ocr/{ocr_id}/status/`.

- [ ] **Create screen from OCR**  
  - `POST /api/projects/{project_id}/ocr/{ocr_id}/create_screen/`  
  - Kỳ vọng: tạo screen mới với components lọc theo confidence.

- [ ] **Retry failed OCR**  
  - `POST /api/projects/{project_id}/ocr/{ocr_id}/retry/` (nếu có implement)  
  - Kỳ vọng: cho phép chạy lại hoặc trả lỗi rõ ràng.

- [ ] **OCR – Negative**  
  - Upload file không phải ảnh → `400`.  
  - Upload file vượt MAX_UPLOAD_SIZE → `400`.  
  - Truy cập OCR của project khác → `404` hoặc `403`.

---

### 7. Component Templates

- [ ] **List templates (có data)**  
  - `GET /api/components/` sau khi `seed_components`  
  - Kỳ vọng: có kết quả, filter/search hoạt động.

- [ ] **Get categories**  
  - `GET /api/components/categories/`  
  - Kỳ vọng: danh sách `{value,label}` theo `CATEGORY_CHOICES`.

- [ ] **Get popular templates**  
  - `GET /api/components/popular/`  
  - Kỳ vọng: top 10 theo `usage_count`.

- [ ] **Create custom template**  
  - `POST /api/components/`  
  - Kỳ vọng: 201, template thuộc về user hiện tại.

- [ ] **Use template**  
  - `POST /api/components/{template_id}/use/`  
  - Kỳ vọng: 200, `usage_count` tăng.

- [ ] **Update template**  
  - `PATCH /api/components/{template_id}/`  
  - Kỳ vọng: chỉ owner hoặc system cho phép, cập nhật fields.

- [ ] **Delete template**  
  - `DELETE /api/components/{template_id}/`  
  - Kỳ vọng: soft delete (`is_active=false`), không hiển thị ở list.

---

### 8. Health bổ sung

- [ ] **Readiness probe**  
  - `GET /api/ready/`  
  - Kỳ vọng: 200, body báo các dịch vụ phụ thuộc “ready”.

- [ ] **Liveness probe**  
  - `GET /api/live/`  
  - Kỳ vọng: 200, xác nhận process đang sống.

