/* =========================================================================
 * Sudan & Neighbouring countries - Community Centered Humanitarian Analysis
 * =========================================================================
 *
 * WHAT THIS FILE DOES
 * Draws an interactive map of the Sudan displacement crisis and lets you drag
 * a timeline to replay it from 15 April 2023 to today.
 *
 * WHERE THE DATA COMES FROM
 * Nothing is calculated here. The Django pipeline writes ready-made files into
 * dashboard/data/ (see data_pipeline/steps/s05_export.py, s06 and s07),
 * and this file only fetches them and draws them.
 *
 * HOW IT IS ORGANISED - read the sections in this order:
 *   1. SETTINGS      colours, map anchors, and the `state` object
 *   2. HELPERS       small reusable functions (formatting, maths)
 *   3. LOAD          fetch every data file once, at start-up
 *   4. MAP           create the map and declare every layer it can draw
 *   5. RENDER        one render*() function per layer or panel
 *   6. TIMELINE      the slider and the play button
 *   7. CONTROLS      the checkboxes in the left sidebar
 *   8. BOOT          the few lines at the bottom that start everything
 *
 * THE ONE IDEA TO UNDERSTAND
 * `state.current` is the date the timeline is pointing at. Every render*()
 * function asks the same question: "what was true on state.current?" When you
 * drag the slider we change state.current and call renderAll(), which re-runs
 * all of them. That is the whole animation.
 */
"use strict";

/* ========================= 1. SETTINGS ================================== */

const DAY = 86400000;                       // milliseconds in one day
const START = Date.parse("2023-04-15");     // the day the war began

// One representative point per country, used to place the theme bubbles.
// These mirror the "country_anchor" entries in data_pipeline/gazetteer.json.
const ANCHORS = {
  "Chad": [21.3, 13.6], "Egypt": [31.8, 24.5], "South Sudan": [32.8, 11.2],
  "Ethiopia": [36.5, 12.5], "Central African Republic": [22.9, 10.35],
  "Libya": [23.32, 24.18], "Uganda": [32.4, 1.2], "Eritrea": [36.66, 15.11],
  "Sudan": [29.5, 14.5], "Regional": [29.5, 19.5],
};

// ---------------------------------------------------------------- countries
/* The countries the filter offers, in the order they appear in the dropdown:
   Sudan first because it is the origin of the whole crisis, then its
   neighbours alphabetically. Every name here must match the "name" property
   in data/boundaries/admin0.geojson, because that file is what supplies the
   map bounds we zoom to.
   The list comes from the server (dashboard/views.py DASHBOARD_COUNTRIES minus
   any country switched off in Admin), so a hidden country is never offered. */
const COUNTRIES = JSON.parse(document.getElementById("shown-countries").textContent);

/* The seasonal calendar and the food-security files are keyed by ISO3, because
   that is how the database stores them. This turns the dropdown's country name
   into that key. */
const COUNTRY_TO_ISO3 = {
  "Sudan": "SDN", "Chad": "TCD", "Egypt": "EGY", "Ethiopia": "ETH",
  "Libya": "LBY", "South Sudan": "SSD", "Uganda": "UGA",
  "Central African Republic": "CAF", "Eritrea": "ERI",
};

/* Corridor ids in flows.json are built from country slugs - "sudan-chad",
   "chad-sudan-return", "south_sudan-sudan-influx". This turns a slug back into
   the country name the rest of the dashboard uses. */
const SLUG_TO_COUNTRY = {
  sudan: "Sudan", chad: "Chad", egypt: "Egypt", libya: "Libya",
  ethiopia: "Ethiopia", uganda: "Uganda", eritrea: "Eritrea",
  south_sudan: "South Sudan", car: "Central African Republic",
};

/* These datasets describe the inside of Sudan only, so they have nothing to
   show when Sudan is filtered out. Named here so the reason is written down
   once rather than repeated as a magic string in five render functions. */
const SUDAN_ONLY = "Sudan";
// ---------------------------------------------------------------- colours
// Colour is defined ONCE, in the :root block of app.css. This reads those
// same custom properties back out, so the stylesheet stays the only place a
// colour is written down and the map, the legend and the CSS can never drift
// apart. (The stylesheet is a <link> in <head> and this script runs at the
// end of <body>, so the values are always resolved by the time we ask.)
const CSS_VARS = getComputedStyle(document.documentElement);
function paletteColor(name, fallback) {
  const value = CSS_VARS.getPropertyValue(name).trim();
  if (value) return value;
  // Only reachable if someone deletes a token from app.css; a visible wrong
  // colour is easier to debug than an invisible layer MapLibre refused.
  console.warn(`[dashboard] missing CSS colour token ${name}; using ${fallback}`);
  return fallback;
}

// The single colour rule of the whole map:
//   orange = people moving OUT of Sudan   (IFRC "Migration and identity")
//   green  = people moving back INTO Sudan (IFRC "Climate and environment")
const COLOR_OUT = paletteColor("--out", "#ff8200");
const COLOR_IN = paletteColor("--return", "#009775");
// Key events and the brand accent, both from the IFRC reds.
const COLOR_EVENT = paletteColor("--event", "#011e41");
const COLOR_ACCENT = paletteColor("--accent", "#ee2435");
const COLOR_INK = paletteColor("--text", "#011e41");
const COLOR_MUTED = paletteColor("--muted", "#6c757d");
const WHITE = paletteColor("--ifrc-white", "#ffffff");
// Sudanese refugees counted in the host countries.
const COLOR_IDP_LOCALITY = paletteColor("--idp-locality", "#ffb25b");
const COLOR_IDP_STATE = paletteColor("--idp-state", "#958dbe");
const COLOR_IN_HOST = paletteColor("--refugees", "#8dcde2");
const COLOR_RETURNEE = paletteColor("--returnee", "#00ab84");
// Humanitarian service points. Deliberately not one of the pillar colours:
// a service is a response, not a finding about a place.
const COLOR_HSP = paletteColor("--hsp", "#6b3a90");
const COLOR_FIELD = paletteColor("--field-data", "#ee2435");

/* The four theme groups, their display names and their colours. These match
   the "dimension" values the pipeline writes into tags.json, and each one is
   given the IFRC thematic palette that means the same thing.

   THIS OBJECT IS THE SWITCH. Every panel that shows narrative reporting - the
   theme dropdowns, the map pillars, the area popups, Community Insights, the
   theme detail list - walks DIM_META or DIM_ORDER, so a dimension that is not
   named here does not appear anywhere on the page.

   movement_pattern used to be the fifth. It was reporting ABOUT movement,
   counted in mentions, sitting beside a map and a headline row that carry the
   movement itself, counted in people - and the two never agreed. The mention
   counts stay in tags.json; the dashboard now says what it knows about
   movement with the Movement trends graph, which plots people. */
const DIM_META = {
  hazard: { label: "Hazards", color: paletteColor("--dim-hazard", "#d22730") },
  vulnerability: { label: "Vulnerabilities", color: paletteColor("--dim-vulnerability", "#6b3a90") },
  coping: { label: "Coping mechanisms", color: paletteColor("--dim-coping", "#009775") },
  need: { label: "Needs", color: paletteColor("--dim-need", "#1874a0") },
};

/* The order the pillar bands are nested in, outermost first. Hazards are
   outside because they are the thing that happens TO a place; the pillars that
   describe the people there sit within it. */
const DIM_ORDER = ["hazard", "vulnerability", "coping", "need"];
const COLOR_WATER = paletteColor("--water", "#1f9ad6");

/* Which tags make the water worth pointing at. Flooding and water/sanitation
   needs are ABOUT the water; a protection concern in a riverside state is not,
   and lighting the river for it would imply a link the report never made. */
const WATER_TAGS = { hazard: ["flooding"], need: ["water_wash"] };

// EVERYTHING the page currently shows is described by this one object.
// Change something here, call renderAll(), and the map catches up.
const state = {
  data: {},                // every file loaded from data/, keyed by name
  endDate: null,           // the most recent date we have data for
  current: START,          // the date the timeline is pointing at RIGHT NOW
  /* THE WINDOW THE TIMELINE COVERS, set by the two date pickers in the
     timebar. It bounds the slider itself, so dragging cannot leave it either,
     and it is what play runs between. rangeEnd starts as null because
     state.endDate is not known until the data has loaded; initTimeline() fills
     both in. Invariant, kept in setRange(): START <= rangeStart <= rangeEnd
     <= endDate. */
  rangeStart: START,
  rangeEnd: null,
  playing: false,          // is the play button running?
  activeTags: new Set(),   // ticked theme boxes, stored as "dimension|tag"
  /* THE HAZARD DIMENSION IS PICKED IN TWO STEPS, category then sub-hazard,
     against the IFRC hazard codebook. Both sets resolve DOWN into activeTags
     above, which is what lets Trends, Top reported hazards and Community
     Insights go on reading the one flat set they always have. */
  activeHazards: new Set(),      // codebook category keys
  activeSubHazards: new Set(),   // sub-hazard keys within them
  /* THE COUNTRY FILTER. Empty means "no filter - show everything", which is
     not the same as "no countries selected". Every filter test in this file
     goes through countryOn() below, so that distinction is made in exactly
     one place. */
  countries: new Set(),
  voiceSearch: "",         // text typed into the Community Insights search box
  voiceTab: "community",   // which Community Insights tab is showing
  /* THE STATEMENTS PICKED BY CLICKING A MAP BUBBLE - a Set of insight ids, or
     null for "nothing selected, show the month". Deliberately plain state and
     not keyed by map, unlike areaDetailByMap: this is one selection for the
     one sidebar panel, so a click in either half of a split view replaces it
     rather than each half owning its own. It narrows WITHIN the month; it
     never widens past it, because the bubble that produced it is itself
     filtered to the month (see insightInMonth). */
  voiceSelection: null,
  /* The three lines of the Movement trends graph, worked out once per FILTER
     change rather than per timeline move - see computeTrendSeries(). */
  trend: { series: [], vmax: 1 },
  // Which layers are switched on. These match the checkboxes in index.html.
  showFlows: true, showReturns: true, showEvents: true,
  showIDP: false, showIDPStates: false, showReturnees: false,
  showRefugees: false,
  showRefugeeCamps: false, showFoodsec: false,
  showCrossings: true, showAOI: false, showHSP: false, showFieldData: true,
  fieldClosed: new Set(),  // survey cards folded in the Community tab (by pcode|type)
  fieldFull: new Set(),    // survey cards showing every answer, not the top few
};

/* ========================= 2. HELPERS =================================== */

/* IPC republishes its food-security map a few times a year. This finds the
   most recent published version that existed on the timeline date `t`. */
function ipcPeriodAt(t, payload) {
  const dates = (payload && payload._meta && payload._meta.dates) || [];
  let d = null;
  for (const dt of dates) { if (Date.parse(dt) <= t) d = dt; }
  return d;
}

const $ = (s) => document.querySelector(s);   // shorthand for "find this element"
// 1234567 -> "1.2M";  4500 -> "5K";  120 -> "120"
const fmtNum = (v) => v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : v >= 1e3 ? Math.round(v / 1e3) + "K" : String(v);
const fmtDate = (t) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const monthKey = (t) => new Date(t).toISOString().slice(0, 7);   // -> "2024-08"
/* The format <input type="date"> reads and writes. UTC, like START and
   monthKey, so a date put into a picker comes back out as the same day. */
const ymd = (t) => new Date(t).toISOString().slice(0, 10);       // -> "2024-08-01"

/* THE most-used function in this file.

   Our data is a list of dated readings, taken irregularly. To show a number
   for any day the user drags to, we take the most recent reading on or before
   that day - exactly how a real situation report reads: the last figure
   published still stands until a newer one arrives. Returns null when nothing
   had been reported yet. */
function seriesAt(series, t) {
  let v = null;
  for (const p of series) {
    if (Date.parse(p.date) > t) break;
    v = p.value;
  }
  return v;
}

/* Build a gently curved line between two points, so movement arrows stay
   readable instead of becoming straight-line spaghetti. `bend` controls how
   far the curve bulges sideways; a negative bend curves the other way, which
   is how the outbound (red) and return (green) arrows on the same route are
   kept apart. */
function arc(o, d, bend = 0.18, steps = 40) {
  const mx = (o[0] + d[0]) / 2, my = (o[1] + d[1]) / 2;
  const dx = d[0] - o[0], dy = d[1] - o[1];
  const cx = mx - dy * bend, cy = my + dx * bend;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const s = i / steps, u = 1 - s;
    pts.push([u * u * o[0] + 2 * u * s * cx + s * s * d[0],
              u * u * o[1] + 2 * u * s * cy + s * s * d[1]]);
  }
  return pts;
}

/* ================= 2b. WHICH COUNTRY IS THIS? ==========================
 * Only three of the data files say which country a row belongs to. For
 * everything else the country has to be worked out, and this section is
 * where that happens. It runs ONCE, at start-up (deriveCountries below), and
 * writes the answer onto the data, so that dragging the timeline never pays
 * for any of it.
 * ======================================================================== */

/* Is the point (x, y) inside this ring? The standard ray-casting test: walk
   the ring's edges and count how many cross a horizontal line running east
   from the point. An odd count means inside. */
function ringContains(ring, x, y) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

/* The same test for a whole Polygon or MultiPolygon. Ring 0 of each polygon
   is its outline and any further rings are holes punched out of it, so a
   point inside a hole is NOT inside the country. */
function polyContains(geom, x, y) {
  const polys = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
  for (const rings of polys) {
    if (!ringContains(rings[0], x, y)) continue;
    let inHole = false;
    for (let r = 1; r < rings.length; r++) if (ringContains(rings[r], x, y)) inHole = true;
    if (!inHole) return true;
  }
  return false;
}

/* The smallest west/south/east/north box containing a geometry. */
function geomBBox(geom) {
  let w = 180, s = 90, e = -180, n = -90;
  (function walk(c) {
    if (typeof c[0] === "number") {
      if (c[0] < w) w = c[0];
      if (c[0] > e) e = c[0];
      if (c[1] < s) s = c[1];
      if (c[1] > n) n = c[1];
    } else for (const part of c) walk(part);
  })(geom.coordinates);
  return [w, s, e, n];
}

// name -> { bbox, geom }, filled by deriveCountries() from admin0.geojson.
const COUNTRY_SHAPES = {};

/* Which country contains this point? Returns null out at sea or outside the
   eight countries we hold outlines for. The cheap box test first means the
   expensive ring walk usually runs for one country, not eight. */
function countryAt(lon, lat) {
  if (lon == null || lat == null) return null;
  for (const [name, shape] of Object.entries(COUNTRY_SHAPES)) {
    const [w, s, e, n] = shape.bbox;
    if (lon < w || lon > e || lat < s || lat > n) continue;
    if (polyContains(shape.geom, lon, lat)) return name;
  }
  return null;
}

/* SPLIT VIEW: EACH HALF IS ITS OWN, NARROWER, FILTER.

   The panels down the sides always describe the whole selection. The map
   halves do not: with Sudan and Egypt selected, the left half is Sudan and the
   right half is Egypt, and Aswan - which is in Egypt - must appear only in the
   right half.

   That is what these two variables do. While a half is being drawn,
   `renderScope` holds just that half's country and `renderTarget` holds just
   that half's map, so every filter test below and every setSource() above
   narrows to it without any render function needing to know. Outside that,
   both are null and everything works on the whole selection, exactly as it
   does when the map is not split. */
let renderScope = null;    // the country THIS half is showing, or null for all
let renderTarget = null;   // the map THIS half draws to, or null for every map

// The countries that matter right now: one half's, or the whole selection.
const scopeCountries = () => renderScope || state.countries;

/* THE QUESTION EVERY RENDER FUNCTION ASKS.

   An empty filter means "no filter is applied", so everything passes. That is
   deliberately different from "the user deselected everything": the country
   dropdown's Clear button empties the set and the dashboard returns to showing
   the whole region, which is what people expect from a filter. */
function countryOn(name) {
  const s = scopeCountries();
  return s.size === 0 || s.has(name);
}

// Is any country in this list selected? Used for flows and crossings, which
// join two countries and stay visible if EITHER end is selected.
function anyCountryOn(names) {
  const s = scopeCountries();
  return s.size === 0 || names.some((c) => s.has(c));
}

// Is a filter applied at all? Reads better than checking .size everywhere.
const filtered = () => scopeCountries().size > 0;

/* Rows tagged "Regional" describe the response as a whole rather than any one
   country. They belong in the unfiltered view but would otherwise survive
   every filter, so they are dropped as soon as a country is chosen. */
const countryOnStrict = (name) => (filtered() ? scopeCountries().has(name) : true);

/* Corridors and border crossings join TWO countries, so "which half does this
   belong in?" has a second part to it.

   In the ordinary single map, nothing changes: a corridor shows if either end
   is selected, so picking Sudan alone still shows every route out of Sudan.

   In split view it also has to have its far end inside the selection. Showing
   Sudan beside Egypt should be about Sudan and Egypt: the Sudan-Chad arrow
   would otherwise still be drawn across the Sudan half, which is not what
   "these two countries" means. */
function corridorInScope(names) {
  if (!renderScope) return anyCountryOn(names);
  return names.some((c) => renderScope.has(c)) && names.every((c) => state.countries.has(c));
}

/* The map bounds to fly to for a set of countries: the union of their boxes,
   with a little breathing room, clamped to the region we allow panning in. */
function boundsFor(names) {
  let w = 180, s = 90, e = -180, n = -90;
  for (const name of names) {
    const shape = COUNTRY_SHAPES[name];
    if (!shape) continue;
    w = Math.min(w, shape.bbox[0]); s = Math.min(s, shape.bbox[1]);
    e = Math.max(e, shape.bbox[2]); n = Math.max(n, shape.bbox[3]);
  }
  if (w > e) return HOME_BOUNDS;     // nothing recognised - show the region
  const pad = 0.6;
  // Clamp to the LOCK, not to home: fitting to a box the map may not pan to
  // would leave MapLibre quietly framing something else.
  return [
    [Math.max(PAN_BOUNDS[0][0], w - pad), Math.max(PAN_BOUNDS[0][1], s - pad)],
    [Math.min(PAN_BOUNDS[1][0], e + pad), Math.min(PAN_BOUNDS[1][1], n + pad)],
  ];
}

/* Split a corridor id into the countries at its two ends.
   "sudan-chad" -> [Sudan, Chad];  "south_sudan-sudan-influx" -> [South Sudan,
   Sudan]. The trailing "-return"/"-influx" is a direction, not a place. */
function corridorCountries(cid) {
  const parts = cid.replace(/-(return|influx)$/, "").split("-");
  const out = [];
  for (const slug of parts) {
    const name = SLUG_TO_COUNTRY[slug];
    if (name && !out.includes(name)) out.push(name);
  }
  return out;
}

/* Stamp a country onto every row that does not already carry one. Called once,
   from loadData(), before anything is drawn. */
function deriveCountries() {
  // country outlines, used by countryAt() and boundsFor()
  for (const f of (state.data.admin0 || { features: [] }).features)
    COUNTRY_SHAPES[f.properties.name] = { bbox: geomBBox(f.geometry), geom: f.geometry };

  // flows: from the corridor id
  for (const [cid, c] of Object.entries(state.data.flows)) c.countries = corridorCountries(cid);

  // crossings: the file names the country on the far side; the near side is
  // always Sudan, so a crossing belongs to both.
  for (const c of state.data.crossings.points)
    c.countries = c.country === "Sudan" ? ["Sudan"] : ["Sudan", c.country];

  /* events: located by their coordinates. 26 of the 77 events have none -
     they are narrative items about the crisis as a whole ("the UN welcomed
     the ceasefire") rather than something that happened in one place. They
     are marked Regional: they can never draw on the map anyway, and they stay
     in the timeline list whatever the filter, because dropping the diplomatic
     record from a country view would misrepresent the record. */
  for (const ev of state.data.events)
    ev.country = countryAt(ev.lon, ev.lat) || "Regional";

  /* The Areas of Operation name their country by ISO3 ("TCD", "SDN"), which is
     what build_aoi writes and what admin_areas stores. This was reading them
     through a two-letter table, so EVERY area resolved to null - and because
     filterFC() keeps a feature only when its .country is in scope, picking any
     country at all emptied the layer completely. */
  for (const f of (state.data.aoi || { features: [] }).features)
    f.properties.country = ISO3_TO_COUNTRY[f.properties.ipc_country] || null;
}

/* The polygons the pillars are drawn on, and the rivers beside them, come to
   about 3 MB. Most visits never switch a theme on, so they are fetched the
   first time one is - the same bargain the food-security layer makes. */
let areasLoading = null;
function loadAreas() {
  if (!areasLoading) {
    areasLoading = Promise.all([
      fetch("data/boundaries/areas.geojson").then((r) => r.json()),
      fetch("data/water.geojson").then((r) => r.json()),
    ]).then(([areas, water]) => {
      state.data.areas = areas;
      state.data.water = water;
      // name -> the water bodies beside it, worked out by build_map_context
      state.data.areaById = {};
      for (const f of areas.features) state.data.areaById[f.properties.id] = f.properties;
      // Hand the geometry to every map that already exists.
      for (const m of maps) {
        const src = m.getSource("areas");
        if (src) src.setData(areas);
      }
    });
  }
  return areasLoading;
}

/* WHAT EACH HALF CAN SAY ABOUT ITS AREAS, HELD PER MAP.

   renderThemes() works out the per-area detail the "Community reporting"
   bubble reads, and in split view it runs ONCE PER HALF - each time for a
   different country. A single shared object did not survive the second pass:
   the left half's areas were computed, then overwritten by the right half's,
   so every polygon on the left hovered dead while the right one worked. Keyed
   by map, the way setSource() keys layer data, each half keeps its own
   answer. A WeakMap, so a retired map is not held alive by it. */
const areaDetailByMap = new WeakMap();

/* Keep only the areas in the selected countries. Returns the collection
   unchanged when no filter is on, so the common case copies nothing. */
function filterFC(fc) {
  if (!filtered() || !fc) return fc;
  const s = scopeCountries();
  return { type: "FeatureCollection",
           features: fc.features.filter((f) => s.has(f.properties.country)) };
}

/* ---------------------------------------------------------------- sidebars
   Both sidebars can be dragged wider. The panels carry long place names, whole
   quotes and the ACAPS seasonal descriptions, and at their default width those
   wrap awkwardly - but the default is deliberately unchanged, so the page opens
   exactly as it always has and only widens when someone asks it to.

   The chosen width is remembered per browser. It is a reading preference, not
   data: if localStorage is unavailable or the stored value is nonsense, the
   default stands and nothing breaks.
*/
const SIDEBAR_LIMITS = {
  sidebar:  { varName: "--sidebar-w",  min: 260, max: 720, def: 320, edge: "right" },
  rightbar: { varName: "--rightbar-w", min: 240, max: 640, def: 290, edge: "left" },
};

/* How much smaller than life the page is being drawn - app.css sets zoom on
   <body> from --ui-scale so the dashboard opens at the size it was designed at
   (see the --ui-scale block there). Measured, not read from the property, and
   the same measurement MapLibre makes for its own pointer maths: the rendered
   width against the laid-out width. Returns 1 when nothing is scaled. */
function uiScale() {
  const b = document.body;
  return b.getBoundingClientRect().width / b.offsetWidth || 1;
}

function initSidebarResize() {
  for (const [id, cfg] of Object.entries(SIDEBAR_LIMITS)) {
    const el = document.getElementById(id);
    if (!el) continue;

    const stored = Number(safeGet(`width:${id}`));
    if (stored >= cfg.min && stored <= cfg.max)
      document.documentElement.style.setProperty(cfg.varName, `${stored}px`);

    const grip = document.createElement("div");
    grip.className = "side-grip";
    grip.title = "Drag to resize · double-click to reset";
    grip.dataset.for = id;
    // Beside the panel, not inside it. A handle inside a panel that scrolls is
    // laid out against the scroll origin, so it is only as tall as one
    // screenful and it travels up out of reach as the panel is scrolled - the
    // left sidebar, the one with enough in it to scroll, is where that shows.
    // As a sibling the flex row stretches it over the full height, so the two
    // sides behave alike at any scroll position. See .side-grip in app.css;
    // the dataset name is what the responsive rules there match on to hide a
    // grip together with the panel it belongs to.
    el.insertAdjacentElement(cfg.edge === "right" ? "afterend" : "beforebegin", grip);

    let startX = 0, startW = 0;

    const onMove = (ev) => {
      // The left sidebar grows as the pointer moves right; the right one grows
      // as it moves left, so the delta is signed by which edge is being pulled.
      // Divided by uiScale() because the pointer is reported in real screen
      // pixels while the width we set is a laid-out one - without it the edge
      // moves only 80% as far as the cursor and the grip slides out from under
      // the hand. Measured rather than read from --ui-scale so it is 1, and
      // this a no-op, if the page is ever drawn at its natural size again.
      const raw = cfg.edge === "right" ? ev.clientX - startX : startX - ev.clientX;
      const delta = raw / uiScale();
      const w = Math.round(Math.min(cfg.max, Math.max(cfg.min, startW + delta)));
      document.documentElement.style.setProperty(cfg.varName, `${w}px`);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.classList.remove("resizing");
      grip.classList.remove("dragging");
      const w = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue(cfg.varName), 10);
      safeSet(`width:${id}`, String(w));
      // The map canvas is sized in pixels, so it has to be told the viewport
      // changed - otherwise it keeps the old width and the picture stretches.
      resizeMaps();
    };

    grip.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      startX = ev.clientX;
      startW = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue(cfg.varName), 10) || cfg.def;
      document.body.classList.add("resizing");
      grip.classList.add("dragging");
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });

    grip.addEventListener("dblclick", () => {
      document.documentElement.style.setProperty(cfg.varName, `${cfg.def}px`);
      safeSet(`width:${id}`, String(cfg.def));
      resizeMaps();
    });
  }
}

/* Both map panes, told that their box changed. */
function resizeMaps() {
  for (const m of maps) { try { m.resize(); } catch (e) { /* not ready yet */ } }
}

/* localStorage can throw outright - a private window, or site data blocked - so
   a remembered width must never be able to stop the dashboard loading. */
function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* preference only */ }
}

/* ========================= 3. LOAD ===================================== */

/* Fetch every data file once, at start-up, and remember it in state.data.
   Promise.all downloads them all at the same time rather than one by one. */
