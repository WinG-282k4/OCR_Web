# 🔄 Database Migration Guide

## Overview

Các thay đổi model yêu cầu database migrations. Guide này sẽ giúp bạn migrate an toàn.

---

## 🚨 Breaking Changes Summary

### Screen Model

```python
# BEFORE
canvas_width = IntegerField(default=1200)
canvas_height = IntegerField(default=800)
components = JSONField(default=dict)  # {"comp-id": {...}}

# AFTER
width = IntegerField(default=1920)
height = IntegerField(default=1080)
components = JSONField(default=list)  # [{id: "comp-id", ...}]
```

### OCRAnalysis Model

```python
# BEFORE
image_file = ImageField(...)
image_name = CharField(...)
STATUS_CHOICES = [('PROCESSING', ...), ('SUCCESS', ...), ('FAILED', ...)]

# AFTER
image = ImageField(...)
original_filename = CharField(...)
STATUS_CHOICES = [('pending', ...), ('processing', ...), ('completed', ...), ('failed', ...)]
```

---

## 🛠️ Migration Steps

### Step 1: Backup Database (IMPORTANT!)

```bash
# Start services first
docker-compose up -d

# Wait for database
Start-Sleep -Seconds 15

# Backup PostgreSQL database
docker-compose exec -T db pg_dump -U postgres uibuilder_db > backup_before_migration.sql

# Or copy entire data volume
docker-compose run --rm -v backend_db_data:/source -v $(pwd):/backup alpine tar czf /backup/db_backup.tar.gz -C /source .
```

### Step 2: Stop Running Containers

```bash
docker-compose down
```

### Step 3: Create Migrations

```bash
docker-compose run --rm backend python manage.py makemigrations
```

Expected output:

```
Migrations for 'api':
  api/migrations/0002_auto_YYYYMMDD_HHMM.py
    - Rename field canvas_width to width on screen
    - Rename field canvas_height to height on screen
    - Rename field image_file to image on ocranalysis
    - Rename field image_name to original_filename on ocranalysis
    - Alter field status on ocranalysis
    - Alter field components on screen
    - Add field is_system to componenttemplate
    - Add field created_by to componenttemplate
    - Add field is_public to componenttemplate
    - Add field tags to componenttemplate
```

### Step 4: Review Migration File

```bash
# Check generated migration
cat Backend/api/migrations/0002_auto_*.py
```

### Step 5: Create Data Migration for Components Structure

Vì components thay đổi từ dict → list, cần migrate data:

```bash
docker-compose run --rm backend python manage.py makemigrations --empty api
```

Edit the new migration file:

```python
# api/migrations/0003_migrate_components_data.py
from django.db import migrations

def convert_components_dict_to_list(apps, schema_editor):
    """Convert components from dict to list format"""
    Screen = apps.get_model('api', 'Screen')

    for screen in Screen.objects.all():
        if screen.components and isinstance(screen.components, dict):
            # Convert dict {"comp-id": {...}} to list [{id: "comp-id", ...}]
            components_list = []
            for comp_id, comp_data in screen.components.items():
                if isinstance(comp_data, dict):
                    comp_data['id'] = comp_id  # Ensure id is set
                    components_list.append(comp_data)

            screen.components = components_list
            screen.save(update_fields=['components'])

def reverse_components_list_to_dict(apps, schema_editor):
    """Reverse: Convert components from list back to dict"""
    Screen = apps.get_model('api', 'Screen')

    for screen in Screen.objects.all():
        if screen.components and isinstance(screen.components, list):
            components_dict = {}
            for comp in screen.components:
                if isinstance(comp, dict) and 'id' in comp:
                    comp_id = comp['id']
                    components_dict[comp_id] = comp

            screen.components = components_dict
            screen.save(update_fields=['components'])

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0002_auto_YYYYMMDD_HHMM'),
    ]

    operations = [
        migrations.RunPython(
            convert_components_dict_to_list,
            reverse_components_list_to_dict
        ),
    ]
```

### Step 6: Run Migrations

