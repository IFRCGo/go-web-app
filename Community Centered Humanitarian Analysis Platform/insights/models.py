"""What a community said, and everything derived from it.

    Insight         one statement, verbatim and whole - THE record
      |- InsightCoding   the hazards, needs and vulnerabilities read out of it
    InsightFolder   a registered folder of source documents
    ExtractionJob   one run: what it read, what it proposed, what it rejected

WHY THIS IS NOT data_track.NarrativeTag. That table records "a UNHCR report
mentioned flooding" - a keyword match on an analyst's prose, rebuilt from scratch
by s03_parse on every pipeline run. This one records "a community in Afar said
this", kept because a person reviewed it and published it. Nothing in
data_pipeline writes here, and nothing here is ever truncated.

The statement and its interpretation are deliberately two tables. Flattening the
codings into one tagged row per theme would lose the statement, which is the only
part no model can reconstruct.
"""
from pathlib import Path

from django.conf import settings
from django.db import models

VOICE_TYPES = [("community", "Community voice"), ("secondary_analysis", "Secondary analysis")]
# Display labels only; the stored values never changed (George, 2026-11-17).
# "primary" rows come from a Kobo pull (insights/field_data.py) - FIELD DATA.
# "manual" rows are typed in Admin - PRIMARY INPUT.
CHANNELS = [("document_ai", "Document (AI)"), ("manual", "Primary input"), ("primary", "Field data")]
STATUSES = [("pending", "Pending review"), ("published", "Published"), ("rejected", "Rejected")]
DIMENSIONS = [("hazard", "Hazard"), ("vulnerability", "Vulnerability"), ("need", "Need"),
              ("coping", "Coping"), ("movement_pattern", "Movement pattern")]

# The coding's part in the statement. 'subject' is what every row written before
# this column existed means, which is why it is the default and why the migration
# needs no backfill. 'driver' is what makes "why are they returning" a query
# rather than a reading exercise: return_movement as subject, armed_conflict as
# driver, on one quote. 'barrier' is what blocks access to a need.
CODING_ROLES = [("subject", "Subject"), ("driver", "Driver"), ("barrier", "Barrier")]

# A figure may be a share. A corridor may not: its value is a BigIntegerField and
# there is no honest way to put "65 percent" in one. A percentage about a moving
# population is a figure on the same quote, not a corridor.
FIGURE_UNITS = [("people", "People"), ("percent", "Percent"), ("households", "Households")]
MOVEMENT_UNITS = [("people", "People"), ("households", "Households")]

# The corridor's direction class - what decides how an arrow is drawn, and the
# same vocabulary data_track.MovementFlow.flow_type already uses. NOT the same
# thing as the movement_pattern coding, which is the richer taxonomy label;
# neither is derivable from the other.
FLOW_TYPES = [("cross_border", "Cross-border"), ("internal", "Internal"),
              ("return", "Return"), ("transit", "Transit")]

ROLE_VALUES = {value for value, _ in CODING_ROLES}
FIGURE_UNIT_VALUES = {value for value, _ in FIGURE_UNITS}
MOVEMENT_UNIT_VALUES = {value for value, _ in MOVEMENT_UNITS}
FLOW_TYPE_VALUES = {value for value, _ in FLOW_TYPES}


class InsightFolder(models.Model):
    """A folder of source documents, registered once and re-read on demand."""

    label = models.TextField(help_text="e.g. 'IOM DTM Chad round 12'")
    path = models.TextField(unique=True, help_text="Must resolve inside the container")
    default_iso3 = models.CharField(max_length=3, null=True, blank=True)
    recursive = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "insight_folders"
        ordering = ["label"]

    def clean(self):
        """Reject an unreachable path at save time rather than inside a job.

        Admin calls this, so a mistyped path is a field error on the form. The
        `reachable` column in the changelist stays, for a folder that was valid
        when registered and has since moved.
        """
        from django.core.exceptions import ValidationError

        from insights import document_roots

        if self.path and not Path(self.path).is_dir():
            raise ValidationError({"path": (
                f"{self.path} is not a directory inside this container. "
                f"{document_roots.sentence()}"
            )})

    def __str__(self):
        return self.label


