"""Seed the survey-label -> taxonomy mappings for the hazards seen so far.

get_or_create, never update: a row a person has since edited in Admin is theirs.
Only labels with an honest taxonomy key are seeded; the rest (Insect
Infestation, Population Movement, Transport Accident...) code as 'other' until
someone decides.
"""
from django.db import migrations

SEED = [
    ("Food Insecurity", "hazard", "famine_food_crisis"),
    ("Drought", "hazard", "extreme_heat_drought"),
    ("Heat Wave", "hazard", "extreme_heat_drought"),
    ("Flood", "hazard", "flooding"),
]


def seed(apps, schema_editor):
    Map = apps.get_model("insights", "FieldDataTagMap")
    for label, dimension, tag in SEED:
        Map.objects.get_or_create(form_key="ccha_primary_data", label=label,
                                  dimension=dimension, defaults={"tag": tag})


class Migration(migrations.Migration):
    dependencies = [("insights", "0011_field_data")]
    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
