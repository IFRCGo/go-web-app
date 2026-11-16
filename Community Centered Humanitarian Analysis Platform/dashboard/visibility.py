"""The one question every public response asks: which countries are hidden?

hidden_countries() reads the table on every call. There is deliberately no
process-level cache: gunicorn runs several workers, and a switch made in Admin
must reach all of them on the very next request.
"""
from dataclasses import dataclass
from functools import lru_cache

from boundaries.models import AdminArea

from .models import CountryVisibility

# Values that mean "not one country" and are therefore never hidden.
_NOT_A_COUNTRY = {None, "", "Regional"}

# The dashboard is the story of displacement FROM Sudan: its corridors and IDP
# layers have no other country to hang on, so Sudan cannot be switched off.
NEVER_HIDDEN = {"SDN"}


@dataclass(frozen=True)
class Hidden:
    iso3: frozenset
    names: frozenset

    def __bool__(self):
        return bool(self.iso3)

    def hides(self, value) -> bool:
        if not isinstance(value, str) or value in _NOT_A_COUNTRY:
            return False
        return value in self.iso3 or value in self.names

    @property
    def labels(self) -> frozenset:
        """Names and codes together, for name fields that sometimes hold an
        ISO3 code ('SDN' sits in Document.country_focus today)."""
        return self.names | self.iso3

    def key(self) -> str:
        """Stable text for cache keys and ETags."""
        return ",".join(sorted(self.iso3))


def hidden_countries() -> Hidden:
    rows = (CountryVisibility.objects.filter(shown=False).exclude(iso3__in=NEVER_HIDDEN)
            .values_list("iso3", "name"))
    return Hidden(frozenset(r[0] for r in rows), frozenset(r[1] for r in rows))


def sync_countries() -> int:
    """Add any country the boundaries hold that has no row yet; refresh names.

    Never changes `shown` and never deletes: a country that drops out of the
    boundaries keeps its row and its setting.
    """
    created = 0
    countries = (AdminArea.objects.filter(level=0)
                 .values_list("iso3", "country_name").distinct())
    for iso3, name in countries:
        row, made = CountryVisibility.objects.get_or_create(
            iso3=iso3, defaults={"name": name})
        if made:
            created += 1
        elif row.name != name:
            CountryVisibility.objects.filter(pk=row.pk).update(name=name)
    return created


@lru_cache(maxsize=None)
def iso3_for_pcode(pcode: str):
    """The country a p-code belongs to, looked up rather than guessed from a prefix."""
    return (AdminArea.objects.filter(pcode=pcode)
            .values_list("iso3", flat=True).first())
