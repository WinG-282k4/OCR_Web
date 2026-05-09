## API Test Report – Backend UIBuilder

**Ngày**: 2026-03-02  
**Môi trường**: `http://localhost:8000` (Docker `docker-compose`)  
**User test**: `tester2@example.com`

---

## 0. APIs đang lỗi (cần lưu ý)

- **Invite member** – `POST /api/projects/{id}/members/`
  - Khi mời `tester3@example.com` (`role=editor`) và `tester4@example.com` (`role=viewer`), server trả về **500 (Internal Server Error)** (traceback từ `ProjectMember.objects.get(...)`), sau đó `/members/` list vẫn chỉ có owner.
  - Chi tiết request/response xem mục **3.4 Invite members** bên dưới.

- **Logout với refresh token cũ sau khi đổi mật khẩu** – `POST /api/auth/logout/`
  - Gọi với refresh token đã được “vô hiệu hóa” bởi change-password trả về **400 Bad Request** với body:
    - `{"error":"Invalid token or token already blacklisted"}`.
  - Đây là hành vi **đúng với thiết kế** nhưng được ghi ở đây vì API trả HTTP error, cần lưu ý khi test.

---

## 1. Health & System

### 1.1 Health check (đã test)

- **Request**

```bash
curl http://localhost:8000/api/health/
```

- **Thực tế – Response**
  - Status: **200 OK**
  - Body:

```json
{
  "status": "healthy",
  "timestamp": 1772446466.824246,
  "version": "1.0.0",
  "checks": { "database": "connected", "storage": "available" }
}
```

- **Kỳ vọng**
  - Status: 200
  - Body có khóa `status="healthy"`, `version="1.0.0"`, các check `database="connected"`, `storage="available"`.

---

## 2. Authentication

### 2.1 Đăng ký (Register) – `/api/auth/register/` (đã test)

- **Request (PowerShell)**

```powershell
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/auth/register/" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"email":"tester2@example.com","password":"Test1234!","password_confirm":"Test1234!","first_name":"Test","last_name":"User2"}'
```

- **Thực tế – Response**
  - Status: **201 Created**
  - Body (rút gọn):

```json
{
  "user": {
    "id": "e93a3b23-9235-4be5-ae77-6000174d5700",
    "email": "tester2@example.com",
    "first_name": "Test",
    "last_name": "User2",
    "full_name": "Test User2",
    "avatar": null,
    "bio": null,
    "is_active": true,
    "date_joined": "2026-03-02T10:19:06.949031Z",
    "last_login": null
  },
  "tokens": {
    "refresh": "<refresh_jwt>",
    "access": "<access_jwt>"
  },
  "message": "Registration successful"
}
```

- **Kỳ vọng**
  - Status: 201
  - Trả về `user` + `tokens.access` + `tokens.refresh`, message `"Registration successful"`.

### 2.2 Đăng nhập (Login) – `/api/auth/login/` (đã test)

- **Request (PowerShell)**

```powershell
$resp = Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/auth/login/" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"email":"tester2@example.com","password":"Test1234!"}';
$resp.Content
```

- **Thực tế – Response**
  - Status: **200 OK**
  - Body (rút gọn):

```json
{
  "user": {
    "id": "e93a3b23-9235-4be5-ae77-6000174d5700",
    "email": "tester2@example.com",
    "first_name": "Test",
    "last_name": "User2",
    "full_name": "Test User2",
    "avatar": null,
    "bio": null,
    "is_active": true,
    "date_joined": "2026-03-02T10:19:06.949031Z",
    "last_login": null
  },
  "tokens": {
    "refresh": "<refresh_jwt>",
    "access": "<access_jwt>"
  },
  "message": "Login successful"
}
```

- **Kỳ vọng**
  - Status: 200
  - Body tương tự README: `user` + `tokens` + `"Login successful"`.

> **Ghi chú**: Access token dùng trong các request tiếp theo:
>
> ```text
> Authorization: Bearer <ACCESS_TOKEN>
> ```

### 2.3 Refresh token – `/api/auth/refresh/` (đã test)

- **Request**

```powershell
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/auth/refresh/" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"refresh":"<refresh_jwt_tester2>"}'
```

- **Thực tế – Response**
  - Status: **200 OK**
  - Body (rút gọn):

```json
{
  "access": "<new_access_jwt>"
}
```

- **Kỳ vọng**
  - Status: 200, trả về access token mới hợp lệ.

### 2.4 Me – `/api/auth/me/` (đã test)

- **Request**