async function loadData() {
  const names = ["meta", "flows", "headline", "events", "tags", "documents",
                 "crossings", "idp_localities", "idp_states", "refugee_camps",
                 "seasonal", "returnee_localities", "unhcr_asylum"];
  const res = await Promise.all(names.map((n) => fetch(`data/${n}.json`).then((r) => r.json())));
  names.forEach((n, i) => (state.data[n] = res[i]));
  // boundary context layers (country outlines, state lines, IFRC Areas of Operation + IPC)
  const [admin0, admin1, aoi, hsps] = await Promise.all([
    fetch("data/boundaries/admin0.geojson").then((r) => r.json()),
    fetch("data/boundaries/admin1_lines.geojson").then((r) => r.json()),
    fetch("data/aoi_ipc.geojson").then((r) => r.json()),
    fetch("data/hsps.geojson").then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]);
  state.data.admin0 = admin0; state.data.admin1 = admin1; state.data.aoi = aoi;
  state.data.hsps = hsps;
  /* The hazard vocabulary and the Montandon events. Both tolerate absence: a
     dashboard built before this feature has neither file, and the page must
     still draw - it simply falls back to one flat Hazards dropdown. */
  const [hazardBook, hazardEvents] = await Promise.all([
    fetch("data/hazards.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    fetch("data/hazard_events.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]);
  state.data.hazards = hazardBook;
  state.data.hazardEvents = hazardEvents;
  // Field data: the CCHA household survey, counted per district on Rebuild.
  state.data.field_surveys = await fetch("data/field_surveys.json")
    .then((r) => (r.ok ? r.json() : null)).catch(() => null);
  // Community insights are the one panel that reads the database live, so a
  // statement published in Admin appears on the next refresh. Failure is not
  // fatal: the panel falls back to the analyst snippets from tags.json.
  state.data.insights = await fetch("api/insights/?limit=2000")
    .then((r) => (r.ok ? r.json() : { results: [] }))
    .then((body) => body.results)
    .catch(() => []);
  // ipc_areas_fs.geojson (~2 MB) is lazy-loaded on first food-security toggle
  /* The timeline ends at the newest thing there is to draw. meta.date_max is
     only the newest PDF; a workbook or API figure dated after it would sit past
     the end of the slider and never be shown. data_dates.json (written by the
     Rebuild) carries the newest observation per country, already scrubbed of
     hidden ones. Tolerates absence: a dashboard not yet rebuilt has no file. */
  const dataDates = await fetch("data/data_dates.json")
    .then((r) => (r.ok ? r.json() : null)).catch(() => null);
  state.endDate = Math.max(
    Date.parse(state.data.meta.date_max) || 0,
    ...((dataDates && dataDates.countries) || []).map((c) => Date.parse(c.date) || 0));
  // Work out which country every row belongs to, once, before anything draws.
  deriveCountries();
  $("#last-updated").textContent = fmtDate(state.endDate);
}

/* The document count in the page footer. Unfiltered it is the figure the
   pipeline reported; filtered it is counted from the catalogue, which does
   name a country for every document. */
function renderDocCount() {
  const n = filtered()
    ? state.data.documents.filter((d) => state.countries.has(d.country)).length
    : state.data.meta.documents;
  $("#doc-count").textContent = n.toLocaleString();
}

/* ========================= 4. MAP ====================================== */

/* THE PAGE CAN SHOW MORE THAN ONE MAP.

   Normally there is exactly one. When the user picks exactly two countries in
   the country filter, the map area splits and shows those two side by side.
   That is the only reason this is a list rather than a single object.

   `map` is the FIRST map: the one that scroll-to-a-country and click-an-event
   fly. `maps` is every map currently alive, and every layer update goes to all
   of them through setSource() below, so both halves always show the same
   filtered data - only the viewport differs. */
let map;                 // the primary map (always maps[0])
let mapB = null;         // the right-hand map; built lazily, only if ever needed
const maps = [];         // every live map, in the order they were created

/* TWO DIFFERENT BOXES, and they used to be one - which is why panning out to
   the rest of Africa was impossible without also changing where the map opens.

   PAN_BOUNDS is the LOCK: how far a user may pan and zoom out. It is now the
   whole continent, so neighbouring and coastal countries can be looked at in
   context. The edges take in the islands as well as the mainland - Cape Verde
   reaches 25.4°W and Mauritius 57.8°E, so a mainland-only box (17.5°W to
   51.4°E) would clip them off - with a degree of slack so the outermost
   coastlines are not pinned against the edge of the viewport.

   HOME_BOUNDS is the VIEW: where the map points with no country selected. That
   stays the operational region, because opening on the whole continent would
   push Sudan down to a thumbnail and bury the detail this dashboard exists to
   show. Widening the lock is not the same as changing the subject.

   HOME_BOUNDS's top edge is 34.5°N rather than the region's 32°N because Libya
   reaches 33.18°N: with a lower cap, fitBounds() would silently clamp and never
   frame Libya properly. */
const PAN_BOUNDS  = [[-26.0, -37.0], [64.0, 39.0]];
const HOME_BOUNDS = [[8.0, -3.0], [56.0, 34.5]];

/* ---- Talking to Mapbox --------------------------------------------------

   The basemap under everything else is the official IFRC GO basemap
   ("LIVE - GO - IFRC Basemap v1"), hosted by Mapbox and shared with go.ifrc.org
   so our map reads as an IFRC map. It is named in config/settings.py and
   reaches us through window.BASEMAP, set by the template.

   There is one wrinkle. Mapbox styles address their own pieces with a private
   "mapbox://" scheme instead of ordinary web addresses:

       style   mapbox://styles/go-ifrc/ckrfe16ru4c8718phmckdfjh0
       sprite  mapbox://sprites/go-ifrc/ckrfe16ru4c.../e0kzxuqku4v...
       fonts   mapbox://fonts/mapbox/{fontstack}/{range}.pbf
       source  mapbox://go-ifrc.go-districts-1,go-ifrc.go-countries,...

   Mapbox's own library understands that scheme. MapLibre - the free library we
   draw with - deliberately does not, so left alone it would ask the browser for
   "mapbox://..." and get nothing back: a blank grey map.

   MapLibre hands EVERY address it is about to fetch to transformRequest first,
   which is where mapboxUrl() below steps in and rewrites the four shapes above
   into the real https addresses, adding the access token. Tiles themselves need
   no rewriting: the tile list Mapbox sends back already carries the token. */
const MAPBOX_API = "https://api.mapbox.com";

/* ---- When the basemap is not there -------------------------------------

   THE BASEMAP IS THE ONLY PART OF THIS PAGE OWNED BY SOMEBODY ELSE, and it used
   to be able to take the whole page down with it. initMap resolved only on
   MapLibre's `load` event, so a style that answered 401 left boot() awaiting a
   promise that would never settle: no layers, no timeline, no controls, no
   renderAll(). Every figure on the page had already downloaded and none of it
   was ever drawn.

   Recorded incident, 23 Sep 2026: the public IFRC GO Mapbox token - the one
   go.ifrc.org sends to every visitor, and this project's default - was revoked
   upstream. The dashboard went blank with nothing wrong in it.

   So a dead basemap now costs the backdrop and nothing else. The country
   outlines, state lines and AOI polygons are this app's OWN GeoJSON, drawn from
   dashboard/data/, so the operation is still perfectly legible on a plain
   ground. */
const BASEMAP_FALLBACK = {
  version: 8,
  // A glyph server that needs no key. Without one the four symbol layers draw
  // no text at all - MapLibre does not fall back to a system font.
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {},
  layers: [{
    id: "background", type: "background",
    paint: { "background-color": "#e8eef3" },
  }],
};

/* Which fontstack the symbol layers ask for. ONE PLACE, because a fontstack the
   glyph server does not hold renders nothing - silently. The GO basemap serves
   Open Sans; the token-free fallback above serves Noto. */
let LABEL_FONTS = { bold: ["Open Sans Bold"], regular: ["Open Sans Regular"] };
const FALLBACK_FONTS = { bold: ["Noto Sans Bold"], regular: ["Noto Sans Regular"] };

// Set once, by the first map that fails, and read by every map made afterwards
// so the split view does not go back to asking for a style already known dead.
let basemapFailed = false;

/* Say so, once, in the corner. A missing basemap is not an error the operator
   caused and cannot fix from here, but a map that silently loses its backdrop
   invites the reading that the DATA is missing - which is the one thing it is
   not. */
function noteBasemapUnavailable() {
  if (document.getElementById("basemap-notice")) return;
  const el = document.createElement("div");
  el.id = "basemap-notice";
  el.textContent = "Basemap unavailable — showing boundaries only. "
                 + "Check MAPBOX_ACCESS_TOKEN in .env.";
  el.style.cssText = "position:fixed;bottom:8px;left:8px;z-index:9999;"
    + "background:rgba(0,0,0,.72);color:#fff;font:11px/1.4 system-ui,sans-serif;"
    + "padding:5px 9px;border-radius:4px;max-width:min(92vw,360px);cursor:pointer";
  el.title = "Click to dismiss";
  el.addEventListener("click", () => el.remove());
  document.body.appendChild(el);
}

/* Swap one map onto the plain style and let boot() carry on. */
function useFallbackBasemap(m, done) {
  basemapFailed = true;
  LABEL_FONTS = FALLBACK_FONTS;
  console.warn("basemap unavailable - drawing boundaries without it");
  noteBasemapUnavailable();
  // `styledata`, not `load`: `load` has already been missed on this map, and
  // MapLibre does not fire it again for a style set afterwards.
  m.once("styledata", done);
  m.setStyle(BASEMAP_FALLBACK);
}

/* Rewrite one "mapbox://" address into the https one it stands for. Anything
   that is not a mapbox:// address (our own GeoJSON, the tile requests) comes
   back untouched. */
function mapboxUrl(url, token) {
  if (!url.startsWith("mapbox://")) return url;
  const rest = url.slice("mapbox://".length);
  const sign = (u) => `${MAPBOX_API}${u}${u.includes("?") ? "&" : "?"}access_token=${token}`;

  // mapbox://styles/go-ifrc/ckrfe...  ->  /styles/v1/go-ifrc/ckrfe...
  if (rest.startsWith("styles/")) return sign(`/styles/v1/${rest.slice(7)}`);

  // mapbox://fonts/mapbox/Poppins Regular/0-255.pbf  ->  /fonts/v1/mapbox/...
  if (rest.startsWith("fonts/")) return sign(`/fonts/v1/${rest.slice(6)}`);

  /* mapbox://sprites/go-ifrc/ckrfe.../e0kz...  ->  /styles/v1/.../sprite
     MapLibre appends "@2x" and ".png" or ".json" before we ever see it, and
     those must end up AFTER the word "sprite", not after the style id - which
     is the part that is easy to get wrong. */
  if (rest.startsWith("sprites/")) {
    const m = rest.slice(8).match(/^(.+?)(@[0-9]+x)?\.(png|json)$/);
    if (m) return sign(`/styles/v1/${m[1]}/sprite${m[2] || ""}.${m[3]}`);
  }

  // Anything else is a list of tileset ids; ask for its tile catalogue.
  return sign(`/v4/${rest}.json?secure`);
}

/* Create one map on the IFRC GO basemap, locked to Africa so a user cannot
   accidentally pan away to Europe, but opening on the operational region.
   Resolves once the style has loaded, because layers cannot be added before
   then. */
function initMap(containerId) {
  const basemap = window.BASEMAP || {};
  const m = new maplibregl.Map({
    container: containerId,
    // A second map opened into a split view must not ask again for a style the
    // first one already found dead: it would sit through the whole timeout
    // below before showing anything.
    style: (basemapFailed || !basemap.style) ? BASEMAP_FALLBACK : basemap.style,
    transformRequest: (url) => ({ url: mapboxUrl(url, basemap.token) }),
    center: [29.5, 15.2],
    zoom: 4.35,
    // 2.5, not 3: at zoom 3 a short viewport cannot fit Africa's 76 degrees of
    // latitude, so the new lock would be unreachable from inside the old floor.
    minZoom: 2.5,
    maxBounds: PAN_BOUNDS,
    attributionControl: { compact: true },
  });
  m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

  /* THIS PROMISE MUST ALWAYS SETTLE. boot() awaits it before adding a single
     layer, so a path that leaves it pending is a blank page, not a degraded
     one. There are three ways out and all of them resolve. */
  return new Promise((resolve) => {
    let settled = false;
    const done = () => { if (!settled) { settled = true; resolve(m); } };

    m.on("load", done);

    m.on("error", (e) => {
      if (settled || m.isStyleLoaded()) return;
      // A SOURCE or TILE error is survivable and must not swap the basemap:
      // one missing tile would otherwise pull the whole backdrop out from under
      // a map that was working. Only a failure with no sourceId - the style
      // document itself - means there will never be a `load`.
      if (e && e.sourceId) return;
      useFallbackBasemap(m, done);
    });

    // And a style request that HANGS never fires `error` at all - a blocked
    // host, a captive portal, a proxy swallowing the connection. Nothing on
    // this page is worth more than ten seconds of a blank screen.
    setTimeout(() => { if (!settled) useFallbackBasemap(m, done); }, 10000);
  });
}

/* Hand one layer's shapes to EVERY live map. This is the single choke point
   that makes the split view work: the render*() functions in section 5 do not
   know or care how many maps are on screen. */
function setSource(id, fc) {
  for (const m of (renderTarget ? [renderTarget] : maps)) {
    const src = m.getSource(id);
    if (src) src.setData(fc);
  }
}

/* Declare every layer the map can draw, once, in the order they stack from
   bottom to top. They all start EMPTY: the render*() functions in section 5
   fill them with the right shapes for whatever date the timeline shows. */
function addLayers(m) {
  // ---- IPC food-security choropleth, area level (bottom of the stack) ----
  m.addSource("ipc", { type: "geojson", data: empty() });
  m.addLayer({
    id: "ipc-fill", type: "fill", source: "ipc",
    paint: {
      "fill-color": ["case", [">=", ["get", "ph"], 1], ["get", "color"], "rgba(0,0,0,0)"],
      "fill-opacity": 0.6,
    },
  });
  m.addLayer({
    id: "ipc-line", type: "line", source: "ipc",
    paint: { "line-color": "#0e1116", "line-width": 0.4, "line-opacity": 0.5 },
  });
  m.addLayer({
    id: "ipc-famine", type: "line", source: "ipc",
    filter: ["==", ["get", "fam"], true],
    paint: { "line-color": COLOR_ACCENT, "line-width": 1.8 },
  });

  // ---- boundary context: state lines, country outlines, IFRC Areas of Operation ----
  m.addSource("admin1lines", { type: "geojson", data: state.data.admin1 || empty() });
  m.addLayer({
    id: "admin1-line", type: "line", source: "admin1lines",
    paint: { "line-color": "#bfc4cb", "line-width": 0.6, "line-dasharray": [2, 2] },
  });
  m.addSource("aoi", { type: "geojson", data: empty() });
  /* OUTLINE ONLY. This fill is deliberately invisible and is deliberately still
     here: it is the click target for the area popup (a line layer only catches
     clicks within a couple of pixels of the edge, so without it the popup would
     be unreachable everywhere except on the boundary itself). The IPC phase it
     used to be shaded by is still read - and still named, in the popup - it is
     just no longer painted, because a per-phase fill made the Areas of
     Operation look like fourteen different kinds of thing. */
  m.addLayer({
    id: "aoi-fill", type: "fill", source: "aoi",
    paint: { "fill-color": "rgba(0,0,0,0)", "fill-opacity": 0 },
  });
  m.addLayer({
    id: "aoi-line", type: "line", source: "aoi",
    paint: { "line-color": COLOR_EVENT, "line-width": 1.2 },
  });
  /* The national wash. About two-thirds of tagged reporting names no place
     ("shelter needs remain acute across Chad"), and that reporting is real. It
     shades the whole country in NEUTRAL GREY, darker where there is more of
     it. Grey deliberately: the pillar colours belong to the bands, so a
     colour on this map always names one pillar and the grey always means
     "reported, but not to a place". */
  m.addSource("admin0fill", { type: "geojson", data: state.data.admin0 || empty(),
                              promoteId: "name" });
  m.addLayer({
    id: "country-tint", type: "fill", source: "admin0fill",
    paint: {
      "fill-color": COLOR_INK,
      "fill-opacity": ["coalesce", ["feature-state", "tint"], 0],
    },
  });
  m.addSource("admin0lines", { type: "geojson", data: state.data.admin0 || empty() });
  m.addLayer({
    id: "admin0-line", type: "line", source: "admin0lines",
    paint: { "line-color": "#5b6470", "line-width": 1.3 },
  });

  /* ---- the theme layers: WHERE each pillar is reported -------------------
     The pillars used to be bubbles on a country anchor. They are now drawn on
     the place the report actually named, because "flooding in Northern State"
     and "flooding somewhere in Sudan" are different findings and one bubble in
     the middle of the country said the same thing for both.

     DRAWN EXACTLY LIKE THE IPC CHOROPLETH: a solid fill and a thin dark
     hairline on the admin area, and NOTHING ELSE ON THE EDGE. That last clause
     is the whole lesson of this layer's history.

     WHAT MADE IT LOOK BLOBBY WAS NEVER THE GEOMETRY. The pillars used to draw
     line bands inset from the boundary with line-offset, one step further
     per pillar. line-offset is measured in PIXELS, and at the zoom where a
     Sudanese state fills the screen one pixel is two to five kilometres - so an
     offset of 3.5 to 14px pushed the outline ten to seventy kilometres off the
     boundary, rounding every corner and doubling every edge. The polygons
     underneath were fine all along: the areas this layer draws carry about 27
     vertices per 100km of edge, against 22 for the IPC areas beside them.
     Simplification runs at 550m, a fifth of a pixel at that zoom, and cannot
     bulge anything.

     SO CONVERGENCE MOVED OFF THE EDGE. The pillars are still meant to be
     read together, but an area now shows the HIGHEST-PRECEDENCE pillar reported
     on it and says the rest in its popup, which lists every pillar with its
     tags and counts. Trying to say "three pillars converge here" in the outline
     is what kept the layer unreadable for anyone trying to see where anything
     was at all.

     One source holds all 336 polygons and is set once. What each pillar shows
     on it is carried by FEATURE STATE rather than by four copies of the
     geometry - see renderThemes().

     SEEDED FROM WHAT IS ALREADY LOADED, and this is not optional. Every other
     layer here is filled by a render function, so a map built later fills
     itself on the next redraw. This one is filled ONCE, by loadAreas(), which
     hands the geometry only to the maps that exist the moment its download
     finishes. The second half of the split view is built later than that - the
     first time two countries are picked - so starting it empty left it empty
     for good: renderThemes() then wrote feature states onto features that were
     not there, and the right-hand half could never highlight anything. */
  m.addSource("areas", {
    type: "geojson", data: state.data.areas || empty(), promoteId: "id",
  });
  // The fill, in the leading pillar's colour. Keeps the id "area-wash" because
  // the popup is bound to it; it is no longer a wash in anything but name.
  m.addLayer({
    id: "area-wash", type: "fill", source: "areas",
    paint: {
      "fill-color": ["coalesce", ["feature-state", "topColor"], "rgba(0,0,0,0)"],
      "fill-opacity": ["coalesce", ["feature-state", "wash"], 0],
    },
  });
  /* The hairline that makes a fill read as a place rather than a smudge - the
     same one IPC's areas get. Its opacity is on feature state, NOT a constant:
     an outline drawn on all 245 areas would put a permanent mesh over the map
     and break the rule that admin levels are colourless until a pillar asks
     for them. Only a lit area gets an edge. */
  m.addLayer({
    id: "area-line", type: "line", source: "areas",
    paint: {
      "line-color": "#0e1116", "line-width": 0.5,
      "line-opacity": ["coalesce", ["feature-state", "edge"], 0],
    },
  });

  /* ---- water ------------------------------------------------------------
     Rivers and lakes beside an area that has WATER-RELATED reporting on it -
     flooding, or water and sanitation needs. They pulse, and that is the only
     movement on this map, so it is kept for the case where the water is part
     of the story rather than merely nearby: floods by the Nile light the Nile,
     a protection concern in the same state does not. */
  m.addSource("water", { type: "geojson", data: empty() });
  m.addLayer({
    id: "water-glow", type: "line", source: "water",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": COLOR_WATER,
      "line-width": ["case", ["==", ["get", "kind"], "lake"], 5, 7],
      "line-opacity": 0.35,             // animated by pulseWater()
      "line-blur": 3,
    },
  });
  m.addLayer({
    id: "water-core", type: "line", source: "water",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": COLOR_WATER, "line-width": 1.4, "line-opacity": 0.95 },
  });

  m.addSource("flows", { type: "geojson", data: empty() });
  m.addSource("flow-labels", { type: "geojson", data: empty() });
  m.addSource("events", { type: "geojson", data: empty() });

  m.addLayer({
    id: "flow-lines", type: "line", source: "flows",
    layout: { "line-cap": "round" },
    paint: {
      "line-color": ["get", "color"],
      "line-width": ["get", "width"],
      "line-opacity": 0.8,
    },
  });
  // chevrons repeated along the line, auto-rotated to the direction of travel
  m.addLayer({
    id: "flow-arrows", type: "symbol", source: "flows",
    layout: {
      "symbol-placement": "line",
      "symbol-spacing": 60,
      "text-field": ">",
      "text-size": ["get", "arrowSize"],
      "text-font": LABEL_FONTS.bold,
      "text-keep-upright": false,
      "text-allow-overlap": true,
      "text-rotation-alignment": "map",
    },
    paint: {
      "text-color": ["get", "color"],
      "text-halo-color": WHITE, "text-halo-width": 1.4,
    },
  });
  m.addLayer({
    id: "flow-labels", type: "symbol", source: "flow-labels",
    layout: {
      "text-field": ["get", "label"],
      "text-size": 12,
      "text-font": LABEL_FONTS.bold,
      "text-anchor": "center",
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": ["get", "color"],
      "text-halo-color": WHITE, "text-halo-width": 1.8,
    },
  });
  m.addLayer({
    id: "event-glow", type: "circle", source: "events",
    paint: {
      "circle-radius": ["*", ["get", "size"], 2.1],
      "circle-color": COLOR_EVENT, "circle-opacity": 0.22, "circle-blur": 0.6,
    },
  });
  m.addLayer({
    id: "event-dots", type: "circle", source: "events",
    paint: {
      "circle-radius": ["get", "size"],
      "circle-color": ["case", ["==", ["get", "source"], "curated"], COLOR_EVENT, "#78909c"],
      "circle-stroke-color": WHITE, "circle-stroke-width": 1.4,
      "circle-opacity": ["get", "opacity"],
    },
  });

  /* Community-insight popups are registered FIRST, ahead of every other
     popup() call in this function (Task 12 R4b): POPUP_SPECS order is
     display order, and the community's own words should lead the combined
     bubble, not trail behind an IPC phase or an IDP count. Registering here
     does not require the insight-bubbles LAYER to exist yet - popup() only
     records a layer id string, and sectionsAt() does not look anything up
     until a user actually hovers, long after addLayers() has finished. The
     layer itself is added further down (search "Quote bubbles"),
     deliberately LAST in the stack so it draws on top of everything else
     this map shows (R1).

     ONE BUBBLE CARRIES EVERY STATEMENT AT ITS POINT, and that is the whole
     reason this reads the way it does. An insight is located to an admin
     AREA and drawn at that area's label position, so every statement about
     the same area lands on the SAME coordinate to the last decimal - 18 of
     them on Egypt's centroid in this deployment. MapLibre clustering cannot
     separate coincident points at any zoom, so the cluster layer this
     replaced said "zoom in to read them" and no zoom ever obliged.
     renderInsightBubbles() therefore groups by coordinate itself and hands
     one feature per PLACE, carrying its statements in `items`. Nothing here
     depends on the camera. */
  popup(m, "insight-bubbles", (p, feature, hoveredMap, pinned) => {
    // MapLibre stringifies feature properties, so `items` arrives as JSON
    // text however it was set. Parse defensively: a malformed value must not
    // take the rest of the combined bubble down with it.
    let items = [];
    try { items = JSON.parse(p.items || "[]"); } catch (err) { return null; }
    if (!items.length) return null;

    /* WHERE, SAID ONCE. Every statement in this feature shares the point,
       so it shares the place - repeating it under each quote would imply
       the statements were placed separately, which is exactly what the
       label-position match method does not do. */
    const placed = p.matchMethod === "unmatched" ? "" :
      `<div class="ip-place">Located to ${escapeHTML(p.place)}${
        p.matchMethod === "name" ? " (named area, label position)" : " (p-code)"}</div>`;

    /* A hover bubble follows the mouse and cannot be scrolled (.hover-popup
       is pointer-events: none until pinned), so it shows the first few and
       says how to read the rest. The pinned bubble takes the pointer, gains
       a close button and scrolls, so it shows all of them. */
    const CAP = 3;
    const shown = pinned ? items : items.slice(0, CAP);
    const head = items.length === 1 ? "" :
      `<div class="ip-count">${items.length} statements here</div>`;
    const more = pinned || items.length <= CAP ? "" :
      `<div class="ip-more">…and ${items.length - CAP} more — click to pin and read all ${items.length}</div>`;

    return `<div class="insight-popup">
        ${head}
        ${placed}
        ${shown.map((it) => `<div class="ip-item">
          <div class="ip-voice">${it.voice === "community" ? "Community" : "Analyst"} ${channelBadgeHtml(it.channel)}</div>
          ${fieldContextHtml(it)}
          <blockquote>${escapeHTML(it.quote)}</blockquote>
          <div class="ip-meta">${escapeHTML(it.date || "")}${
            it.source ? ` · ${escapeHTML(it.source)}` : ""}</div>
        </div>`).join("")}
        ${more}
      </div>`;
  }, "Community insights");

  // Events and corridors read on hover like every other layer.
  popup(m, "event-dots", (p) =>
    `<b style="color:${COLOR_EVENT}">${fmtDate(Date.parse(p.date))}</b><br><b>${p.title}</b><br>${p.description || ""}`, "Key event");
  popup(m, "flow-lines", (p) =>
    `<b>${p.name}</b><br>${p.kind}<br><b style="color:${p.color}">${p.labelFull}</b> people (cumulative)`, "Movement corridor");

  // ---- IDP localities (IOM-DTM, admin2) ----
  m.addSource("idp", { type: "geojson", data: empty() });
  m.addLayer({
    id: "idp-circles", type: "circle", source: "idp",
    paint: {
      "circle-radius": ["get", "radius"],
      "circle-color": COLOR_IDP_LOCALITY, "circle-opacity": 0.5,
      "circle-stroke-color": COLOR_IDP_LOCALITY, "circle-stroke-width": 1,
    },
  });

  // ---- IDP by state (admin1, Sudan IDPs.xlsx) ----
  m.addSource("idp-states", { type: "geojson", data: empty() });
  m.addLayer({
    id: "idp-state-circles", type: "circle", source: "idp-states",
    paint: {
      "circle-radius": ["get", "radius"],
      "circle-color": COLOR_IDP_STATE, "circle-opacity": 0.4,
      "circle-stroke-color": COLOR_IDP_STATE, "circle-stroke-width": 1.4,
    },
  });

  // ---- return lines: origin state -> locality of return --------------
  // BELOW the bubbles deliberately, so a line never covers the thing it
  // points at. Filled by the returnee click handler, emptied on a miss.
  m.addSource("return-lines", { type: "geojson", data: empty() });
  /* EVERY LINE HERE GOES STATE -> LOCALITY, because those are the only
     origins DTM publishes. The cross-border share has no line at all; see the
     click handler for why.

     Do not be tempted to distinguish a line by `line-dasharray` driven off a
     feature property. MapLibre 4.7.1 declares that property "cross-faded"
     with expression.parameters ["zoom"] and no "feature", so a data-driven
     value is REJECTED - and addLayer() does not throw. It fires an error
     event and returns having added nothing, the source still accepts data,
     and the layer simply never draws. A dashed-vs-solid split shipped that
     way once and is what dashboard/tests.py now guards. Two layers with a
     static dasharray each, split by `filter`, is the supported way. */
  m.addLayer({
    id: "return-line-layer", type: "line", source: "return-lines",
    paint: {
      "line-color": COLOR_RETURNEE,
      "line-width": ["get", "width"],
      "line-opacity": 0.7,
    },
  });

  /* ---- returnee localities (IOM-DTM snapshots, admin2) ----------------
     ONE SOURCE, TWO CIRCLES, AND THAT IS THE WHOLE BREAKDOWN. The outer
     circle is everyone who returned to this locality; the inner one is the
     share of them who came from OUTSIDE Sudan. Both are areas over the same
     centre, so the ring between them reads as "returned from within Sudan"
     without needing a second toggle or a second legend entry.

     Both radii are sqrt(value)/45, so the two areas are proportional to their
     two counts and to each other - a locality whose returns are mostly
     cross-border shows a nearly solid inner disc, one whose returns are
     internal shows a thin core in a wide ring. */
  m.addSource("returnees", { type: "geojson", data: empty() });
  m.addLayer({
    id: "returnee-circles", type: "circle", source: "returnees",
    paint: {
      "circle-radius": ["get", "radius"],
      "circle-color": COLOR_RETURNEE, "circle-opacity": 0.28,
      "circle-stroke-color": COLOR_RETURNEE, "circle-stroke-width": 1,
    },
  });
  m.addLayer({
    id: "returnee-abroad-core", type: "circle", source: "returnees",
    // A locality with no cross-border returns has no core to draw.
    filter: [">", ["get", "radiusAbroad"], 0],
    paint: {
      "circle-radius": ["get", "radiusAbroad"],
      "circle-color": COLOR_RETURNEE, "circle-opacity": 0.75,
      "circle-stroke-width": 0,
    },
  });

  // ---- refugees: host-country totals + curated camp markers ----
  m.addSource("refcountry", { type: "geojson", data: empty() });
  m.addLayer({
    id: "ref-country", type: "circle", source: "refcountry",
    paint: {
      "circle-radius": ["get", "radius"],
      "circle-color": COLOR_IN_HOST, "circle-opacity": 0.22,
      "circle-stroke-color": COLOR_IN_HOST, "circle-stroke-width": 1.4,
    },
  });
  m.addSource("refcamps", { type: "geojson", data: empty() });
  m.addLayer({
    id: "ref-camps", type: "circle", source: "refcamps",
    paint: {
      "circle-radius": ["get", "radius"],
      "circle-color": COLOR_IN_HOST, "circle-opacity": 0.85,
      "circle-stroke-color": "#0e1116", "circle-stroke-width": 1.2,
    },
  });

  // ---- humanitarian service points ----
  // Drawn as a ring whose size grows with the number of services offered, so a
  // district doing eight things reads as busier than one doing one.
  m.addSource("hsps", { type: "geojson", data: empty() });
  m.addLayer({
    id: "hsp-dots", type: "circle", source: "hsps",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["get", "n_services"], 1, 5, 11, 12],
      "circle-color": COLOR_HSP,
      "circle-opacity": 0.75,
      "circle-stroke-color": WHITE, "circle-stroke-width": 1.6,
    },
  });

  // ---- field data: household surveys ----
  // One marker per surveyed district, never per household: the household's own
  // GPS never reaches the browser. White with a thick IFRC-red ring so it reads
  // apart from the filled insight bubbles and the purple service points.
  m.addSource("field-surveys", { type: "geojson", data: empty() });
  m.addLayer({
    id: "field-survey-dots", type: "circle", source: "field-surveys",
    paint: {
      "circle-radius": 9,
      "circle-color": WHITE,
      "circle-stroke-color": COLOR_FIELD, "circle-stroke-width": 3.5,
    },
  });

  // ---- border crossings ----
  m.addSource("crossings", { type: "geojson", data: empty() });
  m.addLayer({
    id: "crossing-dots", type: "circle", source: "crossings",
    /* THE SAME DOT THE TOGGLE SHOWS: white, one thin muted ring, 10px across -
       .dot-swatch in app.css to the pixel. A crossing used to swell to a red
       disc on dates when people moved through it, which meant the legend's dot
       and the map's dot were two different marks and neither one was "a border
       crossing". Whether a corridor is moving today is now said in the popup,
       where it can be said in people rather than in radius. */
    paint: {
      "circle-radius": 5,
      "circle-color": WHITE,
      "circle-stroke-color": COLOR_MUTED, "circle-stroke-width": 1,
    },
  });
  m.addLayer({
    id: "crossing-labels", type: "symbol", source: "crossings",
    layout: {
      "text-field": ["get", "name"], "text-size": 10, "text-font": LABEL_FONTS.bold,
      "text-offset": [0, 1.1], "text-anchor": "top", "text-optional": true,
    },
    paint: { "text-color": COLOR_INK, "text-halo-color": WHITE, "text-halo-width": 1.6 },
  });

  /* ---- Quote bubbles: community and analyst statements, placed ----------
     Added LAST in this function's layer list, deliberately: it must draw on
     TOP of every choropleth and every other point layer on this map (Task 12
     R1). Its popups are registered near the TOP of addLayers() instead - see
     the comment there for why the two are split.

     Seeded with empty(), like every other layer here; renderInsightBubbles()
     fills it.

     NOT CLUSTERED, and not by oversight. MapLibre clustering was here and had
     to go: insights are placed at an admin area's LABEL POSITION, so every
     statement about one area shares a coordinate exactly, and coincident
     points never separate however far you zoom. The cluster bubble's own text
     was "zoom in to read them", which was advice the map could not honour.
     renderInsightBubbles() groups by coordinate instead and emits one feature
     per place carrying its statements, so the popup reads them where they are.

     SIZE IS A TWO-STATE STEP, NOT A SCALE (R7): 6px for one statement, 11px
     for several - large enough to hold the count glyph, and the same 11px
     whether there are two statements or twenty. A statement is not a
     quantity and a radius that grew with the count would say it was. */
  m.addSource("insight-bubbles", { type: "geojson", data: empty() });
  m.addLayer({
    id: "insight-bubbles", type: "circle", source: "insight-bubbles",
    paint: {
      "circle-radius": ["case", [">", ["get", "n"], 1], 11, 6],
      "circle-color": ["get", "colour"],
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "#fff",
      "circle-opacity": 0.9,
    },
  });
  m.addLayer({
    id: "insight-count", type: "symbol", source: "insight-bubbles",
    filter: [">", ["get", "n"], 1],
    // Named rather than left to MapLibre's default, which is an Open Sans stack
    // the fallback basemap's glyph server does not hold - the counts would
    // vanish exactly when the basemap did.
    layout: {
      "text-field": ["to-string", ["get", "n"]], "text-size": 11,
      "text-font": LABEL_FONTS.regular,
      "text-allow-overlap": true,
    },
    paint: { "text-color": "#fff" },
  });
  /* THE MAP-TO-PANEL LINK. A side effect, not a popup, so it coexists with
     bindPopups()'s click-to-pin handler on the same click (Task 12 R5).
     Registered once per map because addLayers() runs once per map.

     It used to only toggle a highlight on a card that happened to be on
     screen already, on the stated grounds that it "does not switch tabs or
     search to go find it". That rationale no longer holds: the panel showed
     the timeline's month while the bubbles ignored the date entirely, so the
     card to highlight was usually not rendered at all and the click did
     visibly nothing. Both halves now share one date rule (insightInMonth),
     which means every statement in this feature IS in the panel's month, and
     a click can simply narrow the panel to them. Tab and search are still
     left alone - renderInsightBubbles() applies voiceOnTab(), so a bubble
     that can be clicked is on the active tab by construction. */
  m.on("click", "insight-bubbles", (e) => {
    let ids = [];
    try { ids = JSON.parse(e.features[0].properties.ids || "[]"); } catch (err) { return; }
    if (!ids.length) return;
    state.voiceSelection = new Set(ids.map(String));
    renderVoices();
  });

  popup(m, "idp-circles", (p) => `<b>${p.name}</b> <span style="color:${COLOR_MUTED}">(${p.state})</span><br>
    <b style="color:${COLOR_IDP_LOCALITY}">${p.valFull}</b> IDPs · ${p.dateLabel}<br><span style="color:${COLOR_MUTED}">IOM-DTM via HDX</span>`, "IDPs — locality");
  popup(m, "idp-state-circles", (p) => `<b>${p.name}</b> <span style="color:${COLOR_MUTED}">(Sudan — state level)</span><br>
    <b style="color:${COLOR_IDP_STATE}">${p.valFull}</b> IDPs · ${p.dateLabel}<br><span style="color:${COLOR_MUTED}">IOM-DTM / UNHCR (Sudan IDPs.xlsx)</span>`, "IDPs — state");

  popup(m, "returnee-circles", (p) => {
    /* Sectioned on purpose: the two halves of this number answer different
       questions and come with different confidence. "From outside Sudan" is
       a single published figure DTM does not break down by country; "from
       within Sudan" is a matrix it publishes state by state. Running them
       together as one list would imply the first is as detailed as the second.

       Its own try/catch: a section that throws kills the whole bubble, and
       this is the only section on the map that parses JSON out of a property
       - MapLibre stringifies every feature property on the way in. */
    const rule = `border-top:1px solid ${COLOR_MUTED}33;margin:5px 0;`;
    const head = (text) => `<div style="${rule}"></div>
      <div style="font-size:10px;letter-spacing:.06em;color:${COLOR_MUTED};
                  text-transform:uppercase;margin-bottom:2px">${text}</div>`;

    let within = "";
    try {
      const from = JSON.parse(p.from || "{}");
      const states = (state.data.returnee_localities || {}).states || {};
      const rows = Object.entries(from)
        .map(([code, n]) => `<div style="display:flex;justify-content:space-between;gap:12px">
             <span>${(states[code] || {}).name || code}</span><b>${n.toLocaleString()}</b></div>`);
      within = rows.length
        ? rows.join("")
        : `<span style="color:${COLOR_MUTED}">no state breakdown published</span>`;
    } catch (e) {
      within = `<span style="color:${COLOR_MUTED}">breakdown unavailable</span>`;
    }

    /* The outside section is shown even when zero: a locality whose returnees
       are entirely internal is a finding, not a blank. */
    return `<b>${p.name}</b> <span style="color:${COLOR_MUTED}">(${p.state})</span><br>
      <span style="color:${COLOR_MUTED}">${p.dateLabel}</span>
      <div style="${rule}"></div>
      <div style="font-size:15px"><b style="color:${COLOR_RETURNEE}">${p.valFull}</b> returnees</div>

      ${head(`From outside Sudan · ${p.outsidePct}%`)}
      <div style="display:flex;justify-content:space-between;gap:12px">
        <span>All countries</span><b style="color:${COLOR_RETURNEE}">${p.outsideFull}</b></div>
      <div style="color:${COLOR_MUTED};font-size:11px">DTM does not disaggregate this by country</div>
      ${unhcrContext()}

      ${head(`From within Sudan · ${100 - p.outsidePct}%`)}
      <div style="display:flex;justify-content:space-between;gap:12px">
        <span>All states</span><b style="color:${COLOR_RETURNEE}">${p.withinFull}</b></div>
      ${within}

      <div style="${rule}"></div>
      <span style="color:${COLOR_MUTED};font-size:11px">
        ${p.households ? p.households + " households · " : ""}IOM-DTM snapshot via HDX · preliminary</span>`;
  }, "Returnees — locality");
  /* THREE READINGS IN THE ORDER THE TIMELINE MEETS THEM, AND NEVER AN ADDITION.
     A reader who sees them stacked will add them, so this must not imply the
     sum is a total. Usually it is not: Egypt's portal figure (1,500,000, a
     government estimate of Sudanese present) is forty times its HDX registered
     total, and Libya's portal figure exceeds its HDX one too. Each line
     carries its own date and counter, and the footnote names the
     contradiction where it exists.

     The headline is whichever basis the timeline is sitting on, so the bubble
     and the words under it can never disagree. */
  popup(m, "ref-country", (p) => {
    const rule = `border-top:1px solid ${COLOR_MUTED}33;margin:5px 0;`;
    const portalLink = `<a href="${(state.data.refugee_camps || {}).portal_url
      || "https://data.unhcr.org/en/situations/sudansituation"}"
      target="_blank" rel="noopener" style="color:${COLOR_IN_HOST}">
      UNHCR Sudan Situation portal</a>`;
    const line = (label, value, when, who, lead) => !value ? "" : `
      <div style="${rule}"></div>
      <div style="display:flex;justify-content:space-between;gap:14px">
        <span>${label}</span>
        <b style="color:${COLOR_IN_HOST};${lead ? "font-size:15px" : ""}">${value}</b></div>
      <div style="color:${COLOR_MUTED};font-size:11px">${who}${when ? " · " + when : ""}</div>`;

    const SHOWING = `<span style="color:${COLOR_MUTED}"> — shown</span>`;
    const mismatch = p.arrRaw && p.totalRaw && Number(p.arrRaw) > Number(p.totalRaw);

    return `<b style="color:${COLOR_IN_HOST}">${p.country}</b>
      <span style="color:${COLOR_MUTED}">· ${p.dateLabel}</span>

      ${line("Arrived since 15 Apr 2023" + (p.basis === "portal" ? SHOWING : ""),
             p.basis === "portal" ? p.valFull : p.arrFull,
             p.basis === "portal" ? p.dateLabel : p.arrDate,
             portalLink + ", read by the office",
             p.basis === "portal")}

      ${line("All Sudanese refugees" + (p.basis === "hdx" ? SHOWING : ""),
             p.basis === "hdx" ? p.valFull : p.curFull,
             p.basis === "hdx" ? p.dateLabel : p.curDate,
             p.basis === "hdx"
               ? "UNHCR annual stock via HDX — includes the pre-2023 caseload"
               : "UNHCR operational data via HDX — a different count from the annual",
             p.basis === "hdx")}

      ${line("Present before 15 Apr 2023" + (p.basis === "prewar" ? SHOWING : ""),
             p.basis === "prewar" ? p.valFull : p.preFull,
             p.basis === "prewar" ? p.dateLabel : p.preDate,
             "UNHCR via HDX — last count before the war",
             p.basis === "prewar")}

      <div style="${rule}"></div>
      <span style="color:${COLOR_MUTED};font-size:11px">
        ${mismatch
          ? "Different counts on different bases, and they do not reconcile: the portal figure here exceeds the registered total on HDX."
          : "Three separate counts, not parts of one — they do not sum."}</span>`;
  }, "Refugees — country");
  popup(m, "ref-camps", (p) => `<b style="color:${COLOR_IN_HOST}">${p.name}</b><br>${p.type} · ${p.country}<br>
    Opened ${p.opened}<br><span style="color:${COLOR_MUTED}">Location curated (UNHCR RRP); magnitude shown by country total</span>`, "Refugee site");
  /* The highlighted area. Returns null when nothing was reported here, so
     hovering an unhighlighted state stays silent rather than showing an empty
     box - every one of the 336 polygons is in this layer, only some are lit. */
  popup(m, "area-wash", (p, feature, hoveredMap) => {
    /* The third argument is the map UNDER THE CURSOR, not the one this layer
       was registered on: POPUP_SPECS is built once, from the first map, and
       serves both halves. Reading a single shared object here is what left
       the other half with no bubble at all. */
    const pane = areaDetailByMap.get(hoveredMap) || {};
    const detail = (pane.detail || {})[p.id];
    if (!detail) return null;
    const month = monthLabel(pane.mk || monthKey(state.current));
    /* WHERE, SAID ONCE, AND SAID AS A LABEL.

       Every section below is about this one polygon, and the Montandon feed
       carries no coordinates of its own - an event is attached to the area,
       not to a point inside it. Repeating the place under each hazard would
       imply a precision the data does not have, so the bubble names the place
       at the top and every row beneath it inherits that answer. */
    const level = p.level === "adm2" ? " · locality" : p.level === "adm1" ? " · state" : "";
    let html = `<div class="pp-head">
      <div class="pp-kv"><span class="pp-k">Where</span><span class="pp-v"><b>${escapeHTML(p.name)}</b>${
        p.country ? " — " + escapeHTML(p.country) : " — IFRC area of interest"}${level}</span></div>
      <span class="pp-sub">Reporting for ${month}</span></div>`;
    for (const dim of DIM_ORDER) {
      /* HAZARDS ARE THE PILLAR WITH A CODEBOOK ABOVE THEM and a second kind
         of evidence underneath: document mentions and Montandon events, which
         used to be printed as two unrelated blocks at opposite ends of the
         bubble. hazardSectionHtml() folds both into one category/sub-hazard
         tree, so picking "Climatological" reads the same whether the area was
         lit by the event feed, by the corpus, or by both. The other three
         pillars have no codebook to name and keep the tag-and-count shape. */
      if (dim === "hazard") { html += hazardSectionHtml(detail, month); continue; }
      const tags = detail[dim];
      if (!tags) continue;
      const rows = Object.entries(tags).sort((a, b) => b[1] - a[1]);
      const total = rows.reduce((a, r) => a + r[1], 0);
      html += `<div class="pp-dim" style="border-color:${DIM_META[dim].color}">
        <div class="pp-dim-h" style="color:${DIM_META[dim].color}">${DIM_META[dim].label}
          <span class="pp-n">${total} mention${total > 1 ? "s" : ""}</span></div>` +
        rows.map(([tag, n]) =>
          `<div class="pp-row"><span>${escapeHTML(tag.replace(/_/g, " "))}</span><span class="pp-n">${n}</span></div>`).join("");
      // A sentence from the reporting behind the biggest tag, so the number is
      // never the only thing offered as evidence.
      const td = (state.data.tags[dim] || {})[rows[0][0]];
      const quote = td && snippetFor(td, pane.mk || monthKey(state.current));
      if (quote) html += `<div class="pp-quote">“…${escapeHTML(quote.slice(0, 180))}…”</div>`;
      html += `</div>`;
    }
    /* WHY THIS IS PARSED. MapLibre serialises a nested feature property to a
       STRING on the way into the style, so an area that reaches renderThemes()
       as water: ["Lua","Lobaye"] reaches a popup as the JSON text of that list.
       The old code called .slice(0,4).join() on it, which on a string is a
       four-character slice with no .join at all - it threw, the exception left
       the mousemove handler, and NO bubble appeared on any area with water
       beside it, whatever else was under the cursor. hsp-dots already guards
       its own list property this way; this one did not. */
    const water = typeof p.water === "string" ? JSON.parse(p.water || "[]") : (p.water || []);
    if (water.length)
      html += `<div class="pp-water">Water nearby: ${escapeHTML(water.slice(0, 4).join(", "))}</div>`;
    html += `<div class="pp-note">Counts are mentions in the reporting for this month,
      not people affected — the source documents do not give a per-hazard caseload.
      Switch on the IDP or IPC layers for population figures.</div>`;
    return html;
  }, "Community reporting");
  popup(m, "water-core", (p) =>
    `<b style="color:${COLOR_WATER}">${escapeHTML(p.name)}</b>
     <span class="pp-sub">${p.kind}</span>`, "Water");

  popup(m, "crossing-dots", (p) => `<b>${p.name}</b><br>Crossing to ${p.country}<br>
    ${p.active ? `<b style="color:${COLOR_EVENT}">Active corridor</b> — ${p.flowLabel} people moved (cumulative)` : "No recorded movement at this date"}`, "Border crossing");
  popup(m, "ipc-fill", (p) => `<b>${p.area}</b><br>IPC <b>Phase ${p.ph}</b>${p.fam ? ` · <b style="color:${COLOR_ACCENT}">Famine (P5)</b>` : ""}<br>
    ${p.p3 != null ? `<b>${Math.round(p.p3 * 100)}%</b> in Phase 3+ (Crisis or worse)<br>` : ""}
    ${sourceLine(p.src)}`, "Food security");
  popup(m, "hsp-dots", (p) => {
    const services = (typeof p.services === "string" ? JSON.parse(p.services) : p.services) || [];
    /* Almost every marker is a district's point-on-surface, and saying so is the
       whole reason this line exists. The exception is a place no polygon carries
       - a border reception point - which was placed from a real site coordinate
       by hand; telling a reader THAT one is district-level would be the one
       false thing in the bubble. */
    const byHand = p.match_method === "manual";
    return `<b>${escapeHTML(p.place)}</b> <span style="color:${COLOR_MUTED}">(${escapeHTML(p.country || "")})</span><br>
      <b>${p.n_services}</b> service${p.n_services === 1 ? "" : "s"} offered ${byHand ? "here" : "in this district"}<br>
      <span style="color:${COLOR_MUTED}">${services.map(escapeHTML).join(" · ")}</span><br>
      <span style="color:${COLOR_MUTED}">${byHand
        ? "Site coordinate, entered by hand: the source publishes none."
        : "District-level: the source publishes no site coordinates."}</span><br>
      ${sourceLine("kobo", "reported " + (p.date_reported || ""))}`;
  }, "Humanitarian service points");
  /* No popup: the survey's card is in the Community Insights panel, under the
     Community tab. A click on the marker opens that card and brings it into
     view; the marker only needs to look clickable. */
  m.on("click", "field-survey-dots", (e) => {
    const key = e.features[0] && e.features[0].properties.key;
    if (key) focusFieldSurvey(key);
  });
  m.on("mouseenter", "field-survey-dots", () => { m.getCanvas().style.cursor = "pointer"; });
  m.on("mouseleave", "field-survey-dots", () => { m.getCanvas().style.cursor = ""; });
  /* WHERE IFRC WORKS, AND NOTHING ELSE. This bubble used to go on to report the
     worst IPC phase inside the area and the share of its sub-areas in Phase 3+.
     That is a food-security finding; the IPC layer two rows up in the layer
     control exists to say it, says it per area rather than per operation, and
     says it in IPC's own colours. Repeating it here made an IFRC operational
     boundary read as an IPC classification of its own - the same confusion the
     per-phase fill on this layer used to cause before it was taken off.

     The joined phase is still computed and still in the file (see
     s06_mcp_layers.build_aoi); it is simply not this layer's to tell. */
  popup(m, "aoi-fill", (p) => `<b>${p.name}</b> <span style="color:${COLOR_MUTED}">(${p.country || ""})</span><br>
    <b style="color:${COLOR_EVENT}">IFRC Area of Operation</b>`, "IFRC area of operation");

  /* Clicking a returnee bubble draws where those people came back FROM: one
     line per origin state, from that state's centroid, width by its share.

     Registered BEFORE bindPopups() for the same reason the insight-bubbles
     handler is: MapLibre fires same-event listeners in registration order, so
     bindPopups()'s generic click handler would otherwise run first and this
     one would be setting lines that nothing had cleared. Ordering it here
     keeps "clear on a miss" the last word. */
  m.on("click", (e) => {
    /* SCOPED TO THE MAP THAT WAS CLICKED. setSource() writes to every live map
       unless renderTarget names one, and renderTarget is null during a click -
       so without this, clicking a bubble on the Sudan half of a split view
       draws its origin lines across the Chad half too, which renderReturnees()
       has deliberately left empty. Same failure the render globals comment
       upstream describes; the scope is always put back. */
    const draw = (fc) => {
      const previous = renderTarget;
      renderTarget = m;
      try { setSource("return-lines", fc); } finally { renderTarget = previous; }
    };
    const hit = hitTest(m, e.point, "returnee-circles");
    if (!hit.length) { draw(empty()); return; }
    const p = hit[0].properties;
    const [lon, lat] = hit[0].geometry.coordinates;
    const states = (state.data.returnee_localities || {}).states || {};
    let from = {};
    try { from = JSON.parse(p.from || "{}"); } catch (err) { from = {}; }

    const abroad = Number(p.outsideRaw) || 0;
    const total = Object.values(from).reduce((a, b) => a + b, 0) + abroad || 1;
    const feats = [];
    for (const [code, n] of Object.entries(from)) {
      const origin = states[code];
      if (!origin) continue;
      feats.push({
        type: "Feature",
        geometry: { type: "LineString",
                    coordinates: [[origin.lon, origin.lat], [lon, lat]] },
        properties: { width: Math.max(1, Math.min(9, (n / total) * 14)),
                      abroad: false },
      });
    }
    /* THE OUTSIDE-SUDAN SHARE GETS NO LINE, and that is the point.
       DTM publishes one undifferentiated column - "Returned from outside
       Sudan" - and never says which country those people came from. An
       earlier version drew it as a dashed line from a fixed anchor east of
       Sudan; it was meant to read as "from elsewhere" and instead read as a
       direction, which is a claim the source does not make. Splitting it
       across the four return corridors would be worse: a number DTM never
       published, drawn as though it had.

       That share is carried by the bubble's inner disc and by its own popup
       section instead, and the UNHCR panel gives the national-level context
       for where people have been returning FROM. */
    draw({ type: "FeatureCollection", features: feats });
  });

  // Every layer has now said what it would show. From here the registry is
  // closed, and one handler per map serves all of them from a single bubble.
  popupSpecsBuilt = true;
  bindPopups(m);
}

