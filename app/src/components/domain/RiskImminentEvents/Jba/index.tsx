import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { ListView } from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
    unique,
} from '@togglecorp/fujs';
import { type LngLatBoundsLike } from 'mapbox-gl';
import { useQuery } from 'urql';

import RiskImminentEventMap, { type EventPointFeature } from '#components/domain/RiskImminentEventMap';
import { type HdxLayerSelection } from '#components/domain/RiskImminentEventMap/hdxLayers';
import { type LocalUnitsSelection } from '#components/domain/RiskImminentEventMap/useLocalUnits';
import { type RiskLayerProperties } from '#components/domain/RiskImminentEventMap/utils';
import { graphql } from '#generated/gql';
import { MAX_PAGE_LIMIT } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import { JBA_IMPACT_THRESHOLD } from '../malawi/constants';
import HowItWorks from '../malawi/HowItWorks';
import useFloodExposure, { type FloodExposure } from '../malawi/useFloodExposure';
import EventDetails from './EventDetails';
import EventListItem from './EventListItem';
import IngestionRunFilter, { type JbaIngestionRun } from './IngestionRunFilter';
import LeadTimeFilter from './LeadTimeFilter';

const JBA_FORECAST_IMPACTS_QUERY = graphql(`
    query JbaForecastImpacts {
      floodForecastImpacts(
        order: { forecastIssueDate: DESC }
        pagination: { limit: 9999 }
      ) {
        results {
          id
          forecastFileId
          forecastIssueDate
          forecastTargetDate
          leadTimeDays
          adminAreaId
          adminArea {
            id
            pcode
            ifrcId
            name
          }
          band5Mean
          band5Median
          band5P75
          band5P90
          band5Max
          ensemblesNonzeroCount
        }
      }
    }
`);

const JBA_FORECAST_FILE_QUERY = graphql(`
    query JbaForecastFile($id: ID!) {
      floodForecastFile(id: $id) {
        id
        leadTimeDays
        tiff {
          url
        }
      }
    }
`);

const JBA_INGESTION_RUNS_QUERY = graphql(`
    query JbaIngestionRuns {
      jbaIngestionRuns(
        order: { runDate: DESC }
        pagination: { limit: 9999 }
      ) {
        results {
          id
          runDate
          forecastIssueTime
          status
          filesExpected
          filesProcessed
          completedAt
        }
      }
    }
`);

export type JbaEvent = {
    id: string;
    forecastFileId: string | undefined;
    forecastIssueDate: string;
    forecastTargetDate: string;
    leadTimeDays: number | null | undefined;
    adminAreaPcode: string;
    adminAreaName: string;
    adminAreaIfrcId: number;
    band5Mean: number;
    band5Median: number | null;
    band5P75: number | null;
    band5P90: number | null;
    band5Max: number | null;
    ensemblesNonzeroCount: number | null;
    // Populated once the admin2 REST fetch resolves (joined by adminAreaIfrcId).
    districtId: number | undefined;
    districtName: string | undefined;
    // RP100 flood-exposed population (HDX), joined by adminAreaPcode. Static
    // district-wide context, not matched to this forecast's footprint/lead time.
    floodExposure?: FloodExposure;
};

function keySelector(event: JbaEvent) {
    return event.id;
}
function hazardTypeSelector() {
    return 'FL' as const;
}

interface BaseProps {
    title: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
    showLayerSelection?: boolean;
    activeHdxLayers?: HdxLayerSelection[];
    onActiveHdxLayersChange?: (next: HdxLayerSelection[]) => void;
    localUnits?: LocalUnitsSelection;
    onLocalUnitsChange?: (next: LocalUnitsSelection) => void;
    activeLeadTimeDays: number;
    onActiveLeadTimeDaysChange: (value: number) => void;
    baseLayers?: React.ReactNode;
}

type Props = BaseProps & (
    | { variant: 'global' }
    | { variant: 'region'; regionId: number }
    | { variant: 'country'; iso3: string }
);

