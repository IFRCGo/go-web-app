"""Picking a place out of the boundary library instead of typing one.

WHY THIS FILE EXISTS. The Insight admin form used to ask a reviewer to type
`iso3`, and then to type `admin_pcode`, `admin_level`, `match_method`, `lat` and
`lon` beside it. Those last five are not answers a person has - they are what a
successful match PRODUCES. Typing a p-code by hand is how an insight lands on
the wrong polygon, and typing a latitude by hand is how one lands in the sea.

So the reviewer answers the question they can actually answer - which country,
which state, which district - and this module derives the rest from the polygon
they picked, exactly as `insights.places.resolve()` derives it from a name. The
two routes in must agree; a hand-keyed insight and an extracted one are the same
kind of record, and insights/admin.py says so at the top.

THE DEEPEST SELECTION WINS. District beats state beats country, because a
district is a better answer to "where are these people" than the state
containing it. What is NOT derived from the dropdown is the level: that is read
off the AdminArea row itself. See `InsightPlaceForm.save` for why that matters more
than it sounds.

WHAT IS DELIBERATELY NOT TOUCHED. `place_name_as_written` stays the source's own
spelling. A document saying "Wad Medani" keeps saying "Wad Medani" even when the
polygon it matched is spelled "Wad Madani Al Kubra" - the two columns answer
different questions and collapsing them would lose the source's voice.
"""
from django import forms
from django.urls import reverse

from boundaries.models import AdminArea
from insights.models import Insight, InsightFolder, InsightUpload

LEVEL_COUNTRY = 0
LEVEL_STATE = 1
LEVEL_DISTRICT = 2

BLANK = ("", "---------")


def _admin_areas():
    return AdminArea.objects.filter(kind=AdminArea.KIND_ADMIN)


def country_choices(keep=None):
    """Every country the library holds, by name.

    Keyed on `iso3` rather than the ADM0 p-code on purpose: Sudan's country
    polygon is p-code "SD" while every insight, loader and API in this project
    says "SDN". The dropdown has to speak the language the column is stored in.

    `keep` re-admits an iso3 the library does not hold. An insight extracted for
    a tenth country must stay editable - a reviewer has to be able to reject it -
    and a ChoiceField silently drops a value that is not among its choices.
    """
    rows = list(
        _admin_areas().filter(level=LEVEL_COUNTRY)
        .order_by("country_name").values_list("iso3", "country_name")
    )
    if keep and keep not in {iso3 for iso3, _ in rows}:
        rows.append((keep, f"{keep} (not in the boundary library)"))
    return [BLANK] + rows


def state_choices(iso3):
    """The states or regions of one country.

    Filtered by `iso3`, not by the country's p-code, because the two are spelled
    differently (see country_choices) - and because iso3 is indexed for exactly
    this question.

    The second query is for orphans. South Sudan's Abyei Region is an ADM2 whose
    recorded parent, "SS00", is not an ADM1 the library holds - the disputed area
    sits outside the state structure. Without this it would be unreachable from
    the form, which in a Sudan/South Sudan platform is not an acceptable gap. It
    is offered here at state level, and InsightPlaceForm.save still records its ADM2
    level because it reads that off the row rather than off the dropdown.
    """
    if not iso3:
        return [BLANK]

    states = list(
        _admin_areas().filter(iso3=iso3, level=LEVEL_STATE)
        .order_by("name").values_list("pcode", "name")
    )
    orphans = list(
        _admin_areas().filter(iso3=iso3, level=LEVEL_DISTRICT)
        .exclude(parent_pcode__in=[pcode for pcode, _ in states])
        .order_by("name").values_list("pcode", "name")
    )
    return [BLANK] + sorted(states + orphans, key=lambda row: row[1])


def district_choices(state_pcode):
    """The districts inside one state."""
    if not state_pcode:
        return [BLANK]
    return [BLANK] + list(
        _admin_areas().filter(parent_pcode=state_pcode, level=LEVEL_DISTRICT)
        .order_by("name").values_list("pcode", "name")
    )


