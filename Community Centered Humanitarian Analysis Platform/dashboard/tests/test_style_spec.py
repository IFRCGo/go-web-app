"""Style-spec checks on app.js, because MapLibre rejects a bad layer in silence.

WHY THIS FILE EXISTS. `addLayer()` with an unsupported paint expression does
not throw. It fires an error event and returns having added nothing; the layer's
SOURCE still accepts data, so every later setData() succeeds and the layer
simply never draws. A returnee origin-line layer shipped exactly that way and
survived a green test suite, a clean collectstatic, an HTTP 200 and a grep of
the served file - because none of those opens a map.

These are STRUCTURAL tests over the source text, not behavioural ones. They
cannot prove a layer renders. They can prove the one thing that broke: that a
property MapLibre only evaluates per-zoom is never handed a per-feature
expression.
"""
import re
from pathlib import Path

from django.conf import settings
from django.test import TestCase

APP_JS = Path(settings.BASE_DIR) / "dashboard" / "static" / "dashboard" / "js" / "app.js"

# Paint properties whose expression.parameters in the MapLibre style spec are
# ["zoom"] only - no "feature" - so a ["get"]/["case"]/["match"] value is
# rejected. Verified against the spec embedded in maplibre-gl 4.7.1, the
# version index.html pins.
ZOOM_ONLY_PROPERTIES = ("line-dasharray",)

# The heads of the expression forms that read a feature's own properties.
DATA_DRIVEN = ('["get"', '["case"', '["match"', '["coalesce"', '["feature-state"')


class MapLibreStyleSpecTests(TestCase):
    def source(self):
        return APP_JS.read_text(encoding="utf-8")

    def test_app_js_is_where_we_think_it_is(self):
        self.assertTrue(APP_JS.exists(), f"{APP_JS} not found")

    def test_no_zoom_only_paint_property_is_given_a_data_driven_value(self):
        """The regression that shipped: line-dasharray with ["case", ["get",…]].

        MapLibre 4.7.1 declares line-dasharray property-type "cross-faded" with
        expression.parameters ["zoom"]. A data expression is refused and the
        whole layer is dropped, silently. Two layers with a static dasharray
        each, split by `filter`, is the supported way to say the same thing.
        """
        source = self.source()
        for prop in ZOOM_ONLY_PROPERTIES:
            for match in re.finditer(rf'"{re.escape(prop)}"\s*:\s*', source):
                value = source[match.end():match.end() + 200]
                value = " ".join(value.split())          # collapse newlines
                for form in DATA_DRIVEN:
                    self.assertNotIn(
                        form.replace('"', ''), value[:80].replace('"', ''),
                        f'{prop} is given a data-driven value ({form}). MapLibre '
                        f'4.7.1 evaluates it per ZOOM only and will drop the '
                        f'entire layer without throwing. Split the layer in two '
                        f'and filter instead. Value seen: {value[:80]}')

    def test_the_return_line_layer_exists(self):
        self.assertIn('id: "return-line-layer"', self.source())

    def test_the_cross_border_share_is_never_drawn_as_a_direction(self):
        """DTM publishes ONE undifferentiated "Returned from outside Sudan"
        column and never says which country. An earlier version drew it as a
        dashed line from a fixed anchor east of Sudan, which read as a
        direction the source does not claim. No feature the click handler
        emits may carry abroad:true, and no line may start at that anchor."""
        source = self.source()
        handler = source[source.index("SCOPED TO THE MAP THAT WAS CLICKED"):]
        handler = handler[:handler.index("popupSpecsBuilt = true")]
        self.assertNotIn("abroad: true", handler)
        self.assertNotIn("38.5", handler,
                         "the fabricated off-border anchor is back")

    def test_every_layer_id_is_unique(self):
        """Two addLayer calls sharing an id: the second throws and every layer
        after it in addLayers() is never added."""
        ids = re.findall(r'\bid:\s*"([a-z0-9-]+)"', self.source())
        duplicates = {i for i in ids if ids.count(i) > 1}
        self.assertEqual(duplicates, set(), f"duplicate layer ids: {duplicates}")


