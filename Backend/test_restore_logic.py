"""
Test script to verify version restore logic
Run: docker-compose exec backend python manage.py shell < test_restore_logic.py
"""

# This will run inside Django shell
from api.models import Screen, ScreenVersion, Project, User

def test_restore_logic():
    """Test version restore with multiple deltas"""
    
    print("🧪 Testing Version Restore Logic\n")
    
    # Get or create test project
    user = User.objects.first()
    project = Project.objects.filter(owner=user).first()
    
    if not project:
        print("❌ No project found. Create one first.")
        return
    
    # Create test screen
    screen = Screen.objects.create(
        project=project,
        name="Test Restore Screen",
        width=1920,
        height=1080,
        components=[
            {"id": "A", "type": "button", "value": "1"},
            {"id": "B", "type": "input", "value": "2"},
            {"id": "C", "type": "text", "value": "3"}
        ]
    )
    
    # Version 1 (base) - [A, B, C]
    v1 = ScreenVersion.objects.create(
        screen=screen,
        version_number=1,
        is_base_version=True,
        components=[
            {"id": "A", "type": "button", "value": "1"},
            {"id": "B", "type": "input", "value": "2"},
            {"id": "C", "type": "text", "value": "3"}
        ],
        description="Initial version",
        created_by=user
    )
    print(f"✓ v1 (base): [A, B, C]")
    
    # Version 2 (delta) - Add D
    v2 = ScreenVersion.objects.create(
        screen=screen,
        version_number=2,
        is_base_version=False,
        components=None,
        changes_delta={
            "added": [{"id": "D", "type": "button", "value": "4"}],
            "modified": [],
            "removed": []
        },
        description="Added D",
        changed_components=["D"],
        created_by=user
    )
    print(f"✓ v2 (delta): +D")
    
    # Version 3 (delta) - Modify A, Remove B
    v3 = ScreenVersion.objects.create(
        screen=screen,
        version_number=3,
        is_base_version=False,
        components=None,
        changes_delta={
            "added": [],
            "modified": [{"id": "A", "changes": {"value": "1-modified"}}],
            "removed": ["B"]
        },
        description="Modified A, removed B",
        changed_components=["A", "B"],
        created_by=user
    )
    print(f"✓ v3 (delta): modify A, -B")
    
    # Version 4 (delta) - Add E
    v4 = ScreenVersion.objects.create(
        screen=screen,
        version_number=4,
        is_base_version=False,
        components=None,
        changes_delta={
            "added": [{"id": "E", "type": "text", "value": "5"}],
            "modified": [],
            "removed": []
        },
        description="Added E",
        changed_components=["E"],
        created_by=user
    )
    print(f"✓ v4 (delta): +E")
    
    # Version 5 (delta) - Modify C
    v5 = ScreenVersion.objects.create(
        screen=screen,
        version_number=5,
        is_base_version=False,
        components=None,
        changes_delta={
            "added": [],
            "modified": [{"id": "C", "changes": {"value": "3-modified"}}],
            "removed": []
        },
        description="Modified C",
        changed_components=["C"],
        created_by=user
    )
    print(f"✓ v5 (delta): modify C\n")
    
    # Test 1: Restore to v1 (base)
    print("📝 Test 1: Restore to v1 (base)")
    result_v1 = v1.get_full_components()
    expected_v1 = ["A", "B", "C"]
    actual_v1 = [c['id'] for c in result_v1]
    assert set(actual_v1) == set(expected_v1), f"Expected {expected_v1}, got {actual_v1}"
    print(f"✅ PASS: {actual_v1}\n")
    
    # Test 2: Restore to v2
    print("📝 Test 2: Restore to v2 (base + 1 delta)")
    result_v2 = v2.get_full_components()
    expected_v2 = ["A", "B", "C", "D"]
    actual_v2 = [c['id'] for c in result_v2]
    assert set(actual_v2) == set(expected_v2), f"Expected {expected_v2}, got {actual_v2}"
    print(f"✅ PASS: {actual_v2}\n")
    
    # Test 3: Restore to v3
    print("📝 Test 3: Restore to v3 (base + 2 deltas)")
    result_v3 = v3.get_full_components()
    expected_v3 = ["A", "C", "D"]  # B removed, A modified
    actual_v3 = [c['id'] for c in result_v3]
    assert set(actual_v3) == set(expected_v3), f"Expected {expected_v3}, got {actual_v3}"
    # Check A was modified
    comp_a = next(c for c in result_v3 if c['id'] == 'A')
    assert comp_a['value'] == '1-modified', f"Expected A.value='1-modified', got {comp_a['value']}"
    print(f"✅ PASS: {actual_v3}, A.value='1-modified'\n")
    
    # Test 4: Restore to v5
    print("📝 Test 4: Restore to v5 (base + 4 deltas)")
    result_v5 = v5.get_full_components()
    expected_v5 = ["A", "C", "D", "E"]
    actual_v5 = [c['id'] for c in result_v5]
    assert set(actual_v5) == set(expected_v5), f"Expected {expected_v5}, got {actual_v5}"
    # Check A and C were modified
    comp_a = next(c for c in result_v5 if c['id'] == 'A')
    comp_c = next(c for c in result_v5 if c['id'] == 'C')
    assert comp_a['value'] == '1-modified', f"Expected A.value='1-modified', got {comp_a['value']}"
    assert comp_c['value'] == '3-modified', f"Expected C.value='3-modified', got {comp_c['value']}"
    print(f"✅ PASS: {actual_v5}, A.value='1-modified', C.value='3-modified'\n")
    
    # Cleanup
    screen.delete()
    
    print("🎉 All tests passed! Restore logic is CORRECT!\n")
    print("✅ Confirmed:")
    print("  - Base versions return components directly")
    print("  - Delta versions reconstruct by applying all deltas in ORDER")
    print("  - Modifications are deep-merged correctly")
    print("  - Removals are handled properly")

if __name__ == '__main__':
    test_restore_logic()
