"""The subject tables, and the one table that says how fresh they are.

    SourceSync        one row per thing that can be pulled, and its watermark
    SeasonalCalendar  lean / harvest / dry bands, per country
    FoodSecurityArea  IPC and Cadre Harmonise phases, per area
    MovementPattern   IDP and refugee series, long format
    BorderCrossing    curated crossings, no API behind them

The tables are named for their subject, not their source. A seasonal calendar is a
seasonal calendar whether FEWS NET or ACAPS published it, so which provider a row
came from is a column here rather than a table name.

Geometry is not declared in this file. `FoodSecurityArea` gains two PostGIS columns
in a later migration, added with raw SQL, exactly as `admin_areas` does and for the
same reason: GeoDjango would mean putting GDAL into the web image for no capability
this project needs. Django is perfectly happy managing a table that has a column it
does not know about - it only ever names the columns it does.
"""
from django.db import models


class SourceSync(models.Model):
    """What has already been fetched, so the next pull asks only for the rest.

    IDENTITY EXCLUDES THE CALL'S ARGUMENTS, and that is the point of this table.
    `params` records the last call made, for reproducibility, but it is not part of
    the unique key - `start_date` lives in there, so keying on it would give every
    incremental pull its own row and the watermark would never accumulate.

    `variant` is what legitimately separates two rows for one country: IDPs at
    admin1 and IDPs at admin2 are different things to fetch. Date windows, page
    offsets and result limits are never part of identity.
    """

    source = models.TextField(help_text="fewsnet / ipc / hdx / unhcr / acaps / excel")
    dataset = models.TextField(help_text="seasonal_calendar / food_security / idps / refugees")
    iso3 = models.CharField(
        max_length=3, null=True, blank=True, help_text="Null for a global pull"
    )
    variant = models.TextField(
        default="", blank=True, help_text="Which slice: 'admin2-overview' vs 'admin1'"
    )
    tool = models.TextField(null=True, blank=True, help_text="The MCP tool called")
    params = models.JSONField(
        default=dict, blank=True, help_text="The last call made. NOT part of identity."
    )

    # last_pulled_at moves on every attempt; high_water_date moves only when data
    # genuinely newer than what we held came back. Keeping them apart is what stops
    # a no-op refresh from looking like fresh data.
    last_pulled_at = models.DateTimeField(null=True, blank=True)
    high_water_date = models.DateField(
        null=True, blank=True, help_text="Latest DATA date held - not the pull date"
    )
    known_ids = models.JSONField(
        default=list, blank=True,
        help_text="Identities already held, for sources with no date filter (IPC analysis ids)",
    )
    # WHAT known_ids CANNOT SAY. known_ids means "held": it is filled from rows
    # that loaded. It has no way to record that a person looked at an analysis
    # and decided it does not belong - Chad's Mar 2024 analysis "counts a
    # different denominator and would not compose with the rest" - or that a
    # source publishes an id with no data behind it at all.
    #
    # Without this column, an automated diff of "published minus held" re-pulls
    # every deliberate exclusion and retries every empty analysis on every press,
    # forever. Entries are {"id": "...", "reason": "..."}; the reason is not
    # decoration, it is the difference between a decision and a mystery.
    skipped_ids = models.JSONField(
        default=list, blank=True,
        help_text="Identities deliberately NOT held: [{id, reason}]. See known_ids.",
    )
    row_count = models.IntegerField(default=0)
    notes = models.TextField(
        null=True, blank=True,
        help_text="e.g. 'publishes annually, latest 2024' - so a no-op refresh explains itself",
    )

    class Meta:
        db_table = "source_sync"
        ordering = ["source", "dataset", "iso3", "variant"]
        constraints = [
            # nulls_distinct=False because iso3 is null for global pulls, and under
            # PostgreSQL's default rule two nulls never collide - so duplicate
            # global rows would accumulate silently. Same trap admin_areas
            # documents on uniq_area_identity.
            models.UniqueConstraint(
                fields=["source", "dataset", "iso3", "variant"],
                name="uniq_source_sync_identity",
                nulls_distinct=False,
            ),
        ]

    def __str__(self):
        where = self.iso3 or "global"
        return f"{self.source}/{self.dataset} {where} {self.variant}".strip()


