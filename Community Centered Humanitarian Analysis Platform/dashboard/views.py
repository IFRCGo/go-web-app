"""Serves the interactive map dashboard.

Everything the dashboard needs now lives inside this app:

    dashboard/templates/dashboard/index.html   the page itself
    dashboard/static/dashboard/css/app.css     its styling
    dashboard/static/dashboard/js/app.js       its behaviour
    dashboard/data/                            the JSON + GeoJSON it fetches

Two views do all the work:

  index()      renders the page for the address "/"
  data_file()  sends one file out of dashboard/data/, e.g. data/events.json

The stylesheet and script are ordinary Django static files: the template
addresses them with {% static %} and WhiteNoise serves them.

The data files are deliberately NOT static files. The pipeline rewrites them
every time it runs, and static files are collected once at start-up; serving
them through this view instead means a browser refresh shows the new numbers
immediately, with no collectstatic and no restart.
"""
import json
import mimetypes
import threading
from collections import OrderedDict

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse
from django.shortcuts import render

from .scrubbers import WHOLE_FILE, scrubber_for
from .visibility import hidden_countries

# The countries the picker offers, in dropdown order: Sudan first as the origin
# of the crisis, then its neighbours alphabetically. Each name must match the
# "name" property in data/boundaries/admin0.geojson. index() removes hidden ones.
DASHBOARD_COUNTRIES = ["Sudan", "Central African Republic", "Chad", "Egypt",
                       "Ethiopia", "Libya", "South Sudan", "Uganda"]

# Scrubbed bodies, keyed (path, mtime, hidden set): a rewritten file or a switch
# flipped in Admin each produce a new key, so nothing stale is ever served.
_SCRUB_CACHE: "OrderedDict[tuple, bytes | None]" = OrderedDict()
_SCRUB_CACHE_SIZE = 32
# gunicorn runs threads: lookups, inserts and evictions happen under one lock.
_SCRUB_LOCK = threading.Lock()


def _scrubbed(target, relpath, scrub, hidden):
    """The cleaned file as bytes, or None when the whole file is hidden."""
    key = (relpath, target.stat().st_mtime_ns, hidden.key())
    with _SCRUB_LOCK:
        try:
            payload = _SCRUB_CACHE[key]
            _SCRUB_CACHE.move_to_end(key)
            return payload
        except KeyError:
            pass  # not cached, or evicted meanwhile: compute it below
    result = scrub(json.loads(target.read_text(encoding="utf-8")), hidden)
    payload = None if result is WHOLE_FILE else json.dumps(
        result, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    with _SCRUB_LOCK:
        _SCRUB_CACHE[key] = payload
        while len(_SCRUB_CACHE) > _SCRUB_CACHE_SIZE:
            _SCRUB_CACHE.popitem(last=False)
    return payload

# GeoJSON is not in Python's built-in table of file types, so register it.
# Without this the browser would receive the boundary files as plain text.
mimetypes.add_type("application/geo+json", ".geojson")


def index(request):
    """Return the dashboard page itself.

    The two basemap values are handed to the template rather than hard-coded in
    app.js so the IFRC GO style or its Mapbox token can be changed from .env
    alone. Both are public values; see MAPBOX_* in config/settings.py.
    """
    hidden = hidden_countries()
    return render(request, "dashboard/index.html", {
        "mapbox_style_url": settings.MAPBOX_STYLE_URL,
        "mapbox_access_token": settings.MAPBOX_ACCESS_TOKEN,
        "shown_countries": [c for c in DASHBOARD_COUNTRIES if not hidden.hides(c)],
    })


def data_file(request, path: str):
    """Return one file from dashboard/data/, e.g. data/boundaries/aoi.geojson."""
    base = settings.DASHBOARD_DATA_DIR.resolve()
    target = (base / path).resolve()

    # Safety check: refuse addresses like ../../secret that try to climb out
    # of the data folder.
    if not target.is_relative_to(base) or not target.is_file():
        raise Http404("file not found")

    content_type, _ = mimetypes.guess_type(target.name)

    # THE VISIBILITY GATE. While any country is switched off in Admin, the file
    # is cleaned of it before it leaves the server, so nothing of a hidden
    # country reaches the browser - not even DevTools. Fail-closed: a file with
    # no registered scrubber is refused rather than sent whole.
    hidden = hidden_countries()
    if hidden:
        relpath = target.relative_to(base).as_posix()
        scrub = scrubber_for(relpath)
        if scrub is None:
            raise Http404("file not available while a country is hidden")
        payload = _scrubbed(target, relpath, scrub, hidden)
        if payload is None:
            raise Http404("file belongs to a hidden country")
        response = HttpResponse(payload, content_type=content_type or "application/json")
        response["Cache-Control"] = "no-store"
        return response

    response = FileResponse(
        target.open("rb"), content_type=content_type or "application/octet-stream"
    )
    # The pipeline rewrites these files, so never let a browser cache them.
    response["Cache-Control"] = "no-store"
    return response