class ReturneeLayerWiringTests(TestCase):
    """The wiring that makes the returnee layer appear at all."""

    def source(self):
        return APP_JS.read_text(encoding="utf-8")

    def test_the_layer_file_is_preloaded_not_lazy_loaded(self):
        self.assertIn('"returnee_localities"', self.source())

    def test_the_lines_are_cleared_on_every_render(self):
        """They describe one date. renderReturnees() runs on every timeline
        move, so lines it does not retire would describe the wrong date."""
        source = self.source()
        body = source[source.index("function renderReturnees()"):]
        body = body[:body.index("function pointAt")]
        self.assertIn('setSource("return-lines", empty())', body)
        # Before the toggle check, so the DRAWING path clears them too - not
        # just the switched-off one.
        self.assertLess(body.index('setSource("return-lines", empty())'),
                        body.index("state.showReturnees"))

    def test_there_is_one_returnee_toggle_not_two(self):
        """The outside-Sudan share is a section of one layer's story, not a
        layer of its own: it is the inner disc of the same bubble."""
        source = self.source()
        self.assertIn('layer("#toggle-returnees", "showReturnees")', source)
        self.assertNotIn("showReturneesAbroad", source)

    def test_the_bubble_carries_both_quantities(self):
        """One bubble, two radii: everyone who returned, and the share of them
        who came from outside Sudan."""
        source = self.source()
        self.assertIn('id: "returnee-circles"', source)
        self.assertIn('id: "returnee-abroad-core"', source)
        self.assertIn('"circle-radius": ["get", "radiusAbroad"]', source)

    def test_the_click_handler_scopes_its_draw_to_one_map(self):
        """setSource writes to EVERY live map unless renderTarget names one,
        and it is null during a click - so an unscoped draw puts Sudan's lines
        on the Chad half of a split view."""
        source = self.source()
        # Anchored on the handler's own comment: the scoping helper is
        # defined ABOVE the hitTest call, so slicing from hitTest would
        # cut the very thing this test is looking for.
        handler = source[source.index("SCOPED TO THE MAP THAT WAS CLICKED"):]
        handler = handler[:handler.index("popupSpecsBuilt = true")]
        self.assertIn("renderTarget = m", handler)
        # Exactly ONE write, and it sits inside the scoped helper - between
        # renderTarget being set and being put back. More than one means a
        # later edit added an unscoped draw beside it.
        self.assertEqual(handler.count('setSource("return-lines"'), 1,
                         "every write must go through the scoped helper")
        self.assertLess(handler.index("renderTarget = m"),
                        handler.index('setSource("return-lines"'))
        self.assertLess(handler.index('setSource("return-lines"'),
                        handler.index("renderTarget = previous"))


class RefugeeBubbleBasisTests(TestCase):
    """The bubble follows the basis ladder, not the calendar.

    Egypt is the case that proved it necessary: its portal figure - 1,500,000,
    the government's estimate of Sudanese present - is dated 2025-01-31, while
    UNHCR's annual registered stock of 37,684 is dated 2025-07-01. Picking the
    latest point by DATE drew Egypt as one of the smallest bubbles on the map
    while its own popup reported 1.5m.
    """

    def source(self):
        return APP_JS.read_text(encoding="utf-8")

    def test_the_ladder_is_declared_portal_over_hdx_over_prewar(self):
        source = self.source()
        self.assertIn("BASIS_RANK", source)
        rank = source[source.index("const BASIS_RANK"):]
        rank = rank[:rank.index("\n")]
        self.assertLess(rank.index("prewar"), len(rank))
        for lower, higher in [("prewar: 1", "hdx: 2"), ("hdx: 2", "portal: 3")]:
            self.assertIn(lower, rank)
            self.assertIn(higher, rank)

    def test_the_refugee_bubble_picks_by_basis_not_by_date(self):
        """seriesAt() returns the latest point by date and is the wrong tool
        here; readingAt() walks the ladder."""
        source = self.source()
        body = source[source.index("function renderRefugees"):]
        body = body[:body.index("function ", 40)]
        self.assertIn("readingAt(c.series", body)
        self.assertNotIn("seriesAt(c.series", body,
                         "a date-only pick lets a stale HDX reading displace "
                         "the portal figure - see Egypt")

    def test_readingAt_never_drops_to_a_lower_rung(self):
        """Once a higher basis has reported on or before t, nothing below it
        may win, however much later the lower reading is dated."""
        source = self.source()
        fn = source[source.index("function readingAt"):]
        fn = fn[:fn.index("\n}") + 2]
        self.assertIn("rank > bestRank", fn)
        self.assertIn("rank === bestRank", fn)

    def test_the_popup_marks_which_basis_is_being_shown(self):
        """The bubble and the words under it must not disagree."""
        self.assertIn("— shown", self.source())

    def test_the_portal_is_named_and_linked_not_called_a_workbook(self):
        source = self.source()
        self.assertIn("UNHCR Sudan Situation portal", source)
        self.assertIn("data.unhcr.org/en/situations/sudansituation", source)
        popup = source[source.index('popup(m, "ref-country"'):]
        popup = popup[:popup.index('}, "Refugees — country");')]
        self.assertNotIn("workbook", popup.lower(),
                         "the figures are UNHCR's, read from their portal")