class SeasonalCalendar(models.Model):
    """When the lean season bites, when the harvest comes in - per country.

    TWO PUBLISHERS, AND THEY ARE NOT EQUIVALENT. FEWS NET gives national bands with
    bare names: "Lean", "Harvest", "Post-harvest". ACAPS gives the same seasons
    with the crop named, a sentence of explanation, the admin-1 regions each
    applies to, and the organisation that assessed it with a link to the document.
    The office asked for the ACAPS calendar for exactly that reason, so `source`
    keeps both and the dashboard prefers ACAPS where it exists.

    MONTHS ARE STORED AS A LIST, not only as a span. ACAPS publishes an explicit
    set of months per event and a span cannot represent every set it might publish;
    start_month/end_month are kept beside it because a span is what reads well in a
    strip, but `months` is the authoritative field.

    NO COLOUR COLUMN, deliberately. Neither publisher supplies one, so the column
    would be null for every real row. Colour is derived at build time from
    `season_type`, which has the happy side effect that a lean season is the same
    colour in every country.
    """

    iso3 = models.CharField(max_length=3, db_index=True)
    country_name = models.TextField()
    admin_pcode = models.TextField(
        null=True, blank=True,
        help_text="Null for a national calendar. ACAPS publishes at admin-1.",
    )
    source = models.TextField(help_text="fewsnet / acaps / curated")
    source_ref = models.TextField(
        null=True, blank=True, help_text="FEWS NET fnid, or the ACAPS record id"
    )
    label = models.TextField(help_text="What the season is about: 'Lean', 'Cotton', 'Sorghum'")
    season_type = models.TextField(
        null=True, blank=True,
        help_text="Normalised, and what the calendar strip colours by: Rainy / "
                  "Dry / Planting / Harvest / Lean / Hazard / Livestock, or "
                  "Other for a publisher category we have not classified.",
    )
    # ACAPS's own vocabulary, kept unflattened beside the normalised one. It is
    # finer than season_type and is what a reader recognises: "Planting and
    # growing" and "1st/main planting" say different things.
    event = models.TextField(null=True, blank=True, help_text="e.g. '1st/main planting'")
    event_type = models.TextField(
        null=True, blank=True,
        help_text="ACAPS: Planting and growing / Harvest / Seasonal hazard / "
                  "Lean season / Livestock / Outbreak",
    )
    # The explicit set of months, which is what ACAPS actually publishes.
    months = models.JSONField(default=list, blank=True, help_text="Month numbers, 1-12")
    country_wide = models.BooleanField(
        null=True, blank=True, help_text="False when the event applies to named regions only"
    )
    admin_names = models.JSONField(
        default=list, blank=True, help_text="The admin-1 regions this applies to, when not national"
    )
    admin_codes = models.TextField(
        null=True, blank=True, help_text="ACAPS publishes GADM codes (SDN.1_1), not p-codes"
    )
    # WHO SAID SO. ACAPS is the aggregator; the assessment behind each row is
    # USDA's, FAO's, FEWS NET's or WFP's, and the link goes to that document.
    source_org = models.TextField(null=True, blank=True, help_text="USDA / FAO / FEWS NET / WFP")
    source_date = models.DateField(null=True, blank=True)
    source_url = models.TextField(null=True, blank=True)
    purpose = models.TextField(
        null=True, blank=True, help_text="NutritionIndicator / CropProductionIndicator"
    )
    # A season that runs November to February has end_month < start_month. That is
    # the source telling the truth about the calendar, not an error to correct.
    start_month = models.IntegerField()
    end_month = models.IntegerField()
    alignment = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    aliases = models.JSONField(
        default=list, blank=True, help_text="Multilingual synonyms - 'soudure' for lean"
    )
    display_order = models.IntegerField(default=0)

    class Meta:
        db_table = "seasonal_calendar"
        ordering = ["iso3", "purpose", "display_order"]
        constraints = [
            # source_ref is in the key because ACAPS rows are identified by their
            # own record id: one country can carry several "Harvest" events for
            # different crops, and they are different findings, not duplicates.
            models.UniqueConstraint(
                fields=["source", "iso3", "admin_pcode", "purpose", "label", "source_ref"],
                name="uniq_seasonal_band",
                nulls_distinct=False,
            ),
        ]

    def __str__(self):
        return f"{self.iso3} {self.label} ({self.start_month}-{self.end_month})"


class FoodSecurityArea(models.Model):
    """One IPC or Cadre Harmonise analysis unit, at one phase, in one period.

    IPC ANALYSIS UNITS ARE NOT ADMIN UNITS. IPC redraws them each round, which is
    why the existing ipc_areas_fs.geojson holds a complete snapshot per period
    rather than a series per area. The geometry is stored as IPC published it, and
    `admin_pcode` is a convenience join filled in where a polygon confidently
    matches one in admin_areas, left null otherwise. Nothing depends on it.

    `source` separates products that must never be conflated: 'ipc' is an official
    IPC analysis, 'ch' a Cadre Harmonise one (the same five-phase scale, used across
    the Sahel - Chad's analyses are these), and 'fewsnet' is FEWS NET's own
    IPC-compatible assessment, which is a different organisation's judgement about
    the same places.
    """

    source = models.TextField(db_index=True, help_text="ipc / ch / fewsnet")
    analysis_id = models.TextField(db_index=True, help_text="IPC's anl_id")
    analysis_title = models.TextField(null=True, blank=True)
    condition = models.CharField(
        max_length=1, null=True, blank=True, help_text="A acute, C chronic"
    )
    iso3 = models.CharField(max_length=3, db_index=True)
    period_date = models.DateField(db_index=True, help_text="First day of the period described")
    period_type = models.TextField(
        default="current", help_text="current / projection / second_projection"
    )
    area_id = models.TextField(help_text="IPC's aar_id")
    area_title = models.TextField(null=True, blank=True)
    admin_pcode = models.TextField(null=True, blank=True)

    phase = models.IntegerField(null=True, blank=True, help_text="Overall IPC phase 1-5")
    phase3_pct = models.FloatField(null=True, blank=True)
    phase4_pct = models.FloatField(null=True, blank=True)
    phase5_pct = models.FloatField(null=True, blank=True)
    phase3plus_pct = models.FloatField(null=True, blank=True, help_text="Phases 3+4+5")
    phase5_population = models.BigIntegerField(null=True, blank=True)
    total_population = models.BigIntegerField(null=True, blank=True)
    # IPC's own phase colour, kept so the map never invents one.
    colour = models.TextField(null=True, blank=True)

    # geom / geom_web  geometry(MultiPolygon, 4326) - added in the raw SQL migration

    class Meta:
        db_table = "food_security"
        ordering = ["iso3", "period_date", "area_title"]
        constraints = [
            models.UniqueConstraint(
                fields=["source", "analysis_id", "period_type", "area_id"],
                name="uniq_food_security_area",
                nulls_distinct=False,
            ),
        ]
        indexes = [
            models.Index(fields=["iso3", "period_date"], name="idx_fs_country_period"),
        ]

    @property
    def famine(self):
        """Phase 5 present - what the dashboard's 'fam' flag has always meant."""
        return bool(
            (self.phase5_population or 0) > 0
            or (self.phase is not None and self.phase >= 5)
        )

    def __str__(self):
        return f"{self.iso3} {self.area_title} phase {self.phase} ({self.period_date})"


