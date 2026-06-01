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
import { type HdxLayerSelection } from '#components/domain/RiskImminentEventMap/hdxLayers';
import { type LocalUnitsSelection } from '#components/domain/RiskImminentEventMap/useLocalUnits';
import { type RiskLayerProperties } from '#components/domain/RiskImminentEventMap/utils';
import { graphql } from '#generated/gql';
import { MAX_PAGE_LIMIT } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import {
    ARC_IMPACT_THRESHOLD,
    ARC_OBSERVATION_HISTORY_DAYS,
} from '../malawi/constants';
import HowItWorks from '../malawi/HowItWorks';
import useFloodExposure, { type FloodExposure } from '../malawi/useFloodExposure';
import EventDetails from './EventDetails';
import EventListItem from './EventListItem';

const ARC_RAINFALL_OBSERVATIONS_QUERY = graphql(`
    query ArcRainfallObservations {
      arcRainfallObservations(
        order: { observationDate: DESC }
        pagination: { limit: 9999 }
      ) {
        results {
          id
          observationDate
          adminAreaId
          adminArea {
            id
            pcode
            ifrcId
            name
          }
          rainfall
          rainfallRaw
          impact
          eventRp
          cellTrigger
        }
      }
    }
`);

export type ArcEvent = {
    id: string;
    observationDate: string;
    adminAreaPcode: string;
    adminAreaName: string;
    adminAreaIfrcId: number;
    // MRW backend AdminArea PK — matches ArcTriggerEvent.affectedAdminAreas.
    adminAreaMrwId: string;
    rainfall: number | null;
    rainfallRaw: number | null;
    impact: number | null;
    eventRp: number | null;
    cellTrigger: boolean;
    // Populated once the admin2 REST fetch resolves (joined by adminAreaIfrcId).
    districtId: number | undefined;
    districtName: string | undefined;
    // RP100 flood-exposed population (HDX), joined by adminAreaPcode. Static
    // district-wide context, not matched to this observation.
    floodExposure?: FloodExposure;
};

function keySelector(event: ArcEvent) {
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
    baseLayers?: React.ReactNode;
}

type Props = BaseProps & (
    | { variant: 'global' }
    | { variant: 'region'; regionId: number }
    | { variant: 'country'; iso3: string }
);