class InsightUpload(models.Model):
    """One document uploaded through Admin, rather than found in a folder.

    Files land under MEDIA_ROOT, which is inside the app itself, because the
    folder holding the source documents is mounted read-only: an upload cannot
    be written beside the PDFs it will be read with. Saving one catalogues it
    immediately - see InsightUploadAdmin.save_model - and `document` then points
    at the row it produced.
    """

    file = models.FileField(upload_to="insights/")
    label = models.TextField(null=True, blank=True)
    iso3 = models.CharField(max_length=3, null=True, blank=True)
    report_date = models.DateField(null=True, blank=True)
    document = models.ForeignKey(
        "data_track.Document", on_delete=models.SET_NULL, null=True, blank=True,
        help_text="Filled in once the upload has been catalogued",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "insight_uploads"
        ordering = ["-id"]

    def __str__(self):
        if self.label:
            return self.label
        return Path(self.file.name).name if self.file else f"upload {self.id}"


class ExtractionJob(models.Model):
    """One extraction run, and what it cost in rejected quotes.

    insights_rejected_unverifiable is the number worth watching: it is a direct
    per-run measurement of how much a given model invents, and it is why pointing
    an unknown local model at this is safe to try.
    """

    folder = models.ForeignKey(InsightFolder, on_delete=models.SET_NULL, null=True, blank=True)
    # What this job extracts, and nothing else. Without this link
    # `extract_insights --job N` had nothing to scope itself to but
    # "every document ever catalogued into the insights collection" - a job
    # for one folder would silently re-extract every other folder's documents
    # too. Additive: this table lives in insights and data_track is untouched.
    # A document already catalogued by an earlier job may be attached to a
    # later one too - re-running the SAME job on purpose (e.g. with a better
    # model) re-extracts its documents; the loader's conflict rule (gate 4)
    # already protects any row a reviewer has touched.
    documents = models.ManyToManyField(
        "data_track.Document", blank=True, related_name="extraction_jobs")
    label = models.TextField(
        null=True, blank=True,
        help_text="What this batch was: 'folder: DTM Round 12', '4 files'. Kept "
                  "because a folder chosen in a browser is not a path the server "
                  "can recover any other way.",
    )
    producer = models.TextField(default="external", help_text="external / anthropic / openai_compatible")
    model_used = models.TextField(null=True, blank=True)
    status = models.TextField(
        default="queued",
        help_text=(
            "collecting / collected / converting / converted / convert_failed / "
            "queued / running / loaded / failed. 'collecting' is a wizard batch "
            "whose files are still arriving; 'collected' is one whose files are in "
            "but not yet read; 'converted' is read and waiting for a person to look "
            "at the text before paying the model. 'queued' therefore means CONVERTED "
            "and ready to extract. A job stuck at 'running' or 'converting' because "
            "its process was killed rather than raising (e.g. docker compose restart "
            "web) can be recovered with the 'Reset stuck job' action below."
        ),
    )
    documents_total = models.IntegerField(default=0)
    documents_done = models.IntegerField(default=0)
    insights_proposed = models.IntegerField(default=0)
    insights_rejected_unverifiable = models.IntegerField(default=0)
    insights_skipped_reviewed = models.IntegerField(default=0)
    # A bad vocabulary word costs its own figure or corridor, not the document
    # (spec 6.3) - but a drop must never be silent, so it is counted here and
    # named in `log`. These are deliberately NOT folded into
    # insights_rejected_unverifiable: that number means "whole insights that
    # failed the quote gate" and a reviewer already watches it, so it must not
    # quietly change definition.
    # A coding whose DIMENSION was not one of the five: dropped by
    # contract.parse() rather than costing the payload, and counted here so the
    # drop is never silent. Its own column, not folded into figures_rejected,
    # because these three name three different mistakes a model makes.
    codings_rejected = models.IntegerField(default=0)
    figures_rejected = models.IntegerField(default=0)
    movements_rejected = models.IntegerField(default=0)
    log = models.TextField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "insight_jobs"
        ordering = ["-id"]

    def __str__(self):
        return f"job {self.id} ({self.producer}, {self.status})"


class Conversion(models.Model):
    """What happened when we tried to read one document, and with what.

    ONE ROW PER DOCUMENT, not per page: reading is a per-document act, and a
    re-read overwrites the record of the last one. It lives in `insights`
    rather than beside DocumentText in `data_track` for the same reason
    ExtractionJob.documents does - additive, and data_track stays a table the
    pipeline owns.

    `job` is SET_NULL because how a document was read is evidence about the
    text now sitting in the database. Deleting the batch it arrived in must
    not erase it.
    """

    document = models.OneToOneField("data_track.Document", on_delete=models.CASCADE,
                                    related_name="conversion")
    job = models.ForeignKey(ExtractionJob, null=True, blank=True,
                            on_delete=models.SET_NULL, related_name="conversions")
    engine = models.TextField(
        help_text="docling / pymupdf / skipped. 'pymupdf' means Docling was tried "
                  "and failed on this document, so the intake text was left in place.")
    ok = models.BooleanField(default=False)
    pages = models.IntegerField(default=0)
    markdown_path = models.TextField(null=True, blank=True)
    docling_version = models.TextField(
        null=True, blank=True,
        help_text="A later Docling reading the same PDF differently would move "
                  "quotes out from under their page numbers. This is what says why.")
    message = models.TextField(null=True, blank=True)
    converted_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "insight_conversions"
        ordering = ["-converted_at"]

    def __str__(self):
        return f"{self.document_id} read by {self.engine}"


class Insight(models.Model):
    """One thing a community said, kept whole."""

    # ---- the record itself
    quote = models.TextField(help_text="Verbatim, in full. Never summarised or trimmed.")
    quote_language = models.CharField(max_length=8, default="en")
    quote_translated = models.TextField(null=True, blank=True)
    # Fingerprint of the normalised quote. Part of the natural key, which is why
    # editing the quote in Admin has to recompute it.
    quote_sha1 = models.CharField(max_length=40)

    voice_type = models.TextField(choices=VOICE_TYPES, default="community")
    channel = models.TextField(choices=CHANNELS, default="document_ai")

    # ---- where it came from
    document = models.ForeignKey(
        "data_track.Document", on_delete=models.CASCADE, related_name="insights",
        null=True, blank=True, help_text="Null for manual and primary-collected statements",
    )
    page = models.IntegerField(null=True, blank=True)
    stated_on = models.DateField(
        db_index=True, help_text="Report date, or collection date. The dashboard timeline rides on this.",
    )

    # ---- where the people are
    iso3 = models.CharField(max_length=3, db_index=True)
    place_name_as_written = models.TextField(null=True, blank=True)
    admin_pcode = models.TextField(null=True, blank=True)
    admin_level = models.IntegerField(null=True, blank=True)
    match_method = models.TextField(default="unmatched", help_text="pcode / name / unmatched")
    # Copied from AdminArea.center_lat/center_lon - a point guaranteed inside the
    # polygon. A LABEL POSITION, not an address. See the popup note in the spec.
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)

    # ---- field data: which Kobo interview, which answer
    # Set only on rows insights/field_data.py writes from a Kobo pull. This is
    # the natural key for those rows: two households can write the identical
    # words, so the quote cannot be. CASCADE on purpose - an interview rejected
    # in Kobo after it was stored is deleted on the next pull, and what it said
    # goes with it, published or not.
    field_interview = models.ForeignKey(
        "external_data.CchaPrimaryData", on_delete=models.CASCADE, null=True, blank=True,
        related_name="statements")
    field_question = models.TextField(
        null=True, blank=True,
        help_text="The follow-up column this answers, e.g. vulnerabilities_elaborate")
    field_item = models.IntegerField(
        default=0, help_text="The repeat's hazard_number; 0 outside a repeat")
    # What the last Kobo pull said for this statement (quote, date, place). A
    # re-pull changes a pending row only where KOBO changed since then, so a
    # reviewer's own corrections to a pending row (placing it, fixing a typo)
    # are not undone by the next pull.
    field_kobo = models.JSONField(default=dict, blank=True)

    # ---- optional, and usually absent
    people_affected = models.BigIntegerField(null=True, blank=True)
    severity = models.IntegerField(null=True, blank=True, help_text="1-5, as Event.severity")

    # ---- provenance
    method = models.TextField(default="llm", help_text="llm / manual")
    model_used = models.TextField(null=True, blank=True)
    confidence = models.TextField(null=True, blank=True, help_text="high / medium / low")

    # ---- review
    status = models.TextField(choices=STATUSES, default="pending", db_index=True)
    rejection_reason = models.TextField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    job = models.ForeignKey(ExtractionJob, on_delete=models.SET_NULL, null=True, blank=True,
                            related_name="insights")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "insights"
        ordering = ["-stated_on", "id"]
        # How this table is named on the admin index. "Part 2" because the
        # wizard is Part 1 and the two are read in that order; the admin sorts
        # the index by name, so the numbers do the ordering. Part 3 is the
        # PublishedInsight proxy at the foot of this file - the same rows,
        # listed where a decision is no longer wanted.
        verbose_name_plural = "Part 2 — Insights"
        constraints = [
            # nulls_distinct=False because a manual insight has a null document and
            # a null page. Under PostgreSQL's default rule two NULLs never collide,
            # so every duplicate hand-typed statement would be accepted silently.
            # Field-data rows are excluded: they have no document and no page
            # either, so two households saying "Lack of job" would collide.
            models.UniqueConstraint(
                fields=["document", "page", "quote_sha1"],
                name="uniq_insight_quote", nulls_distinct=False,
                condition=models.Q(field_interview__isnull=True),
            ),
            models.UniqueConstraint(
                fields=["field_interview", "field_question", "field_item"],
                name="uniq_field_statement",
                condition=models.Q(field_interview__isnull=False),
            ),
        ]
        indexes = [
            models.Index(fields=["status", "voice_type", "stated_on"], name="idx_insight_publish"),
            models.Index(fields=["iso3", "stated_on"], name="idx_insight_place"),
        ]

    def save(self, *args, **kwargs):
        # The fingerprint is part of the natural key, so it must follow the quote.
        # Editing a quote in Admin is allowed only to repair an OCR artefact; this
        # keeps the key honest when that happens.
        from insights.verify import quote_sha1 as _sha1
        self.quote_sha1 = _sha1(self.quote)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.iso3} {self.stated_on}: {self.quote[:60]}"