class MovementPattern(models.Model):
    """Displacement figures as the agencies themselves publish them.

    THIS IS NOT data_track.PopulationFigure, and the distinction is deliberate.
    That table holds numbers read out of UNHCR PDFs, each with the sentence that
    produced it. This one holds the same KINDS of quantity from the agencies' own
    APIs and from the office's Excel workbooks. They overlap and they disagree,
    because a situation report and an IOM-DTM round count different things on
    different dates.

    They stay apart. An analyst who wants both writes a UNION and chooses what that
    means. One merged table would produce plausible, wrong totals that nobody could
    trace back - the exact failure this project's evidence trail exists to prevent.
    """

    date = models.DateField(db_index=True)
    iso3 = models.CharField(max_length=3, db_index=True)
    admin_pcode = models.TextField(
        null=True, blank=True, help_text="Null for a national total. Joins admin_areas.pcode."
    )
    admin_level = models.IntegerField(null=True, blank=True)
    place_name = models.TextField(null=True, blank=True)

    metric = models.TextField(
        db_index=True, help_text="idps / refugees / returnees / asylum_seekers"
    )
    population_group = models.TextField(null=True, blank=True)
    value = models.BigIntegerField()
    unit = models.TextField(default="individuals", help_text="individuals / households")

    source = models.TextField(help_text="hdx / unhcr / excel")
    source_dataset = models.TextField(
        null=True, blank=True, help_text="iom-dtm / get_refugees / the workbook name"
    )
    # DTM reports a period, not an instant. Keeping both ends means a later reader
    # can tell a fortnight's round from a single day's count.
    reference_period_start = models.DateField(null=True, blank=True)
    reference_period_end = models.DateField(null=True, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = "movement_patterns"
        ordering = ["iso3", "metric", "date"]
        constraints = [
            # place_name is in the key, and that is not decoration. Sudan's admin1
            # IDP rows carry no p-code, so without it every state sharing a date
            # collided and all but one were silently overwritten - 234 rows
            # collapsing to 6. An observation is identified by WHERE it is, and
            # when a p-code is absent the name is the only "where" there is.
            models.UniqueConstraint(
                fields=["source", "metric", "iso3", "admin_pcode", "place_name",
                        "date", "population_group"],
                name="uniq_movement_observation",
                nulls_distinct=False,
            ),
        ]
        indexes = [
            models.Index(fields=["metric", "iso3", "date"], name="idx_movement_series"),
        ]

    def __str__(self):
        return f"{self.date} {self.iso3} {self.metric} {self.value:,}"


class DisplacementBreakdown(models.Model):
    """One cell of an IOM-DTM matrix: of the people counted at this place on
    this date, how many came from there.

    SEPARATE FROM movement_patterns BECAUSE IT IS A DIFFERENT SHAPE, not a
    different source. A MovementPattern row answers "how many"; this answers
    "of whom, from where". Folding the origin into population_group would make
    every total a special case of a breakdown, and would break the
    one-value-per-place-per-date assumption s06's builders are written on.

    HOUSEHOLDS LIVE HERE TOO, as dimension='households'. They are a second unit
    of the same observation, and uniq_movement_observation does not include
    `unit` - so an individuals row and a households row for one locality and
    date would collide there and the second would silently overwrite the first.
    Adding `unit` to that constraint was the alternative; it is shared with
    three other loaders and its comment records a bug that took 234 rows to 6.
    """

    date = models.DateField(db_index=True)
    iso3 = models.CharField(max_length=3, db_index=True)
    metric = models.TextField(help_text="idps / returnees - matches movement_patterns.metric")
    dest_pcode = models.TextField(help_text="Where the people are now. Joins admin_areas.pcode.")
    dest_level = models.IntegerField()

    dimension = models.TextField(help_text=(
        "origin - the state an IDP was displaced FROM; "
        "displaced_in - the state a returnee was displaced IN; "
        "nationality - SUDANESE / NON_SUDANESE; "
        "households - the household count for the same total"))

    # A state p-code, or a sentinel. NEVER NULL - which is why this constraint
    # needs no nulls_distinct=False, unlike uniq_movement_observation.
    key = models.TextField(help_text=(
        "A state p-code, or: OUTSIDE_SDN ('Returned from outside Sudan'), "
        "SUDANESE / NON_SUDANESE, or 'total' for the households row."))

    value = models.BigIntegerField()
    source = models.TextField(default="dtm")
    source_dataset = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "displacement_breakdown"
        ordering = ["iso3", "metric", "date", "dest_pcode", "dimension", "key"]
        constraints = [
            models.UniqueConstraint(
                fields=["source", "metric", "iso3", "dest_pcode", "date",
                        "dimension", "key"],
                name="uniq_displacement_breakdown",
            ),
        ]
        indexes = [
            models.Index(fields=["metric", "dimension", "date"],
                         name="idx_breakdown_series"),
            models.Index(fields=["dest_pcode", "date"], name="idx_breakdown_place"),
        ]

    def __str__(self):
        return f"{self.date} {self.dest_pcode} {self.dimension}={self.key} {self.value:,}"


class BorderCrossing(models.Model):
    """The crossings people actually move through, tagged to movement corridors.

    Curated, and permanently so: no humanitarian API publishes "the crossings that
    matter for this operation", because that judgement is the operation's own. The
    coordinates come from UNHCR and OCHA operational geography and the corridor tags
    match the ids in flows.json, which is what lets the map light a crossing only
    when population actually moved along it.
    """

    name = models.TextField(unique=True)
    country = models.TextField(help_text="The country on the far side of the crossing")
    iso3 = models.CharField(max_length=3, db_index=True)
    lon = models.FloatField()
    lat = models.FloatField()
    corridor = models.TextField(
        null=True, blank=True, help_text="Outbound corridor id, e.g. sudan-chad"
    )
    # Null, not empty: several crossings have no observed return movement at all,
    # and that absence is a finding rather than a missing value.
    return_corridor = models.TextField(null=True, blank=True)
    source = models.TextField(default="curated")

    class Meta:
        db_table = "border_crossings"
        ordering = ["country", "name"]

    def __str__(self):
        return f"{self.name} ({self.country})"


class PlaceCoordinate(models.Model):
    """A coordinate for a place the boundary library does not carry.

    THE BOUNDARY LIBRARY IS STILL THE FIRST ANSWER. Almost every place a source
    names is an administrative unit, and admin_areas holds the polygon and the
    point inside it. This table is the short list of places that are not units
    at all and never will be: Egypt's Qustul and Arkeen arrive in the Kobo
    service-point form under "Districts where these services are offered", but
    they are border reception points at the Sudan frontier. No p-code exists for
    either, so the name lookup in load_hsps.resolve_places could only ever leave
    them at lat=None - and a row with no coordinate is a row the dashboard does
    not draw.

    WHY A TABLE RATHER THAN A DICTIONARY IN THE LOADER. The coordinate has to
    outlive the rows it lands on. lat and lon are in load_hsps.UPDATE_FIELDS, so
    every load recomputes them, and a newer export writes new rows under a new
    date_reported with nothing in them at all. Putting the coordinate on the
    service-point row is therefore writing it in sand; putting it here is the
    same arrangement the other 129 rows already have, with this table standing
    in for admin_areas. It is also why this is the one table in
    external_data/admin.py that is editable: no loader writes it, so a corrected
    coordinate typed there is picked up by the next load_hsps and by nothing
    else. seed_external fills this table with get_or_create rather than
    update_or_create for the same reason - re-seeding must not undo a
    correction, or the list in that command would be the authority again.

    SOURCE, AND WHAT A ROW IS WORTH. 'curated' means a person entered it from
    operational geography and put their reasoning in `note`. These are site
    coordinates, not label positions - the opposite of what a row placed from a
    polygon means - which is why load_hsps records match_method='manual' and the
    dashboard popup says so rather than repeating "district-level".
    """

    iso3 = models.CharField(max_length=3, db_index=True)
    name = models.TextField(
        db_index=True, help_text="The place name as the source spells it - this is the match key"
    )
    lat = models.FloatField()
    lon = models.FloatField()
    note = models.TextField(
        null=True, blank=True,
        help_text="Where the coordinate came from, and why this place has no polygon",
    )
    source = models.TextField(default="curated")

    class Meta:
        db_table = "place_coordinates"
        ordering = ["iso3", "name"]
        constraints = [
            # The match key. One country, one spelling, one point.
            models.UniqueConstraint(fields=["iso3", "name"], name="uniq_place_coordinate"),
        ]

    def __str__(self):
        return f"{self.name} ({self.iso3})"


class HumanitarianServicePoint(models.Model):
    """Which service a National Society offers, in which district, as reported.

    WHAT THIS TABLE IS NOT. Despite the name the form carries, the Kobo export
    holds no service-point coordinates and no per-site rows: it is six submissions,
    one per country, recording which of eleven services the National Society offers
    and which districts it offers them in. A row here therefore means "this service
    is offered somewhere in this district", NOT "there is a service point at this
    spot". The lat/lon below is the district's own point-on-surface, taken from the
    boundary library, and is a label position rather than an address.

    That is the finest truthful placement the source supports, and saying so here
    is cheaper than someone later reading these dots as building locations.

    match_method='manual' IS THE ONE EXCEPTION, and it reads the other way round.
    A few of the form's "districts" are border reception points that no polygon
    carries - Egypt's Qustul and Arkeen are both crossings, not districts - so
    they can only be placed from a site coordinate a person entered. Those rows
    have a real point and no admin_pcode, and the coordinate comes from
    PlaceCoordinate above rather than from here: lat and lon are rewritten by
    every load, so a coordinate typed onto one of these rows would not survive
    the next one.

    South Sudan is the one country that answered "no" to "same services at every
    HSP", so it carries three named locations with their own service lists; those
    rows have scope='named-location'. The other five are country-wide.

    DATE_REPORTED IS THE EXPORT DATE, and there is no better one. The export
    carries no submission timestamp at all - Kobo's _submission__submission_time
    column is present but empty for every row - so the date comes from the export
    filename. It still does the job it is here for: load a later export and its
    rows sit beside these under a new date, so what changed is a query rather than
    a memory.
    """

    date_reported = models.DateField(
        db_index=True, help_text="Export date. See the note above: no submission date exists."
    )
    country = models.TextField()
    iso3 = models.CharField(max_length=3, db_index=True)

    service = models.TextField(db_index=True, help_text="One of the form's eleven services")
    scope = models.TextField(
        default="country-wide", help_text="country-wide / named-location"
    )

    # Where. admin_pcode joins admin_areas on (iso3, level, pcode).
    location_name = models.TextField(help_text="The district as the form labelled it")
    admin_pcode = models.TextField(null=True, blank=True)
    admin_level = models.IntegerField(null=True, blank=True)
    match_method = models.TextField(
        default="unmatched", help_text="pcode / name / unmatched - how the district was placed"
    )
    # Copied from the matched polygon so a map can be drawn from this table alone,
    # with no join and no second source.
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)

    # Submission-level context, repeated on each row so one query answers everything.
    same_services_everywhere = models.BooleanField(null=True, blank=True)
    hsp_count = models.IntegerField(
        null=True, blank=True, help_text="As reported. NOT max_hsps, which is a form roster size."
    )
    kobo_uuid = models.TextField(null=True, blank=True)
    source_file = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "humanitarian_service_points"
        ordering = ["date_reported", "iso3", "location_name", "service"]
        constraints = [
            # date_reported is IN the key, which is the point: a later export adds
            # rows beside these rather than overwriting them, so the table keeps a
            # history and "did this change?" is answerable.
            models.UniqueConstraint(
                fields=["date_reported", "iso3", "service", "location_name"],
                name="uniq_hsp_service_place_date",
                nulls_distinct=False,
            ),
        ]
        indexes = [
            models.Index(fields=["iso3", "service"], name="idx_hsp_country_service"),
        ]

    def __str__(self):
        return f"{self.service} - {self.location_name} ({self.iso3}, {self.date_reported})"


