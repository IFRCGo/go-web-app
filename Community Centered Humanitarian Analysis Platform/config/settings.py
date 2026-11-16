"""Django settings - the single place where the whole project is configured.

Read this file top-to-bottom to understand how the platform is wired:
  * where the code lives (BASE_DIR / REPO_DIR)
  * where the *data* lives (the UNHCR PDFs, the dashboard JSON, the caches)
  * which database to use (PostgreSQL, credentials come from the .env file)
  * which apps are installed (data_track / data_pipeline / dashboard / updater)

Nothing secret is written here. Every password or key is read from the
environment with os.environ.get("NAME", "fallback"), and docker compose loads
those names out of the .env file in the project root.
"""
import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured

# --------------------------------------------------------------------------
# 1. Folders
# --------------------------------------------------------------------------
# BASE_DIR  = .../Community Centered Humanitarian Analysis/Community Centered Humanitarian Analysis Platform   (this Django project)
# REPO_DIR  = .../Community Centered Humanitarian Analysis              (the git repository root)
BASE_DIR = Path(__file__).resolve().parent.parent
REPO_DIR = BASE_DIR.parent


def env_path(name: str, default: Path) -> Path:
    value = os.environ.get(name)
    return Path(value) if value else default

SOURCE_ROOT = env_path("SOURCE_ROOT", REPO_DIR.parent)
DASHBOARD_DATA_DIR = env_path("DASHBOARD_DATA_DIR", BASE_DIR / "dashboard" / "data")

# Documents uploaded through the insights intake screen. Inside /app because
# /work is mounted read-only - see docker-compose.yml, mount 1.
MEDIA_ROOT = env_path("MEDIA_ROOT", BASE_DIR / "media")
MEDIA_URL = "/media/"

# How long an uploaded document stays on disk. It is a courier, not an archive:
# what this platform keeps is the text read out of it and the statements a
# person published, so the file is released once a document has no pending
# statement left, and swept after this many minutes whether anybody reviewed it
# or not. See insights/retention.py.
# `or` rather than a default argument - an empty value in .env must fall back,
# not be read as "delete every upload immediately".
INSIGHT_UPLOAD_RETENTION_MINUTES = int(
    os.environ.get("INSIGHT_UPLOAD_RETENTION_MINUTES") or 30)

# The in-container extraction adapter (spec §8.2). Optional: with nothing set,
# extraction is run by an agent on the host and loaded from api_cache/insights/.
# `or` rather than a default argument - an empty value in .env must fall back.
LLM_PROVIDER = os.environ.get("LLM_PROVIDER") or "anthropic"
LLM_MODEL = os.environ.get("LLM_MODEL") or "claude-opus-5"
LLM_BASE_URL = os.environ.get("LLM_BASE_URL") or ""
LLM_API_KEY = os.environ.get("LLM_API_KEY") or ""

# Raw pulls from the humanitarian MCP servers (HDX, IPC, FEWS NET, UNHCR).
# These are fetched by an analyst in Claude Code, NOT by this app; the
# pipeline only re-reads whatever sits in the folder. See data_pipeline/README.md.
API_CACHE_DIR = env_path("API_CACHE_DIR", BASE_DIR / "data_pipeline" / "api_cache")
# `manage.py test` swaps API_CACHE_DIR for a temporary folder, so no test can
# rewrite or delete the real cache files. See config/test_runner.py.
TEST_RUNNER = "config.test_runner.IsolatedCacheRunner"

# Reading documents for the insights wizard (spec 2026-09-21 §11). Docling
# converts a PDF or Word file to per-page markdown before the model sees it;
# PyMuPDF stays as the per-document fallback.
# `or` rather than a default argument throughout - an empty value in .env must
# fall back, not be read as "no languages" or "no pages".
DOCLING_ENABLED = (os.environ.get("DOCLING_ENABLED") or "true").strip().lower() not in (
    "0", "false", "no", "off")
