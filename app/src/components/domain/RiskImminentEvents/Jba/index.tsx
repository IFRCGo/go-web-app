import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    isDefined,
    isNotDefined,
    unique,
} from '@togglecorp/fujs';
import { type LngLatBoundsLike } from 'mapbox-gl';
import { useQuery } from 'urql';

import RiskImminentEventMap, { type EventPointFeature } from '#components/domain/RiskImminentEventMap';
import { type RiskLayerProperties } from '#components/domain/RiskImminentEventMap/utils';
import { graphql } from '#generated/gql';
import { MAX_PAGE_LIMIT } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import { JBA_IMPACT_THRESHOLD } from '../malawi/constants';
import EventDetails from './EventDetails';
import EventListItem from './EventListItem';
import LeadTimeFilter from './LeadTimeFilter';

const JBA_FORECAST_IMPACTS_QUERY = graphql(`
    query JbaForecastImpacts {
      floodForecastImpacts(
        order: { forecastIssueDate: DESC }
        pagination: { limit: 9999 }
      ) {
        results {
          id
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

export type JbaEvent = {
    id: string;
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
    activeHdxOptionKey?: string;
    onActiveHdxOptionKeyChange?: (key: string | undefined) => void;
    activeLeadTimeDays: number;
    onActiveLeadTimeDaysChange: (value: number) => void;
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
        activeHdxOptionKey,
        onActiveHdxOptionKeyChange,
        activeLeadTimeDays,
        onActiveLeadTimeDaysChange,
    } = props;

    // eslint-disable-next-line react/destructuring-assignment
    const iso3 = variant === 'country' ? props.iso3 : undefined;

    const [{ data, fetching: pendingImpacts }] = useQuery({
        query: JBA_FORECAST_IMPACTS_QUERY,
    });

    const allImpactRows = data?.floodForecastImpacts?.results;

    // Latest forecast issue date in the response (rows are ordered DESC).
    const latestIssueDate = allImpactRows?.[0]?.forecastIssueDate;

    // All rows for the latest issue date (no threshold filter).
    // Used to build the per-admin timeline shown in the detail chart.
    const latestRows = useMemo<JbaEvent[]>(() => {
        if (!allImpactRows || !latestIssueDate) {
            return [];
        }
        const rows: JbaEvent[] = [];
        allImpactRows.forEach((row) => {
            if (String(row.forecastIssueDate) !== String(latestIssueDate)) {
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
            });
        });
        return rows;
    }, [allImpactRows, latestIssueDate]);

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

    // Markers: rows at the selected lead time whose band5Mean >= threshold.
    const events = useMemo(
        () => latestRows.filter((e) => (
            e.leadTimeDays === activeLeadTimeDays
            && e.band5Mean >= JBA_IMPACT_THRESHOLD
        )),
        [latestRows, activeLeadTimeDays],
    );

    const ifrcIds = useMemo(
        () => unique(
            events.map((e) => e.adminAreaIfrcId),
            (id) => id,
        ),
        [events],
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

    const sidePanelHeading = useMemo(() => (
        latestIssueDate ? `${title} (issued ${String(latestIssueDate)})` : title
    ), [title, latestIssueDate]);

    const sidePanelFilters = (
        <LeadTimeFilter
            value={activeLeadTimeDays}
            onChange={onActiveLeadTimeDaysChange}
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
            pending={pendingImpacts}
            sidePanelHeading={sidePanelHeading}
            sidePanelFilters={sidePanelFilters}
            bbox={bbox}
            onActiveEventChange={handleActiveEventChange}
            showLayerSelection={showLayerSelection}
            iso3ForChoropleth={iso3}
            activeHdxOptionKey={activeHdxOptionKey}
            onActiveHdxOptionKeyChange={onActiveHdxOptionKeyChange}
        />
    );
}

export default Jba;