/* ONE hovering bubble per map, reused by every layer.

   Making a new Popup on each mouse move would leave a trail of them behind, so
   each map keeps a single one and just moves it and rewrites its contents. */
const hoverBubbles = new WeakMap();
function hoverBubble(m) {
  if (!hoverBubbles.has(m))
    hoverBubbles.set(m, new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,               // clear of the cursor, so it cannot flicker
      className: "hover-popup",
      maxWidth: "330px",
    }));
  return hoverBubbles.get(m);
}

/* ===================== ONE BUBBLE, NOT FIVE =============================
 * The layers on this map deliberately sit on top of each other: a state can
 * carry a hazard band, a vulnerability band, an IPC phase, IDP figures and a
 * river, all at the same point. Giving each its own popup meant several bubbles
 * stacked on one another, four of them unreadable.
 *
 * So nothing binds its own popup. Each layer REGISTERS what it would say, and
 * one handler per map asks "what is under the cursor?" and writes a single
 * bubble with a section for each answer, in the order below.
 *
 * Hovering shows it. Clicking PINS it: the bubble stops following the mouse,
 * gains a close button and becomes scrollable, so a tall stack of sections can
 * actually be read. Clicking the map again, or the close button, releases it.
 * ======================================================================== */
const POPUP_SPECS = [];     // { layer, title, html } in the order they appear
let popupSpecsBuilt = false;

