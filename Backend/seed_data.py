import os
import sys
import django
import uuid

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uibuilder_backend.settings")
django.setup()

from api.models import User, Project, Screen

def create_mock_data():
    print("Seeding database with mock data...")
    
    # 1. Ensure user exists
    user_email = "demo@example.com"
    user_pass = "P@ssw0rd2026!"
    user, created = User.objects.get_or_create(
        email=user_email,
        defaults={
            "first_name": "Demo",
            "last_name": "User",
        }
    )
    if created:
        user.set_password(user_pass)
        user.save()
        print(f"Created user: {user_email}")
    else:
        print(f"User {user_email} already exists.")

    # 2. Create Project 1: E-commerce App
    proj1, created_p1 = Project.objects.get_or_create(
        name="E-commerce App Design",
        owner=user,
        defaults={
            "description": "A modern mobile-first e-commerce app mockup.",
            "tags": ["ecommerce", "mobile", "shop"],
            "theme": {"primary": "#3b82f6"}
        }
    )
    
    if created_p1:
        print(f"Created project: {proj1.name}")
        # Add screens to Project 1
        screen1_components = [
            {
                "id": str(uuid.uuid4()),
                "type": "container",
                "label": "Header Container",
                "position": {"x": 0, "y": 0},
                "size": {"width": 1440, "height": 80},
                "properties": {"backgroundColor": "#ffffff"},
                "style": {"boxShadow": "0 2px 4px rgba(0,0,0,0.1)"}
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "label": "Logo",
                "position": {"x": 40, "y": 25},
                "size": {"width": 200, "height": 30},
                "properties": {"text": "UIBuilder Store"},
                "style": {"fontSize": "24px", "fontWeight": "bold", "color": "#1e3a8a"}
            },
            {
                "id": str(uuid.uuid4()),
                "type": "button",
                "label": "Login Button",
                "position": {"x": 1280, "y": 20},
                "size": {"width": 120, "height": 40},
                "properties": {"text": "Sign In", "variant": "primary"},
                "style": {"borderRadius": "8px"}
            },
            {
                "id": str(uuid.uuid4()),
                "type": "image",
                "label": "Hero Image",
                "position": {"x": 100, "y": 150},
                "size": {"width": 1240, "height": 400},
                "properties": {"src": "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1240&auto=format&fit=crop"},
                "style": {"borderRadius": "16px", "objectFit": "cover"}
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "label": "Hero Title",
                "position": {"x": 150, "y": 250},
                "size": {"width": 500, "height": 80},
                "properties": {"text": "The Future of Web Design"},
                "style": {"fontSize": "48px", "fontWeight": "bold", "color": "#ffffff", "textShadow": "0 2px 4px rgba(0,0,0,0.5)"}
            }
        ]
        
        Screen.objects.create(
            project=proj1,
            name="Homepage",
            description="The main landing page of the store.",
            width=1440,
            height=900,
            background_color="#f8fafc",
            order=1,
            components=screen1_components
        )
        
        screen2_components = [
            {
                "id": str(uuid.uuid4()),
                "type": "container",
                "label": "Login Box",
                "position": {"x": 520, "y": 200},
                "size": {"width": 400, "height": 500},
                "properties": {"backgroundColor": "#ffffff"},
                "style": {"borderRadius": "12px", "boxShadow": "0 4px 6px rgba(0,0,0,0.1)"}
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "label": "Welcome Text",
                "position": {"x": 560, "y": 240},
                "size": {"width": 320, "height": 40},
                "properties": {"text": "Welcome Back"},
                "style": {"fontSize": "32px", "fontWeight": "bold", "textAlign": "center"}
            },
            {
                "id": str(uuid.uuid4()),
                "type": "input",
                "label": "Email Input",
                "position": {"x": 560, "y": 320},
                "size": {"width": 320, "height": 48},
                "properties": {"placeholder": "Enter your email", "type": "email"},
                "style": {"borderRadius": "8px", "border": "1px solid #e2e8f0", "padding": "0 16px"}
            },
            {
                "id": str(uuid.uuid4()),
                "type": "input",
                "label": "Password Input",
                "position": {"x": 560, "y": 390},
                "size": {"width": 320, "height": 48},
                "properties": {"placeholder": "Password", "type": "password"},
                "style": {"borderRadius": "8px", "border": "1px solid #e2e8f0", "padding": "0 16px"}
            },
            {
                "id": str(uuid.uuid4()),
                "type": "button",
                "label": "Submit Button",
                "position": {"x": 560, "y": 480},
                "size": {"width": 320, "height": 48},
                "properties": {"text": "Login", "variant": "primary"},
                "style": {"borderRadius": "8px", "fontSize": "16px", "fontWeight": "bold"}
            }
        ]
        
        Screen.objects.create(
            project=proj1,
            name="Login Page",
            width=1440,
            height=900,
            background_color="#e2e8f0",
            order=2,
            components=screen2_components
        )
    else:
        print(f"Project {proj1.name} already exists.")

    # 3. Create Project 2: Dashboard Admin
    proj2, created_p2 = Project.objects.get_or_create(
        name="SaaS Admin Dashboard",
        owner=user,
        defaults={
            "description": "Internal analytics and admin tool.",
            "tags": ["dashboard", "admin", "chart"]
        }
    )
    
    if created_p2:
        print(f"Created project: {proj2.name}")
        screen3_components = [
            {
                "id": str(uuid.uuid4()),
                "type": "container",
                "label": "Sidebar",
                "position": {"x": 0, "y": 0},
                "size": {"width": 260, "height": 1080},
                "properties": {"backgroundColor": "#1e293b"},
                "style": {}
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "label": "Brand",
                "position": {"x": 30, "y": 30},
                "size": {"width": 200, "height": 30},
                "properties": {"text": "SaaS Admin"},
                "style": {"fontSize": "24px", "fontWeight": "bold", "color": "#ffffff"}
            },
            {
                "id": str(uuid.uuid4()),
                "type": "container",
                "label": "Card 1",
                "position": {"x": 300, "y": 100},
                "size": {"width": 300, "height": 150},
                "properties": {"backgroundColor": "#ffffff"},
                "style": {"borderRadius": "12px", "boxShadow": "0 1px 3px rgba(0,0,0,0.1)"}
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "label": "Card 1 Title",
                "position": {"x": 320, "y": 120},
                "size": {"width": 200, "height": 20},
                "properties": {"text": "Total Users"},
                "style": {"fontSize": "16px", "color": "#64748b"}
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "label": "Card 1 Value",
                "position": {"x": 320, "y": 160},
                "size": {"width": 200, "height": 40},
                "properties": {"text": "12,345"},
                "style": {"fontSize": "36px", "fontWeight": "bold", "color": "#0f172a"}
            }
        ]
        
        Screen.objects.create(
            project=proj2,
            name="Analytics Overview",
            width=1920,
            height=1080,
            background_color="#f1f5f9",
            order=1,
            components=screen3_components
        )
    else:
        print(f"Project {proj2.name} already exists.")

    print("Successfully seeded database!")

if __name__ == "__main__":
    create_mock_data()