class InsightCoding(models.Model):
    """One theme read out of one statement.

    `tag` is constrained to taxonomy.json at load time rather than by a database
    check, because the vocabulary is a JSON file that changes without a migration.
    See insights/taxonomy.py, which is the single place that enforces it.
    """

    insight = models.ForeignKey(Insight, on_delete=models.CASCADE, related_name="codings")
    dimension = models.TextField(choices=DIMENSIONS)
    tag = models.TextField(help_text="A key in taxonomy.json under this dimension, or 'other'")
    tag_raw = models.TextField(
        null=True, blank=True, help_text="What was proposed, when it fell outside the vocabulary")
    role = models.TextField(
        choices=CODING_ROLES, default="subject",
        help_text="What part this theme plays in the statement. 'driver' is the "
                  "cause; 'barrier' is what blocks access to a need.")

    class Meta:
        db_table = "insight_codings"
        ordering = ["dimension", "tag"]
        constraints = [
            # role joins the key because one statement can legitimately carry the
            # same tag twice in two parts: displacement as the thing happening,
            # and displacement as what drives a further need.
            models.UniqueConstraint(
                fields=["insight", "dimension", "tag", "role"], name="uniq_insight_coding"),
        ]

    def __str__(self):
        return f"{self.dimension}:{self.tag}"