/* Register what a layer says when the cursor is over it. `html` builds the
   section body from the feature's properties; `title` heads the section when
   several are shown at once. */
function popup(m, layer, html, title) {
  if (!popupSpecsBuilt) POPUP_SPECS.push({ layer, html, title });
}

/* Which map, if any, currently has its bubble pinned open. At most one is
   pinned at a time, but the OTHER half must go on hovering normally while it
   is - so every test below compares it against the map the event came from,
   never just truthiness. `!pinnedOn` froze the second half of a split view
   the moment anything was pinned in the first, which reads as "hovering is
   broken on that map". */
let pinnedOn = null;

/* Everything under the cursor, as ready-to-show sections.

   `pinned` says which of the two bubbles is being built, and is passed on to
   every section body as its FOURTH argument. Almost no layer cares: a section
   normally reads the same either way. The one that does is the community
   insights bubble, where a place can hold twenty statements - far more than a
   bubble that merely follows the mouse can show, and it cannot be scrolled
   because .hover-popup is pointer-events: none until it is pinned. It shows
   the first few on hover and all of them once pinned. Builders that ignore
   the argument are unaffected, which is why it was added at the end. */
function sectionsAt(m, point, pinned) {
  const ids = POPUP_SPECS.map((s) => s.layer).filter((id) => m.getLayer(id));
  let feats = [];
  try {
    feats = m.queryRenderedFeatures(point, { layers: ids });
  } catch (err) {
    return [];                                   // style still loading
  }
  const out = [], seen = new Set();
  for (const spec of POPUP_SPECS) {              // fixed order, not hit order
    for (const f of feats) {
      if (f.layer.id !== spec.layer) continue;
      // One section per feature, not per overlapping copy of it.
      const key = spec.layer + "|" + (f.id != null ? f.id : JSON.stringify(f.properties));
      if (seen.has(key)) continue;
      seen.add(key);
      /* ONE LAYER MUST NOT SILENCE THE REST. These bodies are built from
         feature properties, and a property that is not the shape its layer
         expects used to throw out of the mousemove handler and take the whole
         bubble with it - every other layer under the cursor included. The
         failure is still reported, loudly, in the console; it is simply no
         longer able to make the map look like it has no popups at all. */
      let body = null;
      try {
        body = spec.html(f.properties, f, m, !!pinned);
      } catch (err) {
        console.error(`[dashboard] popup for layer "${spec.layer}" failed`, err);
      }
      if (body) out.push({ title: spec.title, body });
    }
  }
  return out;
}

function showCombined(m, e) {
  const sections = sectionsAt(m, e.point, false);
  const bubble = hoverBubble(m);
  if (!sections.length) { bubble.remove(); m.getCanvas().style.cursor = ""; return; }
  m.getCanvas().style.cursor = "pointer";
  const many = sections.length > 1;
  bubble
    .setLngLat(e.lngLat)
    .setHTML(
      (many ? `<div class="pp-count">${sections.length} layers here</div>` : "") +
      sections.map((s) => `<div class="pp-sec">${
        many && s.title ? `<div class="pp-title">${s.title}</div>` : ""}${s.body}</div>`).join("") +
      `<div class="pp-hint">click to pin${many ? " and scroll" : ""}</div>`)
    .addTo(m);
}

/* Pin the bubble where it is, so it can be read and scrolled. */
function pinBubble(m, e) {
  const sections = sectionsAt(m, e.point, true);
  if (!sections.length) { unpin(); return; }
  unpin();
  pinnedOn = m;
  const bubble = hoverBubble(m);
  bubble.setLngLat(e.lngLat).setHTML(
    `<button type="button" class="pp-close" aria-label="Close">×</button>` +
    (sections.length > 1 ? `<div class="pp-count">${sections.length} layers here</div>` : "") +
    sections.map((s) => `<div class="pp-sec">${
      s.title ? `<div class="pp-title">${s.title}</div>` : ""}${s.body}</div>`).join("")
  ).addTo(m);
  const el = bubble.getElement();
  el.classList.add("pinned");
  const close = el.querySelector(".pp-close");
  if (close) close.addEventListener("click", unpin);
}

function unpin() {
  if (!pinnedOn) return;
  const bubble = hoverBubble(pinnedOn);
  const el = bubble.getElement();
  if (el) el.classList.remove("pinned");
  bubble.remove();
  pinnedOn = null;
}

/* One set of handlers per map, replacing the per-layer ones. */
function bindPopups(m) {
  m.on("mousemove", (e) => { if (pinnedOn !== m) showCombined(m, e); });
  m.on("mouseout", () => { if (pinnedOn !== m) hoverBubble(m).remove(); });
  /* Clicking the pinned half releases it; clicking the other half MOVES the
     pin there, because pinBubble() unpins whatever held it first. Clicking
     bare ground on either half just releases, as it always did.

     A click that MISSED every insight bubble also drops the sidebar's map
     selection: clicking away closes the bubble, and a panel still narrowed to
     statements whose bubble is no longer open is a state a person cannot
     account for. The layer test is not decoration and must not become an
     unconditional clear. addLayers() registers the insight-bubbles click
     handler before it calls bindPopups(), MapLibre fires same-event listeners
     in registration order, so this generic handler runs immediately AFTER the
     one that just set the selection - clearing unconditionally here would
     wipe every selection at the instant it was made, and would look exactly
     like the click doing nothing. */
  m.on("click", (e) => {
    if (!hitTest(m, e.point, "insight-bubbles").length) clearVoiceSelection();
    return pinnedOn === m ? unpin() : pinBubble(m, e);
  });
}

/* Features of one layer under a point, or [] if the layer is not on this map
   yet. Guarded like sectionsAt(): queryRenderedFeatures throws while the
   style is still loading, and a click during boot must not raise. */
function hitTest(m, point, layer) {
  if (!m.getLayer(layer)) return [];
  try {
    return m.queryRenderedFeatures(point, { layers: [layer] });
  } catch (err) {
    return [];
  }
}

// "Draw nothing" - used to clear a layer that is switched off.
const empty = () => ({ type: "FeatureCollection", features: [] });

/* ========================= 5. RENDER ===================================
 * Each function below answers "what should this layer look like on
 * state.current?" and hands the answer to the map. None of them fetch data.
 * ======================================================================== */

