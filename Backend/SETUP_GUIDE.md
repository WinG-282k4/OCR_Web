# UIBuilder Backend - Setup Guide

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 16+
- pip
- virtualenv

### Step-by-Step Setup

#### 1. Install Python Dependencies

```bash
cd Backend
python -m venv venv

# Windows
venv\\Scripts\\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

#### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
SECRET_KEY=django-insecure-your-secret-key-change-this
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_NAME=uibuilder_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Optional - for OCR
NANONETS_API_KEY=your-api-key
```

#### 3. Setup PostgreSQL Database

**Windows (PostgreSQL Shell):**

```sql
CREATE DATABASE uibuilder_db;
CREATE USER postgres WITH PASSWORD 'your_password';
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE uibuilder_db TO postgres;
```

**Linux/Mac:**

```bash
sudo -u postgres psql
CREATE DATABASE uibuilder_db;
CREATE USER postgres WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE uibuilder_db TO postgres;
\\q
```

#### 4. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

Expected output:

```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, api, token_blacklist
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying api.0001_initial... OK
  ...
```

#### 5. Create Admin User

```bash
python manage.py createsuperuser
```

Enter:

- Email: admin@example.com
- First name: Admin
- Last name: User
- Password: **\*\*\*\***

#### 6. Start Development Server

```bash
python manage.py runserver 0.0.0.0:8000
```

Server running at: **http://localhost:8000**

#### 7. Verify Installation

Open browser:

- API Root: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/

## 📝 Testing the API

### 1. Register User

```bash
curl -X POST http://localhost:8000/api/auth/register/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "first_name": "Test"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGci...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGci..."
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### 3. Create Project

```bash
curl -X POST http://localhost:8000/api/projects/ \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My First Project",
    "description": "Test project",
    "tags": ["test", "demo"]
  }'
```

### 4. Create Screen

```bash
curl -X POST http://localhost:8000/api/projects/{project_id}/screens/ \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Home Screen",
    "width": 1920,
    "height": 1080,
    "components": []
  }'
```

## 🐛 Common Issues

### Issue: ModuleNotFoundError: No module named 'django'

**Solution:**

```bash
# Activate virtual environment first
venv\\Scripts\\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Then install
pip install -r requirements.txt
```

### Issue: FATAL: database "uibuilder_db" does not exist

**Solution:**

```bash
# Create database in PostgreSQL
sudo -u postgres psql
CREATE DATABASE uibuilder_db;
\\q
```

### Issue: relation "api_user" does not exist

**Solution:**

```bash
# Run migrations
python manage.py migrate
```

### Issue: CORS errors from frontend

**Solution:**
Check `CORS_ALLOWED_ORIGINS` in `.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Issue: Token error "Token is blacklisted"

**Solution:**
Login again to get new tokens:

```bash
curl -X POST http://localhost:8000/api/auth/login/ -d '{"email": "...", "password": "..."}'
```

## 🔧 Development Tips

### Django Shell

```bash
python manage.py shell
```

```python
from api.models import User, Project, Screen

# Create user
user = User.objects.create_user(email='dev@test.com', password='pass123')

# Query projects
projects = Project.objects.filter(owner=user)
```

### Database Reset

```bash
# Delete and recreate database
python manage.py flush
python manage.py migrate
python manage.py createsuperuser
```

### View SQL Queries

Add to `settings.py`:

```python
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## 📦 Project Structure

```
Backend/
├── manage.py                 # Django CLI
├── requirements.txt          # Dependencies
├── .env.example             # Environment template
├── .env                     # Your settings (gitignored)
├── uibuilder_backend/       # Project settings
│   ├── settings.py          # Django config
│   ├── urls.py              # Root URLs
│   ├── wsgi.py              # WSGI config
│   └── asgi.py              # ASGI config
└── api/                     # Main app
    ├── models/              # Database models
    │   ├── user.py
    │   ├── project.py
    │   ├── ocr.py
    │   └── component.py
    ├── serializers/         # API serializers
    ├── views/               # API views
    ├── permissions/         # Custom permissions
    ├── services/            # Business logic
    │   ├── ocr_service.py
    │   └── export_service.py
    ├── urls.py              # API routes
    └── admin.py             # Admin config
```

## 🎯 Next Steps

1. ✅ Backend is running
2. 🔄 Start frontend: `cd ../v0-web-design-system-with-nanonets-ocr && npm run dev`
3. 🧪 Test API endpoints with Postman or curl
4. 📖 Read API documentation in README.md

## 📞 Support

If you encounter issues:

1. Check error messages in terminal
2. Verify .env configuration
3. Ensure PostgreSQL is running
4. Check Django logs
5. Read troubleshooting section above

Happy coding! 🚀
