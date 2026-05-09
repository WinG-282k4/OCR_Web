# 🧪 UIBuilder Backend - API Testing Guide

Complete guide for testing all API endpoints using **Postman** and **cURL**.

---

## 📋 Table of Contents

1. [Setup & Authentication](#-setup--authentication)
2. [User Management](#-user-management)
3. [Projects](#-projects)
4. [Screens](#-screens)
5. [OCR Analysis](#-ocr-analysis)
6. [Component Templates](#-component-templates)
7. [Screen Versions](#-screen-versions)
8. [Project Members](#-project-members)
9. [Health Checks](#-health-checks)
10. [Postman Collection](#-postman-collection)

---

## 🔧 Setup & Authentication

### Base URL

```
http://localhost:8000/api
```

### Test Credentials

```
Email: admin@uibuilder.com
Password: admin123
```

### 1. Register New User

**Postman:**

```
POST {{base_url}}/auth/register/
Content-Type: application/json

Body:
{
  "email": "test@example.com",
  "password": "Test123!@#",
  "first_name": "Test",
  "last_name": "User"
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Expected Response:**

```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "message": "User registered successfully"
}
```

---

### 2. Login

**Postman:**

```
POST {{base_url}}/auth/login/
Content-Type: application/json

Body:
{
  "email": "admin@uibuilder.com",
  "password": "admin123"
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@uibuilder.com",
    "password": "admin123"
  }'
```

**Expected Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "admin@uibuilder.com",
    "first_name": "Admin",
    "last_name": "User"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**💡 Save the `access` token - you'll need it for authenticated requests!**

---

### 3. Get Current User Info

**Postman:**

```
GET {{base_url}}/auth/me/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 4. Refresh Token

**Postman:**

```
POST {{base_url}}/auth/refresh/
Content-Type: application/json

Body:
{
  "refresh": "{{refresh_token}}"
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

---

### 5. Change Password

**Postman:**

```
POST {{base_url}}/auth/change-password/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "old_password": "admin123",
  "new_password": "NewPass123!@#"
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/auth/change-password/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "admin123",
    "new_password": "NewPass123!@#"
  }'
```

---

### 6. Logout

**Postman:**

```
POST {{base_url}}/auth/logout/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "refresh": "{{refresh_token}}"
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 👤 User Management

### Update Profile

**Postman:**

```
PATCH {{base_url}}/auth/profile/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "first_name": "Updated",
  "last_name": "Name",
  "bio": "Software Engineer"
}
```

**cURL:**

```bash
curl -X PATCH http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated",
    "last_name": "Name",
    "bio": "Software Engineer"
  }'
```

---

## 📁 Projects

### 1. List All Projects

**Postman:**

```
GET {{base_url}}/projects/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Query Parameters:**

- `?search=name` - Search projects by name
- `?ordering=-updated_at` - Sort by update date
- `?page=1` - Pagination

---

### 2. Create Project

**Postman:**

```
POST {{base_url}}/projects/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "name": "My First Project",
  "description": "E-commerce website redesign",
  "thumbnail": null
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Project",
    "description": "E-commerce website redesign"
  }'
```

**Expected Response:**

```json
{
  "project": {
    "id": "uuid",
    "name": "My First Project",
    "description": "E-commerce website redesign",
    "owner": {
      "id": "uuid",
      "email": "admin@uibuilder.com",
      "first_name": "Admin",
      "last_name": "User"
    },
    "screen_count": 0,
    "member_count": 1,
    "created_at": "2026-03-02T10:30:00Z",
    "updated_at": "2026-03-02T10:30:00Z"
  },
  "message": "Project created successfully"
}
```

**💡 Save the project `id` for next requests!**

---

### 3. Get Project Details

**Postman:**

```
GET {{base_url}}/projects/{{project_id}}/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/projects/PROJECT_UUID/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 4. Update Project

**Postman:**

```
PATCH {{base_url}}/projects/{{project_id}}/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**cURL:**

```bash
curl -X PATCH http://localhost:8000/api/projects/PROJECT_UUID/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated description"
  }'
```

---

### 5. Delete Project

**Postman:**

```
DELETE {{base_url}}/projects/{{project_id}}/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X DELETE http://localhost:8000/api/projects/PROJECT_UUID/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 6. Export Project

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/export/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "format": "html",
  "include_screens": [],
  "options": {
    "minify": true
  }
}
```

**cURL (Save to file):**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/export/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "html"
  }' \
  --output project-export.zip
```

**Export Formats:**

- `html` - Static HTML files
- `react` - React components
- `vue` - Vue.js components

---

## 🖼️ Screens

### 1. List Screens in Project

**Postman:**

```
GET {{base_url}}/projects/{{project_id}}/screens/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/projects/PROJECT_UUID/screens/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 2. Create Screen

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/screens/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "name": "Home Page",
  "description": "Landing page design",
  "width": 1920,
  "height": 1080,
  "components": [
    {
      "id": "header-1",
      "type": "header",
      "position": { "x": 0, "y": 0 },
      "size": { "width": 1920, "height": 80 },
      "properties": {
        "backgroundColor": "#ffffff",
        "logo": "logo.png"
      }
    },
    {
      "id": "hero-1",
      "type": "section",
      "position": { "x": 0, "y": 80 },
      "size": { "width": 1920, "height": 600 },
      "properties": {
        "heading": "Welcome to Our Site",
        "subheading": "Your journey starts here",
        "backgroundImage": "hero.jpg"
      }
    },
    {
      "id": "btn-1",
      "type": "button",
      "position": { "x": 860, "y": 400 },
      "size": { "width": 200, "height": 50 },
      "properties": {
        "text": "Get Started",
        "variant": "primary",
        "onClick": "navigate(/signup)"
      }
    }
  ],
  "order": 1
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/screens/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Home Page",
    "description": "Landing page design",
    "width": 1920,
    "height": 1080,
    "components": [
      {
        "id": "btn-1",
        "type": "button",
        "position": {"x": 100, "y": 100},
        "size": {"width": 120, "height": 40},
        "properties": {"text": "Click Me"}
      }
    ]
  }'
```

**💡 Save the screen `id` for next requests!**

---

### 3. Get Screen Details

**Postman:**

```
GET {{base_url}}/projects/{{project_id}}/screens/{{screen_id}}/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/projects/PROJECT_UUID/screens/SCREEN_UUID/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 4. Update Screen Components

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/screens/{{screen_id}}/update_components/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "components": [
    {
      "id": "btn-1",
      "type": "button",
      "position": {"x": 150, "y": 150},
      "size": {"width": 120, "height": 40},
      "properties": {
        "text": "Updated Button",
        "variant": "primary"
      }
    },
    {
      "id": "input-1",
      "type": "input",
      "position": {"x": 150, "y": 200},
      "size": {"width": 300, "height": 40},
      "properties": {
        "placeholder": "Enter your email",
        "type": "email"
      }
    }
  ],
  "create_version": true,
  "version_description": "Updated button style and added email input"
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/screens/SCREEN_UUID/update_components/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "components": [
      {
        "id": "btn-1",
        "type": "button",
        "position": {"x": 200, "y": 200},
        "size": {"width": 120, "height": 40},
        "properties": {"text": "Updated!"}
      }
    ],
    "create_version": true,
    "version_description": "Updated button position"
  }'
```

---

### 5. Duplicate Screen

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/screens/{{screen_id}}/duplicate/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "new_name": "Home Page Copy",
  "copy_versions": false
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/screens/SCREEN_UUID/duplicate/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_name": "Home Page Copy",
    "copy_versions": false
  }'
```

---

### 6. Reorder Screen

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/screens/{{screen_id}}/reorder/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "new_order": 3
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/screens/SCREEN_UUID/reorder/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_order": 3
  }'
```

---

### 7. Export Screen

**Postman:**

```
GET {{base_url}}/projects/{{project_id}}/screens/{{screen_id}}/export/?format=html
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET "http://localhost:8000/api/projects/PROJECT_UUID/screens/SCREEN_UUID/export/?format=html" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Format options:** `html`, `react`, `vue`

---

### 8. Delete Screen

**Postman:**

```
DELETE {{base_url}}/projects/{{project_id}}/screens/{{screen_id}}/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X DELETE http://localhost:8000/api/projects/PROJECT_UUID/screens/SCREEN_UUID/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🖼️ OCR Analysis

### 1. Upload Image for OCR

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/ocr/upload/
Authorization: Bearer {{access_token}}
Content-Type: multipart/form-data

Body (form-data):
- image: [Select file]
- auto_create_screen: true
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/ocr/upload/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/design-mockup.png" \
  -F "auto_create_screen=true"
```

**Expected Response:**

```json
{
  "ocr_analysis": {
    "id": "uuid",
    "original_filename": "design-mockup.png",
    "status": "pending",
    "created_at": "2026-03-02T10:30:00Z"
  },
  "message": "Image uploaded successfully. OCR analysis started."
}
```

---

### 2. List OCR Analyses

**Postman:**

```
GET {{base_url}}/projects/{{project_id}}/ocr/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/projects/PROJECT_UUID/ocr/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Query Parameters:**

- `?status=completed` - Filter by status
- `?ordering=-created_at` - Sort by date

---

### 3. Get OCR Analysis Details

**Postman:**

```
GET {{base_url}}/projects/{{project_id}}/ocr/{{ocr_id}}/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/projects/PROJECT_UUID/ocr/OCR_UUID/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 4. Retry OCR Analysis

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/ocr/{{ocr_id}}/retry/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/ocr/OCR_UUID/retry/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 5. Create Screen from OCR

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/ocr/{{ocr_id}}/create_screen/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "screen_name": "OCR Generated Screen",
  "auto_adjust_layout": true
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/ocr/OCR_UUID/create_screen/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "screen_name": "OCR Generated Screen",
    "auto_adjust_layout": true
  }'
```

---

### 6. Get OCR Status

**Postman:**

```
GET {{base_url}}/projects/{{project_id}}/ocr/{{ocr_id}}/status/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/projects/PROJECT_UUID/ocr/OCR_UUID/status/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Possible Statuses:**

- `pending` - Queued for processing
- `processing` - Currently analyzing
- `completed` - Successfully completed
- `failed` - Analysis failed

---

## 🧩 Component Templates

### 1. List All Templates

**Postman:**

```
GET {{base_url}}/components/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/components/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Query Parameters:**

- `?category=button` - Filter by category
- `?search=primary` - Search by name
- `?tags=system` - Filter by tags
- `?is_public=true` - Only public templates

---

### 2. Get Template Categories

**Postman:**

```
GET {{base_url}}/components/categories/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/components/categories/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 3. Get Popular Templates

**Postman:**

```
GET {{base_url}}/components/popular/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/components/popular/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 4. Create Custom Template

**Postman:**

```
POST {{base_url}}/components/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "name": "My Custom Button",
  "description": "A custom styled button",
  "category": "button",
  "type": "button",
  "template_data": {
    "defaultProps": {
      "text": "Click Me",
      "variant": "primary",
      "size": "medium"
    },
    "styles": {
      "backgroundColor": "#007bff",
      "color": "#ffffff",
      "padding": "10px 20px",
      "borderRadius": "4px"
    }
  },
  "tags": ["custom", "blue"],
  "is_public": false
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/components/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Button",
    "category": "button",
    "type": "button",
    "template_data": {
      "defaultProps": {"text": "Click Me"},
      "styles": {"backgroundColor": "#007bff"}
    }
  }'
```

---

### 5. Use Template (Increment Usage Count)

**Postman:**

```
POST {{base_url}}/components/{{template_id}}/use/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/components/TEMPLATE_UUID/use/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 6. Update Template

**Postman:**

```
PATCH {{base_url}}/components/{{template_id}}/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "name": "Updated Button Template",
  "description": "Updated description"
}
```

**cURL:**

```bash
curl -X PATCH http://localhost:8000/api/components/TEMPLATE_UUID/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Button Template"
  }'
```

**Note:** Can only update your own templates (not system templates)

---

### 7. Delete Template

**Postman:**

```
DELETE {{base_url}}/components/{{template_id}}/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X DELETE http://localhost:8000/api/components/TEMPLATE_UUID/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📜 Screen Versions

### 1. List Screen Versions

**Postman:**

```
GET {{base_url}}/projects/{{project_id}}/screens/{{screen_id}}/versions/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/projects/PROJECT_UUID/screens/SCREEN_UUID/versions/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 2. Get Version Details

**Postman:**

```
GET {{base_url}}/projects/{{project_id}}/screens/{{screen_id}}/versions/{{version_id}}/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/projects/PROJECT_UUID/screens/SCREEN_UUID/versions/VERSION_UUID/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 3. Restore Version

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/screens/{{screen_id}}/versions/{{version_id}}/restore/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "create_backup": true
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/screens/SCREEN_UUID/versions/VERSION_UUID/restore/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "create_backup": true
  }'
```

---

### 4. Compare Versions

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/screens/{{screen_id}}/versions/compare/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "version_a_id": "uuid-1",
  "version_b_id": "uuid-2"
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/screens/SCREEN_UUID/versions/compare/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version_a_id": "VERSION_UUID_1",
    "version_b_id": "VERSION_UUID_2"
  }'
```

---

## 👥 Project Members

### 1. List Project Members

**Postman:**

```
GET {{base_url}}/projects/{{project_id}}/members/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/projects/PROJECT_UUID/members/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 2. Invite Member

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/members/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "user_email": "colleague@example.com",
  "role": "editor"
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/members/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "colleague@example.com",
    "role": "editor"
  }'
```

**Roles:**

- `viewer` - Read-only access
- `editor` - Can edit screens and content
- `owner` - Full control (only one per project)

---

### 3. Update Member Role

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/members/{{member_id}}/update_role/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "role": "viewer"
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/members/MEMBER_UUID/update_role/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "viewer"
  }'
