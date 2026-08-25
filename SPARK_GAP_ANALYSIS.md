# SPARK — Existing Implementation vs New Design: Gap Analysis

###### tags: `spark`, `ifrc-go`, `logistics`, `gap-analysis`

**Companion to:** [SPARK — Frontend Implementation Document](./SPARK_FRONTEND_IMPLEMENTATION.md)
**Purpose:** identify what the existing SPARK implementation already provides, what the new design needs that does not exist yet, and what the existing implementation does that the new design has dropped.

---

## 0. Method and caveat

**The Power BI report itself could not be read.** Two routes were tried:

- `https://go-stage.ifrc.org/spark` — a React SPA that renders the embed through the Power BI JS SDK using a short-lived embed token from `/api/v2/auth-power-bi/`. Returns an empty app shell.
- The underlying iframe, `app.powerbi.com/reportEmbed?reportId=07e2bd35-…&groupId=e2375ce2-…` (workspace cluster `WABI-NORTH-EUROPE-J`) — returns HTTP 200 with the body *"Sign in to view this report. JavaScript is required for this embedded experience."* The `config` query parameter decodes to only `{"clusterUrl": …, "embedFeatures": {"usageMetricsVNext": true}}` — no report metadata.

The report content exists only inside an authenticated browser session. Nothing in this document is derived from scraping it.

**What was read instead** — the unmerged SPARK backend branch, which is the system that *feeds* that Power BI report and is named in the onboarding document as the reference for "schema design, transformation logic, and API design":

`github.com/Sadat154/COMP0016_2025_Team23_SparkIntegrationIntoGoBackend`

Files inspected: `docs/SPARK.md`, `api/stock_inventory_view.py`, `api/framework_agreement_views.py`, `api/pro_bono_views.py`, `api/customs_spark_views.py`, `data/ProBono.csv`, and the repository tree (1,700 files). Field lists below are read from response construction in those views, not inferred.

This is a better source than the report would have been: it gives exact field names, filter parameters, permission classes and endpoint paths, which is what the frontend actually needs to plan against.

---

## 1. Existing implementation at a glance

```
Fabric (Azure SQL) ─► pull_fabric_data ─► Postgres (30 Dim + 4 Fct tables)
                                              │
                              PySpark transforms
                                              │
                       CleanedFrameworkAgreement / StockInventory
                                              │
                                    bulk_index commands
                                              │
                                       Elasticsearch
                                              │
                                       DRF API endpoints
```

Existing endpoints and their paths:

| Endpoint | Module | Auth |
|---|---|---|
| `api/v1/warehouse-stocks/` (list, aggregated, summary) | Stock Inventory | **none** (`permission_classes = []`) |
| `api/v1/warehouse-suggestions/` | Warehouse suggestion | — |
| `fabric/*` + `api/v2/fabric/cleaned-framework-agreements/` | Framework Agreements | `IsAuthenticated`, `DenyGuestUserPermission` |
| `…/cleaned-framework-agreements/item-categories/` | FA filter options | `IsAuthenticated` |
| `…/cleaned-framework-agreements/summary/` | FA stat cards | `IsAuthenticated` |
| `…/cleaned-framework-agreements/map-stats/` | FA map | `IsAuthenticated` |
| `api/v1/pro-bono-services/` | Pro-Bono | **none** (`permission_classes = []`) |
| `api/v2/country-regulations/` + customs updates | Customs | `IsAuthenticated` |

Two things to note immediately. First, the paths bear no resemblance to the `/api/v2/spark/*` namespace proposed in the implementation document — every endpoint is renamed in the rewrite, so no frontend code can be carried over. Second, **the stock and pro-bono endpoints have no authentication at all**, and no endpoint anywhere applies role scoping.

---

## 2. Stock Inventory

**Existing response fields** (`api/stock_inventory_view.py`): `id`, `warehouse_id`, `warehouse`, `warehouse_country`, `country`, `region`, `product_category`, `item_name`, `quantity`, `unit_measurement`, `catalogue_link`.

**Existing filters:** `region`, `country_iso3`, `product_category`, `item_name`, `warehouse_ids`, `sort`, `order`, `page`, `page_size`, `distinct=1`.

