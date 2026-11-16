"""Uganda CCHA -> CCHA primary data: the same form collects in several countries.

Renames the three tables with their data (nothing is re-pulled), and moves the
Data sources row from Uganda-only (iso3 UGA, variant uganda_ccha) to one
regional row (iso3 NULL, variant ccha_primary_data). The form's kobo_form row
follows its new key.
"""
from django.db import migrations, models

NOTE = ("CCHA primary data from Kobo (UGANDA_CCHA_FORM_ID): household, FGD and "
        "KII sections in one form, used for data collection in several "
        "countries, stored in ccha_primary_data and its two repeat tables. Not "
        "Approved submissions are excluded on Kobo's side and deleted here if "
        "rejected after being stored. Audio is held as links only.")


def forward(apps, schema_editor):
    SourceSync = apps.get_model("external_data", "SourceSync")
    KoboForm = apps.get_model("external_data", "KoboForm")
    old = SourceSync.objects.filter(source="kobo", dataset="primary_data",
                                    variant="uganda_ccha").first()
    SourceSync.objects.update_or_create(
        source="kobo", dataset="primary_data", iso3=None, variant="ccha_primary_data",
        defaults={"tool": "kobo list_submissions", "notes": NOTE,
                  "last_pulled_at": old.last_pulled_at if old else None,
                  "high_water_date": old.high_water_date if old else None,
                  "params": old.params if old else {},
                  "row_count": old.row_count if old else 0})
    if old:
        old.delete()
    KoboForm.objects.filter(form_key="uganda_ccha").update(form_key="ccha_primary_data")


def backward(apps, schema_editor):
    SourceSync = apps.get_model("external_data", "SourceSync")
    KoboForm = apps.get_model("external_data", "KoboForm")
    SourceSync.objects.filter(source="kobo", dataset="primary_data",
                              variant="ccha_primary_data").update(
        iso3="UGA", variant="uganda_ccha")
    KoboForm.objects.filter(form_key="ccha_primary_data").update(form_key="uganda_ccha")


class Migration(migrations.Migration):
    dependencies = [("external_data", "0024_uganda_ccha_tables")]
    operations = [
        migrations.RenameModel("UgandaCcha", "CchaPrimaryData"),
        migrations.RenameModel("UgandaCchaHazardDetail", "CchaPrimaryDataHazardDetail"),
        migrations.RenameModel("UgandaCchaCopingChallenge", "CchaPrimaryDataCopingChallenge"),
        migrations.AlterModelTable("CchaPrimaryData", "ccha_primary_data"),
        migrations.AlterModelTable("CchaPrimaryDataHazardDetail",
                                   "ccha_primary_data_hazard_details"),
        migrations.AlterModelTable("CchaPrimaryDataCopingChallenge",
                                   "ccha_primary_data_coping_challenges"),
        migrations.AlterModelOptions("CchaPrimaryData", {
            "ordering": ["-submitted_at"], "verbose_name": "CCHA primary data interview"}),
        migrations.AlterModelOptions("CchaPrimaryDataHazardDetail", {
            "ordering": ["interview", "hazard_number"],
            "verbose_name": "CCHA primary data hazard detail"}),
        migrations.AlterModelOptions("CchaPrimaryDataCopingChallenge", {
            "ordering": ["interview", "hazard_number"],
            "verbose_name": "CCHA primary data coping challenge"}),
        migrations.AlterField(
            model_name="koboform", name="form_key",
            field=models.TextField(db_index=True,
                                   help_text="Short name, e.g. ccha_primary_data")),
        migrations.RunPython(forward, backward),
    ]