```

---

### 4. Remove Member

**Postman:**

```
DELETE {{base_url}}/projects/{{project_id}}/members/{{member_id}}/
Authorization: Bearer {{access_token}}
```

**cURL:**

```bash
curl -X DELETE http://localhost:8000/api/projects/PROJECT_UUID/members/MEMBER_UUID/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 5. Transfer Ownership

**Postman:**

```
POST {{base_url}}/projects/{{project_id}}/members/transfer_ownership/
Authorization: Bearer {{access_token}}
Content-Type: application/json

Body:
{
  "new_owner_id": "user-uuid"
}
```

**cURL:**

```bash
curl -X POST http://localhost:8000/api/projects/PROJECT_UUID/members/transfer_ownership/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_owner_id": "USER_UUID"
  }'
```

**Note:** Only the current owner can transfer ownership

---

## ❤️ Health Checks

### 1. Full Health Check

**Postman:**

```
GET {{base_url}}/health/
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/health/
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": 1709395200.0,
  "version": "1.0.0",
  "checks": {
    "database": "connected",
    "storage": "available"
  }
}
```

---

### 2. Readiness Probe (Kubernetes)

**Postman:**

```
GET {{base_url}}/ready/
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/ready/
```

---

### 3. Liveness Probe (Kubernetes)