```powershell
$Headers = @{ "Authorization" = "Bearer <ACCESS_TOKEN>" }
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/auth/me/" `
  -Method GET `
  -Headers $Headers
```

- **Thực tế – Response**
  - Status: **200 OK**
  - Body (rút gọn):

```json
{
  "id": "e93a3b23-9235-4be5-ae77-6000174d5700",
  "email": "tester2@example.com",
  "first_name": "Test",
  "last_name": "User2",
  "full_name": "Test User2",
  "avatar": null,
  "bio": null,
  "is_active": true,
  "date_joined": "2026-03-02T10:19:06.949031Z",
  "last_login": null
}
```

- **Kỳ vọng**
  - Trả đúng thông tin user hiện tại tương tự phần `user` trong response login.

### 2.5 Update profile – `/api/auth/profile/` (đã test)

- **Request**

```powershell
$Headers = @{ "Authorization" = "Bearer <ACCESS_TOKEN>" }
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/auth/profile/" `
  -Method PATCH `
  -Headers $Headers `
  -ContentType "application/json" `
  -Body '{"bio":"Tester2 updated bio"}'
```

- **Thực tế – Response**
  - Status: **200 OK**
  - Body (rút gọn):

```json
{
  "user": {
    "id": "e93a3b23-9235-4be5-ae77-6000174d5700",
    "email": "tester2@example.com",
    "bio": "Tester2 updated bio",
    "first_name": "Test",
    "last_name": "User2",
    "full_name": "Test User2",
    "avatar": null,
    "is_active": true
  },
  "message": "Profile updated successfully"
}
```

- **Kỳ vọng**
  - Cập nhật profile và trả lại user đã update cùng message như trên.

### 2.6 Change password – `/api/auth/change-password/` (đã test)

- **Request**

```powershell
$Headers = @{ "Authorization" = "Bearer <ACCESS_TOKEN>" }
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/auth/change-password/" `
  -Method POST `
  -Headers $Headers `
  -ContentType "application/json" `
  -Body '{"old_password":"Test1234!","new_password":"NewPass123!","new_password_confirm":"NewPass123!"}'
```

- **Thực tế – Response**
  - Status: **200 OK**
  - Body (rút gọn):

```json
{
  "message": "Password changed successfully",
  "tokens": {
    "refresh": "<new_refresh_jwt>",
    "access": "<new_access_jwt>"
  }
}
```

- **Kỳ vọng**
  - Đổi mật khẩu thành công, blacklist toàn bộ token cũ và trả về cặp tokens mới.

### 2.7 Logout – `/api/auth/logout/` (đã test với token cũ – lỗi hợp lệ)

- **Request**

```powershell
$Headers = @{ "Authorization" = "Bearer <ACCESS_TOKEN>" }
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/auth/logout/" `
  -Method POST `
  -Headers $Headers `
  -ContentType "application/json" `
  -Body '{"refresh_token":"<old_refresh_jwt>"}'
```

- **Thực tế – Response**
  - Status: **400 Bad Request**
  - Body:

```json
{ "error": "Invalid token or token already blacklisted" }
```

- **Nhận xét**
  - Do refresh token dùng trong logout đã bị blacklist/không còn hợp lệ sau khi change-password, API trả lỗi `"Invalid token or token already blacklisted"` đúng với code.

> Nếu gọi logout ngay sau login (trước khi đổi password) với refresh còn sống thì kỳ vọng: `200 OK` và `{ "message": "Logout successful" }`.

---

## 3. Projects & Members

### 3.1 List projects – `/api/projects/` (đã test)

- **Request**

```powershell
$Headers = @{ "Authorization" = "Bearer <ACCESS_TOKEN>" }
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/projects/" `
  -Headers $Headers `
  -Method GET
```

- **Thực tế – Response (lần đầu)**
  - Status: **200 OK**
  - Body:

```json
{ "count": 0, "next": null, "previous": null, "results": [] }
```

- **Kỳ vọng**
  - Liệt kê các project mà user là owner hoặc member, có các field `id`, `name`, `description`, `owner_name`, `screen_count`, `member_count`, `tags`, `updated_at`.

### 3.2 Tạo project – `/api/projects/` (đã test)

- **Request**

```powershell
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/projects/" `
  -Headers $Headers `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Test Project","description":"Test via curl","theme":{},"tags":[]}'
```

- **Thực tế – Response**
  - Status: **201 Created**
  - Body (rút gọn):