function Jba(props: Props) {
    const {
        title,
        bbox,
        variant,
        showLayerSelection,
        activeHdxLayers,
        onActiveHdxLayersChange,
        localUnits,
        onLocalUnitsChange,
        activeLeadTimeDays,
        onActiveLeadTimeDaysChange,
        baseLayers,
    } = props;

    // eslint-disable-next-line react/destructuring-assignment
    const iso3 = variant === 'country' ? props.iso3 : undefined;

    // RP100 flood-exposed population per district (HDX), joined by pcode below.
    const floodExposureByPcode = useFloodExposure(isDefined(iso3));

    const [{ data, fetching: pendingImpacts }] = useQuery({
        query: JBA_FORECAST_IMPACTS_QUERY,
    });

    const [{ data: runsData, fetching: pendingRuns }] = useQuery({
        query: JBA_INGESTION_RUNS_QUERY,
    });

    const allImpactRows = data?.floodForecastImpacts?.results;

    // Most recent issue date that actually has impacts (rows are ordered DESC).
    const latestImpactIssueDate = allImpactRows?.[0]?.forecastIssueDate;

    const ingestionRuns = useMemo<JbaIngestionRun[]>(
        () => (runsData?.jbaIngestionRuns?.results ?? []).map((run) => ({
            id: run.id,
            runDate: String(run.runDate),
            forecastIssueTime: isDefined(run.forecastIssueTime)
                ? String(run.forecastIssueTime) : null,
            status: run.status,
            filesExpected: run.filesExpected ?? null,
            filesProcessed: run.filesProcessed ?? null,
            completedAt: isDefined(run.completedAt) ? String(run.completedAt) : null,
        })),
        [runsData],
    );

    const [selectedRunId, setSelectedRunId] = useState<string | undefined>(undefined);

    // Default to the latest run that actually has impacts (the run whose runDate
    // matches the most recent impact issue date), so the initial view never lands
    // on a pending/failed run with no data. Any run can still be picked explicitly.
    const defaultRun = useMemo(() => {
        if (isDefined(latestImpactIssueDate)) {
            const match = ingestionRuns.find(
                (run) => run.runDate === String(latestImpactIssueDate),
            );
            if (match) {
                return match;
            }
        }
        return ingestionRuns[0];
    }, [ingestionRuns, latestImpactIssueDate]);

    const activeRun = useMemo(
        () => ingestionRuns.find((run) => run.id === selectedRunId) ?? defaultRun,
        [ingestionRuns, selectedRunId, defaultRun],
    );

    // Fall back to the latest impact issue date so impacts still render even when
    // the runs query is empty or unavailable; an explicitly selected run wins.
    const activeIssueDate = activeRun?.runDate
        ?? (isDefined(latestImpactIssueDate) ? String(latestImpactIssueDate) : undefined);

    // All rows for the latest issue date (no threshold filter).
    // Used to build the per-admin timeline shown in the detail chart.
    // districtId / districtName are filled in once the admin2 REST call lands.
    const latestRowsRaw = useMemo<JbaEvent[]>(() => {
        if (!allImpactRows || !activeIssueDate) {
            return [];
        }
        const rows: JbaEvent[] = [];
        allImpactRows.forEach((row) => {
            if (String(row.forecastIssueDate) !== String(activeIssueDate)) {
                return;
            }
            if (isNotDefined(row.band5Mean)) {
                return;
            }
            if (isNotDefined(row.adminArea?.ifrcId)) {
                // eslint-disable-next-line no-console
                console.warn(
                    `[Jba] dropping forecast row with null adminArea.ifrcId: ${row.id}`,
                );
                return;
            }
            rows.push({
                id: row.id,
                forecastFileId: row.forecastFileId ?? undefined,
                forecastIssueDate: String(row.forecastIssueDate),
                forecastTargetDate: String(row.forecastTargetDate),
                leadTimeDays: row.leadTimeDays,
                adminAreaPcode: row.adminArea.pcode,
                adminAreaName: row.adminArea.name,
                adminAreaIfrcId: row.adminArea.ifrcId,
                band5Mean: Number(row.band5Mean),
                band5Median: isDefined(row.band5Median) ? Number(row.band5Median) : null,
                band5P75: isDefined(row.band5P75) ? Number(row.band5P75) : null,
                band5P90: isDefined(row.band5P90) ? Number(row.band5P90) : null,
                band5Max: isDefined(row.band5Max) ? Number(row.band5Max) : null,
                ensemblesNonzeroCount: row.ensemblesNonzeroCount ?? null,
                districtId: undefined,
                districtName: undefined,
            });
        });
        return rows;
    }, [allImpactRows, activeIssueDate]);

    const ifrcIds = useMemo(
        () => unique(
            latestRowsRaw.map((e) => e.adminAreaIfrcId),
            (id) => id,
        ),
        [latestRowsRaw],
    );

    const { response: adminAreasResponse } = useRequest({
        skip: ifrcIds.length === 0,
        url: '/api/v2/admin2/',
        query: {
            id__in: ifrcIds,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const adminAreaById = useMemo(() => {
        const map = new Map<number, NonNullable<typeof adminAreasResponse>['results'][number]>();
        adminAreasResponse?.results?.forEach((item) => {
            if (isDefined(item?.id)) {
                map.set(item.id, item);
            }
        });
        return map;
    }, [adminAreasResponse]);

    // Enrich rows with admin1 district info once the admin2 REST call lands.
    const latestRows = useMemo<JbaEvent[]>(
        () => latestRowsRaw.map((row) => {
            const admin = adminAreaById.get(row.adminAreaIfrcId);
            return {
                ...row,
                districtId: admin?.district_id,
                districtName: admin?.district_name,
            };
        }),
        [latestRowsRaw, adminAreaById],
    );

    // Per-admin timeline across all 10 lead times (sorted ascending).
    const timelineByAdmin = useMemo(() => {
        const map = new Map<number, JbaEvent[]>();
        latestRows.forEach((row) => {
            const list = map.get(row.adminAreaIfrcId);
            if (list) {
                list.push(row);
            } else {
                map.set(row.adminAreaIfrcId, [row]);
            }
        });
        map.forEach((list) => {
            list.sort((a, b) => (a.leadTimeDays ?? 0) - (b.leadTimeDays ?? 0));
        });
        return map;
    }, [latestRows]);

    // Markers: rows at the selected lead time whose band5Mean >= threshold,
    // enriched with the district's RP100 flood-exposed population.
    const events = useMemo(
        () => latestRows
            .filter((e) => (
                e.leadTimeDays === activeLeadTimeDays
                && e.band5Mean >= JBA_IMPACT_THRESHOLD
            ))
            .map((e) => ({
                ...e,
                floodExposure: floodExposureByPcode.get(e.adminAreaPcode),
            })),
        [latestRows, activeLeadTimeDays, floodExposureByPcode],
    );

    const pointFeatureSelector = useCallback(
        (event: JbaEvent): EventPointFeature | undefined => {
            const admin = adminAreaById.get(event.adminAreaIfrcId);
            const centroid = admin?.centroid as
                | { type: 'Point'; coordinates: [number, number] }
                | undefined;
            if (!centroid || centroid.type !== 'Point') {
                return undefined;
            }
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: centroid.coordinates,
                },
                properties: {
                    id: event.id,
                    hazard_type: 'FL',
                },
            };
        },
        [adminAreaById],
    );

    const footprintSelector = useCallback(
        (
            exposure: JbaEvent[] | undefined,
        ): GeoJSON.FeatureCollection<GeoJSON.Geometry, RiskLayerProperties> | undefined => {
            const activeIfrcId = exposure?.[0]?.adminAreaIfrcId;
            if (isNotDefined(activeIfrcId)) {
                return undefined;
            }
            const admin = adminAreaById.get(activeIfrcId);
            const bboxGeom = admin?.bbox as GeoJSON.Geometry | undefined;
            if (!bboxGeom) {
                return undefined;
            }
            return {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: bboxGeom,
                    properties: {
                        type: 'exposure',
                        severity: 'unknown',
                    },
                }],
            };
        },
        [adminAreaById],
    );

    // Re-use the existing activeEventExposure plumbing to carry the active
    // admin's timeline (all 10 lead times) so the detail can render the chart
    // and the footprint selector can derive the ifrcId. No async fetch needed.
    const [activeTimeline, setActiveTimeline] = useState<JbaEvent[] | undefined>(undefined);

    const handleActiveEventChange = useCallback(
        (eventId: string | undefined) => {
            if (isNotDefined(eventId)) {
                setActiveTimeline(undefined);
                return;
            }
            const ev = events.find((e) => e.id === eventId);
            if (!ev) {
                setActiveTimeline(undefined);
                return;
            }
            setActiveTimeline(timelineByAdmin.get(ev.adminAreaIfrcId));
        },
        [events, timelineByAdmin],
    );

    // The selected ingestion run (issue date + status) is surfaced by the
    // IngestionRunFilter in the side panel, so the heading stays clean.
    const sidePanelHeading = title;

    // Resolve the forecast-file ID for the active lead time. All admin rows
    // at the same (issueDate, leadTime) share the same forecastFileId, so the
    // first matching row suffices.
    const activeForecastFileId = useMemo(() => (
        latestRowsRaw.find((row) => row.leadTimeDays === activeLeadTimeDays)?.forecastFileId
    ), [latestRowsRaw, activeLeadTimeDays]);

    // Lazy-fetch the TIFF URL for the active forecast file only.
    const [{ data: forecastFileData }] = useQuery({
        query: JBA_FORECAST_FILE_QUERY,
        variables: { id: activeForecastFileId ?? '' },
        pause: !activeForecastFileId,
    });
    // TODO: backend returns a relative tiff.url like "/media/jba/tiff/.../lead01.tif"
    // and Django doesn't add CORS headers to media file responses, so a direct
    // cross-origin GET fails. Rewrite "/media/..." → "/malawi-media/..." so the
    // request stays same-origin and Vite's dev proxy (see vite.config.ts) forwards
    // it to the backend. Replace this once the backend serves CORS-tagged media
    // (or ships absolute, CORS-correct URLs).
    const activeCogUrl = useMemo(() => {
        const rawUrl = forecastFileData?.floodForecastFile?.tiff?.url;
        if (!rawUrl) {
            return undefined;
        }
        if (rawUrl.startsWith('/media/')) {
            return rawUrl.replace(/^\/media\//, '/malawi-media/');
        }
        return rawUrl;
    }, [forecastFileData]);

    const sidePanelFilters = (
        <ListView
            layout="block"
            spacing="sm"
        >
            <LeadTimeFilter
                value={activeLeadTimeDays}
                onChange={onActiveLeadTimeDaysChange}
            />
            <HowItWorks />
        </ListView>
    );

    const headerActions = (
        <IngestionRunFilter
            runs={ingestionRuns}
            value={activeRun?.id}
            onChange={setSelectedRunId}
            activeRun={activeRun}
            pending={pendingRuns}
        />
    );

    return (
        <RiskImminentEventMap
            source="jba"
            events={events}
            keySelector={keySelector}
            hazardTypeSelector={hazardTypeSelector}
            pointFeatureSelector={pointFeatureSelector}
            footprintSelector={footprintSelector}
            activeEventExposure={activeTimeline}
            activeEventExposurePending={false}
            listItemRenderer={EventListItem}
            detailRenderer={EventDetails}
            pending={pendingImpacts || pendingRuns}
            sidePanelHeading={sidePanelHeading}
            sidePanelFilters={sidePanelFilters}
            headerActions={headerActions}
            bbox={bbox}
            onActiveEventChange={handleActiveEventChange}
            showLayerSelection={showLayerSelection}
            iso3ForChoropleth={iso3}
            activeHdxLayers={activeHdxLayers}
            onActiveHdxLayersChange={onActiveHdxLayersChange}
            localUnits={localUnits}
            onLocalUnitsChange={onLocalUnitsChange}
            cogUrl={activeCogUrl}
            baseLayers={baseLayers}
            // Reset the open detail + raster controls when the run or lead time changes.
            detailResetKey={`${activeRun?.id ?? ''}__${activeLeadTimeDays}`}
        />
    );
}

export default Jba;
