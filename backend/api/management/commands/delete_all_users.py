from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Deletes all users from the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion of all users',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'WARNING: This will delete ALL users from the database.\n'
                    'To confirm, run: python manage.py delete_all_users --confirm'
                )
            )
            return

        user_count = User.objects.count()
        
        if user_count == 0:
            self.stdout.write(self.style.WARNING('No users found in the database.'))
            return

        # Delete all users
        User.objects.all().delete()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully deleted {user_count} user(s) from the database.'
            )
        )