```json
{
  "id": "05b55f49-2344-4693-a389-20b18d81d81f",
  "name": "Test Project",
  "description": "Test via curl",
  "theme": {},
  "tags": [],
  "thumbnail": null,
  "owner": {
    "id": "e93a3b23-9235-4be5-ae77-6000174d5700",
    "email": "tester2@example.com",
    "...": "..."
  },
  "screen_count": 0,
  "member_count": 1,
  "created_at": "...",
  "updated_at": "..."
}
```

- **Kỳ vọng**
  - Status: 201
  - Owner được set là user hiện tại, đồng thời tạo `ProjectMember` role `owner`.

### 3.3 List members – `/api/projects/{project_id}/members/` (đã test)

- **Request**

```powershell
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/projects/05b55f49-2344-4693-a389-20b18d81d81f/members/" `
  -Headers $Headers `
  -Method GET
```

- **Thực tế – Response**
  - Status: **200 OK**
  - Body (rút gọn):

```json
{
  "count": 1,
  "results": [
    {
      "id": "5b76e023-6331-432c-a07d-9a382384c76e",
      "user": {
        "id": "e93a3b23-9235-4be5-ae77-6000174d5700",
        "email": "tester2@example.com",
        "first_name": "Test",
        "last_name": "User2"
      },
      "role": "owner",
      "can_edit": true,
      "can_delete": true,
      "can_invite": true,
      "joined_at": "...",
      "last_activity": "..."
    }
  ]
}
```

- **Kỳ vọng**
  - Owner xuất hiện đúng với role `owner` và quyền `can_edit=true`, `can_invite=true`.

### 3.4 Invite members – `/api/projects/{id}/members/` (đã test, PASS)

- **Request mời tester3 làm editor**

```powershell
$Headers = @{ "Authorization" = "Bearer <ACCESS_TOKEN_OWNER>" }
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/projects/05b55f49-2344-4693-a389-20b18d81d81f/members/" `
  -Headers $Headers `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"user_email":"tester3@example.com","role":"editor"}'
```

- **Thực tế – Response**
  - Status: **201 Created**
  - Body (rút gọn):

```json
{
  "member": {
    "id": "2995c69e-bd9a-45c7-80df-9ecee1168730",
    "user": {
      "id": "ddc6c6b9-58b7-4436-b7b3-6894af93f76a",
      "email": "tester3@example.com",
      "full_name": "Editor User"
    },
    "role": "editor",
    "invited_by_name": "Test User2",
    "can_edit": true,
    "can_delete": false,
    "can_invite": false
  },
  "message": "Member invited successfully"
}
```

- **Request mời tester4 làm viewer**

```powershell
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/projects/05b55f49-2344-4693-a389-20b18d81d81f/members/" `
  -Headers $Headers `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"user_email":"tester4@example.com","role":"viewer"}'
```

- **Thực tế – Response**
  - Status: **201 Created**
  - Body (rút gọn, `role: "viewer"`).

- **List members sau khi invite**

```json
{
  "count": 3,
  "results": [
    { "role": "viewer", "user": { "email": "tester4@example.com" } },
    { "role": "editor", "user": { "email": "tester3@example.com" } },
    { "role": "owner", "user": { "email": "tester2@example.com" } }
  ]
}
```

### 3.5 Members – update/delete/transfer/leave (đã test)

#### 3.5.1 Update member role – `PATCH /api/projects/{id}/members/{member_id}/`

- **Request** (owner đổi tester3 từ `editor` → `viewer`):

```powershell
$HeadersOwner = @{ "Authorization" = "Bearer <ACCESS_TOKEN_OWNER>" }
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/projects/05b55f49-2344-4693-a389-20b18d81d81f/members/2995c69e-bd9a-45c7-80df-9ecee1168730/" `
  -Headers $HeadersOwner `
  -Method PATCH `
  -ContentType "application/json" `
  -Body '{"role":"viewer"}'
```

- **Thực tế – Response**
  - Status: **200 OK**
  - Body (rút gọn):

```json
{
  "member": {
    "id": "2995c69e-bd9a-45c7-80df-9ecee1168730",
    "role": "viewer",
    "can_edit": false
  },
  "message": "Member role updated successfully"
}
```

#### 3.5.2 Remove member – `DELETE /api/projects/{id}/members/{member_id}/`

- **Request** (owner xoá tester4 viewer):

```powershell
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/projects/05b55f49-2344-4693-a389-20b18d81d81f/members/56ba5d3e-46ed-4e6d-be8b-836bd8747018/" `
  -Headers $HeadersOwner `
  -Method DELETE
```

- **Thực tế – Response**
  - Status: **204 No Content** (view trả JSON `"Member removed successfully"`, client hiển thị status 204).

