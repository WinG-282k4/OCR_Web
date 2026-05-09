"""
Management command to backfill screen versions for existing screens
Creates initial version (v1) for screens that don't have any versions
"""

from django.core.management.base import BaseCommand
from api.models import Screen, ScreenVersion


class Command(BaseCommand):
    help = 'Create initial versions for screens that have no versions'

    def handle(self, *args, **options):
        """Execute the command"""
        
        self.stdout.write(self.style.WARNING('🔍 Checking screens without versions...'))
        
        # Find screens without versions
        screens_without_versions = []
        for screen in Screen.objects.all():
            if not screen.versions.exists():
                screens_without_versions.append(screen)
        
        if not screens_without_versions:
            self.stdout.write(self.style.SUCCESS('✅ All screens already have versions!'))
            return
        
        self.stdout.write(
            self.style.WARNING(
                f'📝 Found {len(screens_without_versions)} screens without versions'
            )
        )
        
        # Create initial versions
        created_count = 0
        for screen in screens_without_versions:
            try:
                ScreenVersion.objects.create(
                    screen=screen,
                    version_number=1,
                    components=screen.components,
                    description="Initial version (backfilled)",
                    created_by=screen.project.owner
                )
                created_count += 1
                self.stdout.write(f'  ✓ Created v1 for screen: {screen.name}')
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Failed for screen {screen.name}: {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Successfully created {created_count} initial versions!'
            )
        )