class AreaChoiceField(forms.ChoiceField):
    """A p-code dropdown that leaves the judging to the form's clean().

    A plain ChoiceField refuses anything outside its own option list, and the
    message it gives is "Select a valid choice. SD03 is not one of the available
    choices." That is true and useless: it happens exactly when a reviewer has
    changed the country and left a stale state selected, and it names neither the
    state nor what to do about it.

    So the field accepts any p-code and `InsightPlaceForm.clean` decides, where
    there is enough context to say "Aj Jazirah is not in the country selected
    above." The check is not weakened - it moves, and it gets stricter: clean()
    verifies the p-code actually exists and actually sits under the parent, which
    an option list matching only proves if the list was built for that parent.
    """

    def valid_value(self, value):
        return True


class CountryField(forms.ChoiceField):
    """A country picker for the places that only ever wanted a country.

    InsightFolder.default_iso3 and InsightUpload.iso3 are cataloguing hints: they
    become Document.country_focus, and insights/prompts/extract_insights.md tells
    the extractor in as many words not to copy country_focus into an insight's
    own iso3. The country an insight is about is read out of the document. So
    there is nothing below country to pick here - just a list instead of a box to
    mistype "SDN" into.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("required", False)
        kwargs.setdefault("label", "Country")
        super().__init__(*args, **kwargs)

    # Choices are read at render time, not at import time: the boundary library
    # is loaded by a management command and this module is imported long before.
    def _load(self, keep=None):
        self.choices = country_choices(keep)

    def valid_value(self, value):
        """Accept what is given. This was a free CharField and it stays one.

        The value lands in Document.country_focus, which is free text by
        definition - so the dropdown is here to stop typos, NOT to become a new
        gate on cataloguing. Two things would break if it were a gate: an office
        that has not run `load_boundaries` yet would be offered an empty list and
        could never catalogue anything, and a document about a country outside
        the nine in the library could never be filed at all.
        """
        return True


class PlacePickerMixin:
    """Shared plumbing for a form whose country choices must stay honest."""

    def _prime_country(self, field_name, current):
        # On a bound form the submitted value wins, so a country the library
        # does not hold still renders as the selected option when the page comes
        # back with errors on some other field.
        if self.is_bound:
            current = self.data.get(self.add_prefix(field_name)) or current
        self.fields[field_name]._load(keep=current or None)


class InsightFolderForm(PlacePickerMixin, forms.ModelForm):
    default_iso3 = CountryField(
        help_text="Optional. A cataloguing hint recorded on each document found "
                  "here; it is not the country of any insight extracted from them.",
    )

    class Meta:
        model = InsightFolder
        fields = "__all__"
        # A path is one line. TextField renders a textarea by default, which
        # invites a newline into a value that must be a single directory.
        widgets = {"path": forms.TextInput(attrs={"size": 70})}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._prime_country("default_iso3", self.instance.default_iso3)
        # The browse button hangs off this attribute. reverse() rather than a
        # literal, because insights/admin.py owns that URL and a path written
        # twice is a path that goes stale once.
        self.fields["path"].widget.attrs["data-folder-browse-url"] = reverse(
            "admin:insights_folder_browse")

    class Media:
        js = ("insights/folder_picker.js",)


class InsightUploadForm(PlacePickerMixin, forms.ModelForm):
    iso3 = CountryField(
        help_text="Optional. A cataloguing hint recorded on the document; the "
                  "country of each insight is read out of the document itself.",
    )

    class Meta:
        model = InsightUpload
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._prime_country("iso3", self.instance.iso3)


class InsightPlaceForm(forms.ModelForm):
    """The Insight form, with the "Where" fieldset replaced by three dropdowns."""

    country = forms.ChoiceField(label="Country", required=True)
    state = AreaChoiceField(
        label="State / Region", required=False,
        help_text="Leave blank if the source only says which country.")
    district = AreaChoiceField(
        label="District", required=False,
        help_text="Leave blank if the source only says which state or region.")

    class Meta:
        model = Insight
        # The five derived columns are absent by design. They are shown on the
        # page read-only (see InsightAdmin.resolved_to) so a reviewer can audit
        # where a pick landed, but there is nothing here to type one into.
        exclude = ("iso3", "admin_pcode", "admin_level", "match_method", "lat", "lon",
                   "quote_sha1")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # "Field data" is what a Kobo pull writes (insights/field_data.py); a
        # person typing a statement is "Primary input". The choice stays only on
        # a row that already is field data, or saving it would fail validation.
        if "channel" in self.fields and self.instance.channel != "primary":
            self.fields["channel"].choices = [
                c for c in self.fields["channel"].choices if c[0] != "primary"]
        # What this row's location was BEFORE the reviewer touched the page.
        # save() compares against it to tell "moved it" from "left it alone";
        # it must be read off the instance, never off the POST.
        self._original_chain = self._chain_of(self.instance)
        country, state, district = self._current_chain()

        # THE BUG THIS PREVENTS. A ChoiceField whose options are filled in by
        # JavaScript has no valid choices as far as the server is concerned, so
        # every POST would fail with "Select a valid choice" - including one
        # that only changed the status of an insight whose location nobody
        # touched. The options are therefore rebuilt here, server-side, on both
        # a bound form and an unbound one; the JavaScript only saves the
        # reviewer a round trip.
        self.fields["country"].choices = country_choices(keep=country)
        self.fields["state"].choices = state_choices(country)
        self.fields["district"].choices = district_choices(state)

        # Where place_picker.js fetches the next level from. reverse() rather
        # than a literal: insights/admin.py owns that URL.
        self.fields["country"].widget.attrs["data-place-options-url"] = reverse(
            "admin:insights_place_options")

        # Found by role, not by id. The review page renders one of these forms
        # per row with a prefix, so "id_country" is neither unique nor present.
        for name in ("country", "state", "district"):
            self.fields[name].widget.attrs["data-place-role"] = name

        self.initial.setdefault("country", country)
        self.initial.setdefault("state", state)
        self.initial.setdefault("district", district)

    def _current_chain(self):
        """(country, state, district) from the POST if bound, else the instance."""
        if self.is_bound:
            return (
                self.data.get(self.add_prefix("country")) or "",
                self.data.get(self.add_prefix("state")) or "",
                self.data.get(self.add_prefix("district")) or "",
            )
        return self._chain_of(self.instance)

    @staticmethod
    def _chain_of(instance):
        """Walk a saved row's p-code back up to the country that holds it.

        Reconstructed rather than stored: Insight keeps one p-code and one level,
        which is the right thing for it to keep. The chain above that is the
        boundary library's to know, and asking it is cheaper than denormalising
        two more columns onto every insight ever extracted.

        THE WALK IS NOT OPTIONAL. `places.resolve()` matches a place name at any
        level, so extracted insights sit at ADM3 and ADM4 as well - Ethiopia has
        1,082 ADM3 areas and Uganda 1,520 at ADM4. This form offers three levels,
        so a deeper row cannot be shown exactly. It is shown honestly instead:
        the state and district CONTAINING it, rather than three blank dropdowns
        implying the row has no location at all. save() then leaves the deeper
        p-code alone unless the reviewer actually changes the pick.
        """
        country = getattr(instance, "iso3", "") or ""
        pcode = getattr(instance, "admin_pcode", None)
        if not pcode:
            return country, "", ""

        # Climb parent_pcode, remembering the p-code found at each level. `seen`
        # is a cycle guard: parent_pcode comes out of published boundary files
        # and nothing in the schema stops one pointing back down at itself.
        by_level, seen = {}, set()
        area = _admin_areas().filter(pcode=pcode).first()
        while area is not None and area.pcode not in seen:
            seen.add(area.pcode)
            if area.level is not None:
                by_level.setdefault(area.level, area.pcode)
            if not area.parent_pcode:
                break
            area = _admin_areas().filter(pcode=area.parent_pcode).first()

        state = by_level.get(LEVEL_STATE, "")
        district = by_level.get(LEVEL_DISTRICT, "")
        # An orphan ADM2 (Abyei) has no ADM1 above it and is offered in the state
        # dropdown, so that is where it has to come back as - otherwise reopening
        # the row would show an empty state and a district with no options above
        # it. See state_choices.
        if district and not state:
            return country, district, ""
        return country, state, district

    def clean(self):
        cleaned = super().clean()
        country = cleaned.get("country")
        state = cleaned.get("state")
        district = cleaned.get("district")

        if not country:
            return cleaned

        # A stale dropdown - the country was changed and the state was not
        # re-picked - must never put a Sudanese polygon on a Chadian insight.
        # This is the same rule AdminArea.iso3 exists to enforce; without it the
        # 14 Areas of Interest once put Sudanese reporting on Amhara. See
        # boundaries/README.md.
        if state:
            area = _admin_areas().filter(pcode=state).first()
            if area is None:
                self.add_error("state", forms.ValidationError(
                    "%(pcode)s is not a place the boundary library holds. Re-pick "
                    "the state or region.", params={"pcode": state}))
                district = None
            elif area.iso3 != country:
                self.add_error("state", forms.ValidationError(
                    "%(name)s is not in the country selected above. Re-pick the "
                    "state or region.", params={"name": area.name}))
                district = None

        if district:
            area = _admin_areas().filter(pcode=district).first()
            if area is None:
                self.add_error("district", forms.ValidationError(
                    "%(pcode)s is not a place the boundary library holds. Re-pick "
                    "the district.", params={"pcode": district}))
            elif area.parent_pcode != state:
                self.add_error("district", forms.ValidationError(
                    "%(name)s is not inside the state or region selected above. "
                    "Re-pick the district.", params={"name": area.name}))

        return cleaned

    def save(self, commit=True):
        """Derive the five machine columns from the deepest selection.

        ONLY when the selection actually changed. Re-deriving on every save
        would quietly destroy two things a reviewer never touched:

          * a row placed below ADM2. The dropdowns cannot express an ADM3, so
            they would overwrite it with the ADM2 above it - or, before the
            ancestor walk in _chain_of, with nothing at all. Opening an insight
            to fix a typo would move it.
          * `match_method`. A row the matcher reached by NAME would be restamped
            "pcode" because a reviewer edited its rejection reason, destroying
            the only record of how far the match actually got.

        So an untouched location is left exactly as the extractor wrote it.
        """
        insight = super().save(commit=False)
        insight.iso3 = self.cleaned_data["country"]

        chain = (
            self.cleaned_data.get("country") or "",
            self.cleaned_data.get("state") or "",
            self.cleaned_data.get("district") or "",
        )
        if self.instance.pk and chain == self._original_chain:
            if commit:
                insight.save()
                self.save_m2m()
            return insight

        pcode = self.cleaned_data.get("district") or self.cleaned_data.get("state") or ""
        area = _admin_areas().filter(pcode=pcode).first() if pcode else None

        if area is None:
            # Country only. "Somewhere in Sudan" and "we do not know where" are
            # the same finding at this resolution, and places.resolve() calls
            # that unmatched - so this does too, rather than inventing a
            # match_method the rest of the codebase would not recognise.
            insight.admin_pcode = None
            insight.admin_level = None
            insight.match_method = "unmatched"
            insight.lat = None
            insight.lon = None
        else:
            insight.admin_pcode = area.pcode
            # Read off the row, NOT inferred from which dropdown it came out of.
            # Abyei is offered in the state slot and is genuinely an ADM2; saying
            # "level 1 because it was picked as a state" would be a lie the
            # dashboard would then draw.
            insight.admin_level = area.level
            insight.match_method = "pcode"
            # A point guaranteed to be INSIDE the polygon - a label position, not
            # an address. Same column places.resolve() copies, same caveat.
            insight.lat = area.center_lat
            insight.lon = area.center_lon

        if commit:
            insight.save()
            self.save_m2m()
        return insight

    class Media:
        js = ("insights/place_picker.js",)


class InsightInlineEditForm(InsightPlaceForm):
    """InsightPlaceForm, narrowed to what a reviewer corrects in the review page.

    A subclass rather than a second form: every rule that makes the place safe
    - the server-side choice rebuild, clean()'s country check, save()'s "only
    re-derive when the pick actually changed" - is inherited, not re-stated.

    The field list exists because InsightPlaceForm uses Meta.exclude, so outside
    the admin's own fieldsets it would render `document` and `job` as selects
    over every document and every job in the database.
    """

    class Meta(InsightPlaceForm.Meta):
        fields = ("quote", "quote_language", "quote_translated", "voice_type",
                  "channel", "stated_on", "place_name_as_written",
                  "people_affected", "severity", "confidence", "method",
                  "status", "rejection_reason")
        exclude = None