class HazardEvent(models.Model):
    """One disaster event, as one Montandon source published it.

    SUBJECT-NAMED, LIKE ITS NEIGHBOURS. A hazard event is a hazard event whether
    GDACS, PDC or IDMC-IDU published it, so which one did is a column here.

    `source` IS ALWAYS 'montandon', AND THAT IS NOT COSMETIC. loaders/base.load()
    finishes by computing sync.row_count from the SYNC KEY's source. Writing
    'gdacs' here would make that count zero forever, and the admin would report
    "0 rows" after every successful pull. Every table in this file already keeps
    the convention: SeasonalCalendar.source is fewsnet/acaps, MovementPattern's
    is hdx/unhcr/excel - the publisher of the payload, not of the record.

    THREE SOURCES PUBLISH THE SAME FLOOD. `corr_id` is what ties them together,
    and it also ties this row to its severity and its impacts, which arrive in
    separate calls. The dashboard lights an area once per corr_id; the table
    keeps all three rows, because which agencies saw an event is itself a
    finding.
    """

    source = models.TextField(default="montandon", help_text="Always 'montandon'. See above.")
    collection = models.TextField(
        db_index=True, help_text="gdacs / pdc / idmc-idu - which collection published it"
    )
    event_id = models.TextField(help_text="Montandon's STAC item id")
    corr_id = models.TextField(
        db_index=True, help_text="monty:corr_id - ties sources, severity and impacts together"
    )

    iso3 = models.CharField(max_length=3, db_index=True)
    event_date = models.DateField(db_index=True)
    end_date = models.DateField(null=True, blank=True)
    title = models.TextField(
        help_text="The item title, verbatim. Montandon writes the place into it, in a "
                  "shape that varies by source - admin_pcode is the checkable answer."
    )

    # The raw list as published - HIP code, GLIDE code and UNDRR slug together -
    # so the clustering below can be audited against what actually arrived.
    hazard_codes = models.JSONField(default=list, blank=True)
    hazard_category = models.TextField(
        db_index=True, default="uncategorised",
        help_text="An IFRC codebook category key, from hazard_codebook.json",
    )
    hazard_sub = models.TextField(default="uncategorised")

    # From the *-hazards item, applied by corr_id after the events load. Null for
    # every IDMC-IDU row: there is no idmc-idu-hazards collection.
    #
    # NEVER SORT OR COMPARE severity_value ACROSS COLLECTIONS. GDACS publishes
    # 0.5 on a "GDACS Severity Score" and PDC publishes 0.1 on a "PDC Severity
    # Score"; they are different scales meaning different things. The unit is
    # stored beside the number so nothing can show one without the other.
    severity_value = models.FloatField(null=True, blank=True)
    severity_unit = models.TextField(null=True, blank=True)
    severity_label = models.TextField(null=True, blank=True, help_text="Green / WATCH / ...")
    severity_estimate_type = models.TextField(null=True, blank=True)

    significance = models.TextField(
        default="event", db_index=True,
        help_text="event / detection. A detection is a machine observation with no "
                  "evidence of consequence - it draws only under its own sub-hazard, "
                  "never when a whole category is picked. See hazards.is_detection.",
    )

    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    admin_pcode = models.TextField(null=True, blank=True)
    admin_level = models.IntegerField(null=True, blank=True)
    # WHERE THE POINT ACTUALLY IS, which is not always where Montandon filed it.
    #
    # `iso3` above is the country Montandon tagged the event with, and that tag
    # is loose: a Sudan-filtered query returns fires whose coordinates are in
    # South Sudan, floods in Ethiopia, and one earthquake in the Red Sea. Two
    # thirds of Sudan's first pull were like that. Requiring the polygon to be
    # Sudanese refused to place any of them, so the map lost them entirely.
    #
    # So the point is placed against every boundary the library holds, and this
    # column records whose polygon won. The two columns then say different and
    # both-true things: iso3 is the filing, admin_iso3 is the geography.
    admin_iso3 = models.CharField(
        max_length=3, null=True, blank=True, db_index=True,
        help_text="The country of the polygon the point fell in. May differ from iso3.",
    )
    match_method = models.TextField(
        default="unmatched", help_text="point-in-polygon / unmatched"
    )
    source_url = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "hazard_events"
        ordering = ["iso3", "-event_date", "collection"]
        constraints = [
            # iso3 IS IN THE KEY. One Montandon item can carry two countries - an
            # observed wildfire had ["ETH", "SDN"]. With iso3 outside the key,
            # pulling Chad after Sudan would silently rewrite Sudan's row.
            models.UniqueConstraint(
                fields=["collection", "event_id", "iso3"],
                name="uniq_hazard_event_identity",
                nulls_distinct=False,
            ),
        ]
        indexes = [
            models.Index(fields=["iso3", "hazard_category", "event_date"],
                         name="idx_hazard_country_cat"),
        ]

    def __str__(self):
        return f"{self.event_date} {self.iso3} {self.hazard_sub} - {self.title[:50]}"


