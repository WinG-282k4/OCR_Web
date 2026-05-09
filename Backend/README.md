# UIBuilder Backend - Django REST API

**Version:** 1.0.0  
**Framework:** Django 5.0 + Django REST Framework 3.14  
**Database:** PostgreSQL 16  
**Last Updated:** March 2, 2026

> **🆕 NEW FEATURES:**  
> ✅ **Authentication** - JWT-based login/register  
> ✅ **Collaboration** - Multi-user projects with roles (Owner, Editor, Viewer)  
> ✅ **Permission System** - Fine-grained access control per project

---

## 📋 Mục lục

1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Kiến trúc & Luồng dữ liệu](#kiến-trúc--luồng-dữ-liệu)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Setup & Installation](#setup--installation)
6. [Docker Deployment](#docker-deployment)
7. [Environment Variables](#environment-variables)

---

## 🎯 Tổng quan hệ thống

### Mục đích

Backend API cho UIBuilder - công cụ thiết kế web với OCR và chỉnh sửa UI trực quan.

### Tính năng chính

- ✅ **Authentication & Authorization**: Đăng ký, đăng nhập với JWT
- ✅ **Collaboration**: Một project có nhiều người cùng làm (Owner, Editor, Viewer)
- ✅ **Multi-screen Projects**: Một project chứa nhiều giao diện/pages
- ✅ **OCR Integration**: Upload ảnh mockup → Tự động phát hiện UI components
- ✅ **Real-time Editing**: User chỉnh sửa style, content, position của components
- ✅ **Version Control**: Lưu lịch sử chỉnh sửa, restore về version cũ
- ✅ **Export Flexible**: Export HTML/React/Vue cho từng screen hoặc toàn bộ project
- ✅ **CORS Enabled**: Frontend localhost:3000 gọi được API

---

## 🏗️ Kiến trúc & Luồng dữ liệu

### Hierarchy Structure

```
User (Authentication)
 ├── Profile: email, name, avatar
 └── Projects: [via ProjectMember]

Project (Container)
 ├── Owner: User
 ├── Members: [User1 (Editor), User2 (Viewer), ...]
 ├── Meta: name, description, theme
 ├── Screen 1 (Home Page)
 │    ├── Canvas: width, height, background
 │    ├── Components: {comp-1: {...}, comp-2: {...}}
 │    └── Versions: [v1, v2, v3...]
 ├── Screen 2 (Login Page)
 │    ├── Canvas: width, height, background
 │    ├── Components: {comp-3: {...}, comp-4: {...}}
 │    └── Versions: [v1, v2...]
 └── Screen 3 (Dashboard)
      ├── Canvas: width, height, background
      ├── Components: {comp-5: {...}, comp-6: {...}}
      └── Versions: [v1, v2, v3, v4...]
```

### User Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ Step 0: Đăng ký / Đăng nhập                                  │
│ POST /api/auth/register/                                    │
│ POST /api/auth/login/                                       │
│ → Nhận JWT access + refresh token                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Tạo Project                                          │
│ POST /api/projects/                                          │
│ Header: Authorization: Bearer {access_token}                 │
│ → User tạo project rỗng với name + description               │
│ → User tự động là Owner của project                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 1.5: Mời người khác collaborate (optional)              │
│ POST /api/projects/{id}/members/                            │
│ → Owner mời user khác với role: Editor hoặc Viewer           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Upload ảnh UI mockup                                 │
│ POST /api/projects/{id}/ocr/                                │
│ → Upload image file                                          │
│ → Nanonets OCR phân tích                                     │
│ → Tạo Screen mới với components detected                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Thêm nhiều screens (lặp lại Step 2)                  │
│ POST /api/projects/{id}/ocr/ (ảnh thứ 2)                   │
│ POST /api/projects/{id}/ocr/ (ảnh thứ 3)                   │
│ → Mỗi ảnh tạo 1 screen riêng                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: User edit components trên FE (Owner hoặc Editor)     │
│ → User clicks component → Edit properties                    │
│ → Change: color, size, content, position...                  │
│ PUT /api/projects/{id}/screens/{screen_id}/                │
│ → Backend check permission (Editor or Owner)                 │
│ → Backend save components mới                                │
│ → Tạo ScreenVersion snapshot                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Export                                               │
│ POST /api/projects/{id}/export/                             │
│ → Generate HTML/React/Vue files                              │
│ → Download as ZIP                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (Overview)

> **Chi tiết đầy đủ xem trực tiếp trong code:**  
> `api/models/user.py`, `api/models/project.py`, `api/models/ocr.py`, `api/models/component.py`

- **User**: kế thừa `AbstractUser`, dùng `email` làm `USERNAME_FIELD`, thêm `avatar`, `bio`.
- **Project**: chứa `name`, `description`, `theme` (JSON), `tags`, `thumbnail`, liên kết `owner` và `members` qua `ProjectMember`.
- **ProjectMember**: liên kết User–Project với `role = owner|editor|viewer`, biết được ai có quyền edit/delete/invite.
- **Screen**: thuộc về Project, có `width/height`, `background_color`, `components` là **list** component (position/size/properties), cờ `created_from_ocr` và link `ocr_analysis`.
- **ScreenVersion**: lưu snapshot `components` + metadata (`change_type`, `description`, `changed_components`, `thumbnail`, `created_by`, `created_at`).
- **OCRAnalysis**: lưu ảnh upload (`image`, `original_filename`), `detected_components` (raw + normalized), `status` (`pending|processing|completed|failed`), `processing_time`.
- **ComponentTemplate**: template cho library/palette với `category`, `type`, `template_data`, `thumbnail_url`, `tags`, `usage_count`, ownership (`is_system`, `created_by`, `is_public`).

Sơ đồ quan hệ tổng quát:

```text
User (1) ──────< (N) ProjectMember >──────< (1) Project
                     │                         │
                     │                         ├──────< (N) Screen
                     │                         │          ├──────< (N) ScreenVersion
                     │                         │
                     │                         └──────< (N) OCRAnalysis
                     │
                     └─ Roles: owner | editor | viewer
```

---

### 2. **Screen Model**

Mỗi giao diện/page trong project.

```python
class Screen(models.Model):
    id = UUID
    project = ForeignKey(Project)

    name = CharField  # "Home Page", "Login", "Dashboard"
    description = TextField (optional)
    screen_type = CharField  # page|component|modal|section
    order = IntegerField  # Thứ tự sắp xếp: 0, 1, 2...

    # Canvas settings
    width = IntegerField (default 1920)
    height = IntegerField (default 1080)
    background_color = CharField (default "#ffffff")
    background_image = ImageField (optional)

    # ⭐ UI Components (JSON Array)
    components = JSONField  # list[component]
    # [
    #   {
    #     "id": "comp-uuid-1",
    #     "type": "button",
    #     "position": { "x": 100, "y": 200 },
    #     "size": { "width": 120, "height": 40 },
    #     "properties": {
    #       "text": "Submit",
    #       "variant": "primary"
    #     }
    #   }
    # ]

    thumbnail = ImageField (optional)

    # OCR tracking
    created_from_ocr = Boolean
    ocr_analysis = ForeignKey(OCRAnalysis, optional)

    created_at = DateTime
    updated_at = DateTime
    last_saved_at = DateTime
```

**Example Data:**

```json
{
  "id": "screen-uuid-1",
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Home Page",
  "screen_type": "page",
  "order": 0,

  "width": 1440,
  "height": 1024,
  "background_color": "#f5f5f5",

  "components": [
    {
      "id": "comp-btn-1",
      "type": "button",
      "position": { "x": 600, "y": 400 },
      "size": { "width": 180, "height": 48 },
      "properties": {
        "text": "Get Started",
        "variant": "primary"
      }
    }
  ],

  "created_from_ocr": true,
  "last_saved_at": "2026-03-02T10:20:00Z"
}
```

---

### 3. **OCRAnalysis Model**

Kết quả phân tích OCR từ ảnh.

```python
class OCRAnalysis(models.Model):
    id = UUID
    project = ForeignKey(Project)

    image = ImageField
    original_filename = CharField
    confidence_threshold = FloatField (default 0.5)

    # Kết quả OCR
    detected_components = JSONField
    # {
    #   "raw_response": {...},  # Raw từ Nanonets hoặc mock
    #   "normalized_components": [...]  # Đã chuẩn hóa
    # }

    status = CharField  # pending|processing|completed|failed
    error_message = TextField (optional)
    processing_time = FloatField (optional, seconds)

    created_at = DateTime
```

**Example Data:**

```json
{
  "id": "ocr-uuid-1",
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "image": "ocr_uploads/2026/03/02/homepage_mockup.png",
  "original_filename": "homepage_mockup.png",
  "confidence_threshold": 0.7,
  "detected_components": {
    "raw_response": {
      "predictions": ["..."]
    },
    "normalized_components": [
      {
        "type": "button",
        "content": "Get Started",
        "position": { "x": 600, "y": 400 },
        "style": { "backgroundColor": "#0070f3" },
        "confidence": 0.95
      }
    ]
  },
  "status": "completed",
  "processing_time": 2.3,
  "created_at": "2026-03-02T10:05:00Z"
}
```

---

### 4. **ScreenVersion Model**

Lịch sử version của từng screen.

```python
class ScreenVersion(models.Model):
    id = UUID
    screen = ForeignKey(Screen)

    version_number = IntegerField  # 1, 2, 3...

    # Snapshot components tại version này
    components = JSONField  # cùng format list như Screen.components

    change_type = CharField  # OCR_IMPORT|MANUAL_EDIT|AUTO_SAVE|RESTORE|DUPLICATE
    description = TextField
    changed_components = JSONField  # ["comp-1", "comp-2"]

    thumbnail = ImageField (optional)
    created_by = ForeignKey(User, optional)  # ai tạo version này

    created_at = DateTime
```

**Example Timeline:**

```json
[
  {
    "version_number": 3,
    "change_type": "MANUAL_EDIT",
    "description": "Changed button color to red",
    "changed_components": ["comp-btn-1"],
    "created_at": "2026-03-02T10:20:00Z"
  },
  {
    "version_number": 2,
    "change_type": "AUTO_SAVE",
    "description": "Auto-saved",
    "changed_components": ["comp-btn-1"],
    "created_at": "2026-03-02T10:15:00Z"
  },
  {
    "version_number": 1,
    "change_type": "OCR_IMPORT",
    "description": "Imported from homepage_mockup.png",
    "changed_components": [],
    "created_at": "2026-03-02T10:05:00Z"
  }
]
```

---

### 5. **ComponentTemplate Model** (Optional)

Thư viện components có sẵn.

```python
class ComponentTemplate(models.Model):
    id = UUID

    # Thông tin template
    name = CharField
    category = CharField  # button, input, card, layout, text, media, form, navigation
    type = CharField      # button|text|heading|input|...

    # Cấu hình component
    template_data = JSONField
    # {
    #   "type": "button",
    #   "style": { ... },
    #   "attributes": { ... },
    #   "default_content": "Button"
    # }

    # Metadata
    thumbnail_url = URLField (optional)
    description = TextField (optional)
    is_active = Boolean (default True)

    # Ownership & visibility
    is_system = Boolean  # template hệ thống
    created_by = ForeignKey(User, optional)
    is_public = Boolean  # cho phép người khác dùng

    # Tags & usage
    tags = JSONField  # ["primary", "rounded"]
    usage_count = IntegerField (default 0)

    created_at = DateTime
    updated_at = DateTime
```

---

### Database Relationships

```
User (1) ──────< (N) ProjectMember >──────< (1) Project
                      │                         │
                      │                         │
                      │                         ├──────< (N) Screen
                      │                         │          │
                      │                         │          ├──────< (N) ScreenVersion
                      │                         │          │
                      │                         └──────< (N) OCRAnalysis ──> (1) Screen
                      │
                      └─ Roles: owner | editor | viewer

Giải thích:
- User có nhiều Projects (qua ProjectMember)
- Project có nhiều Members (qua ProjectMember)
- Project có 1 Owner (User) và N Members với roles
- Project có nhiều Screens
- Screen có nhiều Versions
- OCRAnalysis tạo ra Screen
```

---

## 🛣️ API Endpoints

### Base URL

```
Development: http://localhost:8000/api/
Production: https://api.uibuilder.com/api/
```

---

### **1. Authentication API**

#### **Đăng ký (Register)**

```http
POST /api/auth/register/
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**

```json
{
  "user": {
    "id": "user-uuid-1",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### **Đăng nhập (Login)**

```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:**

```json
{
  "user": {
    "id": "user-uuid-1",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "avatar": "/media/avatars/john.jpg"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### **Refresh Token**

```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### **Đăng xuất (Logout)**

```http
POST /api/auth/logout/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

#### **Get Current User**

```http
GET /api/auth/me/
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "id": "user-uuid-1",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "avatar": "/media/avatars/john.jpg",
  "bio": "UI/UX Designer",
  "date_joined": "2026-03-01T10:00:00Z"
}
```

#### **Update Profile**

```http
PATCH /api/auth/me/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

FormData:
  - first_name: "John Updated"
  - bio: "Senior UI/UX Designer"
  - avatar: File (optional)
```

#### **Change Password**

```http
POST /api/auth/change-password/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "old_password": "OldPassword123",
  "new_password": "NewPassword456"
}
```

---

### **2. Health Check**

```http
GET /api/health/
```

**Response:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": "connected"
}
```

---

### **3. Projects API**

#### **Tạo project mới**

```http
POST /api/projects/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "My E-Commerce Site",
  "description": "Full website design",
  "theme": {
    "primaryColor": "#0070f3",
    "fontFamily": "Inter"
  },
  "tags": ["e-commerce", "responsive"]
}
```

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "My E-Commerce Site",
  "description": "Full website design",
  "theme": {...},
  "screen_count": 0,
  "created_at": "2026-03-02T10:00:00Z"
}
```

#### **List projects**

```http
GET /api/projects/?limit=10&offset=0&search=ecommerce
```

#### **Get project chi tiết**

```http
GET /api/projects/{project_id}/
```

**Response:**

```json
{
  "id": "550e8400-...",
  "name": "My E-Commerce Site",
  "screens": [
    {
      "id": "screen-uuid-1",
      "name": "Home Page",
      "order": 0,
      "thumbnail": "url",
      "component_count": 15
    },
    {
      "id": "screen-uuid-2",
      "name": "Product Page",
      "order": 1,
      "thumbnail": "url",
      "component_count": 20
    }
  ],
  "screen_count": 2
}
```

#### **Update project**

```http
PUT /api/projects/{project_id}/
PATCH /api/projects/{project_id}/
```

#### **Delete project**

```http
DELETE /api/projects/{project_id}/
```

---

### **4. Project Members API** (Collaboration)

#### **List members trong project**

```http
GET /api/projects/{project_id}/members/
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "count": 3,
  "results": [
    {
      "id": "member-uuid-1",
      "user": {
        "id": "user-uuid-1",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "avatar": "/media/avatars/john.jpg"
      },
      "role": "owner",
      "joined_at": "2026-03-02T10:00:00Z",
      "last_activity": "2026-03-02T11:30:00Z"
    },
    {
      "id": "member-uuid-2",
      "user": {
        "id": "user-uuid-2",
        "email": "jane@example.com",
        "first_name": "Jane",
        "last_name": "Smith",
        "avatar": null
      },
      "role": "editor",
      "joined_at": "2026-03-02T10:15:00Z",
      "last_activity": "2026-03-02T11:20:00Z"
    }
  ]
}
```

#### **Mời member vào project**

```http
POST /api/projects/{project_id}/members/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "user_email": "jane@example.com",
  "role": "editor"
}
```

**Response:**

```json
{
  "id": "member-uuid-2",
  "user": {
    "id": "user-uuid-2",
    "email": "jane@example.com",
    "first_name": "Jane",
    "last_name": "Smith"
  },
  "role": "editor",
  "joined_at": "2026-03-02T10:15:00Z",
  "message": "User invited successfully"
}
```

**Errors:**

```json
{
  "error": "User not found"
}
// hoặc
{
  "error": "User already in project"
}
// hoặc
{
  "error": "Only owner can invite members"
}
```

#### **Update member role**

```http
PATCH /api/projects/{project_id}/members/{member_id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "role": "viewer"
}
```

**Response:**

```json
{
  "id": "member-uuid-2",
  "role": "viewer",
  "message": "Role updated successfully"
}
```

**Permission:** Only Owner

#### **Remove member**

```http
DELETE /api/projects/{project_id}/members/{member_id}/
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "message": "Member removed successfully"
}
```

**Permission:** Only Owner, hoặc user tự rời khỏi project

#### **Leave project**

```http
POST /api/projects/{project_id}/leave/
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "message": "You have left the project"
}
```

**Note:** Owner không thể leave, phải transfer ownership trước.

#### **Transfer ownership**

```http
POST /api/projects/{project_id}/transfer-ownership/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "new_owner_id": "user-uuid-2"
}
```

**Response:**

```json
{
  "message": "Ownership transferred successfully",
  "new_owner": {
    "id": "user-uuid-2",
    "email": "jane@example.com",
    "first_name": "Jane"
  }
}
```

**Permission:** Only current Owner

---

### **5. Screens API**

#### **List screens trong project**

```http
GET /api/projects/{project_id}/screens/
```

**Response:**

```json
{
  "count": 3,
  "results": [
    {
      "id": "screen-uuid-1",
      "name": "Home Page",
      "order": 0,
      "screen_type": "page",
      "component_count": 15,
      "thumbnail": "url",
      "created_from_ocr": true,
      "last_saved_at": "2026-03-02T10:20:00Z"
    }
  ]
}
```

#### **Get screen chi tiết**

```http
GET /api/projects/{project_id}/screens/{screen_id}/
```

**Response:**

```json
{
  "id": "screen-uuid-1",
  "name": "Home Page",
  "canvas_width": 1440,
  "canvas_height": 1024,
  "background_color": "#ffffff",
  "components": {
    "comp-btn-1": {
      "id": "comp-btn-1",
      "type": "button",
      "content": "Get Started",
      "x": 600,
      "y": 400,
      "style": {
        "backgroundColor": "#0070f3",
        "fontSize": "18px"
      }
    }
  },
  "component_order": ["comp-btn-1"]
}
```

#### **⭐ Update screen (User edit components)**

```http
PUT /api/projects/{project_id}/screens/{screen_id}/
Content-Type: application/json

{
  "name": "Home Page Updated",
  "components": {
    "comp-btn-1": {
      "id": "comp-btn-1",
      "type": "button",
      "content": "Buy Now",
      "x": 600,
      "y": 400,
      "style": {
        "backgroundColor": "#ff0000",
        "fontSize": "20px"
      }
    }
  },
  "auto_save_version": true
}
```

**Response:**

```json
{
  "id": "screen-uuid-1",
  "message": "Screen updated successfully",
  "version_created": true,
  "version_number": 3
}
```

#### **Delete screen**

```http
DELETE /api/projects/{project_id}/screens/{screen_id}/
```

#### **Duplicate screen**

```http
POST /api/projects/{project_id}/screens/{screen_id}/duplicate/

{
  "new_name": "Home Page Copy"
}
```

#### **Reorder screens**

```http
POST /api/projects/{project_id}/screens/reorder/

{
  "screen_orders": [
    {"screen_id": "screen-uuid-2", "order": 0},
    {"screen_id": "screen-uuid-1", "order": 1}
  ]
}
```

---

### **6. OCR API**

#### **⭐ Upload ảnh để tạo screen mới**

```http
POST /api/projects/{project_id}/ocr/
Content-Type: multipart/form-data

FormData:
  - image: File (PNG, JPG, JPEG)
  - screen_name: "Login Page" (optional)
  - confidence: 0.7 (optional, default 0.5)
```

**Response:**

```json
{
  "ocr_id": "ocr-uuid-1",
  "status": "PROCESSING",
  "message": "OCR analysis started"
}
```

#### **Check OCR status**

```http
GET /api/ocr/{ocr_id}/
```

**Response (Success):**

```json
{
  "id": "ocr-uuid-1",
  "status": "SUCCESS",
  "processing_time": 2.3,
  "screen_created": {
    "id": "screen-uuid-3",
    "name": "Login Page",
    "component_count": 8
  },
  "detected_components": [
    {
      "type": "input",
      "content": "Email",
      "confidence": 0.92
    },
    {
      "type": "button",
      "content": "Login",
      "confidence": 0.95
    }
  ]
}
```

#### **List OCR history**

```http
GET /api/projects/{project_id}/ocr/
```

---

### **7. Screen Versions API**

#### **Get version history**

```http
GET /api/projects/{project_id}/screens/{screen_id}/versions/
```

**Response:**

```json
{
  "versions": [
    {
      "version_number": 3,
      "change_type": "MANUAL_EDIT",
      "description": "Changed button colors",
      "changed_components": ["comp-btn-1"],
      "created_at": "2026-03-02T10:30:00Z"
    },
    {
      "version_number": 2,
      "change_type": "AUTO_SAVE",
      "description": "Auto-saved",
      "changed_components": ["comp-btn-1"],
      "created_at": "2026-03-02T10:25:00Z"
    },
    {
      "version_number": 1,
      "change_type": "OCR_IMPORT",
      "description": "Imported from login_mockup.png",
      "changed_components": [],
      "created_at": "2026-03-02T10:00:00Z"
    }
  ]
}
```

#### **Get specific version**

```http
GET /api/projects/{project_id}/screens/{screen_id}/versions/{version_number}/
```

#### **Restore to version**

```http
POST /api/projects/{project_id}/screens/{screen_id}/restore/{version_number}/
```

**Response:**

```json
{
  "message": "Screen restored to version 2",
  "components": {...},
  "new_version_created": true,
  "new_version_number": 4
}
```

---

### **8. Export API**

#### **Export single screen**

```http
POST /api/projects/{project_id}/screens/{screen_id}/export/

{
  "format": "html",
  "include_css": true,
  "include_tailwind": false,
  "minify": false
}
```

**Response:**

```json
{
  "html": "<!DOCTYPE html>...",
  "css": "body { margin: 0; }...",
  "preview_url": "/media/exports/screen-uuid-1.html"
}
```

#### **Export entire project**

```http
POST /api/projects/{project_id}/export/

{
  "format": "html",
  "include_navigation": true,
  "screens": ["screen-uuid-1", "screen-uuid-2"]
}
```

**Response:**

```json
{
  "files": [
    {
      "screen_name": "Home Page",
      "filename": "home.html",
      "url": "/media/exports/project-uuid-1/home.html"
    },
    {
      "screen_name": "Login Page",
      "filename": "login.html",
      "url": "/media/exports/project-uuid-1/login.html"
    }
  ],
  "zip_url": "/media/exports/project-uuid-1.zip"
}
```

---

### **9. Component Templates API** (Optional)

```http
GET /api/components/?category=button&search=primary
GET /api/components/{id}/
```

---

## � Authentication & Collaboration Setup

### JWT Authentication

Backend sử dụng **djangorestframework-simplejwt** cho JWT authentication.

**Thêm vào requirements.txt:**

```
djangorestframework-simplejwt==5.3.1
```

**Thêm vào .env:**

```env
JWT_ACCESS_TOKEN_LIFETIME=60      # 60 minutes
JWT_REFRESH_TOKEN_LIFETIME=7      # 7 days
```

### User Model

Extend Django's built-in User model trong `api/models/user.py`:

```python
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
```

### Collaboration Model

Tạo `api/models/project_member.py`:

```python
class ProjectMember(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    project = models.ForeignKey('Project', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'user')
```

### Permission Checking

Trong views, check permissions:

```python
from rest_framework.permissions import IsAuthenticated

class ScreenUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, project_id, screen_id):
        # Check if user has edit permission
        member = ProjectMember.objects.filter(
            project_id=project_id,
            user=request.user,
            role__in=['owner', 'editor']
        ).first()

        if not member:
            return Response(
                {"error": "You don't have permission to edit"},
                status=403
            )

        # Proceed with update...
```

---

## �🚀 Setup & Installation

### Prerequisites

- Python 3.11+
- PostgreSQL 16+
- pip or pipenv

### Installation Steps

#### 1. Clone repository

```bash
cd Backend
```

#### 2. Create virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### 3. Install dependencies

```bash
pip install -r requirements.txt
```

#### 4. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=uibuilder_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

NANONETS_API_KEY=your-nanonets-api-key

MAX_UPLOAD_SIZE=10485760
```

#### 5. Create database

```bash
# PostgreSQL
createdb uibuilder_db

# hoặc trong psql
psql -U postgres
CREATE DATABASE uibuilder_db;
\q
```

#### 6. Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### 7. Create superuser (optional)

```bash
python manage.py createsuperuser
```

#### 8. Seed data (optional)

```bash
python manage.py seed_components
```

#### 9. Run development server

```bash
python manage.py runserver 0.0.0.0:8000
```

#### 10. Test API

```bash
# Health check
curl http://localhost:8000/api/health/

# Create project
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project"}'
```

---

## 🐳 Docker Deployment

### Using docker-compose

#### 1. Build and run

```bash
docker-compose up --build
```

#### 2. Run migrations

```bash
docker-compose exec backend python manage.py migrate
```

#### 3. Create superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

#### 4. Access

- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin/
- PostgreSQL: localhost:5432

### docker-compose.yml

```yaml
version: "3.8"

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: uibuilder_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn uibuilder_backend.wsgi:application --bind 0.0.0.0:8000"
    volumes:
      - .:/app
      - media_data:/app/media
    ports:
      - "8000:8000"
    environment:
      - DATABASE_HOST=db
      - CORS_ALLOWED_ORIGINS=http://localhost:3000
    depends_on:
      - db

volumes:
  postgres_data:
  media_data:
```

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "uibuilder_backend.wsgi:application", "--bind", "0.0.0.0:8000"]
```

---

## 🔐 Environment Variables

| Variable                     | Description                           | Default        | Required |
| ---------------------------- | ------------------------------------- | -------------- | -------- |
| `DEBUG`                      | Debug mode                            | `True`         | No       |
| `SECRET_KEY`                 | Django secret key                     | -              | **Yes**  |
| `ALLOWED_HOSTS`              | Allowed hosts (comma separated)       | `localhost`    | No       |
| `DATABASE_ENGINE`            | Database engine                       | `postgresql`   | No       |
| `DATABASE_NAME`              | Database name                         | `uibuilder_db` | **Yes**  |
| `DATABASE_USER`              | Database user                         | `postgres`     | **Yes**  |
| `DATABASE_PASSWORD`          | Database password                     | -              | **Yes**  |
| `DATABASE_HOST`              | Database host                         | `localhost`    | No       |
| `DATABASE_PORT`              | Database port                         | `5432`         | No       |
| `CORS_ALLOWED_ORIGINS`       | CORS origins (comma separated)        | -              | **Yes**  |
| `JWT_ACCESS_TOKEN_LIFETIME`  | JWT access token expiration (minutes) | `60`           | No       |
| `JWT_REFRESH_TOKEN_LIFETIME` | JWT refresh token expiration (days)   | `7`            | No       |
| `NANONETS_API_KEY`           | Nanonets API key for OCR              | -              | **Yes**  |
| `MAX_UPLOAD_SIZE`            | Max file upload size (bytes)          | `10485760`     | No       |

---

## 📁 Cấu trúc thư mục

```
Backend/
├── manage.py
├── requirements.txt
├── .env
├── .env.example
├── .gitignore
├── README.md
├── Dockerfile
├── docker-compose.yml
│
├── uibuilder_backend/          # Django project settings
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── api/                        # Main app
│   ├── __init__.py
│   ├── apps.py
│   ├── admin.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py            # User (Extended AbstractUser)
│   │   ├── project.py         # Project, ProjectMember, Screen, ScreenVersion
│   │   ├── ocr.py             # OCRAnalysis
│   │   └── component.py       # ComponentTemplate
│   │
│   ├── serializers/
│   │   ├── __init__.py
│   │   ├── auth_serializer.py # User, Register, Login
│   │   ├── project_serializer.py
│   │   ├── member_serializer.py  # ProjectMember
│   │   ├── screen_serializer.py
│   │   ├── ocr_serializer.py
│   │   └── version_serializer.py
│   │
│   ├── views/
│   │   ├── __init__.py
│   │   ├── auth_views.py      # Register, Login, Me, Logout
│   │   ├── health_view.py
│   │   ├── project_views.py
│   │   ├── member_views.py    # Project members management
│   │   ├── screen_views.py
│   │   ├── ocr_views.py
│   │   ├── version_views.py
│   │   └── export_views.py
│   │
│   ├── permissions/             # NEW: Permission classes
│   │   ├── __init__.py
│   │   └── project_permissions.py  # IsOwner, IsEditor, IsMember
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py    # JWT token generation
│   │   ├── ocr_service.py     # Nanonets integration
│   │   ├── export_service.py  # HTML/React/Vue generation
│   │   └── version_service.py
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── exceptions.py
│   │   ├── validators.py
│   │   └── html_generator.py
│   │
│   ├── urls.py
│   ├── migrations/
│   └── tests/
│
├── media/                      # Uploaded files
│   ├── avatars/               # User avatars
│   ├── ocr_uploads/
│   ├── screen_thumbnails/
│   ├── project_thumbnails/
│   └── exports/
│
└── staticfiles/               # Static files
```

---

## 🧪 Testing

### Automated tests

```bash
python manage.py test
```

Chạy test cho module cụ thể:

```bash
python manage.py test api.tests.test_projects
```

Coverage:

```bash
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

### Manual API testing status (2026-03-02)

- **Đã test & PASS (theo `API_TEST_REPORT.md`)**:
  - Auth: register, login, refresh, me, update profile, change-password, logout (token cũ bị blacklist).  
  - Health: `/api/health/`.  
  - Projects: list, create, export project (zip).  
  - Members: invite (editor, viewer), list, update role, remove member, transfer ownership, owner-leave (bị chặn đúng nghiệp vụ).  
  - Screens/Versions: tạo screen qua API, backfill version v1, list versions cho screen seed.  
  - Export: export toàn bộ project với format `html`.

- **Chưa test hoặc mới test một phần** (theo `API_UNTESTED_CHECKLIST.md`):
  - OCR flows: upload, status, create screen from OCR, retry, các case lỗi file/size/quyền.  
  - Component templates: categories, popular, create/update/delete template, use template.  
  - Export single screen (HTML/React/Vue) trên screen mới tạo qua API.  
  - Negative cases cho Auth/Projects/Screens/Members/Versions (404/400/403/401).

Chi tiết request/response thực tế xem thêm:

- `API_TEST_REPORT.md`: log đầy đủ các API đã gọi.  
- `API_UNTESTED_CHECKLIST.md`: danh sách API và case còn lại cần test.

---

## 📝 Development Guidelines

### Code Style

- Follow PEP 8
- Use type hints
- Write docstrings for functions/classes

### Git Workflow

```bash
# Feature branch
git checkout -b feature/screen-versions

# Commit
git add .
git commit -m "Add screen version control"

# Push
git push origin feature/screen-versions
```

### Database Migration

```bash
# After model changes
python manage.py makemigrations
python manage.py migrate

# Create empty migration
python manage.py makemigrations api --empty
```

---

## 🐛 Troubleshooting

### Database connection error

```bash
# Check PostgreSQL status
pg_isready

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### CORS errors

```bash
# Check CORS_ALLOWED_ORIGINS in settings.py
# Make sure frontend URL is included
```

### Import errors

```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

## 📚 Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nanonets API](https://nanonets.com/documentation/)

---

## 📄 License

MIT License

---

## 👥 Contributors

- Your Team

---

## 📞 Support

For issues or questions, please contact: your-email@example.com

---

**Last Updated:** March 2, 2026
