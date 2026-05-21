"""
Script: reset_db_clean.py
Muc dich:
  - Xoa tat ca project, screen, OCRAnalysis trong DB
  - Tao lai 1 project duy nhat cho demo@example.com
  - Tao 1 screen duy nhat gan voi image_01.jpg (thumbnail) va html_01.html (noi dung)
  - OCRAnalysis tuong ung voi image_01.jpg

Chay: python reset_db_clean.py
"""

import os
import sys
import uuid
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uibuilder_backend.settings")
django.setup()

from django.conf import settings
from api.models import Project, Screen, ScreenVersion, OCRAnalysis

MEDIA_ROOT = settings.MEDIA_ROOT
OCR_IMAGE_REL  = "ocr_uploads/image_01.jpg"   # relative path moi (gon gan)
HTML_FILE_PATH = MEDIA_ROOT / "html" / "html_01.html"  # tuong lai sau khi don dep

# ── Doc noi dung html_01 ─────────────────────────────────────────────────────

def read_html_01():
    # Thu cac vi tri co the
    candidates = [
        MEDIA_ROOT / "html" / "html_01.html",
    ]
    # Tim trong thu muc con (project_id)
    html_dir = MEDIA_ROOT / "html"
    if html_dir.exists():
        for sub in html_dir.iterdir():
            if sub.is_dir():
                candidates.append(sub / "html_01.html")

    for path in candidates:
        if path.exists():
            print(f"  [HTML] Doc tu: {path}")
            return path.read_text(encoding="utf-8")

    print("  [WARN] Khong tim thay html_01.html, dung noi dung mac dinh.")
    return """<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><title>Fashion Brand</title>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
<div class="flex flex-col items-center justify-center h-screen">
  <h1 class="text-4xl font-bold text-center text-gray-800">Fashion Brand</h1>
</div>
</body></html>"""

# ── Kiem tra anh OCR ton tai ─────────────────────────────────────────────────

def find_ocr_image():
    candidates = []
    ocr_dir = MEDIA_ROOT / "ocr_uploads"
    if ocr_dir.exists():
        for sub in ocr_dir.iterdir():
            if sub.is_dir():
                for f in sub.iterdir():
                    if f.name in ("image_01.jpg", "image.jpg"):
                        candidates.append(f)
            elif sub.name in ("image_01.jpg", "image.jpg"):
                candidates.append(sub)

    if not candidates:
        print("  [WARN] Khong tim thay image_01.jpg trong ocr_uploads/")
        return None

    # Uu tien image_01.jpg
    for c in candidates:
        if c.name == "image_01.jpg":
            return c
    return candidates[0]

# ── Don dep DB ───────────────────────────────────────────────────────────────

def cleanup_db():
    deleted_ocr   = OCRAnalysis.objects.all().delete()
    deleted_ver   = ScreenVersion.objects.all().delete()
    deleted_scr   = Screen.objects.all().delete()
    deleted_proj  = Project.objects.all().delete()
    print(f"  [DEL] OCRAnalysis: {deleted_ocr[0]}")
    print(f"  [DEL] ScreenVersion: {deleted_ver[0]}")
    print(f"  [DEL] Screen: {deleted_scr[0]}")
    print(f"  [DEL] Project: {deleted_proj[0]}")

# ── Tao lai du lieu ──────────────────────────────────────────────────────────