# WHY THIS IS NOT "en,fr,ar", WHICH IS WHAT THE ARCHIVE WOULD WANT. EasyOCR
# refuses to load Arabic beside any other non-English language - it raises
# "Arabic is only compatible with English" - and Docling takes exactly one
# ocr_options, so one pass cannot read an Arabic report and a French one.
# Arabic wins the default because the loss is asymmetric: French is Latin
# script, so an English model still reads it and only mangles the accents,
# while Arabic under a Latin model reads as nothing at all. The weights for
# both are baked into the image, so a French-heavy deployment switches with
# DOCLING_OCR_LANGS=en,fr in .env and a restart - no rebuild.
DOCLING_OCR_LANGS = [
    part.strip() for part in (os.environ.get("DOCLING_OCR_LANGS") or "en,ar").split(",")
    if part.strip()
]
# The same ceiling s02_extract_text.MAX_PAGES has always held, and it matters
# far more here: with OCR on, every page is paid for in minutes.
DOCLING_MAX_PAGES = int(os.environ.get("DOCLING_MAX_PAGES") or 40)
DOCLING_TIMEOUT_SECONDS = int(os.environ.get("DOCLING_TIMEOUT_SECONDS") or 900)
# Where the Docker build baked the layout, table and OCR weights.
DOCLING_ARTIFACTS_PATH = env_path("DOCLING_ARTIFACTS_PATH", Path("/opt/docling/models"))

# The hazard vocabulary: IFRC codebook categories, the HIP codes observed for the
# countries of focus, and the document tags, all mapped onto one category set.
# Beside taxonomy.json because it is the same kind of thing - a vocabulary a
# person edits - but read through external_data/hazards.py, because a fetcher
# must not import the pipeline (see fetchers/ipc.py, which parses CRISIS_START
# out of settings for exactly that reason).
HAZARD_CODEBOOK = env_path("HAZARD_CODEBOOK",
                           BASE_DIR / "data_pipeline" / "hazard_codebook.json")

# The two keys the fetchers need. `get(X) or ""`, NOT `get(X, "")`: an empty
# value in .env must fall back to "not set" rather than be sent as a blank key,
# which HAPI answers with a 403 instead of a comprehensible refusal.
#
# Absent is empty string, never None: the admin tests truthiness to decide
# whether a row's Pull button is live, and None would work by accident today
# and break the moment somebody writes `len(...)`.
IPC_API_KEY = os.environ.get("IPC_API_KEY") or ""
HDX_API_TOKEN = os.environ.get("HDX_API_TOKEN") or ""

# Montandon, IFRC's disaster-event registry. NOT an open API: a direct request
# to the staging host answers {"detail": "Not authenticated"}. It is the same
# IFRC_API_TOKEN the `monty` MCP server holds, and it has to be copied into .env
# by hand. Production (montandon-eoapi.ifrc.org) answers 401 and wants GO OIDC
# credentials, so staging is the default until somebody holds them.
IFRC_API_TOKEN = os.environ.get("IFRC_API_TOKEN") or ""
MONTANDON_STAC_URL = (os.environ.get("MONTANDON_STAC_URL")
                      or "https://montandon-eoapi-stage.ifrc.org/stac")


def env_paths(name: str, default: list) -> list:
    """A path-separator list from the environment, falling back when empty.

    `or default` rather than a default argument, for the same reason env_path
    uses it: an empty value in .env must fall back, not be read as "no folders
    at all", which would leave the folder browser with nothing to offer and no
    way to tell a misconfiguration from a deliberate empty list.
    """
    raw = os.environ.get(name) or ""
    chosen = [Path(part) for part in raw.split(os.pathsep) if part.strip()]
    return chosen or default


# Which folders the insights folder browser may offer, and the only folders an
# InsightFolder may point at. Configuration, not a literal: this platform is
# deployed against different folders in different places, and no message shown
# to a user may name one deployment's own paths. The wizard's native upload
# route needs none of this - it has no container path at all.
INSIGHT_DOCUMENT_ROOTS = env_paths("INSIGHT_DOCUMENT_ROOTS", [SOURCE_ROOT, MEDIA_ROOT])

# The two folders of UNHCR situation reports that the pipeline reads.
SOURCE_COLLECTIONS = {
    "regional": SOURCE_ROOT / "UNHCR Regional Population Movement pdfs",
    "sudan_only": SOURCE_ROOT / "UNHCR Sudan only pdfs",
}