| New design needs | Exists? | Gap |
|---|---|---|
| Region | ✅ `region` | — |
| Country | ✅ `country`, `country_iso3` | — |
| **Warehouse managed by** (IFRC / ICRC / NS) | ❌ | **Missing.** Blocks the table column, the three stat cards, and the entire map legend |
| Item categories | ✅ `product_category` | — |
| Item sub-categories | ⚠️ `item_name` only | Two levels exist (`product_category`, `item_name`); the design shows three — category, sub-category, item description |
| Quantity | ✅ `quantity` + `unit_measurement` | — |
| Details / catalogue link | ✅ `catalogue_link` (via `ItemCodeMapping`, populated by a Playwright scraper of the Red Cross Item Catalogue) | — |
| **Contact** | ❌ | **Missing.** No contact field. `DimVendorContact` / `DimVendorContactEmail` exist as Fabric tables but are not joined into `StockInventory` |
| **Status** (`Available` / `Available soon`) | ❌ | **Missing.** No status field and no derivation logic. `DimInventoryItemStatus` exists as a dimension table but is unused in the transform |
| **Warehouse coordinates** | ❌ | **Missing.** Zero `lat` / `lon` / `coord` / `geo` references in the stock view. The map is driven by a **hardcoded allowlist** `MAP_WAREHOUSE_IDS` of 10-ish warehouse codes (`AE1DUB002`, `AR1BUE002`, …), and distance work in `api/country_distance.py` uses **country centroids** |
| **Sending vs Receiving country** | ❌ | **Missing.** Only one country dimension plus `warehouse_country`. No lane/corridor concept — the corridor view has no backing whatsoever |
| **Stat card aggregates by organisation** | ⚠️ summary endpoint exists | Cannot split IFRC / ICRC / NS without `warehouse managed by` |
| Mob Tables | ❌ | **Missing entirely.** No model, no endpoint, no ingestion |
| Charts (most requested, gaps) | ❌ | **Missing.** No demand or gap aggregation anywhere |

**The two most consequential gaps are `warehouse managed by` and warehouse coordinates.** Between them they block three stat cards, one table column, the map legend, and marker placement — i.e. most of the Stock Inventory tab. Neither is a frontend problem; both are ingestion/transform work.

---

## 3. Framework Agreements

**Existing response fields** (camelCase, `api/framework_agreement_views.py`): `id`, `classification`, `defaultAgreementLineExpirationDate`, `status`, `pricePerUnit`, `vendorName`, `vendorValidFrom`, `vendorValidTo`, `vendorCountry`, `owner`, plus indexed `agreement_id`, `item_category`, `region_countries_covered`.

**Existing filters:** `regionCountriesCovered`, `itemCategory`, `vendorCountry`, `sort`, `page`.

| New design needs | Exists? | Gap |
|---|---|---|
| FA Owner | ✅ `owner` | — |
| Coverage | ✅ `region_countries_covered` | — |
| Item categories | ✅ `item_category` | — |
| Item sub-categories | ❌ | Missing — one level only |
| Unit price | ✅ `pricePerUnit` | Currency not visible in the response; the design shows `2.35EUR` |
| Shipping from | ⚠️ `vendorCountry` | Closest equivalent; not necessarily the shipping origin |
| **Lead time** | ❌ | **Missing.** No lead-time field. Confirms the data-sources doc's open question — it would have to come from Sea Freight Costing (S5) |
| **Incoterm** | ❌ | **Missing.** No incoterm field, so the column, the tooltip *and* the Incoterms filter all have no source |
| **Contact** | ❌ | **Missing** from the FA response |
| Supplier | ✅ `vendorName` | — |
| FA expiring | ✅ `defaultAgreementLineExpirationDate` | — |
| Stat cards: IFRC vs Other agreements + suppliers | ✅ summary endpoint aggregates `owner` with a `non_ifrc` bucket, cardinality on `agreement_id` and `vendor_name` | Closest match to the new design of anything in the prototype |
| Countries covered / item categories covered | ✅ in summary | — |
| Map | ⚠️ `map-stats` aggregates `region_countries_covered` and resolves names to ISO3 via GO admin | **Country-level, not point-level.** The design's "FA hotspots" will be country markers/fills, not true locations |
| Filters: Country, Organisation, Incoterms | ❌ | Only region / item category / vendor country exist |

Framework Agreements is the **best-developed** module in the prototype — it has ES indexing, a filter-options endpoint, a summary endpoint and a map-stats endpoint, roughly matching the new design's shape. Its gaps are three specific fields: **incoterm, lead time, contact**.

