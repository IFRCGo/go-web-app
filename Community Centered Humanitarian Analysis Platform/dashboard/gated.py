"""Which /api/ addresses honour the country switch, and which are regional.

A test asserts that GATED | REGIONAL is exactly the set of URL names under
api/, so a new public endpoint cannot ship without someone deciding which list
it belongs to.
"""
# Regional by decision: no per-country rows to hide.
REGIONAL = {"api-index", "api-meta", "api-headline", "external-index"}

# Each of these drops hidden countries' rows before responding.
GATED = {
    "insights-list",
    "api-documents", "api-events", "api-flows", "api-figures", "api-tags",
    "external-seasonal", "external-food-security", "external-movement",
    "external-insights", "external-hsps", "external-crossings", "external-sync",
    "boundary-layers", "boundary-layer", "boundary-features",
}
