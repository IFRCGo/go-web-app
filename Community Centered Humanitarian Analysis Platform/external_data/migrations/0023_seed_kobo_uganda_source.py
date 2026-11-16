"""The source_sync row that makes the Uganda CCHA Pull now button appear.

A row plus a registered fetcher is all a button needs (see 0018). The HSP row
needs no seed: load_hsps has written kobo/humanitarian_service_points/
'hsp-mapping' since September, and the Kobo fetcher is keyed to that same row.
"""
from django.db import migrations

NOTE = ("Uganda CCHA primary data from Kobo (UGANDA_CCHA_FORM_ID): household, "
        "FGD and KII sections in one form, stored whole in kobo_submission. "
        "Not Approved submissions are excluded on Kobo's side and deleted here "
        "if rejected after being stored. Audio is held as links only.")


def seed(apps, schema_editor):
    SourceSync = apps.get_model("external_data", "SourceSync")
    SourceSync.objects.update_or_create(
        source="kobo", dataset="primary_data", iso3="UGA", variant="uganda_ccha",
        defaults={"tool": "kobo list_submissions", "notes": NOTE},
    )


def unseed(apps, schema_editor):
    SourceSync = apps.get_model("external_data", "SourceSync")
    SourceSync.objects.filter(source="kobo", dataset="primary_data",
                              variant="uganda_ccha").delete()


class Migration(migrations.Migration):
    dependencies = [("external_data", "0022_kobo_primary_data")]
    operations = [migrations.RunPython(seed, unseed)]