class HazardImpact(models.Model):
    """One impact figure published against one hazard event.

    ONE ROW PER FIGURE, because Montandon publishes one item per (event, impact
    type): a flood has a displaced_internal item, an earthquake may have death
    and injured items.

    JOINED ON corr_id RATHER THAN BY FOREIGN KEY. Impacts and events are pulled
    in separate calls, and an impact whose event has not loaded is a fact worth
    keeping rather than an integrity error worth raising.
    """

    source = models.TextField(default="montandon")
    collection = models.TextField(db_index=True)
    impact_id = models.TextField()
    corr_id = models.TextField(db_index=True, help_text="Joins hazard_events.corr_id")
    iso3 = models.CharField(max_length=3, db_index=True)
    event_date = models.DateField(null=True, blank=True)

    impact_type = models.TextField(
        db_index=True, help_text="displaced_internal / death / potentially_affected / ..."
    )
    category = models.TextField(null=True, blank=True, help_text="people / buildings / ...")
    value = models.FloatField()
    unit = models.TextField(null=True, blank=True)
    estimate_type = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "hazard_impacts"
        ordering = ["iso3", "-event_date", "impact_type"]
        constraints = [
            models.UniqueConstraint(
                fields=["collection", "impact_id", "iso3"],
                name="uniq_hazard_impact_identity",
                nulls_distinct=False,
            ),
        ]

    def __str__(self):
        return f"{self.corr_id} {self.impact_type} {self.value:,.0f}"