function Arc(props: Props) {
    const {
        title,
        bbox,
        variant,
        showLayerSelection,
        activeHdxLayers,
        onActiveHdxLayersChange,
        localUnits,
        onLocalUnitsChange,
        baseLayers,
    } = props;

    // eslint-disable-next-line react/destructuring-assignment
    const iso3 = variant === 'country' ? props.iso3 : undefined;

    // RP100 flood-exposed population per district (HDX), joined by pcode below.
    const floodExposureByPcode = useFloodExposure(isDefined(iso3));

    const [{ data, fetching: pendingObservations }] = useQuery({
        query: ARC_RAINFALL_OBSERVATIONS_QUERY,
    });

    const allObservationRows = data?.arcRainfallObservations?.results;
    const latestObservationDate = allObservationRows?.[0]?.observationDate;

    // All observation rows (every date) in ArcEvent shape. Drives both the
    // latest-date markers and the per-district timeline shown in the detail chart.
    const allRows = useMemo<ArcEvent[]>(() => {
        if (!allObservationRows) {
            return [];
        }
        const rows: ArcEvent[] = [];
        allObservationRows.forEach((row) => {
            if (isNotDefined(row.adminArea?.ifrcId)) {
                // Only warn for the latest date — older history rows from the
                // same unmapped admin area would repeat the same warning.
                if (String(row.observationDate) === String(latestObservationDate)) {
                    // eslint-disable-next-line no-console
                    console.warn(
                        `[Arc] dropping observation row with null adminArea.ifrcId: ${row.id}`,
                    );
                }
                return;
            }
            rows.push({
                id: row.id,
                observationDate: String(row.observationDate),
                adminAreaPcode: row.adminArea.pcode,
                adminAreaName: row.adminArea.name,
                adminAreaIfrcId: row.adminArea.ifrcId,
                adminAreaMrwId: String(row.adminAreaId),
                rainfall: isDefined(row.rainfall) ? Number(row.rainfall) : null,
                rainfallRaw: isDefined(row.rainfallRaw) ? Number(row.rainfallRaw) : null,
                impact: isDefined(row.impact) ? Number(row.impact) : null,
                eventRp: row.eventRp ?? null,
                cellTrigger: row.cellTrigger,
                districtId: undefined,
                districtName: undefined,
            });
        });
        return rows;
    }, [allObservationRows, latestObservationDate]);

    const eventsRaw = useMemo<ArcEvent[]>(() => {
        if (!latestObservationDate) {
            return [];
        }
        return allRows.filter((row) => (
            row.observationDate === String(latestObservationDate)
            && isDefined(row.impact)
            && row.impact >= ARC_IMPACT_THRESHOLD
        ));
    }, [allRows, latestObservationDate]);

    const ifrcIds = useMemo(
        () => unique(
            eventsRaw.map((e) => e.adminAreaIfrcId),
            (id) => id,
        ),
        [eventsRaw],
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

    // Enrich with admin1 district info once the admin2 REST call lands, plus
    // the district's RP100 flood-exposed population.
    const events = useMemo<ArcEvent[]>(
        () => eventsRaw.map((row) => {
            const admin = adminAreaById.get(row.adminAreaIfrcId);
            return {
                ...row,
                districtId: admin?.district_id,
                districtName: admin?.district_name,
                floodExposure: floodExposureByPcode.get(row.adminAreaPcode),
            };
        }),
        [eventsRaw, adminAreaById, floodExposureByPcode],
    );

    // Per-district observation history (most recent ARC_OBSERVATION_HISTORY_DAYS
    // rows, sorted ascending) for the detail chart.
    const timelineByAdmin = useMemo(() => {
        const map = new Map<number, ArcEvent[]>();
        allRows.forEach((row) => {
            const list = map.get(row.adminAreaIfrcId);
            if (list) {
                list.push(row);
            } else {
                map.set(row.adminAreaIfrcId, [row]);
            }
        });
        map.forEach((list, key) => {
            list.sort((a, b) => a.observationDate.localeCompare(b.observationDate));
            map.set(key, list.slice(-ARC_OBSERVATION_HISTORY_DAYS));
        });
        return map;
    }, [allRows]);

    const pointFeatureSelector = useCallback(
        (event: ArcEvent): EventPointFeature | undefined => {
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
            exposure: ArcEvent[] | undefined,
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

    // Re-use the activeEventExposure plumbing to carry the active district's
    // recent observation history so the detail can render the rainfall chart
    // and the footprint selector can derive the ifrcId. No async fetch needed.
    const [activeTimeline, setActiveTimeline] = useState<ArcEvent[] | undefined>(undefined);

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
        latestObservationDate ? `${title} (observed ${String(latestObservationDate)})` : title
    ), [title, latestObservationDate]);

    return (
        <RiskImminentEventMap
            source="arc"
            events={events}
            keySelector={keySelector}
            hazardTypeSelector={hazardTypeSelector}
            pointFeatureSelector={pointFeatureSelector}
            footprintSelector={footprintSelector}
            activeEventExposure={activeTimeline}
            activeEventExposurePending={false}
            listItemRenderer={EventListItem}
            detailRenderer={EventDetails}
            pending={pendingObservations}
            sidePanelHeading={sidePanelHeading}
            sidePanelFilters={<HowItWorks />}
            bbox={bbox}
            onActiveEventChange={handleActiveEventChange}
            showLayerSelection={showLayerSelection}
            iso3ForChoropleth={iso3}
            activeHdxLayers={activeHdxLayers}
            onActiveHdxLayersChange={onActiveHdxLayersChange}
            localUnits={localUnits}
            onLocalUnitsChange={onLocalUnitsChange}
            baseLayers={baseLayers}
        />
    );
}

export default Arc;