def rebuild(user):
    from pathlib import Path
    import shutil

    # 1. Tim / di chuyen anh OCR ve vi tri gon gang
    ocr_img_path = find_ocr_image()
    new_ocr_dir  = MEDIA_ROOT / "ocr_uploads"
    new_ocr_dir.mkdir(parents=True, exist_ok=True)
    new_ocr_abs  = new_ocr_dir / "image_01.jpg"

    if ocr_img_path and ocr_img_path != new_ocr_abs:
        shutil.copy2(str(ocr_img_path), str(new_ocr_abs))
        print(f"  [COPY] {ocr_img_path.name} -> ocr_uploads/image_01.jpg")
    elif not ocr_img_path:
        print("  [WARN] Khong co anh OCR. Thumbnail se de trong.")

    ocr_rel = "ocr_uploads/image_01.jpg" if new_ocr_abs.exists() else ""

    # 2. Doc noi dung HTML
    html_content = read_html_01()

    # Parse HTML de lay components (don gian: 1 component chua toan bo HTML)
    # Trong tuong lai se dung Nanonets de phan tich
    components = [
        {
            "id": str(uuid.uuid4()),
            "type": "container",
            "label": "Fashion Brand Page",
            "position": {"x": 0, "y": 0},
            "size": {"width": 1440, "height": 900},
            "properties": {
                "html_content": html_content,
                "text": "Fashion Brand"
            },
            "style": {"backgroundColor": "#f3f4f6"}
        }
    ]

    # 3. Tao Project
    project = Project.objects.create(
        owner=user,
        name="Fashion Brand Website",
        description="Giao dien web Fashion Brand, nhan dien tu OCR image_01.jpg",
        tags=["fashion", "ocr", "demo"],
        theme={"primaryColor": "#6b7280"}
    )
    print(f"  [OK]  Tao project: [{project.id}] {project.name}")

    # Di chuyen file media vao thu muc theo project_id (cau truc chuan)
    proj_ocr_dir = MEDIA_ROOT / "ocr_uploads" / str(project.id)
    proj_ocr_dir.mkdir(parents=True, exist_ok=True)
    proj_ocr_abs = proj_ocr_dir / "image_01.jpg"

    if new_ocr_abs.exists() and not proj_ocr_abs.exists():
        shutil.copy2(str(new_ocr_abs), str(proj_ocr_abs))
        print(f"  [COPY] -> ocr_uploads/{project.id}/image_01.jpg")

    proj_ocr_rel = f"ocr_uploads/{project.id}/image_01.jpg" if proj_ocr_abs.exists() else ""

    # Di chuyen html_01 vao thu muc project
    proj_html_dir = MEDIA_ROOT / "html" / str(project.id)
    proj_html_dir.mkdir(parents=True, exist_ok=True)
    new_html_path = proj_html_dir / "html_01.html"
    old_html = find_html_01()
    if old_html and not new_html_path.exists():
        shutil.copy2(str(old_html), str(new_html_path))
        print(f"  [COPY] -> html/{project.id}/html_01.html")
    elif not old_html:
        new_html_path.write_text(html_content, encoding="utf-8")
        print(f"  [WRITE] html/{project.id}/html_01.html (mac dinh)")

    # 4. Tao OCRAnalysis
    ocr = OCRAnalysis(
        project=project,
        original_filename="image_01.jpg",
        confidence_threshold=0.7,
        status="completed",
        detected_components={
            "raw_response": {},
            "normalized_components": components
        },
    )
    if proj_ocr_rel:
        ocr.image.name = proj_ocr_rel
    ocr.save()
    print(f"  [OK]  Tao OCRAnalysis: {ocr.id}")

    # 5. Tao Screen duy nhat - thumbnail = anh OCR
    screen = Screen(
        project=project,
        name="image_01",
        description="Screen nhan dien tu OCR (image_01.jpg). HTML xuat tu html_01.html.",
        screen_type="page",
        order=1,
        width=1440,
        height=900,
        background_color="#f3f4f6",
        components=components,
        created_from_ocr=True,
        ocr_analysis=ocr,
    )
    # Dat thumbnail = anh OCR
    if proj_ocr_rel:
        screen.thumbnail.name = proj_ocr_rel
    screen.save()
    print(f"  [OK]  Tao Screen: [{screen.id}] {screen.name}")

    # 6. Tao ScreenVersion v1
    ScreenVersion.objects.create(
        screen=screen,
        version_number=1,
        is_base_version=True,
        components=components,
        change_type="OCR_IMPORT",
        description="Phien ban dau tien, nhan dien tu OCR image_01.jpg",
        created_by=user
    )
    print(f"  [OK]  Tao ScreenVersion v1")

    return project, screen


def find_html_01():
    html_dir = MEDIA_ROOT / "html"
    if not html_dir.exists():
        return None
    for item in html_dir.rglob("html_01.html"):
        return item
    return None


# ── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  UIBuilder -- Reset DB: 1 Project / 1 Screen")
    print("=" * 60)

    from api.models import User
    try:
        user = User.objects.get(email="demo@example.com")
        print(f"[OK] User: {user.email}")
    except User.DoesNotExist:
        print("[ERROR] Khong tim thay demo@example.com. Hay chay seed_data.py truoc.")
        sys.exit(1)

    print("\n[1] Don dep DB hien tai...")
    cleanup_db()

    print("\n[2] Tao lai du lieu sach...")
    project, screen = rebuild(user)

    print("\n" + "=" * 60)
    print("Ket qua:")
    print(f"  Project : [{project.id}] {project.name}")
    print(f"  Screen  : [{screen.id}] {screen.name}")
    print(f"  Thumbnail: {screen.thumbnail}")
    print(f"  OCR image: {screen.ocr_analysis.image.name if screen.ocr_analysis else 'N/A'}")
    print("\nCau truc media:")
    print(f"  media/ocr_uploads/{project.id}/image_01.jpg")
    print(f"  media/html/{project.id}/html_01.html")
    print("\n[DONE] Hoan tat!")