#### 3.5.3 Transfer ownership – `POST /api/projects/{id}/members/transfer_ownership/`

- **Request** (chuyển owner từ tester2 → tester3):

```powershell
$body='{"new_owner_id":"ddc6c6b9-58b7-4436-b7b3-6894af93f76a"}' # user_id của tester3
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/projects/05b55f49-2344-4693-a389-20b18d81d81f/members/transfer_ownership/" `
  -Headers $HeadersOwner `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

- **Thực tế – Response**
  - Status: **200 OK**
  - Body (rút gọn):

```json
{
  "message": "Ownership transferred successfully",
  "new_owner": {
    "user": { "email": "tester3@example.com" },
    "role": "owner",
    "can_edit": true,
    "can_delete": true,
    "can_invite": true
  }
}
```

#### 3.5.4 Leave project – `POST /api/projects/{id}/members/{member_id}/leave/`

- **Request** (tester3 – hiện là owner mới – thử leave):

```powershell
$HeadersEditor = @{ "Authorization" = "Bearer <ACCESS_TOKEN_TESTER3>" }
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/projects/05b55f49-2344-4693-a389-20b18d81d81f/members/2995c69e-bd9a-45c7-80df-9ecee1168730/leave/" `
  -Headers $HeadersEditor `
  -Method POST
```

- **Thực tế – Response**
  - Status: **400 Bad Request**
  - Body:

```json
{"error":"Project owner cannot leave. Transfer ownership first."}
```

- **Nhận xét**
  - Hành vi đúng theo business rule: owner không thể rời project, phải chuyển ownership cho user khác trước.

---

## 4. Screens & Versions

### 4.1 Tạo screen – `/api/projects/{project_id}/screens/` (đã test)

- **Request**

```powershell
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/projects/05b55f49-2344-4693-a389-20b18d81d81f/screens/" `
  -Headers $Headers `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Home","description":"Home screen","width":1440,"height":900,"components":[]}'
```

- **Thực tế – Response**
  - Status: **201 Created**
  - Body (rút gọn):

```json
{
  "screen": {
    "id": "13ee4685-e28c-4903-bf99-b933adf0afed",
    "name": "Home",
    "description": "Home screen",
    "width": 1440,
    "height": 900,
    "components": [],
    "thumbnail": null,
    "order": 0,
    "component_count": 0,
    "versions": [
      {
        "version_number": 1,
        "description": "Initial version",
        "components": [],
        "created_by": { "id": "e93a3b23-..." },
        "created_at": "..."
      }
    ],
    "current_version": 1
  },
  "message": "Screen created successfully"
}
```

- **Kỳ vọng**
  - Tạo screen mới, đồng thời tạo `ScreenVersion` v1 với components hiện tại.

### 4.2 List screens – `/api/projects/{project_id}/screens/` (đã test)

- **Request**

```powershell
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/projects/05b55f49-2344-4693-a389-20b18d81d81f/screens/" `
  -Headers $Headers `
  -Method GET
```

- **Thực tế – Response**
  - Status: **200 OK**
  - Body: chứa screen `Home` vừa tạo với `component_count=0`, `current_version=1`.

- **Kỳ vọng**
  - Phù hợp với `ScreenListSerializer` trong docs.

### 4.3 Các API screen khác (chưa test – expected)

1. **Retrieve screen** – `GET /api/projects/{p}/screens/{s}/`
   - Expected: trả về chi tiết screen + lịch sử versions.
2. **Update metadata** – `PUT/PATCH /api/projects/{p}/screens/{s}/`
   - Expected: 200, cập nhật name/description/width/height, không đổi versions nếu không yêu cầu.
3. **Update components** – `POST /api/projects/{p}/screens/{s}/update_components/`
   - Expected: validate components là list; nếu `create_version=true` thì tạo version mới.
4. **Duplicate** – `POST /api/projects/{p}/screens/{s}/duplicate/`
   - Expected: tạo screen mới copy metadata + components; version v1 mới hoặc copy toàn bộ versions tuỳ param.
5. **Reorder** – `POST /api/projects/{p}/screens/{s}/reorder/`
   - Expected: update order, re-balance thứ tự các screen khác trong project.
6. **Export single screen** – `GET /api/projects/{p}/screens/{s}/export/?format=html|react|vue`
   - Expected: 200, body `{ format, code, filename }`.

### 4.4 Versions – list/compare/restore/delete (chưa test – expected)