```bash
# Dry run first (check for issues)
docker-compose run --rm backend python manage.py migrate --plan

# Actually migrate
docker-compose run --rm backend python manage.py migrate
```

### Step 7: Verify Data

```bash
# Start Django shell
docker-compose run --rm backend python manage.py shell

# Check Screen data
from api.models import Screen
screen = Screen.objects.first()
print(f"Width: {screen.width}")  # Should work
print(f"Components type: {type(screen.components)}")  # Should be list
print(f"Components: {screen.components}")

# Check OCR data
from api.models import OCRAnalysis
ocr = OCRAnalysis.objects.first()
print(f"Image: {ocr.image}")  # Should work
print(f"Filename: {ocr.original_filename}")
print(f"Status: {ocr.status}")
```

### Step 8: Start Services

```bash
docker-compose up -d
```

### Step 9: Test Critical Endpoints

```bash
# Test health check
curl http://localhost:8000/api/health/

# Test screen creation
curl -X POST http://localhost:8000/api/projects/{project_id}/screens/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Screen",
    "width": 1920,
    "height": 1080,
    "components": [
      {
        "id": "comp-1",
        "type": "button",
        "position": {"x": 100, "y": 100},
        "size": {"width": 120, "height": 40},
        "properties": {"text": "Click Me"}
      }
    ]
  }'

# Test OCR upload
curl -X POST http://localhost:8000/api/projects/{project_id}/ocr/upload/ \
  -H "Authorization: Bearer {token}" \
  -F "image=@test.png"
```

---

## 🔙 Rollback Plan

### If Migration Fails:

1. **Stop services**

```bash
docker-compose down
```

2. **Restore database backup**

```bash
# Restore from SQL dump
cat backup_before_migration.sql | docker-compose exec -T db psql -U uibuilder_user uibuilder_db

# Or restore from tar.gz
docker-compose run --rm -v backend_db_data:/target -v $(pwd):/backup alpine tar xzf /backup/db_backup.tar.gz -C /target
```

3. **Revert code changes**

```bash
git checkout HEAD~1  # Or specific commit before changes
```

4. **Restart services**

```bash
docker-compose up -d
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Field components cannot be converted from dict to list"

**Solution:** Run the data migration first (Step 5)

### Issue 2: "OCRAnalysis.image_file does not exist"

**Solution:** Check migration order - field rename should happen before data access

### Issue 3: "Invalid status value 'PROCESSING'"

**Solution:** Update any existing OCR records:

```python
OCRAnalysis.objects.filter(status='PROCESSING').update(status='processing')
OCRAnalysis.objects.filter(status='SUCCESS').update(status='completed')
OCRAnalysis.objects.filter(status='FAILED').update(status='failed')
```

### Issue 4: Migration conflicts

**Solution:**

```bash
# Delete migration files (if safe)
rm Backend/api/migrations/0002_*.py

# Recreate from scratch
docker-compose run --rm backend python manage.py makemigrations
```

---

## 📊 Migration Checklist

- [ ] Database backup created
- [ ] Services stopped
- [ ] Migrations generated (`makemigrations`)
- [ ] Migration files reviewed
- [ ] Data migration created for components
- [ ] Migrations applied (`migrate`)
- [ ] Data verified in Django shell
- [ ] Services restarted
- [ ] Endpoints tested
- [ ] Backup can be deleted (after confirming everything works)

---

## 🎯 Post-Migration Tasks

1. **Update API documentation** if field names appear in docs
2. **Notify frontend team** about field name changes (if they use raw API)
3. **Monitor logs** for any migration-related errors
4. **Test all CRUD operations** on Screen and OCR models
5. **Seed component templates** (optional, see COMPREHENSIVE_FIX_SUMMARY.md)

---

## 💡 Tips

- **Test in development first** before migrating production
- **Keep backups** for at least a week after migration
- **Monitor error logs** closely after migration
- **Document any custom migrations** made during process

---

Generated: March 2, 2026
Status: ✅ Ready to execute
