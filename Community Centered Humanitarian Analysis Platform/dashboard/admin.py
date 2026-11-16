"""Admin → Countries shown on the dashboard: one tick box per country."""
from django.contrib import admin
from django.utils import timezone

from .models import CountryVisibility
from .visibility import NEVER_HIDDEN, sync_countries


@admin.register(CountryVisibility)
class CountryVisibilityAdmin(admin.ModelAdmin):
    list_display = ("name", "iso3", "shown", "changed_at", "changed_by")
    list_editable = ("shown",)
    list_display_links = None
    readonly_fields = ("name", "iso3", "changed_at", "changed_by")
    actions = None

    def has_add_permission(self, request):
        return False  # countries are detected from the boundaries, never typed

    def has_delete_permission(self, request, obj=None):
        return False  # hiding is the tick box; a row is never removed

    def changelist_view(self, request, extra_context=None):
        sync_countries()
        extra_context = {**(extra_context or {}), "subtitle": (
            "Switching a country off hides it from the dashboard and its public API "
            "at the next page load. Nothing is deleted; switch it back on to restore it. "
            "Sudan always stays on.")}
        return super().changelist_view(request, extra_context)

    def save_model(self, request, obj, form, change):
        if obj.iso3 in NEVER_HIDDEN:
            obj.shown = True  # Sudan is what the dashboard is about
        if "shown" in form.changed_data:
            obj.changed_at = timezone.now()
            obj.changed_by = request.user.get_username()
        super().save_model(request, obj, form, change)