class KoboForm(models.Model):
    """The latest definition of a Kobo form whose submissions are held.

    Kept so `kobo_submission.answers` can be read later - question labels,
    choice labels, which repeat is which - without another call to Kobo, and
    so the definition the answers were read against is on record. One row per
    form, overwritten by every pull.
    """

    form_uid = models.TextField(unique=True)
    form_key = models.TextField(db_index=True, help_text="Short name, e.g. ccha_primary_data")
    name = models.TextField(blank=True, default="")
    definition = models.JSONField(help_text="GET /api/v2/assets/{uid}/, as Kobo sent it")
    fetched_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "kobo_form"
        ordering = ["form_key"]

    def __str__(self):
        return self.name or self.form_key


class CchaPrimaryData(models.Model):
    """One CCHA primary-data interview from Kobo: household, FGD or KII, one row each.

    ONE TABLE FOR EVERY COUNTRY. The same CCHA form is used for data collection
    in several countries (Uganda first), so the table is named for the form, not
    a country (George, 2026-11-16); `country`, `admin1` and `admin2` say where.

    READABLE ON PURPOSE (George, 2026-11-16): one column per question, named
    after the question's short name in the form, holding the answer as its
    LABEL rather than Kobo's code. Multiple choices are joined with "; ", and an
    "Other (specify)" answer sits in the <question>_other column beside it. The
    column's verbose_name is the question wording, so Admin reads like the form.
    The two repeats - hazard details and gaps per hazard - are child tables.

    `interview_type` says which kind of interview a row is. A household row
    leaves the FGD and KII columns blank, and the reverse.

    AUDIO IS A LINK. fgd_audio and kii_audio hold Kobo's download URL; the
    recording stays in Kobo under the account's access control.

    NOT APPROVED IS NEVER HERE: filtered out on Kobo's side, and deleted (with
    its repeat rows) if rejected after it was stored. Approved, On Hold and
    never-reviewed interviews are kept; validation_status says which.

    `unmapped` catches the answer to any question added to the form after
    these columns were written, so nothing is dropped before the code catches
    up. Empty today. The columns are listed in loaders/ccha_primary_data.COLUMNS,
    and a test checks every one of them is a field here.
    """

    submission_id = models.BigIntegerField(unique=True, help_text="Kobo _id")
    uuid = models.TextField(blank=True, default="", help_text="Kobo _uuid")
    submitted_at = models.DateTimeField(null=True, blank=True)
    validation_status = models.CharField(
        max_length=32, blank=True, default="", db_index=True,
        help_text="approved / on_hold / blank when never reviewed")
    interview_date = models.DateField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    interview_type = models.TextField(null=True, blank=True, verbose_name="Which interview is this?")
    enum_name = models.TextField(null=True, blank=True, verbose_name="Enumerator's Name")
    consent = models.TextField(null=True, blank=True, verbose_name="Informed consent given")
    data_privacy = models.TextField(null=True, blank=True, verbose_name="Agreed to data saving and sharing")
    country = models.TextField(null=True, blank=True, verbose_name="Country")
    admin1 = models.TextField(null=True, blank=True, verbose_name="State / Region / Governorate")
    admin2 = models.TextField(null=True, blank=True, verbose_name="District / Locality")
    latitude = models.FloatField(null=True, blank=True, verbose_name="Record the GPS location (latitude)")
    longitude = models.FloatField(null=True, blank=True, verbose_name="Record the GPS location (longitude)")
    hh_head = models.TextField(null=True, blank=True, verbose_name="Are you the head of the household?")
    child_hh_head = models.TextField(null=True, blank=True, verbose_name="Is the Household Child Headed")
    who_hh_head = models.TextField(null=True, blank=True, verbose_name="Who is the head of the household?")
    gender = models.TextField(null=True, blank=True, verbose_name="What's your Gender")
    age = models.TextField(null=True, blank=True, verbose_name="What's your age?")
    hh_composition = models.IntegerField(null=True, blank=True, verbose_name="How many people live in your household? (including yourself)")
    hh_demographics = models.TextField(null=True, blank=True, verbose_name="What is the demography of your household?")
    hh_demographics_other = models.TextField(null=True, blank=True, verbose_name="What is the demography of your household? - other (specify)")
    meaning_hazard = models.TextField(null=True, blank=True, verbose_name="What does a hazard mean to you?")
    hazards_experience = models.TextField(null=True, blank=True, verbose_name="What hazards has this community been experiencing?")
    hazards_experience_other = models.TextField(null=True, blank=True, verbose_name="What hazards has this community been experiencing? - other (specify)")
    hazard_kind = models.TextField(null=True, blank=True, verbose_name="What hazards have become more severe/frequent in the recent years?")
    hazard_kind_other = models.TextField(null=True, blank=True, verbose_name="What hazards have become more severe/frequent in the recent years? - other (specify)")
    hazard_affected_groups = models.TextField(null=True, blank=True, verbose_name="Which groups experience the greatest impact?")
    hazard_affected_groups_other = models.TextField(null=True, blank=True, verbose_name="Which groups experience the greatest impact? - other (specify)")
    hazard_cause = models.TextField(null=True, blank=True, verbose_name="What are the main causes of these hazards?")
    hazard_cause_other = models.TextField(null=True, blank=True, verbose_name="What are the main causes of these hazards? - other (specify)")
    hazard_measures = models.TextField(null=True, blank=True, verbose_name="What measures do you take to be resistant towards common hazards?")
    hazard_measures_other = models.TextField(null=True, blank=True, verbose_name="What measures do you take to be resistant towards common hazards? - other (specify)")
    hazard_management = models.TextField(null=True, blank=True, verbose_name="What hazard management capacities do you have in this community?")
    hazard_management_other = models.TextField(null=True, blank=True, verbose_name="What hazard management capacities do you have in this community? - other (specify)")
    hazard_evacuate = models.TextField(null=True, blank=True, verbose_name="Where do people go when they need to leave their homes?")
    hazard_evacuate_other = models.TextField(null=True, blank=True, verbose_name="Where do people go when they need to leave their homes? - other (specify)")
    meaning_vulnerability = models.TextField(null=True, blank=True, verbose_name="What does vulnerability mean to you?")
    vulnerabilities_believe = models.TextField(null=True, blank=True, verbose_name="What vulnerabilities do you believe the community is facing?")
    vulnerabilities_believe_other = models.TextField(null=True, blank=True, verbose_name="What vulnerabilities do you believe the community is facing? - other (specify)")
    vulnerabilities_group = models.TextField(null=True, blank=True, verbose_name="What makes some groups more vulnerable than others?")
    vulnerabilities_group_other = models.TextField(null=True, blank=True, verbose_name="What makes some groups more vulnerable than others? - other (specify)")
    vulnerabilities_differences = models.TextField(null=True, blank=True, verbose_name="Are there any differences between people who arrived recently and longer-term residents?")
    vulnerabilities_elaborate = models.TextField(null=True, blank=True, verbose_name="Please Elaborate")
    meaning_coping = models.TextField(null=True, blank=True, verbose_name="What does coping capacity mean to you?")
    coping_extent = models.TextField(null=True, blank=True, verbose_name="To what extent do you think your community can cope with a hazard?")
    coping_cohesion = models.TextField(null=True, blank=True, verbose_name="What capacities do you have in this community with regard to social cohesion?")
    coping_cohesion_other = models.TextField(null=True, blank=True, verbose_name="What capacities do you have in this community with regard to social cohesion? - other (specify)")
    coping_gaps = models.TextField(null=True, blank=True, verbose_name="What vulnerabilities (gaps and challenges) do you have in this community with regard to...")
    coping_gaps_other = models.TextField(null=True, blank=True, verbose_name="What vulnerabilities (gaps and challenges) do you have in this community with regard to... - other (specify)")
    fgd_consent = models.TextField(null=True, blank=True, verbose_name="Does the group provide consent for Audio recording?")
    fgd_target_group = models.TextField(null=True, blank=True, verbose_name="Which group is the Focused Group Discussion for?")
    fgd_audio = models.TextField(null=True, blank=True, verbose_name="Record Audio (Kobo link)")
    kii_consent = models.TextField(null=True, blank=True, verbose_name="Does the Key informant provide Consent for Audio Recording?")
    kii_role = models.TextField(null=True, blank=True, verbose_name="What's their Role (Community Profile)?")
    kii_years_community = models.IntegerField(null=True, blank=True, verbose_name="Years in this Community?")
    kii_displacement_status = models.TextField(null=True, blank=True, verbose_name="Displacement Status")
    kii_audio = models.TextField(null=True, blank=True, verbose_name="Record Audio (Kobo link)")

    unmapped = models.JSONField(
        default=dict, blank=True,
        help_text="Answers to questions with no column yet (added to the form later)")

    class Meta:
        db_table = "ccha_primary_data"
        ordering = ["-submitted_at"]
        verbose_name = "CCHA primary data interview"

    def __str__(self):
        return f"{self.interview_type or 'interview'} #{self.submission_id}"