/* "sudan-chad" becomes "Sudan > Chad" for display. */
function corridorName(id) {
  return id.replace(/-/g, " → ").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* The movement arrows. Line thickness grows with the number of people (as the
   square root, so a corridor ten times bigger is not drawn ten times fatter),
   and the label in the middle shows the cumulative figure on this date. */
function renderFlows() {
  const t = state.current;
  const lines = [], labels = [];
  for (const [cid, c] of Object.entries(state.data.flows)) {
    const isInflux = cid.endsWith("influx");
    const intoSudan = c.flow_type === "return" || isInflux;   // green family
    if (intoSudan && !state.showReturns) continue;
    if (!intoSudan && !state.showFlows) continue;
    // A corridor stays on the map if EITHER end is a selected country: the
    // Sudan-Chad arrow is part of the Chad picture as much as the Sudan one.
    // In split view it must also stay within the pair - see corridorInScope().
    if (!corridorInScope(c.countries)) continue;
    const v = seriesAt(c.series, t);
    if (!v) continue;
    const color = intoSudan ? COLOR_IN : COLOR_OUT;
    const o = [c.origin.lon, c.origin.lat], d = [c.destination.lon, c.destination.lat];
    const width = Math.max(1, Math.min(5.5, Math.sqrt(v) / 200));
    const bend = !intoSudan ? 0.18 : isInflux ? -0.34 : -0.22;
    const pts = arc(o, d, bend);
    lines.push({
      type: "Feature", geometry: { type: "LineString", coordinates: pts },
      properties: {
        color, width,
        arrowSize: Math.round(8 + width * 2.4),
        name: corridorName(cid),
        kind: isInflux ? "Influx into Sudan" : intoSudan ? "Return movement" : "Cross-border displacement",
        labelFull: v.toLocaleString(),
      },
    });
    labels.push({
      type: "Feature", geometry: { type: "Point", coordinates: pts[Math.floor(pts.length / 2)] },
      properties: { label: fmtNum(v), color },
    });
  }
  setSource("flows", { type: "FeatureCollection", features: lines });
  setSource("flow-labels", { type: "FeatureCollection", features: labels });
}

/* Event dots, plus the banner across the top of the map.

   Recent events (under 45 days old on the timeline) are drawn big and bright.
   Older ones fade, and minor old ones disappear entirely, so the map keeps
   showing what matters now instead of every dot since 2023. */
function renderEvents() {
  const t = state.current;
  const feats = [];
  if (state.showEvents) {
    for (const ev of state.data.events) {
      const et = Date.parse(ev.date);
      if (et > t || !ev.lat) continue;
      if (!countryOn(ev.country)) continue;
      const age = (t - et) / DAY;
      const recent = age < 45;
      if (!recent && ev.severity < 4) continue;       // old minor events fade out
      feats.push({
        type: "Feature", geometry: { type: "Point", coordinates: [ev.lon, ev.lat] },
        properties: {
          title: ev.title, description: (ev.description || "").slice(0, 220),
          date: ev.date, source: ev.source,
          size: 3 + ev.severity * (recent ? 2.2 : 1.1),
          opacity: recent ? 0.95 : 0.45,
        },
      });
    }
  }
  setSource("events", { type: "FeatureCollection", features: feats });
}

/* The banner across the top of the map. It spans BOTH halves, so unlike the
   dots it is worked out once, from the whole selection, rather than per half. */
function renderEventBanner() {
  const t = state.current;
  let banner = null;
  if (state.showEvents) {
    for (const ev of state.data.events) {
      const et = Date.parse(ev.date);
      if (et > t || !countryOn(ev.country)) continue;
      if ((t - et) / DAY >= 45 || ev.source !== "curated") continue;
      if (!banner || Date.parse(banner.date) < et) banner = ev;
    }
  }
  const el = $("#event-banner");
  if (banner) {
    el.innerHTML = `<div class="eb-date">${fmtDate(Date.parse(banner.date))} — ${banner.location || ""}</div>
      <b>${banner.title}</b><br>${banner.description}`;
    el.classList.remove("hidden");
  } else el.classList.add("hidden");
}

// small per-dimension offsets so bubbles of different dimensions don't fully overlap
const DIM_OFFSET = { hazard: [0, 0], vulnerability: [0.55, 0.35], coping: [-0.55, 0.35],
                     need: [0.55, -0.35] };

/* Theme bubbles: for every tag the user ticked, how many times was it
   mentioned in this month of reporting, per country? A bigger bubble means
   more mentions. Each dimension is nudged slightly so bubbles do not hide
   each other. */
/* Write a set of feature states onto one source, on every map being drawn,
   having first cleared whatever was there before. Without the clear, an area
   that stopped being reported would keep last month's band. */
function setStates(sourceId, statesById) {
  for (const m of (renderTarget ? [renderTarget] : maps)) {
    if (!m.getSource(sourceId)) continue;
    m.removeFeatureState({ source: sourceId });
    for (const [id, st] of Object.entries(statesById))
      m.setFeatureState({ source: sourceId, id }, st);
  }
}

/* THE PILLAR LAYERS.

   For the month the timeline is on, and the tags the reader has ticked, this
   answers two questions per pillar:

     which AREAS did the reports name?      -> a band around each one
     how much named no area at all?         -> a grey wash over the country

   Both are drawn from the same rows. A tag row carries a country always and an
   area only when the report said where, so the two totals together are the
   whole of the reporting - nothing is dropped, and the difference between
   "here" and "somewhere in this country" stays visible.

   The bands are set through feature state rather than by rebuilding geometry,
   because the geometry is 2.3 MB and the timeline redraws about eight times a
   second while it plays. */
function renderThemes() {
  const mk = monthKey(state.current);
  const byArea = {};        // area id -> dim -> count
  const unlocated = {};     // country -> count of reporting that named no area
  const waterNames = new Set();
  /* What the popup will say about each area: not just which pillars are on it
     but WHICH TAGS, how many mentions each, and a sentence from the reporting.
     Worked out here because this is the one place that already walks the rows;
     the popup then only has to look it up. */
  const detail = {};

  for (const key of state.activeTags) {
    const [dim, tag] = key.split("|");
    const tagData = (state.data.tags[dim] || {})[tag];
    if (!tagData) continue;
    const isWaterTag = (WATER_TAGS[dim] || []).includes(tag);
    for (const row of tagData.monthly) {
      if (row.month !== mk || !countryOnStrict(row.country)) continue;
      if (row.area) {
        (byArea[row.area] = byArea[row.area] || {})[dim] =
          (byArea[row.area][dim] || 0) + row.count;
        const d = (detail[row.area] = detail[row.area] || {});
        const dd = (d[dim] = d[dim] || {});
        dd[tag] = (dd[tag] || 0) + row.count;
        // Only a water-related tag lights the water beside its area.
        if (isWaterTag && state.data.areaById) {
          for (const w of (state.data.areaById[row.area] || {}).water || []) waterNames.add(w);
        }
      } else {
        unlocated[row.country] = (unlocated[row.country] || 0) + row.count;
      }
    }
  }

  /* MONTANDON EVENTS LIGHT THE SAME POLYGONS. Their counts go into the same
     byArea bucket, so the fill works exactly as it does for document tags, and
     their detail goes into a SEPARATE detail[area].hazardEvents list so the
     popup can tell the two kinds of evidence apart.

     DELIBERATELY NOT MERGED INTO state.data.tags.hazard. Merging would light
     the polygons for free, but monthTagTotals() reads that same object, and
     Top reported hazards would then show 1,668 GDACS fire pixels beside things
     people actually wrote down. */
  const feed = (state.data.hazardEvents || {}).by_sub || {};
  const bySub = state.activeSubHazards.size > 0;
  const eventsSeen = new Set();       // see the concat below
  for (const [sub, subData] of Object.entries(feed)) {
    const picked = bySub ? state.activeSubHazards.has(sub)
                         : state.activeHazards.has(hazardCategoryOf(sub));
    if (!picked) continue;
    for (const row of subData.monthly) {
      if (row.month !== mk || !row.area || !countryOnStrict(row.country)) continue;
      /* A DETECTION DRAWS ONLY UNDER ITS OWN NAME. A Green GDACS fire that
         affected nobody is a satellite observation, not an event; picking the
         whole category must show the fires that mattered. */
      if (row.significance === "detection" && !bySub) continue;
      (byArea[row.area] = byArea[row.area] || {}).hazard =
        (byArea[row.area].hazard || 0) + row.count;
      const d = (detail[row.area] = detail[row.area] || {});
      /* ONE ROW, ONE COPY OF THE EVENT. by_sub.monthly carries a SEPARATE row
         per significance, so an area whose month holds both a recorded event
         and an automated detection of the same sub-hazard arrives here twice -
         and the event list under it, which is filtered by sub and not by
         significance, was concatenated twice with it. 86 area/month/sub
         combinations in the current feed do exactly that, and the popup listed
         their events in duplicate.

         KEYED ON THE EVENT OBJECT, NOT ON ITS FIELDS. Both passes read the same
         events[area][month] array, so a duplicate is literally the same object
         reached twice and identity settles it exactly. A key built from
         sub/date/title looked equivalent and was not: 24 records in the current
         feed share all three with a DIFFERENT record in the same list - two PDC
         flood records for the Logone on 30 July 2025, one carrying 76 impacts
         and one 152 - and collapsing those would silently drop real events. */
      for (const ev of (((state.data.hazardEvents.events || {})[row.area] || {})[mk] || [])) {
        if (ev.sub !== sub || eventsSeen.has(ev)) continue;
        eventsSeen.add(ev);
        (d.hazardEvents = d.hazardEvents || []).push(ev);
      }
    }
  }

  // ---- the bands, one feature state per area -----------------------------
  const areaStates = {};
  for (const [areaId, dims] of Object.entries(byArea)) {
    const st = {};
    /* WHICH PILLAR OWNS THE FILL: the first one present in DIM_ORDER, not the
       most-mentioned one. The workflow this map is for is "put hazards up, add
       vulnerabilities, then look for coping in the same places" - and ranking by
       count breaks it, because adding a second pillar would recolour areas that
       are already on screen the moment its mentions overtook the first. A fixed
       precedence means a hazard area stays hazard-red as more pillars go on. */
    const top = DIM_ORDER.find((d) => dims[d] != null) || null;
    if (top) {
      st.topColor = DIM_META[top].color;
      /* Opacity still carries volume, but over a NARROW band that starts where
         a colour is already unmistakable. The old floor of 0.07 is what made a
         lightly-reported area indistinguishable from an empty one; IPC sits at
         a flat 0.6 and is legible everywhere, so this brackets that. */
      st.wash = Math.max(0.5, Math.min(0.72, 0.46 + Math.sqrt(dims[top]) * 0.05));
      st.edge = 0.55;
    }
    areaStates[areaId] = st;
  }
  setStates("areas", areaStates);
  /* To THIS half when one is being drawn, to every map when a single scope
     is in force - the same rule setSource() follows, for the same reason. */
  for (const tm of (renderTarget ? [renderTarget] : maps))
    areaDetailByMap.set(tm, { detail, mk });
  state.areaMonth = mk;

  // ---- the national wash for reporting that named no place ---------------
  const countryStates = {};
  for (const [country, count] of Object.entries(unlocated)) {
    // "Regional" is a bucket, not a country, so there is no outline to shade.
    if (country === "Regional" || !countryOn(country)) continue;
    countryStates[country] = { tint: Math.max(0.05, Math.min(0.26, Math.sqrt(count) * 0.022)) };
  }
  setStates("admin0fill", countryStates);

  // ---- the water beside the flooded places -------------------------------
  const water = state.data.water;
  setSource("water", water && waterNames.size
    ? { type: "FeatureCollection",
        features: water.features.filter((f) => waterNames.has(f.properties.name)) }
    : empty());
  pulseWater(waterNames.size > 0);
}

/* The pulse on the water.

   A slow sine wave on the glow's opacity, running only while there is water to
   show, so an idle dashboard is not animating an empty layer. The core line
   underneath stays steady, so the river is always readable and it is only the
   halo that breathes. */
let pulseFrame = null;
function pulseWater(on) {
  if (!on) {
    if (pulseFrame) cancelAnimationFrame(pulseFrame);
    pulseFrame = null;
    return;
  }
  if (pulseFrame) return;                      // already running
  const step = () => {
    const o = 0.22 + 0.3 * (0.5 + 0.5 * Math.sin(Date.now() / 620));
    for (const m of maps) {
      if (m.getLayer && m.getLayer("water-glow")) m.setPaintProperty("water-glow", "line-opacity", o);
    }
    pulseFrame = requestAnimationFrame(step);
  };
  pulseFrame = requestAnimationFrame(step);
}

/* The list under the theme toggles: each ticked tag, its mention count for
   this month, and a real sentence from a report (click a row to expand it). */
function renderThemePanel(mk) {
  const el = $("#theme-detail");
  el.innerHTML = "";
  const byDim = {};
  for (const key of state.activeTags) {
    const [dim, tag] = key.split("|");
    (byDim[dim] = byDim[dim] || []).push(tag);
  }
  for (const [dim, tags] of Object.entries(byDim)) {
    const rows = [];
    for (const tag of tags) {
      const tagData = (state.data.tags[dim] || {})[tag];
      if (!tagData) continue;
      const n = tagCount(tagData, mk);
      rows.push([tag, n, snippetFor(tagData, mk)]);
    }
    rows.sort((a, b) => b[1] - a[1]);
    if (!rows.length) continue;
    const g = document.createElement("div");
    g.className = "theme-group";
    g.innerHTML = `<h3 style="color:${DIM_META[dim].color}">${DIM_META[dim].label} — ${new Date(state.current).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h3>`;
    for (const [tag, n, snippet] of rows) {
      const row = document.createElement("div");
      row.className = "tag-row";
      row.innerHTML = `<span>${tag.replace(/_/g, " ")}</span><span class="cnt">${n ? n + " mention" + (n > 1 ? "s" : "") : "no reports"}</span>`;
      g.appendChild(row);
      if (snippet) {
        const sn = document.createElement("div");
        sn.className = "tag-snippet";
        sn.textContent = `“…${snippet}…”`;
        row.addEventListener("click", () => sn.classList.toggle("open"));
        g.appendChild(sn);
      }
    }
    el.appendChild(g);
  }
  if (state.activeTags.size && !el.children.length)
    el.innerHTML = `<div style="font-size:12px;color:var(--muted)">No tagged reporting for this month.</div>`;
}

/* The whole history of one headline figure under the current filter, for the
   trend chart under the timeline.

   Unfiltered, this is the published series untouched. Filtered, there is no
   stored series to read, so one is built: take every date any corridor
   reported on, and ask statAt() for the figure on each. A dozen corridors over
   a few hundred dates is a few thousand lookups, which is why this is called
   only when a filter changes and never while the timeline plays. */
function statSeries(metric) {
  const h = state.data.headline;
  if (!filtered()) return h[metric] ? h[metric].series : [];
  const dates = new Set();
  for (const c of Object.values(state.data.flows)) for (const p of c.series) dates.add(p.date);
  if (metric === "idps" || metric === "total_displaced")
    for (const p of (h.idps ? h.idps.series : [])) dates.add(p.date);
  const out = [];
  for (const d of [...dates].sort()) {
    const v = statAt(metric, Date.parse(d));
    if (v) out.push({ date: d, value: v });
  }
  return out;
}

/* Add up the corridors in the selected countries. `dir` is "out" for people
   leaving Sudan and "in" for people returning to it. Returns null when no
   corridor in the selection had reported anything yet, so the card shows a
   dash rather than a misleading zero. */
function flowSum(t, dir) {
  let total = 0, any = false;
  for (const [cid, c] of Object.entries(state.data.flows)) {
    const isInflux = cid.endsWith("influx");
    const intoSudan = c.flow_type === "return" || isInflux;
    if (dir === "out" ? intoSudan : c.flow_type !== "return") continue;
    if (!anyCountryOn(c.countries)) continue;
    const v = seriesAt(c.series, t);
    if (v) { total += v; any = true; }
  }
  return any ? total : null;
}

/* One headline figure, for the current filter.

   With NO filter this reads headline.json exactly as before, so the four
   numbers at the top of the page are the published ones and never drift.

   With a filter, headline.json cannot help: it has no country dimension. The
   figures are added up from the corridors instead. That substitution was
   checked against the unfiltered baseline before it was relied on - summed
   cross-border corridors come to 3.24M against a published 3.20M at the end
   of 2024, and 4.57M against 4.50M in August 2026, with returns matching to
   within 0.2% - so a filtered total and the headline it came from tell the
   same story.

   IDPs are inside Sudan by definition, so that card has nothing to say unless
   Sudan is among the selected countries. */
function statAt(metric, t) {
  const h = state.data.headline;
  if (!filtered()) return h[metric] ? seriesAt(h[metric].series, t) : null;
  const sudanIn = state.countries.has("Sudan");
  switch (metric) {
    case "cumulative_arrivals": return flowSum(t, "out");
    case "returns_to_sudan_total": return flowSum(t, "in");
    case "idps": return sudanIn ? seriesAt(h.idps.series, t) : null;
    case "total_displaced": {
      const idp = sudanIn ? seriesAt(h.idps.series, t) || 0 : 0;
      const out = flowSum(t, "out") || 0;
      return idp + out || null;
    }
    default: return null;
  }
}

/* The four big numbers at the top. Each also shows a small arrow comparing
   the current value with 30 days earlier - green when the direction is good
   news (returns rising), red when it is bad news (displacement rising).
   When a country filter is on, the cards are marked so a filtered number is
   never mistaken for the published headline. */
function renderStats() {
  const t = state.current;
  const set = (sel, metric, risingIsGood) => {
    const v = statAt(metric, t);
    const prev = statAt(metric, t - 30 * DAY);
    let trend = "";
    if (v && prev && Math.abs(v - prev) > v * 0.005) {
      const up = v > prev;
      const good = up === risingIsGood;
      trend = `<span class="trend" style="color:${good ? COLOR_IN : COLOR_EVENT}">${up ? "▲" : "▼"}</span>`;
    }
    const card = $(sel);
    card.classList.toggle("stat-filtered", filtered());
    // "n/a" and "–" mean different things: no data yet, versus a figure this
    // country selection cannot have.
    const naIDP = metric === "idps" && filtered() && !state.countries.has("Sudan");
    $(sel + " .stat-value").innerHTML = (naIDP ? "n/a" : v ? fmtNum(v) : "–") + trend;
  };
  set("#stat-displaced", "total_displaced", false);
  set("#stat-idps", "idps", false);
  set("#stat-crossborder", "cumulative_arrivals", false);
  set("#stat-returns", "returns_to_sudan_total", true);
}

/* --------- right-hand panel: insights, voices and triggers -------------- */

/* How many times was this tag mentioned in this month, in the countries the
   filter allows? The one place tag counting happens, so the theme panel, the
   bubbles, Trends and Top hazards can never disagree with each other. */
function tagCount(tagData, mk) {
  return tagData.monthly
    .filter((r) => r.month === mk && countryOnStrict(r.country))
    .reduce((a, r) => a + r.count, 0);
}

/* The example sentence for a tag in a month.

   tags.json has held one sentence per tag per month, with no record of which
   country it came from. The pipeline now also emits a country-keyed form
   ({"2024-08": {"Chad": "..."}}), so this reads BOTH shapes: the exact
   sentence for a selected country when the data has it, and the single
   month sentence otherwise. Until the pipeline is next run, a filtered view
   therefore shows the month's sentence whenever the tag was reported in the
   selected countries - close, but not attributed. */
function snippetFor(tagData, mk) {
  const entry = tagData.snippets[mk];
  if (!entry) return null;
  if (typeof entry === "string") return entry;          // the older, month-only shape
  const wanted = filtered() ? [...state.countries] : Object.keys(entry);
  for (const c of wanted) if (entry[c]) return entry[c];
  return filtered() ? null : Object.values(entry)[0] || null;
}

/* Which tags of this dimension has the user picked?

   Returns null when none are picked, meaning "this dimension is unrestricted"
   - which is NOT the same as an empty set. Restricting per dimension is the
   point: choosing two hazards should narrow the hazard reporting without
   silently emptying Needs, which the user never touched. */
function activeTagsIn(dim) {
  const picked = new Set();
  const prefix = dim + "|";
  for (const key of state.activeTags)
    if (key.startsWith(prefix)) picked.add(key.slice(prefix.length));
  return picked.size ? picked : null;
}

/* All tags of one dimension for one month, as [tag, count, sample sentence],
   biggest first.

   This is the single source for Trends, Top hazards, Community Insights and
   the theme panel, so both filters have to be applied HERE or those panels
   drift apart from the map: the country filter through tagCount(), and the
   theme filter through activeTagsIn(). */
function monthTagTotals(dim, mk) {
  const only = activeTagsIn(dim);
  const out = [];
  for (const [tag, tagData] of Object.entries(state.data.tags[dim] || {})) {
    if (only && !only.has(tag)) continue;
    const n = tagCount(tagData, mk);
    if (n) out.push([tag, n, snippetFor(tagData, mk)]);
  }
  return out.sort((a, b) => b[1] - a[1]);
}

/* Plain-English findings for the current date, worked out on the spot: the
   fastest-growing outflow, the direction of returns and of internal
   displacement.

   All three are POPULATION FIGURES, read from the same series the headline row
   and the Movement trends graph read. The panel used to end with the month's
   most-reported hazard and top need, which are mention counts from the
   documents - a different unit answering a different question, and already
   answered better by Top reported hazards and by the theme panel. */
function renderInsights() {
  const t = state.current, el = $("#insight-list");
  const items = [];
  // fastest-growing outflow corridor over the last 90 days
  let best = null;
  for (const [cid, c] of Object.entries(state.data.flows)) {
    if (c.flow_type !== "cross_border" || cid.endsWith("influx")) continue;
    if (!anyCountryOn(c.countries)) continue;
    const now = seriesAt(c.series, t), prev = seriesAt(c.series, t - 90 * DAY);
    if (now && prev && now > prev && (!best || now - prev > best.delta))
      best = { cid, delta: now - prev, now };
  }
  if (best)
    items.push({ ico: "🔺", html: `Largest recent outflow: <b>${corridorName(best.cid)}</b> grew by <b>${fmtNum(best.delta)}</b> people in the last 3 months (now ${fmtNum(best.now)}).` });
  // returns trend - read through statAt() so it follows the country filter
  const rNow = statAt("returns_to_sudan_total", t), rPrev = statAt("returns_to_sudan_total", t - 90 * DAY);
  if (rNow && rPrev && rNow > rPrev)
    items.push({ ico: "🟢", good: true, html: `Returns to Sudan rising: <b>+${fmtNum(rNow - rPrev)}</b> in 3 months, <b>${fmtNum(rNow)}</b> in total.` });
  // IDP direction (inside Sudan only, so it drops out of a Chad-only view)
  const iNow = statAt("idps", t), iPrev = statAt("idps", t - 90 * DAY);
  if (iNow && iPrev && Math.abs(iNow - iPrev) > iNow * 0.02)
    items.push({ ico: iNow > iPrev ? "⚠" : "↩", good: iNow < iPrev,
      html: `Internal displacement ${iNow > iPrev ? "rising" : "falling"}: <b>${fmtNum(iNow)}</b> IDPs (${iNow > iPrev ? "+" : "−"}${fmtNum(Math.abs(iNow - iPrev))} since ${fmtDate(t - 90 * DAY)}).` });
  el.innerHTML = items.length
    ? items.map((i) => `<div class="insight ${i.good ? "good" : ""}"><span class="ico">${i.ico}</span><span>${i.html}</span></div>`).join("")
    : `<div class="panel-note">${filtered()
        ? "Nothing to report for the selected countries on this date."
        : "Drag the timeline forward to see insights build up."}</div>`;
}

// "2024-08" -> "August 2024", for labelling a quote with the month it is from.
const monthLabel = (mk) =>
  new Date(mk + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" });

/* Whether one published insight belongs under the current country and theme
   filters - country through countryOn(), the one function every filter test
   in this file goes through.

   THEME IS DELIBERATELY NOT activeTagsIn(). activeTagsIn()'s own docstring
   says its null-means-unrestricted rule exists so "choosing two hazards
   [can] narrow the hazard reporting without silently emptying Needs" - which
   is right for a PER-DIMENSION display like Top hazards, Trends or the theme
   panel, each of which only ever shows one dimension at a time and so has no
   other dimension to accidentally empty.

   An insight is not per-dimension: it is ONE statement that can carry
   several codings across several dimensions at once. Applying activeTagsIn()
   here made ticking a hazard hide almost nothing, because nearly every real
   statement also carries a needs coding, and a needs coding always passed
   through the untouched Needs dimension's "unrestricted" null. That is the
   opposite of what ticking flooding is for: "only flood-tagged insights
   remain." So with anything ticked at all, an insight now needs ONE of its
   OWN codings to be one of the ticked "dimension|tag" pairs - not merely a
   coding in some other dimension nobody touched.

   With NOTHING ticked in any dimension, every insight passes (state.activeTags
   is empty), matching activeTagsIn()'s "no filter" case. A row with no
   codings at all can only pass that way - it has no tag of its own a ticked
   box could ever match.

   Do not "fix" this by switching to activeTagsIn(): that would re-break the
   bug this predicate exists to avoid. See allVoices()'s and
   renderInsightBubbles()'s comments for why this stays one function.

   THIS FUNCTION IS THE SHARED DEFINITION. Task 12 draws these same insights
   as map bubbles and must call this exact predicate rather than reimplement
   it, or the panel and the map would filter differently and drift apart -
   the same rule the comment on monthTagTotals states for the analyst
   snippets. Deliberately independent of tags.json and of the current month:
   a statement's country and theme do not change with the date, and Task 12
   calls this once per slider tick. THE DATE IS NOT MISSING FROM HERE, IT IS
   ELSEWHERE ON PURPOSE - insightInMonth() below is its companion, and both
   halves call both functions. Do not fold the month into this one: search
   mode in renderVoices() deliberately looks across every month and still
   needs the country and theme test. */
function insightPasses(row) {
  if (!countryOn(ISO3_TO_COUNTRY[row.iso3])) return false;
  if (!state.activeTags.size) return true;
  return (row.codings || []).some((c) => state.activeTags.has(`${c.dimension}|${c.tag}`));
}

/* Whether one statement belongs to the month the timeline is on.

   THE PANEL AND THE MAP MUST AGREE ABOUT WHEN, and this is the single place
   that says so. They did not: the panel has always shown the timeline's month
   and the bubbles showed every published statement regardless of date, so a
   bubble sat on the map at every position of the slider while the panel
   underneath it said "No community statement recorded for this month" - and
   the bubble was, on almost every date, showing a statement from the wrong
   period. One predicate, called by renderInsightBubbles() and by
   renderVoices(), makes "a bubble is here" and "a card is here" the same
   claim in both directions.

   An undated statement matches no month. /api/insights/ emits date: null for
   a row with no stated_on (views.py's own choice), whose month key is "" and
   cannot equal a real one. That is not a special case bolted on: the panel
   has always excluded such a row from every month for exactly this reason,
   and the bubble now follows it rather than parking the statement on an
   arbitrary date. Such a row is still reachable through the search box,
   which looks across all months. */
function insightInMonth(row, mk) {
  return (row.date || "").slice(0, 7) === mk;
}

/* Every quote the panel can show, from both sources, in one shape.

   Two sources, deliberately not merged into one table upstream:
     - tags.json snippets: regex matches on analyst prose, rebuilt by s03_parse
       on every pipeline run. These are secondary_analysis by definition. One
       row per dimension/tag/month, as before - that granularity is right for
       a mention count.
     - /api/insights/: statements a person reviewed and published. ONE row per
       INSIGHT, not one per coding: a statement coded hazard/flooding AND
       need/water_wash is still one thing someone said, and showing it as
       four repeated cards because it touches four themes would be wrong -
       the statement is what was read and verified, not the coding.

   Both filters are applied HERE, as the comment on monthTagTotals requires, so
   the panel and the map cannot drift apart. The insights half of that rule is
   insightPasses() above, kept as its own function for exactly that reason. */
function allVoices() {
  const rows = [];

  // Analyst voice: the regex snippets, exactly as before.
  for (const [dim, tags] of Object.entries(state.data.tags)) {
    if (!DIM_META[dim]) continue;
    const only = activeTagsIn(dim);
    for (const [tag, tagData] of Object.entries(tags)) {
      if (only && !only.has(tag)) continue;
      for (const mk of Object.keys(tagData.snippets)) {
        if (filtered() && !tagCount(tagData, mk)) continue;
        const text = snippetFor(tagData, mk);
        if (text) rows.push({ dim, tag, mk, text, full: text, voice: "secondary_analysis" });
      }
    }
  }

  // Published insights, community and analyst alike - one row per statement,
  // carrying every coding it has so renderVoices() can draw a chip for each.
  for (const row of state.data.insights || []) {
    if (!insightPasses(row)) continue;
    const codings = row.codings || [];
    // dim/tag stand in for the old single chip wherever code still expects
    // one (the border colour, an unfiltered search match): the first coding
    // whose "dimension|tag" key is actually ticked - matching the theme
    // test insightPasses() now uses to let this row through at all - or,
    // when nothing is ticked (or none of the row's own codings are the
    // reason it passed), simply the first coding it carries. Picking a
    // coding that ISN'T one of the ticked keys would show a border colour
    // for a theme the row does not actually match.
    const primary = codings.find((c) => state.activeTags.has(`${c.dimension}|${c.tag}`)) || codings[0];
    const dim = primary && DIM_META[primary.dimension] ? primary.dimension : "need";
    const tag = (primary && primary.tag) || "other";
    rows.push({
      dim, tag, mk: (row.date || "").slice(0, 7),
      text: row.quote, full: row.quote, translated: row.quote_translated,
      voice: row.voice_type, place: row.place_name, date: row.date,
      source: row.source_document, matchMethod: row.match_method,
      lat: row.lat, lon: row.lon, id: row.id, codings,
      channel: row.channel, field_context: row.field_context,
      field_context_answer: row.field_context_answer,
    });
  }

  return rows.sort((a, b) => (a.mk < b.mk ? 1 : a.mk > b.mk ? -1 : 0));
}

/* Whether a voice_type belongs on the currently active Community Insights
   tab. Pulled out on its own (Task 12 R3a) so voicesForTab() (the panel) and
   renderInsightBubbles() (the map) apply exactly one rule between them - two
   copies of "community tab means voice === community" would be free to drift
   the moment either one changed. */
function voiceOnTab(voice) {
  if (state.voiceTab === "community") return voice === "community";
  if (state.voiceTab === "analyst") return voice === "secondary_analysis";
  return true;
}

/* The rows the active tab shows. Search is scoped to this, which is the point
   of the tabs: with Community selected, a search never returns analyst prose. */
function voicesForTab() {
  return allVoices().filter((v) => voiceOnTab(v.voice));
}

/* One badge per coding, in that dimension's colour - a community/API row can
   carry several themes and must show all of them, not just the "primary"
   one used for the card's own border colour. Analyst snippet cards never
   call this: they still carry exactly one dim/tag and print it inline,
   unchanged from before this task. */
function codingChips(codings) {
  if (!codings.length) return '<span class="v-chip v-chip-uncoded">Uncoded</span>';
  return codings.map((c) => {
    const meta = DIM_META[c.dimension];
    return `<span class="v-chip" style="border-color:${meta ? meta.color : "var(--border)"}">${
      escapeHTML(meta ? meta.label : (c.dimension || "Uncoded"))} · ${escapeHTML((c.tag || "").replace(/_/g, " "))}</span>`;
  }).join("");
}

/* Verbatim statements and sentences - the human voice behind the numbers.

   With the search box empty this shows quotes for the month the timeline is
   on, scoped to whichever tab is active: up to one per dimension on Analyst
   (as it always showed), up to twelve on Community/Both, since community
   statements are scarce enough that showing all of them for the month is
   more useful than picking one. Type anything and it searches every quote
   IN THE ACTIVE TAB across the whole archive instead: any single month holds
   only a handful, so a search confined to one month would almost always come
   back empty - and confined to the tab, so Community search never surfaces
   analyst prose. Each result is labelled with its month and clicking it
   moves the timeline there.

   THERE ARE THREE MODES NOW, not two, and they are tested in this order:
   search, then a map selection, then the plain month. A selection is the
   statements behind one bubble that was clicked, and it NARROWS the month
   rather than replacing it - the bubble it came from is itself filtered to
   the month by insightInMonth(), so every selected id is in the month
   already and nothing here has to widen past it. Search beats selection
   because typing is a fresh question; the selection is cleared when it
   happens, in initVoiceSearch(). */
function renderVoices() {
  const el = $("#voices"), q = state.voiceSearch.trim().toLowerCase();
  const searching = q.length > 0;
  const pool = voicesForTab();
  const selection = state.voiceSelection;
  let picks;

  if (searching) {
    // An insight row carries several codings now, not one - match the
    // search text against ANY of them, not just the "primary" dim/tag used
    // for the border colour. Analyst rows have no .codings array and fall
    // through to the single dim/tag they have always carried.
    picks = pool.filter((v) =>
      v.full.toLowerCase().includes(q) ||
      (v.translated || "").toLowerCase().includes(q) ||
      (v.place || "").toLowerCase().includes(q) ||
      (Array.isArray(v.codings)
        ? v.codings.some((c) =>
            (c.tag || "").replace(/_/g, " ").toLowerCase().includes(q) ||
            (DIM_META[c.dimension] ? DIM_META[c.dimension].label : "").toLowerCase().includes(q))
        : v.tag.replace(/_/g, " ").toLowerCase().includes(q) ||
          DIM_META[v.dim].label.toLowerCase().includes(q))).slice(0, 40);
  } else if (selection) {
    /* Exactly the statements behind the clicked bubble, in the panel's own
       sort order. No month test and no cap: the ids came from a bubble that
       insightInMonth() already confined to this month, and a place holding
       twenty statements is precisely the case a click exists to open up -
       truncating it here would put back the "there is more you cannot see"
       problem the bubble had. */
    picks = pool.filter((v) => v.id != null && selection.has(String(v.id)));
  } else {
    const mk = monthKey(state.current);
    const month = pool.filter((v) => v.mk === mk);
    if (state.voiceTab === "analyst") {
      // Keep the old one-per-dimension behaviour: analyst snippets are
      // plentiful, so taking the first three ROWS (not dimensions) would
      // show three tags of the same dimension instead of a spread.
      const seenDims = new Set();
      picks = month.filter((v) => !seenDims.has(v.dim) && seenDims.add(v.dim)).slice(0, 3);
    } else {
      // Community voice is scarce, so show all of it for the month.
      picks = month.slice(0, 12);
    }
  }

  /* The banner above a selection, with the way out of it. A selection is the
     only one of the three modes a person can enter by accident - a click on
     the map, which is also how bubbles get pinned - so it always says what it
     is doing and always offers the month back. */
  const selBanner = selection
    ? `<div class="voices-selected">Showing the ${picks.length} statement${
        picks.length === 1 ? "" : "s"} you clicked on the map.
        <button type="button" class="voices-clear">Show the whole month</button></div>`
    : "";
  const wireClear = () => {
    const btn = el.querySelector(".voices-clear");
    if (btn) btn.addEventListener("click", clearVoiceSelection);
    wireFieldPanel(el);
  };

  // The household-survey card(s), above the month's statements: Community and
  // Both tabs only, and only in the plain month view (see fieldPanelHtml).
  const fieldHtml = !searching && !selection && state.voiceTab !== "analyst"
    ? fieldPanelHtml() : "";

  if (!picks.length) {
    /* An empty selection should not be reachable - the ids came from a bubble
       built out of this same pool. It is handled rather than assumed away
       because the two are rebuilt by different events, and a selection left
       stale by a filter change must not present itself as "this month is
       empty" when the month is not. */
    el.innerHTML = selBanner + fieldHtml + `<div class="voices-empty">${searching
      ? `No quote matches “${escapeHTML(state.voiceSearch)}” in this tab.`
      : selection
        ? "Those statements are no longer in scope under the current filters."
        : state.voiceTab === "community"
          ? "No community statement recorded for this month."
          : "No narrative reporting captured for this month."}</div>`;
    $("#voice-count").textContent = "";
    wireClear();
    return;
  }

  $("#voice-count").textContent = searching
    ? `${picks.length}${picks.length === 40 ? "+" : ""} across all months`
    // Short on purpose: this span floats into the panel heading, and the
    // banner below it is where the selection explains itself at length.
    : selection ? `${picks.length} selected` : "";

  const unmapped = picks.filter((v) => v.voice === "community" && v.lat == null).length;

  el.innerHTML = selBanner + fieldHtml + picks.map((p, i) => `<div class="voice${
      p.voice === "community" ? " is-community" : ""}${searching ? " voice-hit" : ""}${
      selection && p.id != null && selection.has(String(p.id)) ? " is-selected" : ""}"
      style="border-color:${DIM_META[p.dim].color}"
      data-month="${p.mk}" data-i="${i}" data-id="${p.id || ""}">
      ${fieldContextHtml(p)}
      <div class="v-full">${searching ? highlight(p.full, q) : escapeHTML(p.full)}</div>
      ${p.translated ? `<div class="v-translated">${escapeHTML(p.translated)}</div>` : ""}
      <div class="v-meta">
        <span class="v-voice">${p.voice === "community" ? "Community" : "Analyst"}</span> ${channelBadgeHtml(p.channel)}
        ${Array.isArray(p.codings)
          ? codingChips(p.codings)
          : ` · ${DIM_META[p.dim].label} · ${escapeHTML(p.tag.replace(/_/g, " "))}`}
        ${p.place ? ` · ${escapeHTML(p.place)}` : ""} · ${monthLabel(p.mk)}
        ${p.source ? ` · ${escapeHTML(p.source)}` : ""}
      </div>
    </div>`).join("") + (unmapped
      ? `<div class="voices-unmapped">${unmapped} of these could not be placed on the map.</div>`
      : "");

  wireClear();

  if (searching)
    for (const node of el.querySelectorAll(".voice-hit"))
      node.addEventListener("click", () => goToMonth(node.dataset.month));
}

/* Drop a map selection and go back to showing the month.

   Called from the banner's own button, from the search box and the tabs (see
   initVoiceSearch), and from the map's bare-ground click - clicking away
   releases a pinned bubble, and leaving the panel narrowed to statements
   whose bubble is no longer open is the kind of state a person cannot explain
   to themselves. Returns whether anything changed, so the map's click handler
   can avoid a redraw it does not need. */
function clearVoiceSelection() {
  if (!state.voiceSelection) return false;
  state.voiceSelection = null;
  renderVoices();
  return true;
}

/* Quote text comes from PDFs, so it can contain anything. Everything drawn
   from it goes through here before it reaches innerHTML. */
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* Wrap the matched words in a <mark>. The text is escaped first, and the
   query is escaped for the regular expression, so neither can inject markup. */
function highlight(text, q) {
  const safe = escapeHTML(text);
  if (!q) return safe;
  const re = new RegExp(escapeHTML(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return safe.replace(re, (m) => `<mark>${m}</mark>`);
}

/* THE ONE WAY THE TIMELINE MOVES. Four things ask for a different date - the
   slider, the play loop, a month link in the insights panel, and a click on the
   Movement trends graph - and every one of them has to do the same three
   things: set the date, put the slider where the date is, and redraw. Written
   out four times it is four chances for the slider to end up saying one date
   while the map shows another, so it is written once.

   Days, not milliseconds: the slider's resolution is a day, so a date that is
   not on a day boundary would set a slider position that rounds back to a
   different date - and the next drag would jump. */
function setCurrentDate(t) {
  /* Clamped to the picked window, not to the whole war. That is what makes
     every other way of moving the timeline - a month link, a click on the
     trends graph, which still spans everything - respect the filter without
     each of them having to know about it. */
  const days = Math.round((clamp(t, rangeLo(), rangeHi()) - START) / DAY);
  const was = monthKey(state.current);
  state.current = START + days * DAY;
  /* MOVING TO ANOTHER MONTH DROPS A MAP SELECTION. The selection is the
     statements behind one bubble, and the bubbles about to be redrawn are a
     different month's. Left standing it would survive as ids with no bubble,
     and the panel would explain itself with "no longer in scope under the
     current filters" when what actually changed was the date. Set directly
     rather than through clearVoiceSelection(): renderAll() below renders the
     panel anyway. Compared by month, not by timestamp, because dragging the
     slider within one month does not change which statements are in scope and
     should not throw away what a person just clicked. */
  if (monthKey(state.current) !== was) state.voiceSelection = null;
  $("#time-slider").value = days;
  renderAll();
}

function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

/* Move the timeline to the first day of a month and redraw everything.

   mk can be empty or unparseable: /api/insights/ deliberately emits
   date: null for an undated row (views.py's own choice), and allVoices()
   turns that into mk = "". Date.parse("-01") is NaN, and NaN unguarded would
   flow straight into setCurrentDate() -> state.current, then into the next
   renderAll() -> monthKey(NaN) -> new Date(NaN).toISOString(), which THROWS.
   That one click would take down every panel on the page, not just this one -
   so an unparseable month key is a no-op here, before setCurrentDate ever
   sees it. The row itself still renders and stays visible in search results;
   it just is not navigable. This is the only place a month key turns into a
   timestamp, so guarding here covers every caller: the search-result click
   above, and any future month link - including Task 12's map bubbles, which
   read the same allVoices() rows and so can carry the same null date. */
function goToMonth(mk) {
  const t = Date.parse(mk + "-01");
  if (Number.isNaN(t)) return;
  setCurrentDate(t);
}

/* ===================== WHAT THE HAZARD BLOCK SAYS =======================
 * One block, named in the codebook the filters are built from: the category
 * the reader picked, the sub-hazard under it, and when each piece of evidence
 * is dated. Two kinds of evidence sit in that tree and are kept apart by what
 * they are dated to, never merged into one number:
 *
 *   a Montandon event    - an exact day, a title, severity, recorded impacts
 *   a document mention   - a month, and a count of how often it was written
 *
 * NOTHING IS INVENTED TO FILL A GAP. An IDMC-IDU flood carries displacement
 * and no severity; a GDACS fire carries severity and no displacement; an
 * empty field is left out rather than printed as "unknown".
 *
 * SEVERITY IS ALWAYS SHOWN WITH ITS UNIT. GDACS 0.5 "Green" and PDC 0.1
 * "WATCH" are different scales measuring different things, so a bare number
 * would invite a comparison that means nothing.
 * ====================================================================== */
function hazardSectionHtml(detail, month) {
  const idx = hazardBookIndex();
  const cats = new Map();          // category label -> Map(sub key -> entry)
  /* A sub-hazard the codebook does not hold still has to appear - it is what
     the reporting said. It is filed under its own name rather than dropped. */
  const bucket = (subKey) => {
    const meta = idx[subKey] || {};
    const catLabel = meta.catLabel || "Not in the hazard codebook";
    if (!cats.has(catLabel)) cats.set(catLabel, new Map());
    const subs = cats.get(catLabel);
    if (!subs.has(subKey))
      subs.set(subKey, { label: meta.label || subKey.replace(/_/g, " "), mentions: 0, events: [] });
    return subs.get(subKey);
  };
  for (const [tag, n] of Object.entries(detail.hazard || {})) bucket(tag).mentions += n;
  for (const e of detail.hazardEvents || []) bucket(e.sub).events.push(e);
  if (!cats.size) return "";

  const colour = DIM_META.hazard.color;
  let html = `<div class="pp-dim" style="border-color:${colour}">
    <div class="pp-dim-h" style="color:${colour}">${DIM_META.hazard.label}</div>`;
  for (const [catLabel, subs] of cats) {
    html += kvRow("Hazard", escapeHTML(catLabel));
    for (const [subKey, s] of subs) {
      html += kvRow("Sub-hazard", escapeHTML(s.label));
      /* The month, not a day: a mention count is reporting gathered over the
         month the timeline is on, and dating it to a day would be a fiction. */
      if (s.mentions) {
        html += kvRow("When", `${escapeHTML(month)} — <span class="pp-n">${s.mentions} mention${
          s.mentions === 1 ? "" : "s"} in reporting</span>`);
        /* AND THE SENTENCE BEHIND THE NUMBER. Every other pillar block offers
           one, so that the count is never the only thing put forward as
           evidence; hazards would have lost theirs on the way out of the
           DIM_ORDER loop, which is where the other three still get it. */
        const td = (state.data.tags.hazard || {})[subKey];
        const quote = td && snippetFor(td, state.areaMonth || monthKey(state.current));
        if (quote)
          html += `<div class="pp-quote pp-linked">“…${escapeHTML(quote.slice(0, 180))}…”</div>`;
      }
      for (const e of s.events.slice(0, 4)) html += hazardEventRows(e);
      if (s.events.length > 4)
        html += `<div class="pp-detail">…and ${s.events.length - 4} more recorded event${
          s.events.length - 4 === 1 ? "" : "s"} here this month</div>`;
    }
  }
  return html + `</div>`;
}

/* One dated event: the day on the labelled row, everything the record actually
   carries in the smaller line under it. */
function hazardEventRows(e) {
  const bits = [];
  if (e.title) bits.push(escapeHTML(e.title.slice(0, 90)));
  if (e.severity_label)
    bits.push(`severity ${escapeHTML(e.severity_label)} (${escapeHTML(e.severity_unit || "")})`);
  for (const i of e.impacts || [])
    bits.push(`<b>${Number(i.value).toLocaleString()}</b> ${escapeHTML(i.category || "")} ` +
              `${escapeHTML((i.type || "").replace(/_/g, " "))} (${escapeHTML(i.source)})`);
  bits.push(`reported by ${escapeHTML((e.sources || []).join(", "))}`);
  if (e.significance === "detection")
    bits.push(`<i>automated detection, no recorded impact</i>`);
  return kvRow("When", escapeHTML(eventDateLabel(e.date))) +
    `<div class="pp-detail">${bits.join("<br>")}</div>` +
    linkedInsightsHtml(e.insight_ids);
}

/* "2023-04-01" -> "1 Apr 2023". An unparseable date is shown as it was
   recorded rather than silently dropped or guessed at. */
function eventDateLabel(iso) {
  if (!iso) return "date not recorded";
  const t = Date.parse(iso);
  return Number.isNaN(t) ? iso
    : new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* THE COMMUNITY VOICE BEHIND A RECORDED EVENT.

   Montandon events carry insight_ids, and the popup used to print only how
   many there were - a count of evidence is not evidence. Up to two of the
   statements themselves are shown instead.

   The id list is resolved against the insights that are LOADED, which is the
   most recent 2,000. An id that is not among them is reported as a link that
   exists and is not shown, never passed over in silence. */
function linkedInsightsHtml(ids) {
  if (!ids || !ids.length) return "";
  const byId = insightIndex();
  const found = ids.map((id) => byId[id]).filter(Boolean);
  if (!found.length)
    return `<div class="pp-detail">${ids.length} linked community insight${
      ids.length === 1 ? "" : "s"}, outside the loaded set</div>`;
  let html = found.slice(0, 2).map((r) => `<div class="pp-quote pp-linked">“…${
    escapeHTML((r.quote || "").slice(0, 180))}…”<span class="pp-sub">${
    escapeHTML([r.place_name, r.date].filter(Boolean).join(" · "))}</span></div>`).join("");
  if (found.length > 2)
    html += `<div class="pp-detail">…and ${found.length - 2} more linked insight${
      found.length - 2 === 1 ? "" : "s"}</div>`;
  return html;
}

/* Published insights by id. Rebuilt only when the array itself is replaced,
   because a popup is written on every mouse move and this must not walk 2,000
   rows per hover. */
let insightIndexFor = null, insightIndexCache = {};
function insightIndex() {
  const rows = state.data.insights || [];
  if (insightIndexFor === rows) return insightIndexCache;
  const idx = {};
  for (const r of rows) if (r.id != null) idx[r.id] = r;
  insightIndexFor = rows;
  insightIndexCache = idx;
  return idx;
}

/* A labelled row. The label is the whole point of this popup: "Drought" on
   its own does not say whether it is the category, the sub-hazard or a tag. */
function kvRow(key, valueHtml) {
  return `<div class="pp-kv"><span class="pp-k">${key}</span><span class="pp-v">${valueHtml}</span></div>`;
}

/* A small bar chart of the six most-mentioned hazards this month. */
function renderTriggers() {
  const mk = monthKey(state.current), el = $("#triggers");
  const rows = monthTagTotals("hazard", mk).slice(0, 6);
  const max = rows.length ? rows[0][1] : 1;
  el.innerHTML = rows.length
    ? rows.map(([tag, n]) => `<div class="trigger-row">
        <div class="t-label"><span>${tag.replace(/_/g, " ")}</span><span class="t-n">${n}</span></div>
        <div class="trigger-bar"><div style="width:${Math.round((n / max) * 100)}%"></div></div></div>`).join("")
    : `<div style="font-size:12px;color:var(--muted)">No hazards reported this month.</div>`;
}

/* The scrolling timeline list on the right. Shows the 40 most recent events
   up to the current date, newest first; click one to fly the map to it. */
function renderEventList() {
  const t = state.current;
  const el = $("#event-list");
  el.innerHTML = "";
  /* Regional events stay in this list under any filter - they are the
     diplomatic and ceasefire record, which belongs to every country view. */
  const shown = state.data.events
    .filter((e) => Date.parse(e.date) <= t && (e.source === "curated" || e.severity >= 2))
    .filter((e) => e.country === "Regional" || countryOn(e.country))
    .slice(-40).reverse();
  for (const ev of shown) {
    const div = document.createElement("div");
    div.className = `event-item ${ev.source} ${ev.severity >= 4 ? "major" : ""}`;
    div.innerHTML = `<div class="ev-date">${fmtDate(Date.parse(ev.date))}${ev.location ? " · " + ev.location : ""}</div>
      <div class="ev-title">${ev.title}</div>`;
    // In split view, fly the half that is showing this event's country -
    // flying the other one would look like the click did nothing.
    if (ev.lat) div.addEventListener("click", () => mapShowing(ev.country).flyTo({ center: [ev.lon, ev.lat], zoom: 6 }));
    el.appendChild(div);
  }
}

/* ------------- layers built from the humanitarian open-data servers ------
 * (IOM-DTM and UNHCR via HDX, IPC, FEWS NET - see s06_external.py)
 * ----------------------------------------------------------------------- */

/* The date of the most recent reading on or before t, so a popup can say
   "as of 31 May 2026" rather than implying the number is from today. */
function lastDateOnOrBefore(series, t) {
  let d = "";
  for (const p of series) { if (Date.parse(p.date) <= t) d = p.date; }
  return d;
}

/* IPC food-insecurity map: show the analysis that was current on this date. */
/* Food insecurity, for every country in scope rather than Sudan alone.

   Each country is a separate file and keeps its own analysis calendar - IPC
   redraws its units per round and no two countries publish on the same date - so
   the period in effect is worked out PER COUNTRY at the current timeline date and
   the results are concatenated. Showing one global period would blank every
   country that had not published in that particular month. */
function renderFoodsec() {
  if (!state.showFoodsec) { setSource("ipc", empty()); return; }
  const scope = scopeCountries();
  let feats = [];
  for (const [iso3, payload] of Object.entries(state.data.ipcByCountry || {})) {
    const country = ISO3_TO_COUNTRY[iso3];
    if (scope.size && country && !scope.has(country)) continue;
    const d = ipcPeriodAt(state.current, payload);
    if (d && payload.periods[d]) feats = feats.concat(payload.periods[d].features);
  }
  setSource("ipc", { type: "FeatureCollection", features: feats });
}

/* Fetch the food-security file for each country in scope that is not loaded
   yet. One file per country, on demand: together they are far larger than any
   one of them, and a reader looking at Chad has no use for Sudan's polygons. */
async function loadFoodsecForScope() {
  state.data.ipcByCountry = state.data.ipcByCountry || {};
  const scope = scopeCountries();
  const wanted = COUNTRIES
    .filter((c) => !scope.size || scope.has(c))
    .map((c) => COUNTRY_TO_ISO3[c])
    .filter((iso) => iso && IPC_COUNTRIES.includes(iso) && !(iso in state.data.ipcByCountry));
  if (!wanted.length) return;
  const loaded = await Promise.all(wanted.map((iso) =>
    fetch(`data/ipc_fs/${iso}.geojson`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)));
  wanted.forEach((iso, i) => {
    if (!loaded[i]) return;
    // Stamp the country name each area belongs to, once, from the file it came
    // in - no bounding-box guessing needed now that the data carries its iso3.
    for (const fc of Object.values(loaded[i].periods))
      for (const f of fc.features) f.properties.country = ISO3_TO_COUNTRY[iso];
    state.data.ipcByCountry[iso] = loaded[i];
  });
}

/* One bubble per locality (admin2) inside Sudan, sized by its IDP count. This
   is genuine per-location data from the IOM Displacement Tracking Matrix. */
function renderIDP() {
  // Every locality here is inside Sudan, so this layer has nothing to draw
  // when the filter excludes Sudan.
  if (!state.showIDP || !countryOn(SUDAN_ONLY)) { setSource("idp", empty()); return; }
  const t = state.current, feats = [];
  for (const L of state.data.idp_localities.localities) {
    const v = seriesAt(L.series, t);
    if (!v) continue;
    const dl = lastDateOnOrBefore(L.series, t);
    feats.push({
      type: "Feature", geometry: { type: "Point", coordinates: [L.lon, L.lat] },
      properties: {
        radius: Math.max(3, Math.min(38, Math.sqrt(v) / 45)),
        name: L.name, state: L.state, valFull: v.toLocaleString(),
        dateLabel: dl ? fmtDate(Date.parse(dl)) : "",
      },
    });
  }
  setSource("idp", { type: "FeatureCollection", features: feats });
}

/* The same idea one level up: one bubble per Sudanese state (admin1). */
function renderIDPStates() {
  if (!state.showIDPStates || !state.data.idp_states || !countryOn(SUDAN_ONLY)) {
    setSource("idp-states", empty());
    return;
  }
  const t = state.current, feats = [];
  for (const S of state.data.idp_states.states) {
    const v = seriesAt(S.series, t);
    if (!v) continue;
    const dl = lastDateOnOrBefore(S.series, t);
    feats.push({
      type: "Feature", geometry: { type: "Point", coordinates: [S.lon, S.lat] },
      properties: {
        radius: Math.max(4, Math.min(52, Math.sqrt(v) / 60)),
        name: S.name, valFull: v.toLocaleString(),
        dateLabel: dl ? fmtDate(Date.parse(dl)) : "",
      },
    });
  }
  setSource("idp-states", { type: "FeatureCollection", features: feats });
}

/* Where returnees went inside Sudan. One bubble per locality of return, and a
   second sizing that counts only the people who came back from ABROAD - which
   is the question flows.json could never answer, because its return corridors
   all stop at the border.

   Every locality here is inside Sudan, so the layer empties when the country
   filter excludes Sudan, exactly as renderIDP() does. */
function renderReturnees() {
  /* THE LINES ARE CLEARED ON EVERY RENDER, including the drawing path. They
     describe one locality's breakdown AT ONE DATE, and this function runs on
     every timeline move - so lines left standing would keep July's shares
     while the bubble beside them shrank to November's, or point at a locality
     whose bubble has vanished because the slider went back before its first
     reading. A click redraws them; anything else retires them. */
  setSource("return-lines", empty());

  if (!state.showReturnees || !state.data.returnee_localities
      || !countryOn(SUDAN_ONLY)) {
    setSource("returnees", empty());
    return;
  }
  const radius = (v) => Math.max(3, Math.min(38, Math.sqrt(v) / 45));
  const t = state.current, feats = [];
  for (const L of state.data.returnee_localities.localities) {
    const point = pointAt(L.series, t);
    if (!point || !point.value) continue;
    const within = point.value - point.outside;
    feats.push({
      type: "Feature", geometry: { type: "Point", coordinates: [L.lon, L.lat] },
      properties: {
        radius: radius(point.value),
        // 0 when nobody came from abroad, which the core layer filters out.
        radiusAbroad: point.outside ? radius(point.outside) : 0,
        name: L.name, state: L.state, pcode: L.pcode,
        valRaw: point.value, valFull: point.value.toLocaleString(),
        outsideRaw: point.outside, outsideFull: point.outside.toLocaleString(),
        withinRaw: within, withinFull: within.toLocaleString(),
        outsidePct: point.value ? Math.round((point.outside / point.value) * 100) : 0,
        households: point.households ? point.households.toLocaleString() : "",
        dateLabel: fmtDate(Date.parse(point.date)),
        // MapLibre stringifies feature properties, so this arrives in the
        // popup builder as JSON text and must be parsed there.
        from: JSON.stringify(point.from || {}),
      },
    });
  }
  setSource("returnees", { type: "FeatureCollection", features: feats });
}

/* The series entry in force at time t - the whole object, not just its value,
   because this layer needs the breakdown that travels with it. seriesAt()
   returns a number and cannot say which reading it came from. */
function pointAt(series, t) {
  let found = null;
  for (const p of series) {
    if (Date.parse(p.date) <= t) found = p; else break;
  }
  return found;
}

/* The reading to draw for a country at time t, BY BASIS AND THEN BY DATE.
   Not simply the latest point: the three bases are a priority ladder, and a
   stale reading on a lower rung must not displace a better one just for
   carrying a later date.

   Egypt is why. Its portal figure - 1,500,000, the government's estimate of
   Sudanese present - is dated 2025-01-31, and UNHCR's annual registered stock
   of 37,684 is dated 2025-07-01. Picking the latest point by date drew Egypt
   as one of the smallest bubbles on the map while its popup reported 1.5m.

   So: the best PORTAL reading on or before t, else the best HDX reading, else
   the pre-war caseload. Playing the timeline from the start therefore shows
   the pre-war figures, then HDX as it begins, then the portal once it does -
   and never falls back to a lower rung once a higher one has data. */
const BASIS_RANK = { portal: 3, hdx: 2, prewar: 1 };

function readingAt(series, t) {
  let best = null;
  for (const p of series || []) {
    if (Date.parse(p.date) > t) break;
    const rank = BASIS_RANK[p.basis] || 0;
    const bestRank = best ? (BASIS_RANK[best.basis] || 0) : -1;
    // A later date wins only within the same rung.
    if (rank > bestRank || (rank === bestRank && p.date >= best.date)) best = p;
  }
  return best;
}

/* The last reading on or before t, as the whole point. seriesAt() returns a
   bare number and lastDateOnOrBefore() a bare date; this layer needs both at
   once, for a series that may be empty. */
function lastOnOrBefore(series, t) {
  let found = null;
  for (const p of series || []) {
    if (Date.parse(p.date) <= t) found = p; else break;
  }
  return found;
}

/* Where the Sudanese who left are still held, from UNHCR's own count.

   CONTEXT, NOT ATTRIBUTION. DTM never says which country its cross-border
   returnees came from, so this cannot be a breakdown of the figure above it -
   it is the population that figure is drawn from, at national level, and the
   heading says so. Shown inside the outside-Sudan section because that is
   where a reader asks the question; kept to the four largest so a hover bubble
   stays a bubble. */
function unhcrContext() {
  const data = state.data.unhcr_asylum;
  if (!data || !data.countries || !data.countries.length) return "";
  const rows = data.countries.slice(0, 4).map((c) => {
    const arrow = c.change > 0 ? "▲" : c.change < 0 ? "▼" : "·";
    return `<div style="display:flex;justify-content:space-between;gap:12px">
      <span>${c.country}</span>
      <span><b>${c.latest.toLocaleString()}</b>
        <span style="color:${COLOR_MUTED}">${arrow}</span></span></div>`;
  }).join("");
  return `<div style="margin-top:4px;color:${COLOR_MUTED};font-size:10px;
                      letter-spacing:.04em">SUDANESE STILL IN ASYLUM (UNHCR)</div>
    ${rows}`;
}

/* Two layers, switched independently: a big bubble per host country sized by
   its refugee total (the only level at which a time series exists), and small
   dots for individual camps, which appear on the map from the month they
   opened. The camps carry no figure of their own - their size is a curated
   rank - so the country bubbles are where the magnitude is read. */
function renderRefugees() {
  const t = state.current;
  if (!state.showRefugees) {
    setSource("refcountry", empty());
  } else {
    const cfeats = [];
    for (const c of state.data.refugee_camps.countries) {
      if (!countryOn(c.country)) continue;
      const at = readingAt(c.series, t);
      if (!at || !at.value) continue;
      const v = at.value, dl = at.date;
      /* The bubble is sized by the TOTAL series - every Sudanese refugee the
         country holds - and the popup names the two readings separately. They
         are different measurements, not parts of one: see the popup. */
      const arr = lastOnOrBefore(c.arrivals, t);
      cfeats.push({
        type: "Feature", geometry: { type: "Point", coordinates: c.anchor },
        properties: {
          radius: Math.max(8, Math.min(58, Math.sqrt(v) / 22)),
          country: c.country, valFull: v.toLocaleString(),
          dateLabel: dl ? fmtDate(Date.parse(dl)) : "",
          basis: at ? at.basis : "",
          curFull: c.current ? c.current.value.toLocaleString() : "",
          curDate: c.current ? fmtDate(Date.parse(c.current.date)) : "",
          arrFull: arr ? arr.value.toLocaleString() : "",
          arrDate: arr ? fmtDate(Date.parse(arr.date)) : "",
          arrRaw: arr ? arr.value : 0,
          preFull: c.pre_war ? c.pre_war.value.toLocaleString() : "",
          preDate: c.pre_war ? fmtDate(Date.parse(c.pre_war.date)) : "",
          totalRaw: v,
          note: c.note || "",
        },
      });
    }
    setSource("refcountry", { type: "FeatureCollection", features: cfeats });
  }
  if (!state.showRefugeeCamps) { setSource("refcamps", empty()); return; }
  const cam = [];
  for (const m of state.data.refugee_camps.camps) {
    if (Date.parse(m.opened + "-01") > t || !countryOn(m.country)) continue;
    cam.push({
      type: "Feature", geometry: { type: "Point", coordinates: [m.lon, m.lat] },
      properties: { radius: 3 + m.size * 1.6, name: m.name, type: m.type,
                    country: m.country, opened: m.opened },
    });
  }
  setSource("refcamps", { type: "FeatureCollection", features: cam });
}

/* Border crossings. A crossing lights up when either of its corridors had
   people moving through it on this date. */
function renderCrossings() {
  if (!state.showCrossings) { setSource("crossings", empty()); return; }
  const t = state.current, feats = [];
  for (const c of state.data.crossings.points) {
    if (!corridorInScope(c.countries)) continue;
    let active = false, flow = 0;
    for (const cid of [c.corridor, c.return_corridor]) {
      const f = cid && state.data.flows[cid];
      if (!f) continue;
      const v = seriesAt(f.series, t);
      if (v) { active = true; flow = Math.max(flow, v); }
    }
    feats.push({
      type: "Feature", geometry: { type: "Point", coordinates: [c.lon, c.lat] },
      properties: { name: c.name, country: c.country, active,
                    flowLabel: flow ? flow.toLocaleString() : "" },
    });
  }
  setSource("crossings", { type: "FeatureCollection", features: feats });
}

/* The 14 IFRC Areas of Operation, drawn as a uniform outline. The IPC phase
   joined onto them is deliberately neither drawn nor named - see aoi-fill. */
/* Service points for the countries in scope. */
function renderHSP() {
  if (!state.showHSP || !state.data.hsps) { setSource("hsps", empty()); return; }
  setSource("hsps", filterFC(state.data.hsps));
}

/* FIELD DATA - the CCHA household survey, one marker per surveyed district.

   The marker appears once the timeline reaches the first day of collection
   and STAYS: a survey's findings hold until the next round replaces them.
   That is unlike the insight bubbles, which are month-by-month; the card's
   own quote list follows the marker, not the month (see fieldSurveyCardHtml). */
function fieldSurveys() {
  return ((state.data.field_surveys || {}).surveys) || [];
}

/* The surveys the timeline has reached, in the countries shown. One rule for
   the marker and the panel card, so the two can never disagree. */
function visibleFieldSurveys() {
  if (!state.showFieldData) return [];
  return fieldSurveys()
    .filter((s) => countryOn(ISO3_TO_COUNTRY[s.iso3]))
    .filter((s) => state.current >= Date.parse(s.date_from));
}

function fieldKey(s) { return `${s.pcode}|${s.type}`; }

/* THE SURVEY CARD IN THE COMMUNITY TAB.

   Shown above the month's statements on the Community and Both tabs, never
   while searching or showing a bubble selection (those answer a narrower
   question). Each card can be folded; what is folded and whether "Show all"
   is on are remembered for the session, so the slider redrawing the panel
   does not undo them. */
function fieldPanelHtml() {
  return visibleFieldSurveys().map((s) => {
    const key = fieldKey(s);
    const open = !state.fieldClosed.has(key);
    const full = state.fieldFull.has(key);
    return `<details class="field-panel" data-key="${escapeHTML(key)}"${open ? " open" : ""}>
      <summary>${channelBadgeHtml("primary")} <b>${escapeHTML(s.place)}</b> · Household survey · ${s.n} households</summary>
      ${fieldSurveyCardHtml(s, full)}
      <button type="button" class="fd-toggle">${full ? "Show the top answers only" : "Show all answers and statements"}</button>
    </details>`;
  }).join("");
}

function wireFieldPanel(el) {
  for (const node of el.querySelectorAll(".field-panel")) {
    const key = node.dataset.key;
    node.addEventListener("toggle", () => {
      if (node.open) state.fieldClosed.delete(key); else state.fieldClosed.add(key);
    });
    node.querySelector(".fd-toggle").addEventListener("click", () => {
      if (state.fieldFull.has(key)) state.fieldFull.delete(key); else state.fieldFull.add(key);
      renderVoices();
    });
  }
}

/* A click on the marker: switch to the Community tab if another is showing,
   drop any search or selection that would hide the card, open it, and scroll
   it into view. */
function focusFieldSurvey(key) {
  if (state.voiceTab === "analyst") {
    const tab = document.querySelector('.voice-tab[data-tab="community"]');
    if (tab) { tab.click(); }
  }
  if (state.voiceSearch) {
    state.voiceSearch = "";
    const input = $("#voice-search");
    if (input) input.value = "";
  }
  state.voiceSelection = null;
  state.fieldClosed.delete(key);
  renderVoices();
  const card = [...document.querySelectorAll("#voices .field-panel")].find((n) => n.dataset.key === key);
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    card.classList.remove("is-flash");
    void card.offsetWidth;
    card.classList.add("is-flash");
  }
}

function renderFieldData() {
  if (!state.showFieldData) { setSource("field-surveys", empty()); return; }
  const feats = visibleFieldSurveys()
    .map((s) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [s.lon, s.lat] },
      // Only a key: the card reads the entry itself, so nothing nested goes
      // through MapLibre's property stringification.
      properties: { key: fieldKey(s), country: ISO3_TO_COUNTRY[s.iso3] || s.iso3 },
    }));
  setSource("field-surveys", { type: "FeatureCollection", features: feats });
}

/* "Field data" for a Kobo-pulled statement, "Primary input" for one typed in
   Admin, nothing for one extracted from a document. */
function channelBadgeHtml(channel) {
  const label = { primary: "Field data", manual: "Primary input" }[channel];
  return label ? `<span class="ch-badge ch-${channel}">${label}</span>` : "";
}

/* The question a Field-data statement answers, shown above the quote. */
function fieldContextHtml(row) {
  if (!row.field_context) return "";
  return `<div class="fd-on">On: “${escapeHTML(row.field_context)}”${
    row.field_context_answer ? ` — <b>${escapeHTML(row.field_context_answer)}</b>` : ""}</div>`;
}

function fieldSurveyCardHtml(s, pinned) {
  const pct = (n) => Math.round((100 * n) / s.n);
  const bars = (rows, top) => {
    const shown = pinned ? rows : rows.slice(0, top);
    if (!shown.length) return `<div class="fd-none">No answers recorded.</div>`;
    return shown.map(([label, n]) => `<div class="fd-bar">
        <span class="fd-bar-l">${escapeHTML(label)}</span>
        <span class="fd-bar-t"><span style="width:${pct(n)}%"></span></span>
        <span class="fd-bar-n">${pct(n)}%</span></div>`).join("") +
      (!pinned && rows.length > top ? `<div class="fd-more">+${rows.length - top} more</div>` : "");
  };
  const block = (title, colour, inner) =>
    `<div class="fd-block" style="border-color:${colour}"><div class="fd-h" style="color:${colour}">${title}</div>${inner}</div>`;
  const sub = (label, inner) => `<div class="fd-sub">${label}</div>${inner}`;
  const H = s.sections.hazards, V = s.sections.vulnerable, C = s.sections.coping, G = s.sections.gaps;
  const range = s.date_from === s.date_to ? fmtDate(Date.parse(s.date_from))
    : `${fmtDate(Date.parse(s.date_from))} – ${fmtDate(Date.parse(s.date_to))}`;

  // WHAT HOUSEHOLDS SAID: published Field-data statements at this place.
  // Deliberately NOT filtered by the slider month or the theme chips: the card
  // is the survey's view and must not go empty when the slider moves on.
  const said = (state.data.insights || [])
    .filter((r) => r.channel === "primary" && r.admin_pcode === s.pcode);
  const CAP = 2;
  const quotes = (pinned ? said : said.slice(0, CAP)).map((r) => {
    const dims = [...new Set((r.codings || []).map((c) => c.dimension))]
      .filter((d) => DIM_META[d]).map((d) => DIM_META[d].label).join(" · ");
    return `<div class="fd-quote">
        <div class="fd-q-meta">${channelBadgeHtml(r.channel)}${dims ? ` ${escapeHTML(dims)}` : ""}</div>
        ${fieldContextHtml(r)}
        <blockquote>${escapeHTML(r.quote)}</blockquote></div>`;
  }).join("");

  return `<div class="field-card">
    <div class="fd-head">Collected ${range} · IFRC household survey</div>
    ${block("Hazards", DIM_META.hazard.color,
      sub("Experienced", bars(H.experienced, 5)) + sub("Getting worse", bars(H.worsening, 3)))}
    ${block("Who is most affected", DIM_META.vulnerability.color,
      sub("Groups hit hardest", bars(V.most_affected, 5)) + sub("Why", bars(V.why, 3)))}
    ${block("Coping", DIM_META.coping.color,
      sub("Can the community cope with a hazard?", bars(C.extent, 4)) + sub("What households do", bars(C.measures, 3)))}
    ${block("Gaps", DIM_META.need.color, sub("Gaps and challenges in social cohesion", bars(G.cohesion_gaps, 5)))}
    <div class="fd-said"><div class="fd-h">What households said</div>${said.length ? quotes +
      (!pinned && said.length > CAP ? `<div class="fd-more">…and ${said.length - CAP} more</div>` : "")
      : `<div class="fd-none">No statements published yet.</div>`}</div>
    <div class="pp-note">Share of the ${s.n} households interviewed who named each answer (several could be named). District-level: no household location is shown.</div>
  </div>`;
}

function renderAOI() {
  setSource("aoi", state.showAOI ? filterFC(state.data.aoi) : empty());
}

/* iso3 -> the country name the rest of the dashboard uses. */
const ISO3_TO_COUNTRY = Object.fromEntries(
  Object.entries(COUNTRY_TO_ISO3).map(([name, iso]) => [iso, name]));

/* Which countries have a food-security file to fetch. Egypt and Libya have no
   classification from ANY source - neither IPC nor FEWS NET covers them - so
   asking for a file would 404 on every toggle. Ethiopia is here because its
   FEWS NET phases have been matched to the boundary library by name; IPC itself
   has published nothing for it since 2021. */
const IPC_COUNTRIES = ["SDN", "TCD", "CAF", "SSD", "ETH"];

/* WHO PUBLISHED A NUMBER, AND WHERE TO GO AND READ IT.

   A popup used to say "via IPC MCP". MCP is how this project fetches the data,
   which is a fact about our plumbing and of no interest to a reader deciding
   whether to trust a phase classification. What matters is who assessed it, so
   each source is named and linked to its own site. */
const SOURCES = {
  ipc:     { name: "IPC",      url: "https://www.ipcinfo.org/" },
  ch:      { name: "Cadre Harmonisé", url: "https://www.ipcinfo.org/ch/" },
  fewsnet: { name: "FEWS NET", url: "https://fews.net/" },
  hdx:     { name: "IOM DTM via HDX", url: "https://data.humdata.org/" },
  unhcr:   { name: "UNHCR",    url: "https://data.unhcr.org/" },
  excel:   { name: "IFRC operational reporting", url: "" },
  kobo:    { name: "IFRC HSP Mapping", url: "" },
  curated: { name: "Curated by the operation", url: "" },
};

/* One line of attribution: the publisher's name, linked where it has a site. */
function sourceLine(key, extra) {
  const src = SOURCES[key] || { name: key || "unknown", url: "" };
  const label = src.url
    ? `<a href="${src.url}" target="_blank" rel="noopener">${escapeHTML(src.name)}</a>`
    : escapeHTML(src.name);
  return `<span class="pp-src">${label}${extra ? " · " + escapeHTML(extra) : ""}</span>`;
}

const CAL_MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

/* WHAT EACH BAND OF THE CALENDAR MEANS, and the order the bands are read in.

   Keyed on the normalised `season_type`, so one kind of season is one colour
   in EVERY country: a reader who learns pale blue is the rains in Sudan can
   then read Chad's strip without going back to the key. The colours themselves
   live in app.css (--season-*) and are read from there, so the brand block
   stays the single place colour is defined.

   The order is the story the calendar tells, not the alphabet: the climate
   first, because it drives everything under it; then the agricultural cycle in
   the sequence it happens; then the lean season, which is the consequence; then
   the hazards and the herds. ACAPS's own event_type is NOT used for the
   headings - it files rainy and dry seasons under "Seasonal hazard", which
   would put a blue band under a heading that reads as a warning. */
const SEASON_META = {
  Rainy:     { label: "Rainy season",   varName: "--season-rain",      fallback: "#8dcde2" },
  Dry:       { label: "Dry season",     varName: "--season-dry",       fallback: "#ffb25b" },
  Planting:  { label: "Planting and land preparation",
                                        varName: "--season-planting",  fallback: "#47d7ac" },
  Harvest:   { label: "Harvest",        varName: "--season-harvest",   fallback: "#009775" },
  Lean:      { label: "Lean season",    varName: "--season-lean",      fallback: "#6b3a90" },
  Hazard:    { label: "Seasonal hazard", varName: "--season-hazard",   fallback: "#d22730" },
  Livestock: { label: "Livestock movement",
                                        varName: "--season-livestock", fallback: "#ff8200" },
  Other:     { label: "Unclassified",   varName: "--season-other",     fallback: "#bdbdbd" },
};
const SEASON_ORDER = ["Rainy", "Dry", "Planting", "Harvest", "Lean", "Hazard",
                      "Livestock", "Other"];

/* The colour of one band, read from the stylesheet so app.css stays the one
   place the palette is defined. */
function seasonColor(type) {
  const meta = SEASON_META[type] || SEASON_META.Other;
  return paletteColor(meta.varName, meta.fallback);
}

/* The seasonal calendar strip: lean, rainy and harvest bands, with the month
   the timeline is currently in highlighted. */
function renderSeasonal() {
  const el = $("#seasonal-cal");
  const data = state.data.seasonal && state.data.seasonal.countries;
  if (!el || !data) return;

  // Whichever countries are selected, in the dropdown's own order. An empty
  // filter means no filter, so every country we hold a calendar for is shown.
  const scope = scopeCountries();
  const wanted = COUNTRIES.filter((c) => (scope.size === 0 || scope.has(c)) && COUNTRY_TO_ISO3[c]);

  const cur = new Date(state.current).getMonth();   // 0-11
  let html = "";
  let shown = 0;
  const absent = [];
  // The kinds of season actually on screen. The legend lists only these: a key
  // to bands the reader cannot see is noise, and it changes with the filter.
  const seen = new Set();

  for (const country of wanted) {
    const entry = data[COUNTRY_TO_ISO3[country]];
    // A country FEWS NET does not cover is named rather than skipped: Egypt has
    // crop seasons but no lean season, and Libya has a single placeholder band.
    // Silence would read as "we did not look".
    if (!entry || !entry.items || !entry.items.length) { absent.push(country); continue; }

    shown++;
    const src = entry.source === "acaps" ? "ACAPS" : "FEWS NET";
    html += `<div class="cal-country">${escapeHTML(country)}
      <span class="cal-src">${src}</span></div>`;

    // ACAPS groups its events - planting, harvest, hazards - and the grouping is
    // most of what makes it readable: a reader looks for "when is the lean
    // season", not for the twelfth row of an undifferentiated list.
    const groups = new Map();
    for (const it of entry.items) {
      const g = SEASON_META[it.season_type] ? it.season_type : "Other";
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(it);
      seen.add(g);
    }
    const names = [...groups.keys()].sort(
      (a, b) => SEASON_ORDER.indexOf(a) - SEASON_ORDER.indexOf(b));

    html += `<div class="cal-row cal-head"><span class="cal-label"></span>`;
    for (let m = 0; m < 12; m++)
      html += `<span class="cal-cell ${m === cur ? "cal-now" : ""}">${CAL_MONTHS[m]}</span>`;
    html += `</div>`;

    for (const g of names) {
      html += `<div class="cal-group">${escapeHTML(SEASON_META[g].label)}</div>`;
      for (const it of groups.get(g)) {
        // Everything ACAPS says about this event, in the tooltip: the sentence of
        // explanation, the regions it applies to when it is not national, and who
        // assessed it. That detail is the reason this calendar was asked for.
        const bits = [];
        if (it.note) bits.push(it.note);
        if (it.event && it.event !== it.label) bits.push(it.event);
        if (it.country_wide === false && (it.areas || []).length)
          bits.push("Regions: " + it.areas.join(", "));
        if (it.source_org) bits.push(`Source: ${it.source_org}${it.source_date ? " (" + it.source_date.slice(0, 4) + ")" : ""}`);
        const title = escapeHTML(bits.join(" — "));
        const partial = it.country_wide === false ? " cal-partial" : "";
        html += `<div class="cal-row"><span class="cal-label${partial}" title="${title}">${escapeHTML(it.label)}</span>`;
        for (let m = 1; m <= 12; m++) {
          const on = it.months.includes(m);
          // data-season, not an inline colour: the stylesheet decides what a
          // rainy season looks like, and it decides it once for every country.
          html += `<span class="cal-cell ${m - 1 === cur ? "cal-now" : ""}"${on ? ` data-season="${g}"` : ""}></span>`;
        }
        html += `</div>`;
      }
    }
  }

  if (seen.size) {
    const keys = SEASON_ORDER.filter((k) => seen.has(k)).map((k) =>
      `<span class="cal-key"><i style="background:${seasonColor(k)}"></i>${escapeHTML(SEASON_META[k].label)}</span>`);
    html += `<div class="cal-legend">${keys.join("")}</div>`;
  }
  if (absent.length)
    html += `<div class="panel-note">No seasonal calendar published for
      ${absent.map(escapeHTML).join(", ")}.</div>`;
  if (shown)
    html += `<div class="panel-note">Hover a row for the description, the regions it
      covers and who assessed it. Source:
      <a href="https://www.acaps.org/en/thematics/all-topics/seasonal-events-calendar"
         target="_blank" rel="noopener">ACAPS Seasonal Events Calendar</a>.</div>`;
  if (!shown && !absent.length)
    html += `<div class="panel-note">No seasonal calendar for this selection.</div>`;
  el.innerHTML = html;
}

/* Bubbles for every published insight that passes the shared filters.

   Deliberately does NOT call allVoices() or voicesForTab() (Task 12 R3):
   those walk the ~2.4 MB tags.json archive to build the analyst-snippet rows
   too, and this runs inside drawMapLayers() - once per slider tick, and twice
   per tick in split view. Iterating state.data.insights directly keeps this
   O(published insights), which stays small.

   A row passes when insightPasses() says its country and theme are in scope
   (the same predicate the panel uses - see its comment for why that matters),
   voiceOnTab() says the active tab wants its voice, insightInMonth() says it
   belongs to the month the timeline is on, and it has a resolved point:
   camps, settlements and neighbourhoods are not in the boundary library and
   never will be, so an unplaced statement is simply absent rather than
   guessed at. One feature per PLACE, and within it one entry per insight id,
   never per coding - a statement coded twice is still one thing someone said.

   GROUPED BY COORDINATE, which is the fix for the bubble that could not be
   read. A statement is located to an admin area and drawn at that area's
   label position, so "the point" is the area's point: 18 statements about
   Egypt are 18 statements on one pixel, to the last decimal. MapLibre
   clustering used to cover for that and could not - coincident points do not
   separate at any zoom, so its "zoom in to read them" bubble was permanent.
   Grouping here is not a rendering trick; it matches what the data says,
   which is that these statements share a place rather than merely crowd each
   other. Keyed on the raw lon/lat pair: both come from the same boundary
   library lookup, so statements about one area carry byte-identical values
   and no rounding tolerance is needed to bring them together. */
function renderInsightBubbles() {
  const seen = new Set();
  const groups = new Map();
  const mk = monthKey(state.current);
  for (const row of state.data.insights || []) {
    if (row.id == null || row.lat == null || row.lon == null) continue;
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    if (!insightPasses(row)) continue;
    if (!insightInMonth(row, mk)) continue;
    if (!voiceOnTab(row.voice_type)) continue;
    const codings = row.codings || [];
    // Colour by the SAME rule allVoices() uses for the card's border: the
    // coding that is actually ticked, else the first one with a dimension we
    // can colour. Without the first clause a statement coded [hazard, need]
    // would draw a red bubble while its own panel card drew a blue border,
    // for the same tick - the panel and the map disagreeing about what a
    // statement is "about" is exactly the drift insightPasses() exists to
    // prevent, and colour is the most visible place for it to show.
    const first = codings.find((c) => DIM_META[c.dimension] && state.activeTags.has(`${c.dimension}|${c.tag}`))
      || codings.find((c) => DIM_META[c.dimension]);
    const key = `${row.lon},${row.lat}`;
    let g = groups.get(key);
    if (!g) {
      /* The place, the match method and the colour come from the FIRST
         statement at this point and stand for the group. Place and match
         method are properties of the point itself, so they are the same for
         every member by construction. Colour is not: a place can hold a
         hazard statement and a needs statement. One dot cannot be two
         colours, so it takes the first, and the popup names each statement
         individually - which is where a reader distinguishes them anyway. */
      g = {
        lon: row.lon, lat: row.lat,
        colour: first ? DIM_META[first.dimension].color : COLOR_MUTED,
        place: row.place_name || "",
        matchMethod: row.match_method || "unmatched",
        items: [],
      };
      groups.set(key, g);
    }
    g.items.push({
      id: row.id,
      quote: row.quote,
      date: row.date || "",
      source: row.source_document || "",
      voice: row.voice_type,
      channel: row.channel,
      field_context: row.field_context,
      field_context_answer: row.field_context_answer,
    });
  }

  const feats = [];
  for (const g of groups.values())
    feats.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [g.lon, g.lat] },
      properties: {
        // Serialised deliberately, not left as arrays: MapLibre stringifies
        // feature properties on the way through, so an array would reach the
        // popup as "[object Object]" text. JSON in, JSON.parse out, at both
        // readers - the popup builder and the click handler.
        items: JSON.stringify(g.items),
        ids: JSON.stringify(g.items.map((it) => it.id)),
        n: g.items.length,
        colour: g.colour,
        place: g.place,
        matchMethod: g.matchMethod,
      },
    });
  setSource("insight-bubbles", { type: "FeatureCollection", features: feats });
}