# Excel workbook (kept beside the PDFs) used by data_pipeline step 7.
POP_MOVEMENT_XLSX = env_path(
    "POP_MOVEMENT_XLSX", SOURCE_ROOT / "neighbouring countries Pop movement data.xlsx"
)

# --------------------------------------------------------------------------
# The boundary library's source files.
#
# These are read ONCE, by "manage.py load_boundaries", and then live in the
# database. Nothing at runtime touches these folders: a dashboard that stops
# drawing borders because a shared drive was reorganised is not a dashboard
# anyone can rely on.
#
# Inside Docker they arrive as two read-only mounts (see docker-compose.yml).
# The defaults below are the paths on the machine this was built on, so the
# loader also runs directly from a laptop with no environment set.
# --------------------------------------------------------------------------
BOUNDARY_ADMIN_DIR = env_path(
    "BOUNDARY_ADMIN_DIR",
    Path(r"C:\Users\Admin\OneDrive - IFRC\Sudan Crisis - Chad 2026\Chad Maps\Countries Maps"),
)
BOUNDARY_LAYERS_DIR = env_path(
    "BOUNDARY_LAYERS_DIR",
    Path(r"C:\Users\Admin\OneDrive - IFRC\Nigeria Malnutrition 2025"
         r"\HDCC Africa-1 Disaster Preparedness and Response - 08. IM"
         r"\01. Maps\QGIS_Template_2024\layers"),
)
# The IFRC icon set, used to build the Humanitarian Service Point symbols.
# The PNGs rather than the SVGs: the SVGs carry their colour in a stylesheet
# block that map renderers ignore, and would draw as black silhouettes.
BOUNDARY_ICONS_DIR = env_path(
    "BOUNDARY_ICONS_DIR", Path(r"C:\Users\Admin\Dropbox\icons\Colour\png")
)
# The Kobo export behind the Humanitarian Service Points layer.
HSP_XLSX = env_path(
    "HSP_XLSX",
    Path(r"C:\Users\Admin\OneDrive - IFRC\Sudan Crisis - Chad 2026\Chad Maps"
         r"\Humanitarian_Service_Points_Mapping_-_all_versions_-_labels"
         r"_-_2026-09-08-11-46-14.xlsx"),
)

# --------------------------------------------------------------------------
# 2. Core Django security / debug switches
# --------------------------------------------------------------------------
# The secret key signs cookies and sessions. The fallback below is fine for a
# local install; set DJANGO_SECRET_KEY in .env before putting this on a server.
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-insecure-key-change-me")

# DEBUG=True shows full error pages. Turn it off (DJANGO_DEBUG=0) in production.
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"

# Which host names this site answers to. "*" = any, which is fine locally.
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")

# Browsers refuse cross-origin POSTs unless the origin is trusted. Needed when
# the dashboard is opened through a hostname other than localhost.
CSRF_TRUSTED_ORIGINS = [
    o for o in os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS", "").split(",") if o
]

# --------------------------------------------------------------------------
# 3. Applications and middleware
# --------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",          # the built-in database admin site at /admin/
    "django.contrib.auth",           # users and permissions (the admin login)
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",    # collects CSS/JS for serving
    "data_track",                    # the seven database tables + the JSON API
    "boundaries",                    # the map itself: admin areas and features
    "external_data",                 # IPC, FEWS NET, DTM, UNHCR + their freshness
    "api_calls",                     # pulling those sources, and the job record
    "insights",                      # what communities said, and who reviewed it
    "data_pipeline",                 # the ETL steps, as manage.py commands
    "dashboard",                     # serves the MapLibre dashboard
    "updater",                       # the one-click "Update now" page
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # WhiteNoise serves static files straight from Django, so no nginx container.
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # Every template lives in its app's own templates/ folder, which
        # APP_DIRS finds by itself. Nothing outside the project is searched.
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# --------------------------------------------------------------------------
# 4. The database - PostgreSQL, connection details from the environment
# --------------------------------------------------------------------------
# NOTHING about the database is hard-coded here. All five values come from the
# environment, which docker compose fills in from the .env file beside
# docker-compose.yml. .env is git-ignored and never published, so a copy of
# this repository carries no database and no credentials: whoever clones it
# copies env.example to .env, points it at their own PostgreSQL, and starts.
#
# The name, user, host and port fall back to the values of the PostgreSQL
# container that ships with this project, so the bundled stack works with no
# configuration. The password has no fallback on purpose - see below.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB", "sudan_neighbouring_pop_movement"),
        "USER": os.environ.get("POSTGRES_USER", "sudan"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", ""),
        # "db" is the service name of the PostgreSQL container in docker-compose.
        # Set POSTGRES_HOST in .env to use a database somewhere else instead.
        "HOST": os.environ.get("POSTGRES_HOST", "db"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
        # Keep one connection open for a minute instead of reconnecting per request.
        "CONN_MAX_AGE": 60,
    }
}