---

## 4. Pro-Bono Services — the largest gap

This is the module where the reference documentation and reality diverge most.

**`data/ProBono.csv` actual header:**

```
Company, Name 1, Email address 1, Name 2, Email address 2, Transport means and services, Comments
```

**Sample row:** `AIRBUS, Sophie Pignol, nikola.jovanovic@ifrc.org, , , Air/sea, "Airbus test flights, ACJ, Airbus vessels"`

`api/pro_bono_views.py` is 45 lines: it reads the CSV with `csv.DictReader` and returns `{id, company, name1, email1, name2, email2, services, comments}`. No database model, no filtering, no pagination, no auth.

| New design needs | Exists? | Gap |
|---|---|---|
| Company | ✅ `Company` | — |
| Service type | ⚠️ `Transport means and services` | Free text (`Air/sea`), not a category |
| Contact | ✅ two name/email pairs | Design shows one contact; source has two |
| Comments | ✅ `Comments` | — |
| **Coverage** (`MENA`, `Ukraine only`) | ❌ | **Missing** |
| **Terms** (`100 flights`) | ❌ | **Missing** |
| **Status** `Active` / `Expiring` | ❌ | **Missing** — no `is_active`, no expiry date |
| **Country / Region** | ❌ | **Missing** — so the Region and Country filters have nothing to filter on |
| **Service Category** (for the filter and the 3 KPI counts) | ❌ | **Missing** — Transport / Customs / Warehouse Services cannot be counted from free text |
| Pagination, filtering, auth | ❌ | None of it exists |

> **Correction to the Data Sources → UI Mapping document.** That document states the pro-bono source "already contains most of the fields required by the UI" and maps `service_category`, `is_active` and `terms` to source fields. **The committed CSV contains none of those three.** Of the seven UI needs beyond company/comments/contact, six have no source.
>
> This reverses the build-order recommendation in the implementation document, which put Pro-Bono first on the grounds that its source was the best covered. On the evidence, **Framework Agreements is the best-covered module** and Pro-Bono has the largest data gap of the four — even though it is the simplest module to build. Either a richer pro-bono dataset is supplied, or the cards ship with roughly half their fields empty.

---

## 5. Customs

The prototype's approach differs fundamentally from the new design.

| New design | Prototype |
|---|---|
| "Open-source country customs data merged with IFRC-specific data" | **AI-generated.** `api/customs_ai_service.py` uses OpenAI web search to generate per-country customs summaries, storing `CountryCustomsSnapshot` + `CountryCustomsSource` + `CountryCustomsEvidenceSnippet` with credibility scores |
| Table: legal status, cargo exemptions, details, last updated | Snapshots with `is_current`, `status`, `error_message`, official docs, RC society fields |
| Per-field provenance | ✅ evidence snippets and sources per snapshot — **stronger** than the design assumes |
| Choropleth | ❌ no geo aggregation endpoint |
| Stat cards (countries included / legal status counts) | ❌ |
| Filters (region, country, legal status, cargo exemptions) | ❌ — only per-country lookup by name |
| Country detail: import environment, humanitarian exemptions, key item sensitivity | ❌ not in this structure |
| IDRL fields, shipping instructions | ❌ |

Two things worth carrying forward. The **evidence-snippet + credibility-score model already satisfies the provenance requirement** in §5.4.3 of the implementation document, and more thoroughly than "display `data_source` if the API exposes it" — the frontend could show citations per field. Conversely, an **AI-generated customs layer has different accuracy and liability characteristics** from a licensed open-source dataset, which makes the permanent disclaimer in the design ("indicative and situational") not merely prudent but load-bearing. Which of the two approaches the rewrite adopts is a decision that has not been made.

Also note migrations `0241_export_regulations_models` followed by `0242_remove_export_regulations_models` — export regulations were built and then removed in the prototype.

---

## 6. Features the prototype has that the new design drops

