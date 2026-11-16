"""Kobo (kobo.ifrc.org) -> Humanitarian Service Points, and CCHA primary data.

ONE BASE, ONE SUBCLASS PER FORM. A form is named in .env (HSPs_FORM_ID,
UGANDA_CCHA_FORM_ID) and the only thing a subclass knows is which setting holds
its uid and which loader reads it. A third form is a third subclass of a few
lines, a .env key, a compose line and a source_sync row.

TWO PAYLOADS, ONE LOAD. Kobo's /data/ answers in CODES ("health wash", a
district's `name`), while the map and the Excel export it replaces speak in
LABELS. The labels live in the form definition, a second request. Loaders take
one payload per Call, so plan() fetches the definition first, saves it to the
cache as evidence, and hands it to the one /data/ Call in `context`. IPC's
plan() already makes a preparatory listing request the same way.

NOT APPROVED NEVER ARRIVES (CCHA form only - George's rule, 2026-11-16). The
/data/ call is filtered server-side, so a Not Approved submission does not
reach this server, not even the cache. A second, id-only request lists what is
Not Approved NOW, so the loader can delete a submission that was approved,
stored, and later rejected.

NO NARROWING. Every pull asks for everything: `_submission_time` does not move
when a submission is edited, so a date window would miss corrections. An empty
answer is therefore always a fault, never "nothing new".

The token travels only in the Authorization header - never in a URL, which
would put it in requests' own error messages and so in a job log.
"""
import json
from datetime import date
from pathlib import Path

from django.conf import settings

from external_data.fetchers import register
# The module, not the names, for the reason refresh_external gives: a patched
# base.http_get_json must be the one these calls reach.
from external_data.fetchers import base
from external_data.fetchers.base import Call, Fetcher, save_payload

# Kobo accepts up to 30,000 a page. 5,000 keeps one page of a large form well
# inside a minute while a six-row HSP form is still a single request.
PAGE_LIMIT = 5000

NOT_APPROVED = "validation_status_not_approved"


class KoboFetcher(Fetcher):
    source = "kobo"
    tool = "kobo get_asset + list_submissions"
    form_setting = ""            # the setting holding this form's asset uid
    form_key = ""                # short name: cache folder, context, sync variant
    loader = ""                  # loader_dataset for the /data/ Call
    exclude_not_approved = False

    def _uid(self):
        return getattr(settings, self.form_setting, "")

    def _headers(self):
        return {"Authorization": f"Token {settings.KOBO_TOKEN}"}

    def _asset_url(self):
        return f"{settings.KOBO_URL}/api/v2/assets/{self._uid()}/"

    def plan(self, sync):
        uid, headers = self._uid(), self._headers()
        folder = Path("kobo") / self.form_key

        form = base.http_get_json(self._asset_url(), {"format": "json"}, headers=headers)
        save_payload(folder / "form.json", form)

        context = {"form_key": self.form_key, "form_uid": uid, "form": form,
                   "pulled_on": date.today().isoformat()}
        params = {"format": "json", "limit": PAGE_LIMIT}

        if self.exclude_not_approved:
            rejected = base.fetch_next_url_pages(
                self._asset_url() + "data/",
                {"format": "json", "limit": PAGE_LIMIT,
                 "query": json.dumps({"_validation_status.uid": NOT_APPROVED}),
                 "fields": json.dumps(["_id"])},
                headers)
            ids = sorted(r["_id"] for r in rejected["results"] if "_id" in r)
            save_payload(folder / "not_approved_ids.json", ids)
            context["not_approved_ids"] = ids
            params["query"] = json.dumps(
                {"_validation_status.uid": {"$ne": NOT_APPROVED}})

        yield Call(url=self._asset_url() + "data/", params=params,
                   cache_path=folder / "data.json", loader_dataset=self.loader,
                   context=context, paginated=True, pager="next_url",
                   headers=headers)

    def params_record(self):
        return {"tool": self.tool, "fetcher": type(self).__name__,
                "form_key": self.form_key, "form_uid": self._uid()}


@register
class KoboHspFetcher(KoboFetcher):
    """The Humanitarian Service Point mapping form. Replaces the Excel export.

    The key matches the row load_hsps has always written (iso3 NULL, variant
    'hsp-mapping'), so the button appears on the row people already know.
    """
    dataset = "humanitarian_service_points"
    variant = "hsp-mapping"
    requires = ("KOBO_TOKEN", "HSPS_FORM_ID")
    form_setting = "HSPS_FORM_ID"
    form_key = "hsp"
    loader = "kobo_hsp"


@register
class KoboCchaFetcher(KoboFetcher):
    """CCHA primary data: household, FGD and KII sections in one form, used in
    several countries - so the source row is regional (iso3 NULL) and the
    country is a column. The .env key keeps its first name, UGANDA_CCHA_FORM_ID."""
    dataset = "primary_data"
    variant = "ccha_primary_data"
    requires = ("KOBO_TOKEN", "UGANDA_CCHA_FORM_ID")
    form_setting = "UGANDA_CCHA_FORM_ID"
    form_key = "ccha_primary_data"
    loader = "ccha_primary_data"
    exclude_not_approved = True

    def note_empty(self, sync, call):
        """Delete rejected submissions even when nothing else loaded.

        When every remaining submission is Not Approved, /data/ comes back empty
        and load() raises before after_insert() can delete them, so they would
        survive every later pull. The runner calls this hook on an empty
        payload, outside the rolled-back transaction. The pull still reports
        failure, because no submissions loaded.
        """
        from external_data.loaders.ccha_primary_data import delete_rejected
        delete_rejected(call.context.get("not_approved_ids"))