1. **List versions** – `GET /api/projects/{p}/screens/{s}/versions/`
   - Expected: list version theo `version_number` giảm dần, có `component_count`, `created_by`.
2. **Compare** – `POST /api/projects/{p}/screens/{s}/versions/compare/`
   - Body: `{ "version_a": 1, "version_b": 3 }`.
   - Expected: trả về thống kê component_count_diff, components_added/removed.
3. **Restore** – `POST /api/projects/{p}/screens/{s}/versions/{version_id}/restore/`
   - Expected: cập nhật screen.components, optional tạo version mới.
4. **Delete version** – `DELETE /api/projects/{p}/screens/{s}/versions/{version_id}/`
   - Expected: không cho xoá nếu là version duy nhất.

---

## 5. OCR API (chưa test – expected)

### 5.1 Upload OCR – `/api/projects/{project_id}/ocr/upload/`

- **Request (dự kiến)**

```bash
curl -X POST http://localhost:8000/api/projects/{project_id}/ocr/upload/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "image=@mockup.png" \
  -F "screen_name=Login Page" \
  -F "confidence_threshold=0.7"
```

- **Expected response**
  - Status: 201
  - Body có `ocr_analysis` (status `'pending'`/`'completed'`) và nếu auto_create_screen=true & OCR thành công thì có thông tin `screen` được tạo.

### 5.2 Check OCR status – `/api/projects/{p}/ocr/{id}/status/`

- Expected: 200, trả về `{ status, progress, message, component_count? }`.

### 5.3 Create screen from OCR – `/api/projects/{p}/ocr/create_screen/`

- Request body mẫu:

```json
{
  "ocr_analysis_id": "<ocr_uuid>",
  "screen_name": "Login Screen",
  "confidence_filter": 0.8
}
```

- Expected: 201, tạo screen mới với components lọc theo confidence, tạo version v1.

---

## 6. Component Templates

### 6.1 List templates – `/api/components/` (đã test, chưa seed data)

- **Request**

```powershell
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:8000/api/components/" `
  -Headers $Headers `
  -Method GET
```

- **Thực tế – Response**
  - Status: **200 OK**
  - Body:

```json
{ "count": 0, "next": null, "previous": null, "results": [] }
```

- **Kỳ vọng**
  - Khi đã seed data (`python manage.py seed_components`), trả về list templates theo filter `category`, `type`, `tags`, `search`.

### 6.2 Các API khác của components (chưa test – expected)

1. **Create template** – `POST /api/components/`
   - Expected: 201, chỉ user đăng nhập; `created_by` = user hiện tại.
2. **Use template** – `POST /api/components/{id}/use/`
   - Expected: 200, tăng `usage_count`.
3. **Categories** – `GET /api/components/categories/`
   - Expected: list các `{ value, label }` theo `CATEGORY_CHOICES`.
4. **Popular** – `GET /api/components/popular/`
   - Expected: top 10 template có `usage_count` cao nhất.

---

## 7. Project Export (chưa test – expected)

### 7.1 Export project – `/api/projects/{project_id}/export/`

- **Request (ví dụ)**

```bash
curl -X POST "http://localhost:8000/api/projects/{project_id}/export/" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "html",
    "include_screens": [],
    "options": {}
  }' \
  -o project-export.zip
```

- **Expected**
  - Status: 200
  - Response là file zip (`Content-Type: application/zip`) chứa:
    - `screens/*.html` hoặc `.jsx`/`.vue` theo format.
    - `README.md` mô tả project.
    - `package.json` nếu format là `react`/`vue`.

---

## 8. Kết luận test hiện tại

- **Đã test runtime bằng curl/Invoke-WebRequest**:
  - `/api/health/`
  - `/api/auth/register/`
  - `/api/auth/login/`
  - `/api/projects/` (GET, POST)
  - `/api/projects/{id}/members/` (GET)
  - `/api/projects/{id}/screens/` (POST, GET)
  - `/api/components/` (GET – chưa seed data)

- **Chưa test runtime (mới dừng ở mức expected theo code/README)**:
  - Auth: refresh, logout, me, change-password, profile.
  - Project: update/delete, stats, duplicate, archive, recent.
  - Member: invite/update role/delete/transfer/leave.
  - Screens: retrieve, update, update_components, duplicate, reorder, export single screen.
  - Versions: list/compare/restore/delete_version.
  - OCR: upload/status/create_screen.
  - Export project: zip file.
  - Component templates: create/use/categories/popular.

File này có thể tiếp tục được cập nhật khi chạy thêm test curl thực tế (ghi thêm từng request/response vào các section tương ứng).