| Feature | Where | Comment |
|---|---|---|
| **Warehouse suggestion** — ranks warehouses by distance scoring and export-regulation feasibility | `api/warehouse_suggestion_views.py`, `api/country_distance.py`, `api/export_ai_service.py` | Genuine decision support: "given a destination, which warehouse should you draw from?" Absent from the new design and from every wireframe. This is closest in spirit to the anticipatory-action goal, and dropping it silently would lose real capability |
| **Export regulations** (AI-generated, per country) | `CountryExportSnapshot` and friends | Built, then removed by migration 0242 |
| **Item catalogue scraper** | `api/scrapers/item_catalogue.py`, `ItemCodeMapping` | This is how `catalogue_link` gets populated. The new design assumes the API supplies the URL — worth knowing that a Playwright scraper is what stands behind it |
| **Filter-option endpoints** | `…/item-categories/`, `?distinct=1` | The implementation document specifies filter *bars* but never says where the dropdown options come from. Every SPARK filter needs an options source — this is a genuine omission in the new design, not just the prototype |
| **Raw Fabric passthrough ViewSets** | `fabric/*`, 30+ Dim/Fct serializers | Debug/admin surface, not product |

---

## 7. Features the new design has with no prototype backing

Everything here is net-new backend work, not a port:

1. **Role-based field visibility** — no endpoint applies role scoping; two endpoints have no auth at all. The entire IFRC / ICRC / HNS / PNS model is new.
2. **Mob Tables** — no model, endpoint or ingestion. Plus the unresolved appeal→Mob-Table grain question and the "Access Mob Table" destination.
3. **Corridor / lane view** — no sending↔receiving concept anywhere.
4. **Warehouse geospatial coordinates** — currently a hardcoded warehouse allowlist and country centroids.
5. **Stock status derivation** — `Available` / `Available soon`.
6. **Warehouse managed by** — IFRC / ICRC / NS attribution.
7. **Stock demand and gap charts.**
8. **Customs choropleth, stat cards, filters, and the three-card country detail.**
9. **Incoterm, lead time and contact on framework agreements.**
10. **Pro-bono coverage, terms, status, country and service category.**
11. **CSV export** honouring filters and role scoping — no `format=csv` support anywhere in the prototype.
12. **Consistent `/api/v2/spark/*` namespace and naming.** The prototype mixes `api/v1` and `api/v2`, `fabric/*` and product paths, and mixes camelCase (FA) with snake_case (stock) in responses.

---

## 8. Missing pieces, ranked

**Blocks Phase 1 delivery**

1. `warehouse managed by` on stock — three stat cards, a table column, the map legend.
2. Warehouse coordinates — real geospatial placement; replaces a hardcoded ID allowlist.
3. Stock `status` derivation.
4. Stock `contact`.
5. FA `incoterm` — column, tooltip *and* filter.
6. FA `lead time` and `contact`.
7. Pro-bono `coverage`, `terms`, `status`, `country`, `service_category` — six of nine card fields and two of four filters.
8. Role-based access model, end to end.
9. Filter-option sources for every filter on every tab.
10. `?format=csv` on every list endpoint.

**Blocks specific Phase 1 features**

11. Mob Table model, appeal-level grouping, "active" definition, access URL.
12. Sending/receiving lane data for the corridor view.
13. Demand and gap aggregations for the two stock charts.
14. Item sub-category as a distinct level in both stock and FA.

**Phase 2**

15. Customs choropleth, stat cards, filters, country detail structure, IDRL, shipping instructions.
16. Decision: AI-generated customs layer (as built) vs licensed open-source dataset (as designed).

---

## 9. Questions this raises

Additions to §12 of the implementation document:

1. **Is the warehouse-suggestion feature in or out?** It exists, it is useful, and it is in no wireframe. If out, say so explicitly so it is not rediscovered later as a regression.
2. **Where do warehouse coordinates come from?** Fabric `DimWarehouse` / `DimLogisticsLocation`, GO local units, or a new dataset? Everything geospatial in Phase 1 depends on this.
3. **Is `warehouse managed by` derivable** from `DimInventoryOwner` / `DimSite` / `DimWarehouse`, or does it need new source data?
4. **Is the customs layer AI-generated or licensed?** Different accuracy, liability and provenance-display implications.
5. **Will a richer pro-bono dataset be supplied?** If not, the cards ship substantially empty and the KPI counts cannot be computed.
6. **Where do filter options come from** for each filter on each tab — dedicated options endpoints, ES aggregations, or GO enums?
7. **Are FA incoterm and lead time obtainable at all**, from the FA register or from Sea Freight Costing (S5)?
8. **Is the `ItemCodeMapping` scraper being carried forward?** It is what makes `catalogue_link` work, and a Playwright scraper is a production dependency worth an explicit decision.
