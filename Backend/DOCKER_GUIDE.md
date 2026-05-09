# 🐳 Docker Setup Guide

## Quick Start (Chỉ 2 lệnh!)

```bash
# 1. Build và start containers
docker-compose up --build

# 2. Tạo superuser (terminal mới)
docker-compose exec backend python manage.py createsuperuser
```

✅ **Backend:** http://localhost:8000
✅ **Database:** PostgreSQL tự động chạy trong container

---

## 📦 Chi Tiết

### Containers

**docker-compose.yml** tạo 2 containers:

1. **uibuilder_db** - PostgreSQL 16
   - Port: 5432
   - Database: `uibuilder_db`
   - User: `postgres`
   - Password: `postgres123`

2. **uibuilder_backend** - Django API
   - Port: 8000
   - Tự động chạy migrations
   - Hot reload (code changes tự động reload)

### Volumes

Data được lưu trong Docker volumes (không mất khi restart):

- `postgres_data` - Database data
- `media_data` - Uploaded images
- `static_data` - Static files

---

## 🚀 Commands

### Start Services

```bash
# Start tất cả (foreground)
docker-compose up

# Start background
docker-compose up -d

# Build lại và start
docker-compose up --build

# Chỉ start backend
docker-compose up backend
```

### Stop Services

```bash
# Stop containers
docker-compose stop

# Stop và xóa containers
docker-compose down

# Stop và xóa CẢ data (⚠️ xóa database)
docker-compose down -v
```

### View Logs

```bash
# Xem tất cả logs
docker-compose logs

# Xem logs backend
docker-compose logs backend

# Xem logs database
docker-compose logs db

# Follow logs (real-time)
docker-compose logs -f backend
```

### Django Commands

```bash
# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Run migrations
docker-compose exec backend python manage.py migrate

# Create migrations
docker-compose exec backend python manage.py makemigrations

# Django shell
docker-compose exec backend python manage.py shell

# Collect static files
docker-compose exec backend python manage.py collectstatic
```

### Database Commands

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d uibuilder_db

# Backup database
docker-compose exec db pg_dump -U postgres uibuilder_db > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T db psql -U postgres uibuilder_db
```

---

## 🧪 Testing

### 1. Kiểm tra containers đang chạy

```bash
docker-compose ps
```

Output:

```
NAME                   STATUS          PORTS
uibuilder_backend      Up 2 minutes    0.0.0.0:8000->8000/tcp
uibuilder_db           Up 2 minutes    0.0.0.0:5432->5432/tcp
```

### 2. Test API

```bash
# Health check
curl http://localhost:8000/api/

# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!",
    "password_confirm": "Test123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 3. Access Admin Panel

```bash
# Create superuser first
docker-compose exec backend python manage.py createsuperuser

# Then visit: http://localhost:8000/admin/
```

---

## 🔧 Development Workflow

### Code Changes

Code changes tự động reload (không cần restart):

```bash
# Sửa file .py
# Save
# Backend tự động reload! ✨
```

### Database Changes

```bash
# 1. Sửa models in api/models/
# 2. Create migrations
docker-compose exec backend python manage.py makemigrations

# 3. Apply migrations
docker-compose exec backend python manage.py migrate
```

### Reset Database

```bash
# Stop và xóa database volume
docker-compose down -v

# Start lại (database mới)
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

---

## 🐛 Troubleshooting

### Issue: Port 8000 already in use

```bash
# Stop container đang dùng port
docker-compose down

# Hoặc kill process
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux
lsof -ti:8000 | xargs kill
```

### Issue: Database connection refused

```bash
# Check db container health
docker-compose ps

# View db logs
docker-compose logs db

# Restart db
docker-compose restart db
```

### Issue: Import errors / Module not found

```bash
# Rebuild image
docker-compose build --no-cache backend

# Restart
docker-compose up -d backend
```

### Issue: Permission denied

```bash
# Fix permissions (Linux/Mac)
sudo chown -R $USER:$USER .

# Windows: Run Docker Desktop as Administrator
```

---

## 📊 Monitoring

### Container Stats

```bash
# View resource usage
docker stats

# View backend stats only
docker stats uibuilder_backend
```

### Database Size

```bash
docker-compose exec db psql -U postgres -d uibuilder_db -c "
  SELECT pg_size_pretty(pg_database_size('uibuilder_db'));
"
```

### Disk Usage

```bash
# Docker disk usage
docker system df

# Clean up unused data
docker system prune -a
```

---

## 🚢 Production Deployment

### Environment Variables

Tạo file `.env.production`:

```env
DEBUG=False
SECRET_KEY=your-strong-random-secret-key-here
DJANGO_SETTINGS_MODULE=uibuilder_backend.settings
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

DATABASE_NAME=uibuilder_db
DATABASE_USER=postgres
DATABASE_PASSWORD=strong-password-here
DATABASE_HOST=db
DATABASE_PORT=5432

NANONETS_API_KEY=your-api-key
```

### Production docker-compose

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    build: .
    command: gunicorn uibuilder_backend.wsgi:application --bind 0.0.0.0:8000 --workers 4
    env_file:
      - .env.production
    volumes:
      - media_data:/app/media
      - static_data:/app/staticfiles
    ports:
      - "8000:8000"
    depends_on:
      - db
    restart: always

volumes:
  postgres_data:
  media_data:
  static_data:
```

Run:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📖 References

- **Dockerfile** - Image definition
- **docker-compose.yml** - Services orchestration
- **.dockerignore** - Build optimization
- **Backend code** - Volume mounted for hot reload

---

## 🎯 Summary

✅ **1 lệnh setup:** `docker-compose up --build`
✅ **PostgreSQL tự động:** Không cần cài manual
✅ **Hot reload:** Code changes tự động apply
✅ **Data persistence:** Volumes lưu database
✅ **Easy cleanup:** `docker-compose down -v`

Happy Dockerizing! 🐳