class CchaPrimaryDataHazardDetail(models.Model):
    """The 'Hazard details' repeat: one row per hazard named in an interview."""

    interview = models.ForeignKey(CchaPrimaryData, on_delete=models.CASCADE,
                                  related_name="hazard_details")
    hazard_number = models.IntegerField(null=True, blank=True)
    hazard = models.TextField(null=True, blank=True)
    hazard_occurence = models.TextField(null=True, blank=True, verbose_name="How often it occurs")
    hazard_occurence_other = models.TextField(null=True, blank=True,
                                              verbose_name="How often it occurs - other")
    hazard_events = models.TextField(null=True, blank=True, verbose_name="When it usually occurs")
    hazard_impact = models.TextField(null=True, blank=True,
                                     verbose_name="How seriously it affects the household/community")

    class Meta:
        db_table = "ccha_primary_data_hazard_details"
        ordering = ["interview", "hazard_number"]
        verbose_name = "CCHA primary data hazard detail"


class CchaPrimaryDataCopingChallenge(models.Model):
    """The 'Gaps/challenges per hazard' repeat: one row per hazard per interview."""

    interview = models.ForeignKey(CchaPrimaryData, on_delete=models.CASCADE,
                                  related_name="coping_challenges")
    hazard_number = models.IntegerField(null=True, blank=True)
    hazard = models.TextField(null=True, blank=True)
    coping_challenges = models.TextField(
        null=True, blank=True, verbose_name="Gaps/challenges the community has with this hazard")

    class Meta:
        db_table = "ccha_primary_data_coping_challenges"
        ordering = ["interview", "hazard_number"]
        verbose_name = "CCHA primary data coping challenge"
