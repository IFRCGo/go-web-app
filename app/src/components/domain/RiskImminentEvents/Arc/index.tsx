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

import { ARC_IMPACT_THRESHOLD } from '../malawi/constants';
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
    rainfall: number | null;
    rainfallRaw: number | null;
    impact: number;
    eventRp: number | null;
    cellTrigger: boolean;
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
    activeHdxOptionKey?: string;
    onActiveHdxOptionKeyChange?: (key: string | undefined) => void;
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
        activeHdxOptionKey,
        onActiveHdxOptionKeyChange,
    } = props;

    // eslint-disable-next-line react/destructuring-assignment
    const iso3 = variant === 'country' ? props.iso3 : undefined;

    const [{ data, fetching: pendingObservations }] = useQuery({
        query: ARC_RAINFALL_OBSERVATIONS_QUERY,
    });

    const allObservationRows = data?.arcRainfallObservations?.results;
    const latestObservationDate = allObservationRows?.[0]?.observationDate;

    const events = useMemo<ArcEvent[]>(() => {
        if (!allObservationRows || !latestObservationDate) {
            return [];
        }
        const rows: ArcEvent[] = [];
        allObservationRows.forEach((row) => {
            if (String(row.observationDate) !== String(latestObservationDate)) {
                return;
            }
            if (isNotDefined(row.impact) || Number(row.impact) < ARC_IMPACT_THRESHOLD) {
                return;
            }
            if (isNotDefined(row.adminArea?.ifrcId)) {
                // eslint-disable-next-line no-console
                console.warn(
                    `[Arc] dropping observation row with null adminArea.ifrcId: ${row.id}`,
                );
                return;
            }
            rows.push({
                id: row.id,
                observationDate: String(row.observationDate),
                adminAreaPcode: row.adminArea.pcode,
                adminAreaName: row.adminArea.name,
                adminAreaIfrcId: row.adminArea.ifrcId,
                rainfall: isDefined(row.rainfall) ? Number(row.rainfall) : null,
                rainfallRaw: isDefined(row.rainfallRaw) ? Number(row.rainfallRaw) : null,
                impact: Number(row.impact),
                eventRp: row.eventRp ?? null,
                cellTrigger: row.cellTrigger,
            });
        });
        return rows;
    }, [allObservationRows, latestObservationDate]);

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
            activeIfrcId: number | undefined,
        ): GeoJSON.FeatureCollection<GeoJSON.Geometry, RiskLayerProperties> | undefined => {
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

    const [activeIfrcId, setActiveIfrcId] = useState<number | undefined>(undefined);

    const handleActiveEventChange = useCallback(
        (eventId: string | undefined) => {
            if (isNotDefined(eventId)) {
                setActiveIfrcId(undefined);
                return;
            }
            const ev = events.find((e) => e.id === eventId);
            setActiveIfrcId(ev?.adminAreaIfrcId);
        },
        [events],
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
            activeEventExposure={activeIfrcId}
            activeEventExposurePending={false}
            listItemRenderer={EventListItem}
            detailRenderer={EventDetails}
            pending={pendingObservations}
            sidePanelHeading={sidePanelHeading}
            bbox={bbox}
            onActiveEventChange={handleActiveEventChange}
            showLayerSelection={showLayerSelection}
            iso3ForChoropleth={iso3}
            activeHdxOptionKey={activeHdxOptionKey}
            onActiveHdxOptionKeyChange={onActiveHdxOptionKeyChange}
        />
    );
}

export default Arc;