class InsightFigure(models.Model):
    """One number read out of one statement.

    WHY THIS IS NOT Insight.people_affected. That column is a BigIntegerField
    holding a headline people-count, and it stays. But an assessment report
    states most of what it knows as a share - the Egypt EVAR states 253 figures
    as percentages - and there is no honest way to put "65 percent" in a whole
    number of people.

    WHY figure_as_written EXISTS. verify.py checks the QUOTE against the page; it
    says nothing about a number typed beside it. A model could quote "About 65
    percent of refugees are highly or extremely vulnerable" perfectly and write
    value 56, and every gate would pass. So the span as printed is stored and
    checked against the quote, and value/unit are the parsed reading of it. This
    is place_name_as_written / admin_pcode one level down: what the document said,
    and what we made of it, kept side by side so the reading stays auditable.
    """

    insight = models.ForeignKey(Insight, on_delete=models.CASCADE, related_name="figures")
    figure_as_written = models.TextField(
        help_text="The span exactly as printed: '65 percent', '0.7 million'. Must "
                  "occur in the quote.")
    value = models.FloatField(
        help_text="The parsed reading. A float because a share is not an integer.")
    unit = models.TextField(choices=FIGURE_UNITS)
    measures = models.TextField(help_text="What it counts: 'highly or extremely vulnerable'")
    applies_to = models.TextField(
        null=True, blank=True,
        help_text="The subgroup, when the figure is disaggregated: 'non-Arabic "
                  "speaking households'. Null means the whole population the "
                  "statement is about.")

    class Meta:
        db_table = "insight_figures"
        ordering = ["id"]

    def __str__(self):
        return f"{self.figure_as_written} ({self.measures})"