/* Every layer of ONE map, for whatever scope is currently in force. */
function drawMapLayers() {
  renderFoodsec();
  renderFlows();
  renderCrossings();
  renderHSP();
  renderFieldData();
  renderIDP();
  renderIDPStates();
  renderReturnees();
  renderRefugees();
  renderEvents();
  renderThemes();
  renderInsightBubbles();
  /* The Areas of Operation used to be drawn only when their checkbox moved,
     because they do not change with the date. They do change with the country
     filter and with the split, so they are redrawn with everything else. */
  renderAOI();
}

/* Draw `fn` as one half: only this map, only this country. The scope is always
   put back, even if a render throws, so one bad layer cannot leave the whole
   dashboard stuck showing a single country. */
function withPane(m, country, fn) {
  renderTarget = m;
  renderScope = new Set([country]);
  try { fn(); } finally { renderTarget = null; renderScope = null; }
}

/* Fill the map, or both halves of it.

   Split view is the only interesting case: each half is drawn on its own, with
   its own country, so a feature that belongs to one country appears in that
   half alone. Everything else - one country, three, none - is a single scope
   written to every live map at once. */
function renderMapLayers() {
  const sel = [...state.countries];
  if (sel.length === 2 && mapB) {
    withPane(maps[0], sel[0], drawMapLayers);
    withPane(mapB, sel[1], drawMapLayers);
  } else {
    drawMapLayers();
  }
}

