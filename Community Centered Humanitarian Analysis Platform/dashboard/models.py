"""Which countries the public dashboard may show.

ONE ROW PER COUNTRY, AND A PERSON IS THE ONLY WRITER OF `shown`. The rows are
detected from the country boundaries (visibility.sync_countries) so nobody types
a name, but no pipeline step, loader or rebuild ever changes `shown`: a country
switched off stays off through every data refresh until someone switches it back
on in Admin. Switching off hides; it never deletes. See
docs/superpowers/specs/2026-11-16-country-visibility-switch-design.md.
"""
from django.db import models


class CountryVisibility(models.Model):
    iso3 = models.CharField(max_length=3, unique=True)
    name = models.TextField()
    shown = models.BooleanField(
        default=True,
        help_text="Untick to hide this country from the dashboard and its public API.")
    changed_at = models.DateTimeField(null=True, blank=True)
    changed_by = models.TextField(blank=True, default="")

    class Meta:
        db_table = "country_visibility"
        ordering = ["name"]
        verbose_name = "country shown on the dashboard"
        verbose_name_plural = "Countries shown on the dashboard"

    def __str__(self):
        return f"{self.name} ({self.iso3}): {'shown' if self.shown else 'hidden'}"
