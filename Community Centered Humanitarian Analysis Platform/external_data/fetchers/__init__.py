"""The fetcher registry. Adding a source is adding a file, not editing a command.

Deliberately the same shape as `external_data/loaders/__init__.py`, and for the
same reason: the two packages are halves of one idea. A loader knows what a
payload MEANS; a fetcher knows where it COMES FROM. Neither imports the other.

THE KEY INCLUDES `variant`, which the loader registry's does not. A loader is
chosen by dataset alone because `fewsnet_phases` is one way of reading one shape
of JSON. A fetch is chosen by all three because `hdx/idps/SDN` is an
admin2-overview request and `fewsnet/food_security/ETH` sits under variant
'fewsnet-phases' while its loader's dataset is 'fewsnet_phases'. Keying on
(source, dataset) alone silently misses that row.
"""
FETCHERS = {}


def register(cls):
    """Class decorator: put a Fetcher subclass into the registry under its key."""
    FETCHERS[(cls.source, cls.dataset, cls.variant)] = cls
    return cls


def fetcher_for(source, dataset, variant=""):
    """The fetcher for one source_sync row, or None if that row has no API."""
    return FETCHERS.get((source, dataset, variant or ""))


# Importing the modules is what populates FETCHERS. Kept at the bottom because
# each module imports `register` from this one.
from external_data.fetchers import (dtm, fewsnet, hdx, ipc,  # noqa: E402,F401
                                    kobo, montandon, unhcr_situations)