class InsightMovement(models.Model):
    """One corridor read out of one statement - a complete arrow.

    WHY A ROW IS A CORRIDOR AND NOT A PAIR OF COLUMNS ON Insight. EVAR p.10 names
    eight origin countries in a single sentence, and the (document, page,
    quote_sha1) unique constraint means one quote cannot be split into eight rows
    to hold them. Eight child rows are eight unambiguous arrows on one quote.

    WHY EACH SIDE CARRIES ITS OWN iso3. places.resolve() needs a country per side,
    and on the corridor this table exists for - Sudan to Egypt - neither side
    equals the parent insight's iso3 in both positions. Inheriting it would invent
    a placement, and would do so precisely on cross-border movement.

    origin_lat/lon and dest_lat/lon are LABEL POSITIONS copied from
    AdminArea.center_lat/center_lon, not addresses - the same caveat the subject
    place carries, and the dashboard popup must repeat it.
    """

    insight = models.ForeignKey(Insight, on_delete=models.CASCADE, related_name="movements")

    origin_name_as_written = models.TextField(null=True, blank=True)
    origin_iso3 = models.CharField(max_length=3, null=True, blank=True)
    origin_pcode = models.TextField(null=True, blank=True)
    origin_admin_level = models.IntegerField(null=True, blank=True)
    origin_match_method = models.TextField(
        default="unmatched", help_text="pcode / name / unmatched")
    origin_lat = models.FloatField(null=True, blank=True)
    origin_lon = models.FloatField(null=True, blank=True)

    dest_name_as_written = models.TextField(null=True, blank=True)
    dest_iso3 = models.CharField(max_length=3, null=True, blank=True)
    dest_pcode = models.TextField(null=True, blank=True)
    dest_admin_level = models.IntegerField(null=True, blank=True)
    dest_match_method = models.TextField(
        default="unmatched", help_text="pcode / name / unmatched")
    dest_lat = models.FloatField(null=True, blank=True)
    dest_lon = models.FloatField(null=True, blank=True)

    flow_type = models.TextField(choices=FLOW_TYPES)
    value_as_written = models.TextField(
        null=True, blank=True,
        help_text="The span exactly as printed: '0.7 million'. Must occur in the "
                  "quote when present.")
    value = models.BigIntegerField(null=True, blank=True)
    unit = models.TextField(choices=MOVEMENT_UNITS, null=True, blank=True)

    class Meta:
        db_table = "insight_movements"
        ordering = ["id"]
        indexes = [
            models.Index(fields=["origin_iso3", "dest_iso3"], name="idx_movement_corridor"),
        ]

    def __str__(self):
        return f"{self.origin_name_as_written or '?'} → {self.dest_name_as_written or '?'}"


