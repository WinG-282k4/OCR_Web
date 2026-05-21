"""
Script: attach_media_to_project.py
Muc dich:
  1. Tim user demo@example.com va project "E-commerce App Design" trong DB
  2. Di chuyen file OCR + HTML hien co sang duong dan gon gang hon
  3. Tao ban ghi OCRAnalysis trong DB gan file image_01.jpg vao project do
  4. Don dep thu muc cu neu rong

Chay: python attach_media_to_project.py
"""

import os
import sys
import shutil
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uibuilder_backend.settings")
django.setup()

from django.conf import settings
from api.models import Project, OCRAnalysis

MEDIA_ROOT = settings.MEDIA_ROOT

# --- 1. Lay project tu DB ---------------------------------------------------

def get_target_project():
    from api.models import User
    try:
        user = User.objects.get(email="demo@example.com")
    except User.DoesNotExist:
        print("[ERROR] Khong tim thay user demo@example.com. Hay chay seed_data.py truoc.")
        sys.exit(1)

    project = Project.objects.filter(owner=user).order_by("created_at").first()
    if not project:
        print("[ERROR] User chua co project nao. Hay chay seed_data.py truoc.")
        sys.exit(1)

    print(f"[OK] Tim thay user: {user.email}")
    print(f"[OK] Gan vao project: [{project.id}] {project.name}")
    return user, project


# --- 2. Di chuyen file OCR --------------------------------------------------

def migrate_ocr_files(project):
    old_dir = MEDIA_ROOT / "ocr_uploads" / "2026" / "05" / "09"
    new_dir = MEDIA_ROOT / "ocr_uploads" / str(project.id)
    new_dir.mkdir(parents=True, exist_ok=True)

    for fname in ["image.jpg", "image_01.jpg"]:
        old_path = old_dir / fname
        new_path = new_dir / fname
        if old_path.exists():
            if new_path.exists():
                print(f"  [SKIP] {fname} da ton tai o dich.")
            else:
                shutil.move(str(old_path), str(new_path))
                print(f"  [MOVED] {fname} -> ocr_uploads/{project.id}/{fname}")
        else:
            print(f"  [WARN] Khong tim thay: {old_path}")

    # Xoa thu muc cu neu rong
    for d in [old_dir, old_dir.parent, old_dir.parent.parent, old_dir.parent.parent.parent]:
        try:
            if d.exists() and not any(d.iterdir()):
                d.rmdir()
                print(f"  [DEL]  Thu muc rong da xoa: {d.name}")
        except Exception:
            pass

    return new_dir


# --- 3. Di chuyen file HTML -------------------------------------------------

def migrate_html_file(project):
    old_path = MEDIA_ROOT / "html" / "html_01.html"
    new_dir  = MEDIA_ROOT / "html" / str(project.id)
    new_dir.mkdir(parents=True, exist_ok=True)
    new_path = new_dir / "html_01.html"

    if old_path.exists():
        if new_path.exists():
            print(f"  [SKIP] html_01.html da ton tai o dich.")
        else:
            shutil.move(str(old_path), str(new_path))
            print(f"  [MOVED] html_01.html -> html/{project.id}/html_01.html")
    else:
        print(f"  [WARN] Khong tim thay: {old_path}")


# --- 4. Tao ban ghi OCRAnalysis trong DB ------------------------------------

def create_ocr_record(project):
    image_rel = f"ocr_uploads/{project.id}/image_01.jpg"
    abs_path  = MEDIA_ROOT / "ocr_uploads" / str(project.id) / "image_01.jpg"

    if not abs_path.exists():
        print(f"  [WARN] File {abs_path} khong ton tai, bo qua tao OCRAnalysis.")
        return None

    existing = OCRAnalysis.objects.filter(
        project=project,
        original_filename="image_01.jpg"
    ).first()

    if existing:
        print(f"  [SKIP] OCRAnalysis cho image_01.jpg da ton tai (id={existing.id}).")
        return existing

    ocr = OCRAnalysis(
        project=project,
        original_filename="image_01.jpg",
        confidence_threshold=0.7,
        status="completed",
        detected_components={
            "raw_response": {},
            "normalized_components": []
        },
    )
    ocr.image.name = image_rel
    ocr.save()
    print(f"  [OK]  Tao OCRAnalysis: id={ocr.id}")
    return ocr


# --- 5. In tom tat ----------------------------------------------------------

def print_summary(project):
    pid = str(project.id)
    print("\nCau truc media sau khi chinh sua:")
    print("  media/")
    print("  +-- ocr_uploads/")
    print(f"  |   +-- {pid}/")
    print("  |       +-- image.jpg")
    print("  |       +-- image_01.jpg")
    print("  +-- html/")
    print(f"      +-- {pid}/")
    print("          +-- html_01.html")


# --- Main -------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 60)
    print("  UIBuilder -- Attach Media to Project")
    print("=" * 60)

    user, project = get_target_project()

    print("\n[OCR Images]")
    migrate_ocr_files(project)

    print("\n[HTML Export]")
    migrate_html_file(project)

    print("\n[DB Record]")
    create_ocr_record(project)

    print_summary(project)
    print("\n[DONE] Hoan tat!")