/* Redraw everything for state.current. This runs on every slider move, so
   each render*() function above must stay fast and must not fetch anything. */
function renderAll() {
  renderMapLayers();
  renderEventBanner();
  // The panels always describe the WHOLE selection, never one half of it.
  renderThemePanel(monthKey(state.current));
  renderStats();
  renderEventList();
  renderInsights();
  renderVoices();
  renderTriggers();
  renderSeasonal();
  renderDocCount();
  drawMovementTrends();
  renderTrendLegend();
  $("#current-date").textContent = fmtDate(state.current);
}

/* Everything renderAll() does, plus the things that only change when a FILTER
   changes rather than when the date does: the points behind the Movement
   trends graph and, if asked, the map viewport.

   Fitting the map is deliberately not part of renderAll(): renderAll runs
   about eight times a second while the timeline is playing, and re-fitting the
   camera at that rate would make the map unusable. Rebuilding the trend series
   is kept out of it for the same reason - see computeTrendSeries(). */
function applyFilters({ refit = true } = {}) {
  computeTrendSeries();
  renderAll();
  if (refit) fitToSelection();
  // Widening the country filter can bring a country into scope whose
  // food-security file has never been fetched. Load it, then redraw that one
  // layer - the rest of the page has already been drawn from what it had.
  if (state.showFoodsec) loadFoodsecForScope().then(renderFoodsec);
}

/* ---------------- the Movement trends graph ----------------------------
 *
 * Three population series on one pair of axes: everyone displaced, everyone
 * who crossed a border out of Sudan, and everyone who has gone back.
 *
 * It used to be a 48px sparkline drawn BEHIND the timeline slider, where it
 * was a texture rather than a chart - no scale, no year marks, no way to read
 * a value off it, and a slider thumb sitting on top of the lines. It is now a
 * panel of its own on the right, which leaves the timeline as just a timeline.
 *
 * ONE VERTICAL SCALE for all three. They are all counts of people, so plotting
 * them against a shared axis is the only way their relative size stays honest;
 * a second axis would let the smallest series be drawn as tall as the biggest.
 * ------------------------------------------------------------------------ */

/* The three lines, in the order they are drawn and listed. Colours are the
   ones the map already uses for the same idea: orange leaving, green
   returning. Checked as a set for colour blindness - the closest pair is
   10.4 apart - but the orange is pale against white, so identity is carried
   by the labelled key below the graph as well as by the colour. */
const TREND_SERIES = [
  { metric: "total_displaced", color: COLOR_OUT, label: "Total displaced" },
  { metric: "cumulative_arrivals", color: COLOR_ACCENT, label: "Fled across a border" },
  { metric: "returns_to_sudan_total", color: COLOR_IN, label: "Returns to Sudan" },
];

/* Work out the points and cache them on state.

   Kept apart from the drawing because statSeries() is cheap unfiltered and
   expensive under a filter - it rebuilds a series by asking statAt() for every
   date any corridor reported on. The graph is redrawn on every timeline move,
   about eight times a second while the story plays; the points behind it only
   change when a FILTER changes, so that is when this runs. */
function computeTrendSeries() {
  const series = TREND_SERIES.map((s) => ({ ...s, points: statSeries(s.metric) }));
  state.trend = {
    series,
    vmax: Math.max(...series.flatMap((s) => s.points.map((p) => p.value)), 1),
  };
}

/* Round a maximum up to something a person would say out loud, so the top of
   the scale reads "13M" rather than "12,994,517".

   TWO significant figures, not one. A ladder of round numbers - 1, 2, 5, 10 -
   would push a peak of 13M up to a scale of 15M and spend a fifth of the
   panel's height on empty air, which is a lot of height in a panel this size.
   Rounding to the second digit costs nothing in readability and keeps the
   lines as tall as they can be. */
function niceMax(v) {
  const mag = Math.pow(10, Math.floor(Math.log10(v)) - 1);
  return Math.ceil(v / mag) * mag;
}

/* THE PLOT BOX, in CSS pixels, and the one place its shape is written down.
   The drawing multiplies these by the device pixel ratio; the click handler
   uses them as they are, because a click arrives in CSS pixels. Both have to
   agree about where the box starts and ends, or clicking the graph would set a
   date other than the one under the cursor - so neither gets its own copy.

   The gutters are what pay for the axes. Left holds the tick figures and the
   rotated axis title; bottom holds the year marks and "Date". The 132px of plot
   between them is exactly the height the lines had when the panel was 132px
   tall and had no axes at all: the labels were added to the canvas, not taken
   out of the chart. */
const TREND_CSS_H = 176;
const TREND_PAD = { t: 10, r: 4, b: 34, l: 46 };
const TREND_TICKS = 4;                     // gridlines above zero

/* Where the plot box sits across a canvas of this width. */
function trendBox(canvas) {
  return { x0: TREND_PAD.l, x1: canvas.offsetWidth - TREND_PAD.r };
}

/* A click's x, in CSS pixels, back into the date standing at it - xAt() run
   backwards. Clamped, so a click in either gutter takes the nearer end of the
   timeline rather than a date off the end of the war. */
function dateAtTrendX(canvas, cssX) {
  const { x0, x1 } = trendBox(canvas);
  const f = clamp((cssX - x0) / Math.max(x1 - x0, 1), 0, 1);
  return START + f * (state.endDate - START);
}

/* Draw the graph from the cache. Plain canvas - no charting library.

   Styled the way seaborn draws a whitegrid: soft gridlines in both directions,
   figures on both axes, a named axis on each, and no top or right spine. The
   panel used to carry a single number - the top of the scale - floating
   unlabelled above the lines, which gave the shape a ceiling but no way to read
   a value at any other height. */