class DocumentsToInsights(ExtractionJob):
    """The wizard's front door on the admin index.

    A proxy, because Django's admin index lists registered MODELS and the
    wizard is a sequence of pages. Proxying ExtractionJob rather than inventing
    a model is honest about what the wizard drives: a batch IS a job, and the
    steps are that job's states. No table is created.
    """

    class Meta:
        proxy = True
        verbose_name = "Documents → insights"
        verbose_name_plural = "Part 1 — Documents → insights"


class PublishedInsight(Insight):
    """The archive, on the index beside the two screens that do the work.

    Same table, same rows - a proxy only so the admin can list published
    statements somewhere other than Part 2. Part 2 is a queue: a reviewer opens
    it to decide something, and a published row there is a decision already
    made, burying the ones that are not. The split is presentational, and
    nothing outside the admin should filter on this class rather than on
    `Insight.status`.

    "Part 3" because the admin index sorts by name - see the note on
    Insight.Meta.
    """

    class Meta:
        proxy = True
        verbose_name = "Published insight"
        verbose_name_plural = "Part 3 — Published insights"


class FieldDataTagMap(models.Model):
    """A survey answer label -> a taxonomy tag, per form and dimension.

    The CCHA form's answer lists are not the taxonomy ("Insect Infestation" has
    no key), so a field statement about a named hazard is coded through this
    table. Curated values belong in a table a person can edit, not a dict in a
    loader. A label with no row codes as 'other', with the label in tag_raw, so
    the reviewer sees it and can add a row.
    """

    form_key = models.TextField(default="ccha_primary_data")
    label = models.TextField(help_text="The answer exactly as the form labels it")
    dimension = models.TextField(choices=DIMENSIONS)
    tag = models.TextField(help_text="A key in taxonomy.json under this dimension, or 'other'")

    class Meta:
        db_table = "field_data_tag_map"
        ordering = ["form_key", "dimension", "label"]
        unique_together = [("form_key", "label", "dimension")]
        verbose_name = "Field data → theme mapping"
        verbose_name_plural = "Field data → theme mappings"

    def clean(self):
        from django.core.exceptions import ValidationError
        from insights.taxonomy import OTHER, tags_by_dimension
        allowed = set(tags_by_dimension().get(self.dimension, [])) | {OTHER}
        if self.tag not in allowed:
            raise ValidationError({"tag": f"'{self.tag}' is not a {self.dimension} tag "
                                          f"in taxonomy.json (or 'other')."})

    @classmethod
    def lookup(cls, form_key, label, dimension):
        """The mapped tag, or None. Case-insensitive on the label."""
        if not label:
            return None
        return (cls.objects.filter(form_key=form_key, dimension=dimension,
                                   label__iexact=label.strip())
                .values_list("tag", flat=True).first())

    def __str__(self):
        return f"{self.label} → {self.dimension}:{self.tag}"