# A default password would be worse than none: a fresh clone would appear to
# work while quietly using a password that is printed in a public repository.
# Better to stop immediately and say what is missing.
if not DATABASES["default"]["PASSWORD"]:
    raise ImproperlyConfigured(
        "POSTGRES_PASSWORD is not set, so there is nothing to connect to the "
        "database with.\n"
        "Copy env.example to .env next to docker-compose.yml, set "
        "POSTGRES_PASSWORD in it, and start again.\n"
        "To use a PostgreSQL server you already have, set POSTGRES_HOST, "
        "POSTGRES_PORT, POSTGRES_DB and POSTGRES_USER in the same file."
    )

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --------------------------------------------------------------------------
# 5. Language, time and static files
# --------------------------------------------------------------------------
LANGUAGE_CODE = "en-gb"
TIME_ZONE = os.environ.get("TZ", "UTC")
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"   # collectstatic writes here (used in Docker)

# WhiteNoise normally serves the copies made by collectstatic at start-up, which
# would mean restarting the web container after every tweak to the dashboard's
# app.js or app.css. With DEBUG on it re-reads the originals on each request
# instead, so a browser refresh is enough - the same as before the dashboard
# moved into Django. Turn DEBUG off and the fast, cached behaviour returns.
WHITENOISE_AUTOREFRESH = DEBUG
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    # Compress static files so browsers download less.
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedStaticFilesStorage"},
}

# --------------------------------------------------------------------------
# 6. Project-specific settings used by the pipeline and the updater page
# --------------------------------------------------------------------------
# Link shown on the updater page ("open the dashboard").
DASHBOARD_URL = os.environ.get("DASHBOARD_URL", "/")

# The crisis clock starts the day fighting broke out in Khartoum.
CRISIS_START = "2023-04-15"

# --------------------------------------------------------------------------
# The basemap the dashboard draws under everything else.
#
# This is the official IFRC GO basemap, hosted by Mapbox and shared across the
# GO platform, so our map looks like every other IFRC map. Documented at
# https://go-wiki.ifrc.org/en/user_guide/Maps
#
# The token is a PUBLIC Mapbox token ("pk." prefix): it is meant to be sent to
# the browser, exactly as go.ifrc.org sends it. It sits here rather than in the
# JavaScript only so it can be rotated from .env without editing code.
# "or" rather than a get() default on purpose: docker-compose passes these
# through as ${MAPBOX_STYLE_URL:-}, so an unset value arrives as an EMPTY
# string, not as a missing name. get(name, default) would hand the map "" and
# it would never load. Same shape as env_path() above.
MAPBOX_STYLE_URL = (
    os.environ.get("MAPBOX_STYLE_URL") or "mapbox://styles/go-ifrc/ckrfe16ru4c8718phmckdfjh0"
)
MAPBOX_ACCESS_TOKEN = os.environ.get("MAPBOX_ACCESS_TOKEN") or ("pk.eyJ1IjoiZ28taWZyYyIsImEiOiJjbWNkN2w1YjUwNmt4MmpxemZkYmRubDJjIn0"
                                                                ".riUripexhLbliR3Q1Z99rA")

# Send log lines to the container console so "docker compose logs" shows them.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