**Postman:**

```
GET {{base_url}}/live/
```

**cURL:**

```bash
curl -X GET http://localhost:8000/api/live/
```

---

## 📦 Postman Collection

### Setting Up Environment Variables

1. Create a new environment in Postman
2. Add these variables:

```
base_url = http://localhost:8000/api
access_token = [Set after login]
refresh_token = [Set after login]
project_id = [Set after creating project]
screen_id = [Set after creating screen]
ocr_id = [Set after OCR upload]
template_id = [Set after creating template]
member_id = [Set after inviting member]
version_id = [Set after creating version]
```

### Auto-Set Tokens After Login

Add this to the **Tests** tab of your Login request:

```javascript
// Save tokens to environment
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("access_token", jsonData.tokens.access);
  pm.environment.set("refresh_token", jsonData.tokens.refresh);
  console.log("✅ Tokens saved to environment");
}
```

---

### Collection Structure

```
UIBuilder API
├── 🔐 Authentication
│   ├── Register
│   ├── Login [Auto-save tokens]
│   ├── Get Me
│   ├── Refresh Token
│   ├── Change Password
│   └── Logout
│
├── 👤 User
│   └── Update Profile
│
├── 📁 Projects
│   ├── List Projects
│   ├── Create Project
│   ├── Get Project
│   ├── Update Project
│   ├── Delete Project
│   └── Export Project
│
├── 🖼️ Screens
│   ├── List Screens
│   ├── Create Screen
│   ├── Get Screen
│   ├── Update Components
│   ├── Duplicate Screen
│   ├── Reorder Screen
│   ├── Export Screen
│   └── Delete Screen
│
├── 🔍 OCR
│   ├── Upload Image
│   ├── List OCR Analyses
│   ├── Get OCR Details
│   ├── Retry OCR
│   ├── Create Screen from OCR
│   └── Get OCR Status
│
├── 🧩 Components
│   ├── List Templates
│   ├── Get Categories
│   ├── Get Popular
│   ├── Create Template
│   ├── Use Template
│   ├── Update Template
│   └── Delete Template
│
├── 📜 Versions
│   ├── List Versions
│   ├── Get Version
│   ├── Restore Version
│   └── Compare Versions
│
├── 👥 Members
│   ├── List Members
│   ├── Invite Member
│   ├── Update Role
│   ├── Remove Member
│   └── Transfer Ownership
│
└── ❤️ Health
    ├── Health Check
    ├── Readiness
    └── Liveness
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete User Journey

```bash
# 1. Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Test123!","first_name":"Test","last_name":"User"}'