function drawMovementTrends() {
  const canvas = $("#movement-trends");
  if (!canvas || !canvas.offsetWidth || !state.endDate) return;
  const dpr = devicePixelRatio || 1;
  const w = (canvas.width = canvas.offsetWidth * dpr);
  const h = (canvas.height = TREND_CSS_H * dpr);
  canvas.style.height = TREND_CSS_H + "px";
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);

  const box = trendBox(canvas);
  const x0 = box.x0 * dpr, x1 = box.x1 * dpr;
  const y0 = TREND_PAD.t * dpr, y1 = h - TREND_PAD.b * dpr;
  const span = state.endDate - START;
  const vmax = niceMax(state.trend.vmax);
  const xAt = (t) => x0 + ((t - START) / span) * (x1 - x0);
  const yAt = (v) => y1 - (v / vmax) * (y1 - y0);

  ctx.font = `${9.5 * dpr}px "Open Sans", Arial, sans-serif`;
  ctx.textBaseline = "alphabetic";

  const GRID = "rgba(1,30,65,.10)";
  const SPINE = "rgba(1,30,65,.28)";

  // ---- horizontal gridlines, and the figure each one stands for ---------
  ctx.lineWidth = 1 * dpr;
  for (let i = 0; i <= TREND_TICKS; i++) {
    const v = (vmax / TREND_TICKS) * i;
    const y = Math.round(yAt(v)) + 0.5;
    if (i > 0) {                           // zero is the spine, drawn below
      ctx.strokeStyle = GRID;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    }
    ctx.fillStyle = COLOR_MUTED;
    ctx.textAlign = "right";
    ctx.fillText(v ? fmtNum(v) : "0", x0 - 6 * dpr, y + 3.4 * dpr);
  }

  // ---- year marks: gridline above, figure below -------------------------
  /* The axis starts on 15 April 2023, so the loop below - which wants 1 January
     - can never label the origin, and with real axes an unlabelled end reads as
     a gap. So 2023 is written on the spine itself, left-aligned to stay inside
     the box, and with no gridline of its own because the spine is already the
     line it would draw. */
  ctx.fillStyle = COLOR_MUTED;
  ctx.textAlign = "left";
  ctx.fillText("2023", x0, y1 + 14 * dpr);

  const lastYear = new Date(state.endDate).getFullYear();
  for (let y = 2024; y <= lastYear; y++) {
    const t = Date.parse(`${y}-01-01`);
    if (t < START || t > state.endDate) continue;
    const x = Math.round(xAt(t)) + 0.5;
    ctx.strokeStyle = GRID;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
    ctx.fillStyle = COLOR_MUTED;
    ctx.textAlign = "center";
    ctx.fillText(String(y), x, y1 + 14 * dpr);
  }

  // ---- the spines. Left and bottom only, seaborn-despined ---------------
  ctx.strokeStyle = SPINE;
  ctx.beginPath();
  ctx.moveTo(Math.round(x0) + 0.5, y0);
  ctx.lineTo(Math.round(x0) + 0.5, Math.round(y1) + 0.5);
  ctx.lineTo(x1, Math.round(y1) + 0.5);
  ctx.stroke();

  // ---- what each axis is counting ---------------------------------------
  ctx.fillStyle = COLOR_MUTED;
  ctx.textAlign = "center";
  ctx.fillText("Date", (x0 + x1) / 2, h - 4 * dpr);
  ctx.save();                              // the y title reads bottom-to-top
  ctx.translate(11 * dpr, (y0 + y1) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("People", 0, 0);
  ctx.restore();

  // ---- the defining events, as ticks standing on the zero line ----------
  ctx.fillStyle = "rgba(200,110,0,.8)";
  for (const ev of (state.data.events || []).filter((e) =>
    e.source === "curated" && e.severity >= 4 && (e.country === "Regional" || countryOn(e.country)))) {
    const t = Date.parse(ev.date);
    if (t < START || t > state.endDate) continue;
    ctx.fillRect(Math.round(xAt(t)), y1 - 5 * dpr, 1.5 * dpr, 5 * dpr);
  }

  // ---- where the timeline is standing -----------------------------------
  // The graph no longer sits under the slider, so it has to say for itself
  // which date the rest of the page is showing. Drawn under the lines.
  const xNow = Math.round(xAt(state.current)) + 0.5;
  ctx.strokeStyle = "rgba(1,30,65,.45)";
  ctx.lineWidth = 1 * dpr;
  ctx.setLineDash([3 * dpr, 3 * dpr]);
  ctx.beginPath(); ctx.moveTo(xNow, y0 - 4 * dpr); ctx.lineTo(xNow, y1); ctx.stroke();
  ctx.setLineDash([]);

  // ---- the three lines ---------------------------------------------------
  for (const s of state.trend.series) {
    if (s.points.length < 2) continue;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2 * dpr;
    ctx.lineJoin = "round";
    ctx.beginPath();
    s.points.forEach((p, i) => {
      const x = xAt(Date.parse(p.date)), y = yAt(p.value);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
  }

  // ---- a dot on each line at the current date ----------------------------
  // This is what ties a line to its row in the key underneath, which carries
  // the figure. The white ring keeps two dots apart where the lines cross.
  for (const s of state.trend.series) {
    const v = statAt(s.metric, state.current);
    if (!v) continue;
    ctx.beginPath();
    ctx.arc(xNow, yAt(v), 3.2 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.lineWidth = 1.6 * dpr;
    ctx.strokeStyle = WHITE;
    ctx.stroke();
  }
}

/* CLICKING THE GRAPH MOVES THE WHOLE DASHBOARD. The graph draws the war end to
   end while every other panel shows a single date, so it is the one place a
   reader can SEE the moment they want - the bend where returns start, the step
   where a corridor opened - and until now the only way to get to that moment
   was to hunt for it with the slider.

   The story is stopped first. A click during playback would otherwise be
   overwritten by the play timer 120ms later, which reads as the click having
   done nothing at all. */
function initTrendsClick() {
  const canvas = $("#movement-trends");
  if (!canvas) return;
  canvas.addEventListener("click", (e) => {
    if (!state.endDate) return;
    stopPlaying();
    // Worked out from the cursor and the canvas's own box rather than taken
    // from e.offsetX, because the page is drawn smaller than it is laid out
    // (see uiScale) and offsetX is reported at the size it is DRAWN, while
    // dateAtTrendX measures against offsetWidth, which is the size it is laid
    // out at. Straight from offsetX the click landed a fifth of the war early.
    const box = canvas.getBoundingClientRect();
    const scale = box.width / canvas.offsetWidth || 1;
    setCurrentDate(dateAtTrendX(canvas, (e.clientX - box.left) / scale));
  });
}

/* The key under the graph: one row per line, each carrying its figure for the
   date the timeline is on. The figures are the point of it. Colour alone would
   leave the orange series - the palest of the three against white - identified
   by something a reader may not be able to see, and would leave the graph a
   shape with no numbers anywhere on it. */
function renderTrendLegend() {
  const el = $("#trend-key");
  if (!el) return;
  el.innerHTML = state.trend.series.map((s) => {
    const v = statAt(s.metric, state.current);
    return `<div class="tk-row">
      <span class="tk-line" style="background:${s.color}"></span>
      <span class="tk-label">${s.label}</span>
      <span class="tk-val">${v ? fmtNum(v) : "–"}</span>
    </div>`;
  }).join("");
}

/* ========================= 6. TIMELINE ================================= */

/* The two ends of the picked window, as dates and as the slider's own unit -
   whole days since 15 April 2023. Read through these rather than captured in a
   variable anywhere, because the window moves while the page is open: a play
   loop or a slider bound that remembered its limit from boot would keep
   running past a window narrowed afterwards.

   rangeEnd is null until initTimeline() has run, and state.endDate is itself
   null until the data has loaded, so both fall back to what is known. */
const rangeLo = () => state.rangeStart;
const rangeHi = () => state.rangeEnd || state.endDate || START;
const dayNo = (t) => Math.round((t - START) / DAY);

/* Move either end of the window, keeping end >= start.

   The rule the pickers need is not "reject an end before the start" - that
   leaves the person looking at a control that ignored them - but "the other
   end gives way". Drag the start past the end and the end comes with it, and
   the other way round, so the window is never inside out and never empty.
   Everything else here follows from that: clamp into the dates we hold, push
   the pair back into the inputs and their min/max, rebuild the ticks, and
   re-clamp the current date, which may now be outside the window.

   keep names the end that was just edited, and so the one that must be
   honoured when the two cross; the other is the one that gives way. Without
   it the edited end is the one that moves, which looks like the picker
   ignoring what was typed into it.

   render: false is for the one call made during boot, where the page has not
   been drawn even once yet and boot() ends with its own renderAll(). */
function setRange(startT, endT, { render = true, keep = "start" } = {}) {
  let lo = clamp(startT, START, state.endDate);
  let hi = clamp(endT, START, state.endDate);
  if (hi < lo) { if (keep === "end") lo = hi; else hi = lo; }
  state.rangeStart = START + dayNo(lo) * DAY;
  state.rangeEnd = START + dayNo(hi) * DAY;

  const s = $("#range-start"), e = $("#range-end");
  s.value = ymd(state.rangeStart);
  e.value = ymd(state.rangeEnd);
  /* min/max only grey out days in the picker's own popup - a typed date walks
     straight past them - so they are a courtesy on top of the clamping above,
     never the thing enforcing the constraint. */
  s.min = ymd(START);        s.max = ymd(state.rangeEnd);
  e.min = ymd(state.rangeStart); e.max = ymd(state.endDate);

  const slider = $("#time-slider");
  slider.min = dayNo(state.rangeStart);
  slider.max = dayNo(state.rangeEnd);

  drawSliderTicks();
  if (render) setCurrentDate(state.current);   // clamps into the window, redraws
  else state.current = clamp(state.current, rangeLo(), rangeHi());
}

/* The labels under the slider. Years once the window is long enough to hold
   one, the two end dates when it is not, because two year labels pinned to the
   ends of a short window read as a scale a year wide and labelled wrongly.

   The test is the window's LENGTH, not how many year boundaries it crosses:
   November to February is three months that happen to straddle New Year, and
   counting boundaries would label it "2024" ... "2025" - the very thing this
   is avoiding. */
function drawSliderTicks() {
  const ticks = $("#slider-ticks");
  ticks.innerHTML = "";
  const y0 = new Date(rangeLo()).getUTCFullYear();
  const y1 = new Date(rangeHi()).getUTCFullYear();
  const labels = rangeHi() - rangeLo() >= 365 * DAY
    ? Array.from({ length: y1 - y0 + 1 }, (_, i) => String(y0 + i))
    : [fmtDate(rangeLo()), fmtDate(rangeHi())];
  for (const text of labels) {
    const span = document.createElement("span");
    span.textContent = text;
    ticks.appendChild(span);
  }
}

/* Read one picker. Returns null for a cleared or unparseable box, which the
   caller turns back into the boundary it started from: Date.parse("") is NaN,
   and NaN reaching setCurrentDate() would flow into monthKey() -> new
   Date(NaN).toISOString(), which throws and takes every panel down with it. */
function pickedDate(input) {
  const t = Date.parse(input.value);
  return Number.isNaN(t) ? null : t;
}

/* Wire up the slider, the date pickers and the play button. The slider value is
   a number of days since 15 April 2023, which we turn back into a date. Play
   simply advances that number by 4 days every 120 milliseconds, between the
   ends of the picked window. */
function initTimeline() {
  const slider = $("#time-slider");
  slider.addEventListener("input", () => {
    setCurrentDate(START + Number(slider.value) * DAY);
  });

  // The window opens on everything we hold, which is how the page behaved
  // before there was a window at all.
  const s = $("#range-start"), e = $("#range-end");
  setRange(START, state.endDate, { render: false });

  /* Changing either end is a move of the timeline by hand, so it stops the
     story first - the same rule the trends graph follows. */
  s.addEventListener("change", () => {
    stopPlaying();
    setRange(pickedDate(s) ?? START, state.rangeEnd);
  });
  e.addEventListener("change", () => {
    stopPlaying();
    setRange(state.rangeStart, pickedDate(e) ?? state.endDate, { keep: "end" });
  });

  const play = $("#play-btn");
  play.addEventListener("click", () => {
    if (state.playing) { stopPlaying(); return; }
    state.playing = true;
    play.textContent = "❚❚";
    // Play again from the end of the window and it starts at the beginning of
    // the window, not at the beginning of the war.
    if (Number(slider.value) >= dayNo(rangeHi())) slider.value = dayNo(rangeLo());
    playTimer = setInterval(() => {
      const hi = dayNo(rangeHi());
      const v = Number(slider.value) + 4;
      if (v >= hi) { slider.value = hi; stopPlaying(); }
      else slider.value = v;
      setCurrentDate(START + Number(slider.value) * DAY);
    }, 120);
  });
}

/* The play loop's handle, lifted out of initTimeline() so that anything which
   moves the timeline by hand can stop the story first. Without that, clicking
   the trends graph mid-play sets a date the timer overwrites 120ms later, and
   the click reads as broken. */
let playTimer = null;
function stopPlaying() {
  clearInterval(playTimer);
  playTimer = null;
  state.playing = false;
  const play = $("#play-btn");
  if (play) play.textContent = "▶";
}

/* ========================= 7. CONTROLS ================================= */

/* Connect each sidebar checkbox to its layer. Note the food-security one: its
   file is about 2 MB, so we only download it the first time someone asks for
   it, and disable the checkbox while that happens. */
function initControls() {
  /* Each switch redraws the WHOLE map rather than only its own layer. That
     looks wasteful for a single checkbox, and would be, but for the split
     view: drawing one layer on its own has no half to draw it into, so it
     would write both countries' data into both halves and quietly undo the
     scoping. renderMapLayers() knows about the halves; a lone renderX() does
     not. It costs a few milliseconds and it is always right. */
  const layer = (id, key) =>
    $(id).addEventListener("change", (e) => { state[key] = e.target.checked; renderMapLayers(); });
  layer("#toggle-flows", "showFlows");
  layer("#toggle-returns", "showReturns");
  layer("#toggle-events", "showEvents");
  layer("#toggle-idp", "showIDP");
  layer("#toggle-idp-states", "showIDPStates");
  layer("#toggle-returnees", "showReturnees");
  layer("#toggle-refugees", "showRefugees");
  layer("#toggle-refugee-camps", "showRefugeeCamps");
  layer("#toggle-crossings", "showCrossings");
  layer("#toggle-aoi", "showAOI");
  // Food security is the exception: its file is about 2 MB, so it is only
  // downloaded the first time someone asks for it.
  // The survey card lives in the Community tab, so the panel follows the toggle too.
  $("#toggle-field-data").addEventListener("change", (e) => {
    state.showFieldData = e.target.checked;
    renderMapLayers();
    renderVoices();
  });
  $("#toggle-hsps").addEventListener("change", (e) => {
    state.showHSP = e.target.checked;
    renderMapLayers();
  });
  $("#toggle-foodsec").addEventListener("change", async (e) => {
    state.showFoodsec = e.target.checked;
    if (state.showFoodsec) {
      e.target.disabled = true;
      await loadFoodsecForScope();
      e.target.disabled = false;
    }
    renderMapLayers();
  });
  // The key-events switch also empties the banner above the map.
  $("#toggle-events").addEventListener("change", renderEventBanner);
}

/* ---------------------------------------------------------------- dropdown
 * ONE searchable multi-select, built six times: once for the country filter
 * and once for each of the four narrative dimensions. Everything about how a
 * filter control behaves is decided here, so all six behave identically.
 *
 * The two ways to choose, as asked for:
 *   tick the box  -> add or remove this option, leaving the rest alone
 *   click the name -> select ONLY this option, clearing the others
 * ------------------------------------------------------------------------ */
function makeDropdown({ label, color, options, selected, onChange, placeholder }) {
  // `options` is reassignable, because the Sub-Hazard list is rebuilt whenever
  // a category is ticked - see setOptions() on the returned handle.
  // allOptionValues remembers everything this control has ever offered, which
  // is how setOptions knows which ticked values to drop.
  const allOptionValues = new Set(options.map((o) => o.value));
  const root = document.createElement("div");
  root.className = "dd";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "dd-trigger";
  root.appendChild(trigger);

  const panel = document.createElement("div");
  panel.className = "dd-panel";
  panel.innerHTML = `
    <div class="dd-search"><input type="search" placeholder="${placeholder || "Search…"}" aria-label="${placeholder || "Search"}"></div>
    <div class="dd-actions"><button type="button" data-act="all">Select all</button>
      <button type="button" data-act="none">Clear</button>
      <span class="dd-shown"></span></div>
    <div class="dd-list" role="group" aria-label="${label}"></div>`;
  root.appendChild(panel);

  const search = panel.querySelector("input");
  const list = panel.querySelector(".dd-list");
  const shown = panel.querySelector(".dd-shown");

  // Draw the rows that match what has been typed in the search box.
  function paint() {
    // Every tick redraws the whole list, which would otherwise throw the
    // scroll position back to the top halfway down a long dimension.
    const scroll = list.scrollTop;
    const q = search.value.trim().toLowerCase();
    const hits = options.filter((o) => o.label.toLowerCase().includes(q));
    list.innerHTML = hits.length
      ? hits.map((o) => `<div class="dd-opt${selected.has(o.value) ? " on" : ""}" data-v="${escapeHTML(o.value)}">
          <input type="checkbox" class="dd-cb"${selected.has(o.value) ? " checked" : ""}
                 aria-label="${escapeHTML(o.label)}">
          ${o.color ? `<span class="dd-dot" style="background:${o.color}"></span>` : ""}
          <span class="dd-text" title="Show only this">${escapeHTML(o.label)}</span></div>`).join("")
      : `<div class="dd-empty">Nothing matches “${escapeHTML(search.value)}”.</div>`;
    shown.textContent = q ? `${hits.length} of ${options.length}` : "";
    list.scrollTop = scroll;
  }

  // The trigger always says what is currently chosen.
  function paintTrigger() {
    const n = selected.size;
    const chosen = options.filter((o) => selected.has(o.value));
    const text = n === 0 ? "All" : n === 1 ? chosen[0].label : `${n} selected`;
    trigger.innerHTML = `${color ? `<span class="dd-dot" style="background:${color}"></span>` : ""}
      <span class="dd-label">${escapeHTML(label)}</span>
      <span class="dd-value${n ? " on" : ""}">${escapeHTML(text)}</span>
      <span class="dd-caret">▾</span>`;
    root.classList.toggle("has-selection", n > 0);
  }

  function changed() { paint(); paintTrigger(); onChange(); }

  list.addEventListener("click", (e) => {
    const row = e.target.closest(".dd-opt");
    if (!row) return;
    const v = row.dataset.v;
    if (e.target.classList.contains("dd-cb")) {
      // the checkbox: add or remove, leave everything else as it is
      selected.has(v) ? selected.delete(v) : selected.add(v);
    } else {
      // the name: this one only - unless it already is the only one, in which
      // case clicking again clears it, so the control is never a dead end
      const only = selected.size === 1 && selected.has(v);
      selected.clear();
      if (!only) selected.add(v);
    }
    changed();
  });

  panel.querySelector('[data-act="all"]').addEventListener("click", () => {
    for (const o of options) selected.add(o.value);
    changed();
  });
  panel.querySelector('[data-act="none"]').addEventListener("click", () => {
    selected.clear();
    changed();
  });
  search.addEventListener("input", paint);
  search.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  const open = () => {
    // only one dropdown open at a time, or they overlap each other
    for (const other of document.querySelectorAll(".dd.open")) other.classList.remove("open");
    root.classList.add("open");
    search.value = ""; paint(); search.focus();
  };
  const close = () => root.classList.remove("open");
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    root.classList.contains("open") ? close() : open();
  });
  panel.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  paint(); paintTrigger();
  return {
    el: root,
    refresh: () => { paint(); paintTrigger(); },
    /* Replace the choices without rebuilding the control, so the Sub-Hazard
       list can narrow to whatever the Hazard dropdown has selected. Anything
       ticked that is no longer on offer is dropped, or it would go on
       filtering invisibly. */
    setOptions: (next) => {
      options = next;
      // Anything ticked that is no longer on offer is dropped, or it would go
      // on filtering from behind a list it is not in.
      const offered = new Set(next.map((o) => o.value));
      for (const o of [...allOptionValues]) if (!offered.has(o)) selected.delete(o);
      for (const o of offered) allOptionValues.add(o);
      paint(); paintTrigger();
    },
  };
}

/* ------------------------------------------------------------- the filters */

let countryDropdown = null;

/* The country filter in the top bar, plus the chips under it that show what is
   selected and let you take one off again. */
function initCountryFilter() {
  const wrap = $("#country-filter");
  countryDropdown = makeDropdown({
    label: "Countries",
    options: COUNTRIES.map((c) => ({ value: c, label: c })),
    selected: state.countries,
    placeholder: "Search countries…",
    onChange: () => { renderCountryChips(); applyFilters(); },
  });
  wrap.appendChild(countryDropdown.el);
  renderCountryChips();
}

function renderCountryChips() {
  const el = $("#country-chips");
  const sel = [...state.countries];
  el.innerHTML = sel.length
    ? sel.map((c) => `<button type="button" class="chip" data-c="${escapeHTML(c)}"
         title="Remove ${escapeHTML(c)} from the filter">${escapeHTML(c)}<span>×</span></button>`).join("") +
      `<button type="button" class="chip chip-clear" data-c="*">Clear all</button>`
    : "";
  for (const btn of el.querySelectorAll(".chip"))
    btn.addEventListener("click", () => {
      btn.dataset.c === "*" ? state.countries.clear() : state.countries.delete(btn.dataset.c);
      countryDropdown.refresh();
      renderCountryChips();
      applyFilters();
    });
  // tell the reader what the split view is doing, in words
  const mode = $("#filter-mode");
  mode.textContent = sel.length === 0 ? "Whole region"
    : sel.length === 1 ? `Zoomed to ${sel[0]}`
    : sel.length === 2 ? `Split view: ${sel[0]} | ${sel[1]} · zoom only, panning locked`
    : `${sel.length} countries, fitted to all`;
}

/* Build the theme filters from the data itself: one searchable dropdown per
   dimension, holding every tag the pipeline actually found. Add a new tag to
   taxonomy.json and it appears here on the next run, with no code change. */
function initThemeControls() {
  const wrap = $("#dim-groups");
  for (const [dim, meta] of Object.entries(DIM_META)) {
    const tags = Object.keys(state.data.tags[dim] || {}).sort();
    if (!tags.length) continue;
    /* activeTags is one flat set of "dimension|tag" keys shared by all four
       dropdowns, so each one is given a small view onto just its own slice of
       it. Select-all and Clear then act on that dimension alone. */
    const view = {
      has: (tag) => state.activeTags.has(`${dim}|${tag}`),
      add: (tag) => state.activeTags.add(`${dim}|${tag}`),
      delete: (tag) => state.activeTags.delete(`${dim}|${tag}`),
      clear: () => { for (const tag of tags) state.activeTags.delete(`${dim}|${tag}`); },
      get size() { return tags.filter((tag) => state.activeTags.has(`${dim}|${tag}`)).length; },
    };
    if (dim === "hazard" && buildHazardDropdowns(wrap, meta)) continue;
    const dd = makeDropdown({
      label: meta.label,
      color: meta.color,
      options: tags.map((tag) => ({ value: tag, label: tag.replace(/_/g, " "), color: meta.color })),
      selected: view,
      placeholder: `Search ${meta.label.toLowerCase()}…`,
      /* Redraw EVERYTHING, not just the map: a theme filter changes the
         panel, Trends, Community Insights and Top hazards too. The polygons
         are fetched on the first tick and the map redrawn again once they
         arrive, so the panels update immediately and do not wait on 3 MB. */
      onChange: () => {
        applyFilters({ refit: false });
        if (state.activeTags.size) loadAreas().then(renderMapLayers);
      },
    });
    wrap.appendChild(dd.el);
  }
}

/* HAZARD, THEN SUB-HAZARD, against the IFRC hazard codebook.

   The codebook is a clustering method rather than a list: hazards.json holds
   only the categories the data actually has, so a Sahel operation is never
   offered tsunamis. Returns false when that file is missing, and the caller
   then falls back to the single flat dropdown this replaced.

   BOTH SETS RESOLVE DOWN INTO state.activeTags. That is what lets Trends, Top
   reported hazards, Community Insights and the theme detail list go on working
   through the machinery they already use, untouched. A sub-hazard that exists
   only in Montandon - wildfires, earthquake - has no document tag, resolves to
   nothing here, and filters the event feed alone. */
function buildHazardDropdowns(wrap, meta) {
  const book = state.data.hazards;
  if (!book || !(book.categories || []).length) return false;

  const subsOf = (cats) =>
    cats.flatMap((c) => c.sub_hazards.map((s) => ({ ...s, cat: c.key })));
  const visibleSubs = () => subsOf(
    state.activeHazards.size
      ? book.categories.filter((c) => state.activeHazards.has(c.key))
      : book.categories);

  function resolveTags() {
    for (const key of [...state.activeTags])
      if (key.startsWith("hazard|")) state.activeTags.delete(key);
    for (const sub of visibleSubs()) {
      const on = state.activeSubHazards.size
        ? state.activeSubHazards.has(sub.key)
        : state.activeHazards.has(sub.cat);
      if (on && sub.source === "documents") state.activeTags.add(`hazard|${sub.key}`);
    }
  }

  const redraw = () => {
    resolveTags();
    subDropdown.setOptions(visibleSubs().map((s) => ({
      value: s.key, label: s.label, color: meta.color,
    })));
    applyFilters({ refit: false });
    if (state.activeTags.size || state.activeSubHazards.size || state.activeHazards.size)
      loadAreas().then(renderMapLayers);
  };

  const catDropdown = makeDropdown({
    label: "Hazard",
    color: meta.color,
    /* The asterisk marks the two categories this project added because the
       codebook has nowhere to put conflict or famine. Saying so in the list is
       cheaper than letting somebody quote them back as IFRC's. */
    options: book.categories.map((c) => ({
      value: c.key,
      label: c.in_codebook ? c.label : `${c.label} *`,
      color: meta.color,
    })),
    selected: setView(state.activeHazards),
    placeholder: "Search hazard categories…",
    onChange: () => {
      // A category switched off must not leave its sub-hazards ticked and
      // filtering from behind a list they are no longer on.
      if (state.activeHazards.size) {
        for (const key of [...state.activeSubHazards]) {
          const owner = book.categories.find(
            (c) => c.sub_hazards.some((s) => s.key === key));
          if (owner && !state.activeHazards.has(owner.key))
            state.activeSubHazards.delete(key);
        }
      }
      redraw();
    },
  });

  const subDropdown = makeDropdown({
    label: "Sub-Hazard",
    color: meta.color,
    options: visibleSubs().map((s) => ({ value: s.key, label: s.label, color: meta.color })),
    selected: setView(state.activeSubHazards),
    placeholder: "Search sub-hazards…",
    onChange: redraw,
  });

  wrap.appendChild(catDropdown.el);
  wrap.appendChild(subDropdown.el);
  return true;
}

/* The small view makeDropdown expects, over a plain Set. */
function setView(set) {
  return {
    has: (v) => set.has(v),
    add: (v) => set.add(v),
    delete: (v) => set.delete(v),
    clear: () => set.clear(),
    get size() { return set.size; },
  };
}

/* THE CODEBOOK, INDEXED BY SUB-HAZARD.

   hazards.json is a list of categories each holding its sub-hazards, which is
   the shape the two dropdowns are built from and the wrong way round for a
   popup: that starts from a sub-hazard key and has to name the category above
   it. Inverted once per hazards.json, because the popup is rebuilt on every
   mouse move and a linear scan of the book per hover is not free.

   The asterisk on a category outside the codebook is carried here too, so the
   popup marks conflict and famine exactly as the dropdown does - this project
   added them, and neither should be quotable as IFRC codebook categories. */
let hazardIndexFor = null, hazardIndexCache = {};
function hazardBookIndex() {
  const book = ((state.data.hazards || {}).categories) || [];
  if (hazardIndexFor === book) return hazardIndexCache;
  const idx = {};
  for (const c of book)
    for (const s of c.sub_hazards || [])
      idx[s.key] = {
        label: s.label || s.key,
        catKey: c.key,
        catLabel: c.in_codebook ? c.label : `${c.label} *`,
      };
  hazardIndexFor = book;
  hazardIndexCache = idx;
  return idx;
}

/* Which codebook category holds this sub-hazard. */
function hazardCategoryOf(sub) {
  const e = hazardBookIndex()[sub];
  return e ? e.catKey : null;
}

/* The search box on the Community Insights panel. */
function initVoiceSearch() {
  const input = $("#voice-search");
  /* Typing is a fresh question, so it drops a map selection rather than
     fighting it: with both live, a search that matched nothing inside the
     selection would report "no quote matches" about the whole tab. Cleared
     directly, not through clearVoiceSelection(), because renderVoices() is
     about to run anyway and doing both would render the panel twice. */
  input.addEventListener("input", () => {
    state.voiceSearch = input.value;
    state.voiceSelection = null;
    renderVoices();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      input.value = ""; state.voiceSearch = ""; state.voiceSelection = null; renderVoices();
    }
  });
  for (const tab of document.querySelectorAll(".voice-tab"))
    tab.addEventListener("click", () => {
      state.voiceTab = tab.dataset.tab;
      // The selection was made against the old tab's bubbles, which are about
      // to be redrawn for a different set of voices.
      state.voiceSelection = null;
      for (const other of document.querySelectorAll(".voice-tab"))
        other.classList.toggle("is-active", other === tab);
      renderVoices();
      // renderMapLayers(), not renderInsightBubbles() directly: outside
      // withPane() a direct call would write the UNSCOPED set to every map
      // and break split-view scoping until the next slider tick (Task 12 R6).
      renderMapLayers();
    });
}

/* ------------------------------------------------------- map fit and split */

/* Which map is currently showing this country? Always the first one, unless
   the map is split and the country is the one in the right-hand half. */
function mapShowing(country) {
  const sel = [...state.countries];
  return sel.length === 2 && country === sel[1] && mapB ? mapB : maps[0];
}

/* Hold a half still.

   In split view the two halves each stand for one country, and dragging one of
   them away from its country makes the comparison meaningless without it
   being obvious that anything has moved. So panning is switched off and only
   zoom is left - anchored on the CENTRE rather than the pointer, which is what
   keeps the country in the middle while you zoom. The zoom buttons in the
   corner already work this way.

   Everything switched off here is switched back on when the map is not split,
   so the single-map view keeps behaving normally. */
function setPanLock(m, locked) {
  if (!m) return;
  if (locked) {
    m.dragPan.disable();
    m.dragRotate.disable();
    m.keyboard.disable();
    m.doubleClickZoom.disable();          // would re-centre on the pointer
    m.scrollZoom.enable({ around: "center" });
    m.touchZoomRotate.enable({ around: "center" });
    m.touchZoomRotate.disableRotation();
  } else {
    m.dragPan.enable();
    m.keyboard.enable();
    m.doubleClickZoom.enable();
    m.scrollZoom.enable();
    m.touchZoomRotate.enable();
  }
  m.getContainer().classList.toggle("pan-locked", locked);
}

/* Point one map at a set of bounds. */
function fitMap(m, bounds) {
  if (!m) return;
  m.fitBounds(bounds, { padding: 28, duration: 700, maxZoom: 7 });
}

/* Bring the second map into being, or put it away again.

   It is built the first time two countries are selected and kept afterwards,
   because creating a MapLibre map and its twenty-odd layers is far more
   expensive than hiding a div. The container is shown BEFORE the map is
   constructed: MapLibre measures its container on creation, and a hidden one
   measures zero. */
async function ensureSplit(on) {
  const wrap = $("#map-wrap");
  wrap.classList.toggle("split", on);
  if (on && !mapB) {
    mapB = await initMap("map-b");
    addLayers(mapB);
    maps.push(mapB);
  }
  // Panning is locked while split and released the moment it is not.
  for (const m of maps) { setPanLock(m, on); m.resize(); }
  // Both halves have to be redrawn on the way in AND on the way out: what each
  // one shows depends on whether the map is split, not only on the filter.
  renderMapLayers();
}

/* Put the map where the country filter says it should be. This is the rule the
   dashboard was asked for:
     nothing selected -> the whole region
     one country      -> zoom to it
     two countries    -> split the map and show one in each half
     three or more    -> back to one map, zoomed out to fit them all           */
async function fitToSelection() {
  const sel = [...state.countries];
  await ensureSplit(sel.length === 2);
  if (sel.length === 2) {
    $("#map-a-label").textContent = sel[0];
    $("#map-b-label").textContent = sel[1];
    fitMap(maps[0], boundsFor([sel[0]]));
    fitMap(mapB, boundsFor([sel[1]]));
  } else {
    fitMap(maps[0], sel.length ? boundsFor(sel) : HOME_BOUNDS);
  }
}

/* ========================= 8. BOOT =====================================
 * The starting point. Everything above is a definition; these lines run.
 * ======================================================================== */
(async function boot() {
  // Download the data and create the first map at the same time, then wire up.
  const [, first] = await Promise.all([loadData(), initMap("map-a")]);
  map = first;
  maps.push(map);
  addLayers(map);
  initTimeline();
  initControls();
  initCountryFilter();
  initThemeControls();
  initSidebarResize();
  initVoiceSearch();
  computeTrendSeries();
  /* The graph is sized in pixels off its panel, and the right sidebar can be
     resized by dragging its grip - which changes that width without any window
     resize to listen for. Watching the canvas itself catches both. */
  new ResizeObserver(() => drawMovementTrends()).observe($("#movement-trends"));
  initTrendsClick();
  window.addEventListener("resize", () => { for (const m of maps) m.resize(); });
  // open the story at the beginning
  renderAll();
})();
