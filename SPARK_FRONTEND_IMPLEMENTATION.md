# SPARK — Frontend Implementation Document

###### tags: `spark`, `ifrc-go`, `logistics`

**Repository:** `IFRCGo/go-web-app` (`app/` workspace)
**Audience:** Togglecorp frontend team, GO reviewers, IFRC Logistics/Supply Chain stakeholders
**Status:** Draft for review — Week 1 action #2 (frontend documentation owner: Cyrus)
**Wireframe:** [Figma](https://www.figma.com/proto/H9mZfGeXtlzK6HPzttYoci/IFRC-GO---Wires-Current---1?page-id=&node-id=13803-64806&viewport=-8632%2C135%2C0.1&t=f0cP0INAuB09z537-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=13857%3A71244&show-proto-sidebar=1&hide-ui=1)

**Companion document:** [SPARK — Existing Implementation vs New Design: Gap Analysis](./SPARK_GAP_ANALYSIS.md)

**Related documents:** SPARK Integration — Project Onboarding and Kickoff (Aug 2026); SPARK Requirements List; SPARK Data Sources → UI Mapping; SPARK Research Report (Feb 2026); SCM Feedback document.

This document describes **how SPARK is built in `go-web-app`**. It maps the requirements and the Yellow Umbrella wireframes onto this codebase's existing routing, request, table, map, i18n and styling conventions, and states the API contract the frontend needs. It does not propose UI design — design is owned by Yellow Umbrella (Mariam).

---

## 1. Scope

| Phase | Frontend deliverables |
|---|---|
| **Phase 1** (~3 months, M1–M2) | Route/tab shell for all four modules; role-based field visibility; shared SPARK component set; Stock Inventory (incl. Mob Tables and corridor view), Framework Agreements, Pro-Bono Services; i18n wiring; decommission of the Power BI placeholder |
| **Phase 2** (~2 months, M3–M4) | Customs module (2-layer) incl. the country customs detail panel; ERU stock & NS FSP; lead times; consolidated country view; FR/AR/ES localization incl. RTL |
| **Out of scope** | UI design; Montandon forecast integration; building or maintaining upstream systems (GO MobTable, ERP/D365, Items Catalogue, IDRL); data collection, stewardship and accuracy; selecting/licensing the open-source customs data source |

The Customs **route and tab shell** ship in Phase 1 even though the module content is Phase 2, so enabling it later is a config change rather than a rebuild.

Note on "out of scope": it is the *upstream systems* that are excluded, not their data. SPARK consumes the MobTable overlay, the Items Catalogue link and IDRL fields — building or maintaining those systems is somebody else's job.

---

## 2. Current state in the codebase

SPARK today is a single Power BI report embed — a prototype, not the product in the requirements.

| What | Where |
|---|---|
| View | `app/src/views/Spark/index.tsx` — fetches `/api/v2/auth-power-bi/`, renders one embed |
| Embed component | `app/src/components/domain/SparkEmbed/` |
| Route | `app/src/App/routes/index.tsx:447` — const `globalLogistics`, path `spark`, `visibility: 'is-authenticated'` |
| Navbar entry | `app/src/components/Navbar/index.tsx:243` (`to="globalLogistics"`), string key `userMenuSpark` |
| Config | `app/src/config.ts:36` (`powerBiReportId1`), `app/env.ts:44` (`APP_POWER_BI_REPORT_ID_1`) |
| Dependency | `powerbi-client` in `app/package.json` |

### 2.1 Decommission plan

`powerbi-client`, `SparkEmbed`, `powerBiReportId1` and `APP_POWER_BI_REPORT_ID_1` exist **only** for this placeholder. `pnpm lint:unused` (knip) runs in CI (`.github/workflows/ci.yml:169`) and flags unused files *and* unused dependencies, so all four must be removed in the **same PR** that lands the new layout — a partial removal breaks CI.

The other Power BI usages in the codebase (`OperationalLearning`, `Preparedness*`, `Resources`) are plain external links to `app.powerbi.com` and are unaffected. The `/api/v2/auth-power-bi/` endpoint itself is a backend concern and is not touched here.

### 2.2 What changes for the user

| | Existing SPARK | New design |
|---|---|---|
| Rendering | One iframe | Native GO React components |
| Tabs | Power BI navigation pane | 4 GO routes, deep-linkable |
| Filters | Power BI slicers | GO filter bar, 4–7 filters per tab + Clear Filters |
| Map | Power BI visual | GO map, clickable hotspots + choropleth + route lanes |
| Table | Power BI table | Expandable rows, status pills, mailto and catalogue links |
| Export | Power BI | Per-tab Export button |
| Data | Power BI semantic model over Fabric | GO API |
| Mob Tables | Not available | New functionality |
| Pro-bono / Customs / FA | Not available as dedicated tabs | New tabs |

---

## 3. Decisions and constraints

**D1 — SPARK endpoints are not in the generated API types.**
`app/generated/types.ts` is generated from `go-api/assets/openapi-schema.yaml` and contains no `spark` paths. The typed `useRequest` only accepts URLs present in that schema, so it cannot be used until the backend merges. See §4.3 for the bridge and migration path.

**D2 — Role-based visibility is server-driven.**
Field visibility per role comes from the API. The frontend must **not** derive it from `usePermissions` / `useUserMe` / email domain. Hiding a field client-side is presentational only; the API is the authority and must not serialize values the role is not entitled to. See §4.4.

**D3 — Structure now, visual polish later.**
Components are parameterised (filter configs, column configs, legend configs) so the Figma can be applied by changing configuration and CSS, not component structure.

**D4 — i18n from day one.**
Every user-facing string goes through `i18n.json` + `useTranslation` in Phase 1. Phase 2 localization work is then limited to translation delivery and RTL verification.

**D5 — Server-side filtering, sorting and pagination.**
All filters, ordering and paging are query parameters. The frontend never filters or sorts a full dataset client-side — role scoping means the client must not hold rows the role cannot see.

**D6 — Ingestion does not exist yet.**
Power BI handled ingestion in the prototype; the GO API pipeline is new work. Several sources are unconfirmed (§7). The frontend is built against the API contract in §8, not against any particular spreadsheet, so a source swap does not reach the frontend.

---

## 4. Architecture

### 4.1 Routing

SPARK becomes a layout route with four children, following the existing `preparednessLayout` / `riskWatchLayout` pattern in `app/src/App/routes/index.tsx`.

```
/spark                          → sparkLayout (redirects to default child)
/spark/stock-inventory          → sparkStockInventory      (Phase 1, default)
/spark/framework-agreements     → sparkFrameworkAgreements (Phase 1)
/spark/pro-bono-services        → sparkProBonoServices     (Phase 1)
/spark/customs                  → sparkCustoms             (Phase 2 content, Phase 1 shell)
```

```tsx
type DefaultSparkChild = 'stock-inventory';

const sparkLayout = customWrapRoute({
    parent: rootLayout,
    path: 'spark',
    forwardPath: 'stock-inventory' satisfies DefaultSparkChild,
    component: {
        render: () => import('#views/Spark'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'SPARK',
        visibility: 'is-authenticated',
    },
});

const sparkIndex = customWrapRoute({
    parent: sparkLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: { to: 'stock-inventory' satisfies DefaultSparkChild, replace: true },
    },
    context: { title: 'SPARK', visibility: 'is-authenticated' },
});

// …one customWrapRoute per module, parent: sparkLayout
```

Checklist when landing this:

- Rename the existing `globalLogistics` const to `sparkLayout` — the name no longer matches the route.
- Update `components/Navbar/index.tsx:243` from `to="globalLogistics"` to `to="sparkLayout"`.
- Register all five route consts in the `wrappedRoutes` object at the bottom of `routes/index.tsx` — a route missing from that object is unreachable and `NavigationTab to="…"` will not typecheck.
- Keep `visibility: 'is-authenticated'` on every SPARK route.
- `app/src/utils/routes.test.tsx` exercises route definitions — run `pnpm test` after the change.

Use plain `Navigate` for the index route; `SmartNavigate` is only needed where legacy `#hash` deep links must be preserved, and SPARK has none.

### 4.2 File layout

```
app/src/
├── App/routes/index.tsx
├── views/
│   ├── Spark/                              # layout: header, tabs, access request, Outlet
│   ├── SparkStockInventory/
│   │   ├── StockTable/                     # table + expandable detail rows
│   │   ├── StockCharts/                    # most-requested + gaps charts
│   │   └── CorridorView/                   # sending→receiving lane view
│   ├── SparkFrameworkAgreements/
│   ├── SparkProBonoServices/
│   └── SparkCustoms/
│       └── CustomsCountryDetail/           # current situation + 3 detail cards
├── components/domain/
│   ├── SparkMapView/                       # markers, choropleth, route lanes
│   ├── SparkWarehousePopup/
│   ├── SparkMobTablePopup/
│   ├── SparkFilterBar/
│   ├── SparkStatCard/
│   ├── SparkStatusPill/
│   ├── SparkServiceCard/                   # pro-bono card
│   ├── SparkLastUpdated/
│   └── RoleScopedField/
└── utils/domain/
    └── spark.ts                            # endpoint constants, types, helpers
```

`SparkEmbed/` is deleted (§2.1). Each view and component folder carries `index.tsx`, `i18n.json` and `styles.module.css`.

### 4.3 Data layer

**The bridge.** `#utils/restRequest` exports `useExternalRequest<RESPONSE>`, which takes a free-form URL and an explicit response type:

```ts
const useExternalRequest = useRequest as <RESPONSE>(
    requestOptions: Pick<RequestOptions<RESPONSE, TransformedError, unknown>, 'query' | 'url' | 'skip'>,
) => RequestReturn<RESPONSE>;
```

Two properties of the request context (`app/src/utils/restRequest/go.ts`) make this the right bridge rather than a raw `fetch`:

- `processGoUrls` only treats a URL as external when it matches `^https?://`. A **relative** URL such as `/api/v2/spark/stock-inventory/` is resolved against `api` from `#config` — the normal GO API base.
- `processGoOptions` defaults `apiType` to `'go'`, so `Authorization: Token …` and `Accept-Language` are injected exactly as for any other GO request.

Limitations: the option type exposes only `url`, `query` and `skip` — no `preserveResponse`, no custom headers, no mutation methods. Phase 1 SPARK is read-only so this suffices. Without `preserveResponse` the table blanks between paginated fetches; handle it with `Container`'s `overlayPending` or by holding the previous page in local state.

**Typing.** `app/src/utils/domain/spark.ts` holds endpoint constants and hand-written response types, each with a `FIXME` referencing the migration. Keeping them in one module makes the migration a single-file deletion plus import rewrites.

**Migration path — when the backend merges:**

1. Update the `go-api` submodule so `assets/openapi-schema.yaml` includes the SPARK paths.
2. `pnpm generate:type:go-api`.
3. Replace `useExternalRequest<SparkX>({ url: SPARK_API_ENDPOINT_X, … })` with `useRequest({ url: '/api/v2/spark/…', … })` and add `preserveResponse: true`.
4. Replace hand-written types with `GoApiResponse<'/api/v2/spark/…'>` / `GoApiUrlQuery<…>` and delete them from `spark.ts`.

Tracked as one issue per module (epic 12, §11) so the hand-written types do not silently become permanent.

**Per-tab fetching.** Each module fetches its own aggregate (stat cards), list (table/cards) and map data independently. Switching tabs triggers a fresh scoped fetch; modules share no cache. The one exception is the access/visibility response, fetched once by the layout.

### 4.4 Role-based field visibility

**Contract.** One request from the layout:

```
GET /api/v2/spark/access/
```

```jsonc
{
  "role": "ifrc",            // "ifrc" | "icrc" | "ns-host" | "ns-partner"
  "scoped_country": null,    // country id for host NS users; null for global roles
  "modules": {
    "stock-inventory": {
      "visible_fields": ["region", "country", "warehouse", "quantity", "contact_email", "status"],
      "last_updated": "2026-12-02T06:00:00Z"
    },
    "framework-agreements": { "visible_fields": ["…"], "last_updated": "…" }
  }
}
```

`visible_fields` names match the module list serializer's field names. `last_updated` is the upstream sync timestamp driving the per-tab "Last update" label — it belongs here rather than in each list response because the label must render before and independently of any filtered fetch.

**Distribution.** The layout (`#views/Spark`) fetches this once and passes it to tabs through React Router's `Outlet` context, matching `CountryOutletContext` / `RegionOutletContext` in `app/src/utils/outletContext.ts`:

```ts
export interface SparkOutletContext {
    accessResponse: SparkAccessResponse | undefined;
    accessPending: boolean;
}
```

Fetching once in the layout avoids four identical requests per tab switch.

**Consumption.** Two patterns, because tables and cards need different mechanics:

```ts
// Tables — filter the column list, so hidden columns cost no header cell.
const isVisible = createFieldVisibilityChecker(access);

const columns = useMemo(() => ([
    createStringColumn<Item, number>('region', strings.region, (i) => i.region?.name),
    isVisible('unit_price')
        ? createNumberColumn<Item, number>('unit_price', strings.unitPrice, (i) => i.unit_price)
        : undefined,
].filter(isDefined)), [isVisible, strings]);
```

```tsx
// Cards, stat figures, popup rows — wrap.
<RoleScopedField isVisible={isVisible('contact_email')}>
    <Link href={`mailto:${item.contact_email}`} external>{item.contact_name}</Link>
</RoleScopedField>
```

**Default when the config is absent.** If `/api/v2/spark/access/` is undeployed, errors, or omits a module, treat every field as visible. Failing closed would blank the dashboard for everyone during the window between frontend and backend deploys; failing open is safe because the API — not the frontend — withholds restricted values. State this in code comments so it is not "fixed" backwards later.

**Host NS scoping.** When `scoped_country` is set, the country filter is pre-filled and locked and stat cards show that country's totals only. The frontend still sends the country parameter; the server still enforces it.

**Known role-scoped fields.** Framework Agreements `unit_price`, `supplier_name` and `contact_email` are the primary candidates (IFRC full, others restricted), plus `contact_email` across the other modules. The exact matrix is an open question (§12) and is the gating dependency for this epic.

### 4.5 Shared components

#### 4.5.1 Reuse inventory

Audit of `@ifrc-go/ui`, `app/src/components` and `app/src/components/domain` against what SPARK needs. **No new component is required in the `@ifrc-go/ui` package** — everything new lives in `app/src`, so the shared UI package, its Storybook and Chromatic are untouched.

**Reused as-is — no frontend work**

| SPARK need | Existing |
|---|---|
| Page shell, title, subtitle, actions | `Page` (`#components/Page`) |
| Tab bar | `NavigationTabList` (ui) + `NavigationTab` (`#components/NavigationTab`) |
| Section wrapper with pending / empty / errored / filtered states, filters slot, footer actions | `Container` (ui) |
| Per-tab body states | `TabPage` (`#components/TabPage`) |
| Table | `Table` (ui) |
| Table columns | `createStringColumn`, `createNumberColumn`, `createDateColumn`, `createBooleanColumn`, `createElementColumn`, `createExpandColumn`, `createListDisplayColumn` (`@ifrc-go/ui/utils`); `createLinkColumn` (`#utils/domain/tableHelpers`) |
| Expandable row body | `TableBodyContent` (ui) via `rowModifier` |
| Pagination | `Pager` (ui) |
| Stat card figures | `KeyFigure` / `KeyFigureView` (ui) |
| Label / value rows in cards and popups | `TextOutput` (ui) |
| Mob Tables toggle | `Switch` (ui) |
| Incoterm tooltip | `InfoPopup` (ui) |
| Region / country filters | `RegionSelectInput`, `CountrySelectInput`, `CountryMultiSelectInput` (domain) |
| SPARK-specific option filters (item category, organisation, incoterms, warehouse, service category, company) | `SelectInput` / `MultiSelectInput` (ui) |
| Export button | `ExportButton` (domain) |
| Export mechanics | `useRecursiveCsvExport` (`#hooks/useRecursiveCsvRequest`) |
| Map base, admin-0 fill, choropleth paint, hover / click | `GlobalMap`, `BaseMap` (domain) |
| Map chrome — title, sources footer, presentation mode, PNG download, nav controls | `GoMapContainer` (`#components/GoMapContainer`) |
| Map sources, layers, fit-to-screen | `MapSource`, `MapLayer`, `MapBounds` (`@togglecorp/re-map`) |
| Map popup shell | `MapPopup` (`#components/MapPopup`) |
| Legend | `Legend` / `LegendItem` (ui) |
| Grid and stack layout | `ListView`, `InlineLayout` (ui) |
| Links, mailto, external links | `Link` (`#components/Link`) |
| Most-requested chart (horizontal bars) | `BarChart` (ui) — it renders label + bar + value rows with `maxRows`, which is exactly the wireframe |
| Filter / page / sort state | `useFilterState`, `useUrlSearchState`, `useDebouncedValue` |
| Breadcrumbs, footer, wiki link | `Breadcrumbs` (ui), `GlobalFooter`, `WikiLink` |

**Thin wrappers — compose existing components, small**

| Component | What it wraps | Why it exists |
|---|---|---|
| `SparkFilterBar` | `Container`'s `filters` slot + the domain select inputs | Composing filters inline in `Container filters={…}` is the house pattern (24 views do it). The wrapper exists only so the Clear Filters text link and row layout are not repeated across four tabs |
| `SparkStatCard` | `KeyFigureView` ×1 or ×2 with a divider | Two-figure card has no equivalent |
| `SparkServiceCard` | `Container` + `TextOutput` rows + `SparkStatusPill` | `CatalogueInfoCard` (title + link list) and `SurgeCardContainer` (heading + children) do not fit the pro-bono layout |
| `SparkWarehousePopup` | `MapPopup` + two `KeyFigure`s | — |
| `SparkMobTablePopup` | `MapPopup` + `TextOutput` rows + `Button` | — |
| `SparkLastUpdated` | `TextOutput valueType="date"` + separator | — |
| `RoleScopedField` | conditional render | A few lines, but it is the single place role hiding happens |

**Genuinely new — real build work**

| Component | Why nothing existing covers it |
|---|---|
| `SparkStatusPill` | **There is no status pill or badge component anywhere in the codebase.** `Chip` offers only red / white / grey (`primary` / `secondary` / `tertiary`) and carries a delete affordance; `TextBadge` is a character/word counter, not a badge; `ColorPreview` and `SeverityIndicator` are colour dots; `GradientBar` is a gradient strip. SPARK needs green / orange / red / grey semantic variants for `Available`, `Available soon`, `Active`, `Expiring`, FA expiry dates, `High complexity`, `Conditional`, and the customs sensitivity indicator |
| `SparkMapView` | Nothing parameterises marker vs choropleth mode behind one interface, and nothing in the codebase draws route lanes. `ActiveOperationMap` is the closest reference — markers, scaling, legend, popup — but is appeal-specific. The corridor arc layer has no precedent |
| `StockCharts` — gaps chart | `BarChart` is horizontal-only, so the vertical 0–100 chart is a local component on `ChartContainer` + `ChartAxes` + `useNumericChartData` + `<rect>`, following `CountryPreparedness/RatingByAreaChart` and `CountryProfileRiskWatch/RiskBarChart/*` |
| `StockTable` with item sub-rows | The mechanism exists (`ActiveSurgeDeployments/OngoingEruDeployments` uses `createExpandColumn` + `rowModifier` + `TableBodyContent`) but the SPARK table itself is new |
| `CustomsCountryDetail` | Current situation prose + permanent disclaimer + three field cards with pills. No precedent |
| `CorridorView` | Stacked multi-module lane rollup. No precedent |

**Deleted:** `SparkEmbed` (with `powerbi-client`, `powerBiReportId1`, `APP_POWER_BI_REPORT_ID_1`) — see §2.1.

**Decision to note:** `SparkStatusPill` is generic enough that GO will likely want it elsewhere (DREF, EAP and PER tables all render status as plain text today). Build it in `app/src` for SPARK, and consider promoting it to `@ifrc-go/ui` once the variants have settled — promoting later is cheap, designing for the whole platform up front is not.

#### 4.5.2 Component specifications


**`SparkMapView`** — one map component for all modes.

| Prop | Type | Notes |
|---|---|---|
| `mode` | `'markers' \| 'choropleth'` | markers for Stock/FA/Pro-bono, choropleth for Customs |
| `data` | `GeoJSON.FeatureCollection` | already role-scoped by the server |
| `legendItems` | `{ key, label, color }[]` | rendered bottom-right under the map |
| `colorMapping` | `mapboxgl.Expression` | `circle-color` or `fill-color` |
| `sizeMapping` | `mapboxgl.Expression` | `circle-radius`, scaled by item count |
| `routes` | `{ from: [lng,lat]; to: [lng,lat] }[]` | draws corridor arcs (§5.1.6) |
| `title` | `string` | map title, also used by the PNG download |
| `bbox` | `LngLatBoundsLike \| undefined` | fit-to-screen |
| `onFeatureClick` | `(props, lngLat) => void` | opens the popup |
| `popupContent` | `React.ReactNode` | rendered inside `MapPopup` |

Built from the existing map stack: `GlobalMap` (wraps `BaseMap`; exposes `adminZeroFillPaint`, `onAdminZeroFillClick`, `onAdminZeroFillHover`, and `AdminZeroFeatureProperties` with `iso3` / `country_id` / `name`), `GoMapContainer` (title, `footer` for map sources + legend, `withPresentationMode`, PNG download), `MapSource` / `MapLayer` / `MapBounds` from `@togglecorp/re-map`, `MapPopup`, and `Legend` / `LegendItem` from `@ifrc-go/ui`.

Per the wireframes the map footer is a single row: **map sources on the left** ("Map Sources : ICRC, UN." with an info icon), **"Legends" plus the legend items on the right**. Zoom `+`/`−` and a fit-to-screen control sit top-left over the canvas — `GoMapContainer`/`BaseMap` already provide navigation controls; fit-to-screen is `MapBounds` with `DEFAULT_MAP_PADDING` and `DURATION_MAP_ZOOM` from `#utils/constants`.

- **markers** — a `MapSource` of point features with a `circle` `MapLayer`; colour by `['match', ['get', 'organisation'], …]`, radius scaled by item count so a large hub (Dubai) renders larger than a small warehouse. Warehouse coordinates come from the API, **not** country centroids.
- **choropleth** — pass `adminZeroFillPaint` to `GlobalMap` with a `['match', ['get', 'iso3'], …]` fill expression built from the customs rows. No point source.
- **routes** — see §5.1.6.

**`SparkWarehousePopup`** — opened by clicking a warehouse marker. Shows the warehouse name as heading, a close button, and two figures side by side: **Item Categories** and **Items**. Reuses `MapPopup` + `SparkStatCard`-style figures.

**`SparkMobTablePopup`** — opened by clicking a Mob Table marker when the toggle is on. Shows operation title (e.g. "Jamaica - Hurricane Melissa"), `Last update`, `Disaster type`, `Start date`, and a full-width primary **Access Mob Table** action. See §6.

**`SparkFilterBar`** — generic bar driven by a per-module field config, with **Clear Filters as a text link** at the end of the row (not a button, per the wireframes). Renders the existing domain inputs (`RegionSelectInput`, `CountrySelectInput`, `CountryMultiSelectInput`) plus `SelectInput`/`MultiSelectInput` for SPARK-specific option lists. Clear Filters calls `resetFilter` from `useFilterState`. Presentational — filter state lives in the module view.

**`SparkStatCard`** — one or two figures, built on `KeyFigureView`. Two-figure cards show a vertical divider between them (Stock, FA); one-figure cards are used by Pro-bono and Customs. Props: `label`, `value`, `secondaryLabel?`, `secondaryValue?`, `pending?`. Renders nothing when all figures are role-hidden.

**`SparkStatusPill`** — coloured badge. Props: `label`, `variant`.

| Variant | Colour token | Used for |
|---|---|---|
| `success` | `--go-ui-color-green` | `Available`, `Active`, FA expiry far off |
| `warning` | `--go-ui-color-orange` | `Available soon`, `Expiring`, FA expiry near, customs `Conditional` |
| `danger` | `--go-ui-color-primary-red` | customs `High complexity` |
| `default` | `--go-ui-color-gray-30` | customs sensitivity `Low`, unknown states |

No hardcoded hex anywhere; map layer colours are the one exception and live in `spark.ts` as named constants derived from `#utils/constants`.

**`SparkServiceCard`** — pro-bono card: company name with service type beneath it, status pill top-right, a two-cell row of **Coverage** and **Terms** (value above, uppercase label below), then **Comments** and **Contact** as label/value rows.

**`RoleScopedField`** — `{ isVisible: boolean; children }`, returns `null` when hidden. Deliberately dumb: the decision is made by the caller from the API config, so the component knows nothing about roles.

**`SparkLastUpdated`** — renders the module's `last_updated` as `Last update: DD-MM-YY`, left-aligned above the filter bar with a separator line beneath it.

**Export** — reuse `#components/domain/ExportButton` as-is (`onClick`, `pendingExport`, `progress`, `totalCount`, `disabled`). Do not build a SPARK-specific export button.

### 4.6 Filters, URL state and pagination

- Filter/sort/page state: `useFilterState` (`#hooks/useFilterState`) — `filter`, `rawFilter`, `setFilterField`, `resetFilter`, `filtered`, `limit`, `offset`, `page`, `setPage`, `sortState`, with a built-in 200 ms debounce on values sent to the API.
- Deep-linkable filters (region, country) additionally go through `useUrlSearchState`, matching `AllThreeWActivity`, so a filtered view can be shared.
- `filtered` drives `Container`'s `filteredEmptyMessage`, keeping "no results for these filters" distinct from "no data".
- Pagination via `Pager` in the container footer. **The wireframes show no pager on any tab** — see §12.

### 4.7 Export

`useRecursiveCsvExport` (`#hooks/useRecursiveCsvRequest`) pages a list endpoint with `format=csv` and returns `[pending, progress, trigger]` where `trigger(url, totalCount, urlParams)`. The exported set must be the **current filtered, role-scoped view**, so pass the same query object as the table minus `limit`/`offset`.

Backend requirement: every SPARK list endpoint supports `?format=csv` honouring the same filters and role scoping as the JSON response — otherwise export leaks data the table hides.

`exceljs` and `xlsx` are already dependencies if XLSX is required. Map image export already exists via `GoMapContainer`'s download button (`html-to-image`).

### 4.8 Internationalisation

- One `i18n.json` per view/component with a unique `namespace` and a flat `strings` map, consumed via `useTranslation(i18n)`.
- Interpolation via `resolveToString` / `resolveToComponent` — never string concatenation.
- After adding or changing strings run `pnpm translatte:generate` and commit the file under `translationMigrations/`. CI runs `pnpm lint:translation` (`ci.yml:111`) and fails on missing migrations or unused keys.
- Wired in Phase 1: filter labels, table headers, stat card labels, status pill labels, map legends, chart labels, popup labels, customs card labels, empty/error messages, tab labels.
- Arabic requires RTL verification across filter bar, table, card grid, map legend and popups (Phase 2 task). Avoid physical CSS properties from the start — use `margin-inline`, `padding-inline`, `inset-inline`.

### 4.9 Styling

CSS Modules with `--go-ui-*` design tokens only. `stylelint-config-concentric` enforces property ordering and `stylelint-value-no-unknown-custom-properties` rejects unknown tokens — run `pnpm lint:css` before pushing.

---

## 5. Module specifications

Common per-tab layout, confirmed by the wireframes:

```
stat cards
Last update: DD-MM-YY        ── separator ──
filter bar …                          Clear Filters      [Export]
map (zoom, fit-to-screen; sources bottom-left, legends bottom-right)
table or card grid
[charts — Stock Inventory only]
```

Stock Inventory is the exception: its Mob Tables toggle and Export sit on a **second row** beneath the filters; the other three tabs put Export on the filter row itself.

### 5.1 Stock Inventory — Phase 1

**Route** `/spark/stock-inventory` · **Endpoints** `…/stock-inventory/`, `…/stock-inventory/aggregate/`

#### 5.1.1 Stat cards

Three two-figure cards: **IFRC Warehouses + Item Categories**, **ICRC Warehouse + Item Categories**, **NS Warehouses + Item Categories**. Role-scoped — an HNS user sees their own country's totals only.

#### 5.1.2 Filters

Region · Sending Country · Receiving Country · Item Category · Item Subcategory · Organisation · Warehouse · Clear Filters.
Second row: **Show Active Mob Tables** toggle (left) and **Export** (right).

#### 5.1.3 Map

`mode="markers"`. Warehouse coordinates from the API. Marker radius scales with the number of items at that warehouse. Legend: IFRC Warehouses / ICRC Warehouses / NS Warehouses.

Clicking a marker opens `SparkWarehousePopup`: warehouse name, **Item Categories** count, **Items** count.

#### 5.1.4 Table

| Column | Helper | Role-scoped |
|---|---|---|
| Region | `createStringColumn` | no |
| Country | `createLinkColumn` (to `countriesLayout`) | no |
| Warehouse managed by | `createStringColumn` | no |
| Item categories | `createStringColumn` | no |
| Item sub-categories | `createStringColumn` | no |
| Quantity | `createNumberColumn` | candidate |
| Details | `createElementColumn` — catalogue link *or* plain item code | no |
| Contact | `createElementColumn` → `mailto:` link | **yes** |
| Status | `createElementColumn` → `SparkStatusPill` | no |
| *(expand)* | `createExpandColumn` | no |

`Details` is not uniformly a link: the wireframe shows both `Catalogue link` (anchor to the Items Catalogue) and a bare item code such as `HSHEBLANCLT1`. Render an external link when the API supplies a catalogue URL and plain text otherwise.

#### 5.1.5 Expandable rows

The chevron at the end of a row expands it into **item-level sub-rows sharing the same columns**, each with its own item sub-category description (e.g. "Blanket, woven, 100% cotton, 12x18"), quantity, Details and Status. The parent row's quantity is the roll-up of its children.

Implementation follows `ActiveSurgeDeployments/OngoingEruDeployments`: `createExpandColumn` + local `expandedRow` state + a `rowModifier` rendering a nested `TableBodyContent` for the sub-rows. Only one row is expanded at a time.

#### 5.1.6 Corridor view (Sending Country + Receiving Country)

When **both** Sending Country and Receiving Country are selected, the tab becomes a lane view:

- the map draws an **arc between the two countries** with endpoint dots, alongside the warehouse markers relevant to the lane;
- below the map, the page renders, in order: the **Stock Inventory** table, a **FRAMEWORK AGREEMENTS** section with its own table, a **PRO-BONO SERVICES** section with its card grid, and a **CUSTOMS REGULATIONS — {country}** section (§5.4.2).

This is a single-country/lane rollup of all four modules and is the highest-value screen in the module — it is the "who has what, under which agreement, and can it clear customs" question the whole product exists to answer. The sections reuse the FA table, pro-bono card and customs detail components verbatim; only their query scope differs.

Route arcs are a `MapSource` of `LineString` features with a `line` `MapLayer`; generate a curved great-circle-ish path rather than a straight segment so long lanes read as arcs.

#### 5.1.7 Charts

Two charts below the table, side by side, using `BarChart` from `@ifrc-go/ui` (`useNumericChartData` for scales):

- **Most requested item categories (last 12 months)** — horizontal bars, category label on the left, value at the bar end.
- **Key items low or out of stock (gaps)** — vertical bars with a 0–100 axis.

Whether these are computed from Mob Tables or from stock inventory is unresolved — §12.

#### 5.1.8 Export

Exports the current filtered, role-scoped table.

### 5.2 Framework Agreements — Phase 1

**Route** `/spark/framework-agreements` · **Endpoints** `…/framework-agreement/`, `…/framework-agreement/aggregate/`

**Stat cards** IFRC Framework Agreements + Suppliers · Other Framework Agreements + Suppliers · Countries Covered + Item Categories Covered.

**Filters** Region · Country · Item Category · Item Subcategory · Organisation · Incoterms · Clear Filters · Export.

**Map** `mode="markers"`, FA coverage by owner. Legend: IFRC FAs / ICRC FAs / NS FAs.

**Table**

| Column | Helper | Role-scoped |
|---|---|---|
| FA Owner | `createStringColumn` | no |
| Coverage | `createStringColumn` | no |
| Item categories / sub-categories | `createStringColumn` | no |
| Unit price | `createElementColumn` (value + currency, e.g. `2.35EUR`) | **yes** |
| Shipping from | `createStringColumn` | no |
| Lead time | `createStringColumn` (e.g. `3 days`) | no |
| Incoterm | header carries an `InfoPopup` tooltip | no |
| Supplier | `createStringColumn` | **yes** |
| Contact | `createElementColumn` → `mailto:` link | **yes** |
| FA expiring | `createElementColumn` → `SparkStatusPill` with the date as label | no |

Expiry pill variant is derived from proximity to the expiry date; thresholds are constants in `spark.ts` pending the decision in §12 (placeholder: ≤30 days `danger`, ≤90 days `warning`, otherwise `success`).

### 5.3 Pro-Bono Services — Phase 1

**Route** `/spark/pro-bono-services` · **Endpoints** `…/pro-bono-service/`, `…/pro-bono-service/aggregate/`

**Stat cards** Transport Services · Customs Services · Warehouse Services (single figure each).

**Filters** Region · Country · Service Category · Company · Clear Filters · Export.

**Map** `mode="markers"`, single legend item "Pro-bono coverage".

**Card grid** `ListView layout="grid"` with `numPreferredGridColumns={3}` and `minGridColumnSize` so it collapses responsively. Each card is a `SparkServiceCard` (§4.5). Contact is wrapped in `RoleScopedField`.

### 5.4 Customs — Phase 2 (shell in Phase 1)

**Route** `/spark/customs` · **Endpoint** `…/customs/`

Phase 1 ships the route, the tab and an empty state. Phase 2 fills it in.

#### 5.4.1 Overview screen

**Stat cards** Countries Included · IFRC Legal Status · IFRC No Legal Status (single figure each).

**Filters** Region · Country · IFRC legal status · Cargo exemptions · Clear Filters · Export.

**Map** `mode="choropleth"` — filled countries, no markers. Legend: IFRC has legal status (green) / IFRC has no legal status (orange) / Data not included (grey).

**Table** Region · Country · IFRC legal status (Yes/No) · Humanitarian cargo exemptions (Yes/No) · Details link · Last updated.

#### 5.4.2 Country customs detail

Rendered per country — both from the Details link and inline in the corridor view (§5.1.6). Heading `CUSTOMS REGULATIONS — {COUNTRY}`, then:

- `Last update: DD-MM-YY`
- **Current situation** — a prose summary of the clearance environment.
- A permanent italic disclaimer: *"Customs information is indicative and situational. Always confirm with your customs agent or IFRC logistics focal point before shipment."* This is a standing caveat on the module, not sample copy — it renders whether or not the API supplies text.
- A `Details link` aligned right.

Then three cards:

| Card | Status pill | Fields |
|---|---|---|
| **Import environment** | complexity (`High complexity` red) | IFRC legal status · Typical clearance time · Route sensitivity · IFRC contact · Customs agency |
| **Humanitarian exemptions** | (`Conditional` orange) | IFRC-owned goods · NS-owned goods · Donor-owned · Private supplier |
| **Key item categories — customs sensitivity** | — | one row per item category with a sensitivity level indicator (e.g. TENTS/NFIS · Low) |

#### 5.4.3 Two-layer data and provenance

Open-source country customs data is merged with IFRC-specific data **server-side**; the frontend renders the combined record. Because the open-source layer is not IFRC's own data, per-field provenance is displayed wherever the API exposes a `data_source` — a licensing and accuracy requirement, not a nicety.

**Shipping instructions and IDRL fields** belong to this module and render inside the country detail (§5.4.2) rather than as extra table columns.

---

## 6. Mob Tables

Mob Tables live inside Stock Inventory behind the **Show Active Mob Tables** toggle. MobTable itself is an upstream GO system — the frontend only consumes the overlay.

**Grain mismatch.** The Mob Table source files are **item-level**, while the map cards are **appeal/operation-level**: one appeal has many Mob Tables. The proposed relationship is:

```
Appeal / Operation  →  many Mob Tables  →  many Items
```

with **Appeal Code** as the linking key. The frontend consumes the appeal-level grouping; the grouping itself must happen server-side.

**Map card.** Toggling the switch on adds operation markers. Clicking one opens `SparkMobTablePopup`:

- operation title (e.g. "Jamaica - Hurricane Melissa")
- `Last update`
- `Disaster type` (e.g. Cyclone)
- `Start date`
- a full-width primary **Access Mob Table** action

**Access Mob Table** is unresolved (§12): it either links out to the published Excel file — in which case the frontend needs a stable per-Mob-Table URL from the API — or navigates to an internal SPARK Mob Table view, which is additional frontend scope not currently estimated. **This decision must be made before the Stock Inventory epic starts.**

---

## 7. Data sources → UI mapping

Ingestion is backend work; this section records what the frontend depends on and where it is not yet confirmed. Per the Data Sources → UI Mapping document:

| # | Source | Feeds |
|---|---|---|
| S1 | Sample Stock Data (xlsx) | Stock Inventory |
| S2 | Mobilization report (xlsx) | Mob Tables, estimated/outstanding costs |
| S3 | ERU Stock Materials Location (xlsx) | Map / NS locations (Phase 2) |
| S4 | Lead time of transportation (xlsx) | Customs and lead-time data |
| S5 | Sea Freight Costing Comparison (xlsx, APAC, 11/2024) | FA lead time / Incoterm |
| S6 | Pro-bono services (xlsx/CSV) | Pro-Bono Services |
| S7 | Framework Agreements | **No confirmed source** |
| S8 | MS Fabric stock model | Stock Inventory (intended source) |

Frontend-relevant consequences:

- **Stock Inventory** depends on the MS Fabric schema (S8), which has not been supplied. Fields at risk: `warehouse managed by`, `contact`, `catalogue link`, `status`. `Status` is derived (`Available` / `Available soon`) and `Region` may be derived from country/ISO3 — both derivations belong server-side, not in the frontend.
- **Framework Agreements** has no confirmed register (S7). The tab is fully specified and can be built against the §8 contract, but it cannot be populated until a source exists. Lead time and Incoterm may need to come from S5 rather than the FA register — the authoritative source is an open question.
- **Pro-Bono Services** has the **largest data gap of the four**, contrary to the Data Sources → UI Mapping document. The committed `data/ProBono.csv` in the existing implementation carries only `Company`, two name/email pairs, a free-text `Transport means and services`, and `Comments` — there is no `service_category`, `is_active`, `terms`, `coverage`, `country` or expiry date. Six of the nine card fields and two of the four filters have no source. It remains the simplest module to *build*, but it cannot be populated as designed without a richer dataset. See the gap analysis, §4.
- **Customs** maps onto S4, with `Last updated` **not currently available** in the source. Until that is resolved the column and the detail panel's `Last update` line have no value to render — the frontend will show a placeholder rather than fabricate a date.

The frontend is built against the API contract in §8, so changing or replacing any source above does not reach the frontend as long as the contract holds.

---

## 8. API contract requested from the backend

| Endpoint | Purpose |
|---|---|
| `GET /api/v2/spark/access/` | Role, `scoped_country`, per-module `visible_fields` and `last_updated` |
| `GET /api/v2/spark/stock-inventory/` | Paginated, filtered stock rows incl. item-level children and warehouse coordinates |
| `GET /api/v2/spark/stock-inventory/aggregate/` | Stat card figures + chart series, honouring the same filters |
| `GET /api/v2/spark/mob-table/` | Active Mob Tables grouped to appeal/operation level, with access URL |
| `GET /api/v2/spark/framework-agreement/` + `/aggregate/` | Framework agreements |
| `GET /api/v2/spark/pro-bono-service/` + `/aggregate/` | Pro-bono services |
| `GET /api/v2/spark/customs/` | Customs rows for the table and choropleth |
| `GET /api/v2/spark/customs/{iso3}/` | Country detail: current situation, import environment, exemptions, sensitivity, IDRL, shipping instructions |
| `GET /api/v2/spark/corridor/` | Lane rollup for sending → receiving country (§5.1.6) |

Requirements on every list endpoint:

1. **Standard GO pagination** — `count` / `next` / `previous` / `results`, with `limit` and `offset`.
2. **Server-side filtering** for every filter in that module's bar, and ordering via the usual `ordering` parameter.
3. **Role enforcement** — restricted fields omitted from the payload, not merely flagged. `visible_fields` tells the frontend what to render; it is not the access control.
4. **`?format=csv`** honouring the same filters and role scoping.
5. **Geospatial coordinates** on stock rows (warehouse locations), not country centroids, plus an item count per warehouse for marker sizing.
6. **Derived values computed server-side** — `status`, `region` from ISO3, FA expiry proximity inputs, Mob Table "active" determination.
7. **OpenAPI coverage** — paths must appear in `go-api/assets/openapi-schema.yaml` so `pnpm generate:type:go-api` picks them up.

Not required for Phase 1: write endpoints. SPARK is read-only in the frontend — no create or edit actions in any module.

---

## 9. Phase 2 additions

- **ERU stock & NS FSP** — expected to extend the Stock Inventory and Framework Agreements patterns rather than become new tabs (S3 supplies ERU stock locations). Confirm against the Figma before building; if they do become tabs, the layout's tab list is the only structural change.
- **Lead times** — route- and FA-based, surfacing in the existing FA "Lead time" column and in the corridor view. Source authority between the FA register and Sea Freight Costing (S5) is unresolved.
- **Consolidated country view** — the corridor view (§5.1.6) is the Phase 1 seed of this. Phase 2 extends it with demand/gap charts at country level and the Mob Table overlay. Warrants its own spec once the aggregation contract is defined.
- **Localization** — FR/AR/ES from the backend; frontend work limited to verification and RTL, given D4.

**Montandon** is out of scope. The only architectural accommodation needed is that module fetching stays parameterised by filters rather than hardwired to "current user's country", so a forecast-driven prefilter can be added later without restructuring.

---

## 10. Testing and QA

- **Unit (`vitest`)** — `createFieldVisibilityChecker` including the config-absent default; expiry-variant thresholds; filter→query-parameter mapping; GeoJSON construction from list responses; corridor arc geometry.
- **Route tests** — extend `app/src/utils/routes.test.tsx` for the SPARK children.
- **Role matrix** — the highest-value manual QA: for each of IFRC / ICRC / HNS / PNS, confirm per module that restricted fields are absent from the **network payload**, not merely hidden in the DOM. Blocked on the visibility matrix (§12).
- **Export** — verify the CSV matches the filtered, role-scoped table for each role.
- **Responsive / RTL** — card grid, filter bar, table overflow, map legend, popups.
- QA involved from Sprint 1 (Neha); bugs tracked as GitHub issues.

---

## 11. Delivery breakdown

Frontend-only, indicative.

| # | Epic | Issues | Phase / Milestone |
|---|---|---|---|
| 1 | SPARK shell | Layout + 4 child routes; Navbar rename; layout view with tabs; Power BI decommission (view, `SparkEmbed`, config, env, dependency) | P1 / M1 |
| 2 | Data layer foundation | `utils/domain/spark.ts` types + endpoint constants; `useExternalRequest` bridge; error/empty/pending conventions | P1 / M1 |
| 3 | Role-based visibility | Access request in layout; `SparkOutletContext`; `createFieldVisibilityChecker`; `RoleScopedField`; HNS country pre-scoping | P1 / M1 |
| 4 | Shared components | `SparkMapView` (markers, choropleth, routes); popups; `SparkFilterBar`; `SparkStatCard`; `SparkStatusPill`; `SparkServiceCard`; `SparkLastUpdated` | P1 / M1 |
| 5 | Pro-Bono Services | Stat cards; filters; map; card grid; export — simplest module, but see the data gap in §7 | P1 / M2 |
| 6 | Stock Inventory | Stat cards; filters; marker map + warehouse popup; table; expandable item rows; export | P1 / M2 |
| 7 | Mob Tables | Toggle; operation markers; Mob Table popup; Access Mob Table action | P1 / M2 |
| 8 | Stock charts | Most-requested and gaps charts | P1 / M2 |
| 9 | Framework Agreements | Stat cards; filters; map; table incl. price/supplier/contact scoping; expiry pills; export | P1 / M2 |
| 10 | Corridor view | Route arcs; stacked Stock + FA + Pro-bono + Customs sections | P1 / M2 |
| 11 | Customs | Stat cards; filters; choropleth; table; country detail panel; provenance; IDRL + shipping instructions | P2 / M3 |
| 12 | ERU & NS FSP | Placement per Figma; extends epics 6 and 9 | P2 / M4 |
| 13 | Consolidated country view | Country rollup; demand/gap charts; Mob Table overlay | P2 / M4 |
| 14 | Localization & RTL | Translation verification; RTL sweep | P2 / M4 |
| 15 | Generated-types migration | One issue per module: `useExternalRequest` → `useRequest`, delete hand-written types | follows backend merge |

Epics 1–4 are prerequisites for everything else. Epic 5 is first among the modules because it is the simplest end-to-end slice — stat cards, filters, map, card grid, export — so it proves the whole stack while the heavier modules are still being scoped. Note that its *data* is the least complete of the four (§7), so expect to build it against the contract and populate it later. Framework Agreements (epic 9) has the best-developed backend in the existing implementation and is the strongest candidate for the first module with real data.

---

## 12. Open questions

| # | Question | Blocks | Owner |
|---|---|---|---|
| 1 | Field-level visibility matrix per role (IFRC / ICRC / HNS / PNS) per module | Epic 3 configs; role QA | Product + Logistics |
| 2 | Expiry-colour thresholds for FA and Pro-Bono pills | Epics 9, 5 (placeholders in use) | Logistics |
| 3 | Export format(s) — CSV / XLSX / both; is map image export in scope? | §4.7 | Logistics |
| 4 | **Does Access Mob Table open the source Excel or an internal SPARK view?** If external, is there a stable per-Mob-Table URL? | Epic 7 — must be settled before it starts | Logistics + Backend |
| 5 | What makes a Mob Table "Active"? | Epic 7 | Logistics |
| 6 | Do the two Stock charts come from Mob Tables or stock inventory? | Epic 8 | Logistics |
| 7 | Can we get the MS Fabric stock schema (S8)? Does it carry `warehouse managed by`, `contact`, `catalogue link`, `status`? Is Region derivable from ISO3? | Epic 6 | IFRC |
| 8 | Does an FA register exist (S7), and which source is authoritative for FA lead times and Incoterms — FA register, Sea Freight Costing (S5), or both? | Epic 9 | IFRC |
| 9 | Which sheet is the authoritative customs source, where does customs `Last updated` come from, and are the legal-status/exemption fields structured enough to filter on? | Epic 11 | IFRC |
| 10 | Does the Customs API expose provenance per field or only per record? | Epic 11 | Backend |
| 11 | Pagination vs infinite scroll — the wireframes show no pager on any tab | Epics 5, 6, 9, 11 | Product |
| 12 | Placement of ERU stock and NS FSP — new tabs or extensions | Epic 12 | Yellow Umbrella |
| 13 | Is Microsoft Fabric a Phase 1 requirement or a future integration? | Architecture flexibility only — no frontend hardcoding either way | IFRC |

Questions 1, 4, 7 and 8 are the ones that most constrain Phase 1: the visibility matrix gates every role config, the Access Mob Table decision changes the size of epic 7, and the two source questions determine whether Stock Inventory and Framework Agreements can be populated at all.