# 2. Login (save token)
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Test123!"}' \
  | jq -r '.tokens.access')

# 3. Create Project
PROJECT_ID=$(curl -X POST http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project"}' \
  | jq -r '.project.id')

# 4. Create Screen
SCREEN_ID=$(curl -X POST http://localhost:8000/api/projects/$PROJECT_ID/screens/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Home","width":1920,"height":1080,"components":[]}' \
  | jq -r '.screen.id')

# 5. Update Components
curl -X POST http://localhost:8000/api/projects/$PROJECT_ID/screens/$SCREEN_ID/update_components/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"components":[{"id":"btn-1","type":"button","position":{"x":100,"y":100},"size":{"width":120,"height":40},"properties":{"text":"Click"}}],"create_version":true}'
```

---

### Scenario 2: OCR Workflow

```bash
# 1. Upload image
OCR_ID=$(curl -X POST http://localhost:8000/api/projects/$PROJECT_ID/ocr/upload/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@mockup.png" \
  -F "auto_create_screen=false" \
  | jq -r '.ocr_analysis.id')

# 2. Check status (repeat until completed)
curl -X GET http://localhost:8000/api/projects/$PROJECT_ID/ocr/$OCR_ID/status/ \
  -H "Authorization: Bearer $TOKEN"

# 3. Create screen from OCR
curl -X POST http://localhost:8000/api/projects/$PROJECT_ID/ocr/$OCR_ID/create_screen/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"screen_name":"OCR Screen","auto_adjust_layout":true}'
```

---

### Scenario 3: Collaboration

```bash
# 1. Invite member
MEMBER_ID=$(curl -X POST http://localhost:8000/api/projects/$PROJECT_ID/members/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_email":"colleague@test.com","role":"editor"}' \
  | jq -r '.member.id')

# 2. Update role
curl -X POST http://localhost:8000/api/projects/$PROJECT_ID/members/$MEMBER_ID/update_role/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"viewer"}'

# 3. List all members
curl -X GET http://localhost:8000/api/projects/$PROJECT_ID/members/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Common Issues

### 401 Unauthorized

**Problem:** Token expired or invalid  
**Solution:** Login again to get fresh token

### 403 Forbidden

**Problem:** Insufficient permissions  
**Solution:** Check your role (viewer/editor/owner)

### 404 Not Found

**Problem:** Resource doesn't exist  
**Solution:** Verify UUID is correct

### 400 Bad Request

**Problem:** Invalid data format  
**Solution:** Check request body matches examples above

---

## 📝 Notes

1. **All UUIDs**: Replace placeholder UUIDs with actual values from responses
2. **Tokens**: Access tokens expire after 1 hour, refresh tokens after 7 days
3. **File Uploads**: Use `multipart/form-data` for image uploads
4. **Pagination**: Most list endpoints support `?page=1&page_size=20`
5. **Filtering**: Use query parameters for filtering and searching

---

**Happy Testing! 🎉**

For issues or questions, check the [COMPREHENSIVE_FIX_SUMMARY.md](COMPREHENSIVE_FIX_SUMMARY.md) or [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
