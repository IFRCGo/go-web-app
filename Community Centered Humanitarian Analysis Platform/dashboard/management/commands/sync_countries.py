"""Detect countries from the loaded boundaries. Never changes a show/hide choice."""
from django.core.management.base import BaseCommand

from dashboard.visibility import sync_countries


class Command(BaseCommand):
    help = "Add any country in the boundaries to the dashboard visibility list."

    def handle(self, *args, **options):
        self.stdout.write(f"{sync_countries()} countries added")
