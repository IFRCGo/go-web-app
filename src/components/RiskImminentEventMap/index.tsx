import type { SymbolLayout, CirclePaint, LngLatBoundsLike } from 'mapbox-gl';
import { useCallback, useMemo, useState } from 'react';
import {
    isDefined,
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';
import Map, {
    MapContainer,
    MapSource,
    MapLayer,
    MapImage,
    MapBounds,
} from '@togglecorp/re-map';
import {
    ChevronRightLineIcon,
    ChevronLeftLineIcon,
} from '@ifrc-go/icons';
import getBbox from '@turf/bbox';
import getBuffer from '@turf/buffer';

import Container from '#components/Container';
import Button from '#components/Button';
import List from '#components/List';
import {
    defaultMapOptions,
    defaultMapStyle,
} from '#utils/map';
import { hazardTypeToColorMap } from '#utils/risk';
import type { components } from '#generated/riskTypes';
import {
    COLOR_BLACK,
    COLOR_WHITE,
} from '#utils/constants';

import earthquakeIcon from '#assets/icons/risk/earthquake.png';
import floodIcon from '#assets/icons/risk/flood.png';
import cycloneIcon from '#assets/icons/risk/cyclone.png';
import droughtIcon from '#assets/icons/risk/drought.png';
import wildfireIcon from '#assets/icons/risk/wildfire.png';

import styles from './styles.module.css';

const mapImageOption = {
    sdf: true,
};
type HazardType = components['schemas']['HazardTypeEnum'];

const hazardKeyToIconmap: Record<HazardType, string | null> = {
    EQ: earthquakeIcon,
    FL: floodIcon,
    TC: cycloneIcon,
    EP: null,
    FI: null,
    SS: null,
    DR: droughtIcon,
    TS: cycloneIcon,
    CD: null,
    WF: wildfireIcon,
};

const hazardKeys = Object.keys(hazardKeyToIconmap) as HazardType[];

interface HazardMapImageProps {
    hazardKey: HazardType;
    onLoad: (key: HazardType, loaded: boolean) => void;
}

function HazardMapImage(props: HazardMapImageProps) {
    const {
        hazardKey,
        onLoad,
    } = props;

    const handleLoad = useCallback(
        (loaded: boolean) => {
            onLoad(hazardKey, loaded);
        },
        [hazardKey, onLoad],
    );

    const url = hazardKeyToIconmap[hazardKey];
    if (isNotDefined(url)) {
        return null;
    }

    return (
        <MapImage
            name={`${hazardKey}-ICON`}
            url={url}
            onLoad={handleLoad}
            imageOptions={mapImageOption}
        />
    );
}

const mapIcons = mapToList(
    hazardKeyToIconmap,
    (icon, key) => (icon ? ({ key, icon }) : undefined),
).filter(isDefined);

const iconImage: SymbolLayout['icon-image'] = [
    'match',
    ['get', 'hazard_type'],
    ...(mapIcons).flatMap(({ key }) => [key, `${key}-ICON`]),
    '',
];

type EventPointProperties = {
    id: string | number,
    hazard_type: HazardType,
}

export type EventPointFeature = GeoJSON.Feature<GeoJSON.Point, EventPointProperties>;

const geojsonSourceOptions: mapboxgl.GeoJSONSourceRaw = { type: 'geojson' };
const hazardTypeColorPaint: CirclePaint['circle-color'] = [
    'match',
    ['get', 'hazard_type'],
    ...mapToList(hazardTypeToColorMap, (value, key) => [key, value]).flat(),
    COLOR_BLACK,
];

interface EventItemProps<EVENT> {
    data: EVENT;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
}

interface Props<EVENT> {
    events: EVENT[] | undefined;
    keySelector: (event: EVENT) => string | number;
    pointFeatureSelector: (event: EVENT) => EventPointFeature | undefined;
    footprintSelector?: (
        eventId: string | number | undefined,
        callback: (footprint: GeoJSON.FeatureCollection<GeoJSON.Geometry> | undefined) => void,
    ) => void;
    listItemRenderer: React.ComponentType<EventItemProps<EVENT>>;
    detailRenderer: React.ComponentType<EventItemProps<EVENT>>;
    pending: boolean;
    sidePanelHeading: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
}

function RiskImminentEventMap<EVENT>(props: Props<EVENT>) {
    const {
        events,
        pointFeatureSelector,
        keySelector,
        listItemRenderer,
        detailRenderer,
        pending,
        footprintSelector,
        sidePanelHeading,
        bbox,
    } = props;

    const [activeEventId, setActiveEventId] = useState<string | number | undefined>();
    const activeEvent = useMemo(
        () => {
            if (isNotDefined(activeEventId)) {
                return undefined;
            }

            return events?.find(
                (event) => keySelector(event) === activeEventId,
            );
        },
        [activeEventId, keySelector, events],
    );

    const [activePointFootprint, setActivePointFootprint] = useState<
        GeoJSON.FeatureCollection<GeoJSON.Geometry> | undefined
    >(undefined);

    const pointFeatures: EventPointFeature[] = events?.map(
        pointFeatureSelector,
    ).filter(isDefined) ?? [];

    const bounds = useMemo(
        () => {
            if (isNotDefined(activeEvent)) {
                return bbox;
            }

            const activePoint = pointFeatureSelector(activeEvent);
            if (!activePoint) {
                return bbox;
            }
            const bufferedPoint = getBuffer(activePoint, 10);

            if (activePointFootprint) {
                return getBbox({
                    ...activePointFootprint,
                    features: [
                        ...activePointFootprint.features,
                        bufferedPoint,
                    ],
                });
            }

            return getBbox(bufferedPoint);
        },
        [activeEvent, activePointFootprint, pointFeatureSelector, bbox],
    );

    const pointFeatureCollection: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: pointFeatures,
    };

    const promptForFootprint = useCallback(
        (eventId: string | number | undefined) => {
            if (!footprintSelector) {
                return;
            }

            footprintSelector(eventId, setActivePointFootprint);
            // setActivePointFootprint(footprint);
        },
        [footprintSelector],
    );

    const setActiveEventIdSafe = useCallback(
        (eventId: number | string | undefined) => {
            setActiveEventId(eventId);
            if (isDefined(eventId)) {
                promptForFootprint(eventId);
            } else {
                setActivePointFootprint(undefined);
            }
        },
        [promptForFootprint],
    );

    const handlePointClick = useCallback(
        (e: mapboxgl.MapboxGeoJSONFeature) => {
            const pointProperties = e.properties as EventPointProperties;
            setActiveEventIdSafe(pointProperties.id);
            return undefined;
        },
        [setActiveEventIdSafe],
    );

    const eventListRendererParams = useCallback(
        (eventId: string | number, event: EVENT) => ({
            data: event,
            actions: (
                <Button
                    name={eventId}
                    onClick={setActiveEventIdSafe}
                    variant="tertiary"
                >
                    <ChevronRightLineIcon className={styles.icon} />
                </Button>
            ),
        }),
        [setActiveEventIdSafe],
    );

    const DetailComponent = detailRenderer;

    const [loadedIcons, setLoadedIcons] = useState<Record<string, boolean>>({});

    const handleIconLoad = useCallback(
        (key: HazardType, loaded: boolean) => {
            setLoadedIcons((prevValue) => ({
                ...prevValue,
                [key]: loaded,
            }));
        },
        [],
    );

    const allIconsLoaded = useMemo(
        () => (
            Object.values(loadedIcons)
                .filter(Boolean).length === mapIcons.length
        ),
        [loadedIcons],
    );

    return (
        <div className={styles.riskImminentEventMap}>
            <Map
                mapStyle={defaultMapStyle}
                mapOptions={defaultMapOptions}
                navControlShown
                navControlPosition="top-right"
            >
                {hazardKeys.map((key) => (
                    <HazardMapImage
                        key={key}
                        hazardKey={key}
                        onLoad={handleIconLoad}
                    />
                ))}
                <MapContainer className={styles.mapContainer} />
                <MapSource
                    sourceKey="event-points"
                    sourceOptions={geojsonSourceOptions}
                    geoJson={pointFeatureCollection}
                >
                    {activePointFootprint && (
                        <MapSource
                            sourceKey="active-event-footprint"
                            sourceOptions={geojsonSourceOptions}
                            geoJson={activePointFootprint}
                        >
                            <MapLayer
                                layerKey="exposure-fill"
                                layerOptions={{
                                    type: 'fill',
                                    filter: [
                                        '==',
                                        ['get', 'type'],
                                        'exposure',
                                    ],
                                    paint: {
                                        'fill-color': COLOR_BLACK,
                                        'fill-opacity': 0.2,
                                    },
                                }}
                            />
                            <MapLayer
                                layerKey="track-outline"
                                layerOptions={{
                                    type: 'line',
                                    filter: [
                                        '==',
                                        ['get', 'type'],
                                        'track',
                                    ],
                                    paint: {
                                        'line-color': COLOR_BLACK,
                                        'line-opacity': 0.4,
                                    },
                                }}
                            />
                            <MapLayer
                                layerKey="track-point"
                                layerOptions={{
                                    type: 'circle',
                                    filter: [
                                        '==',
                                        ['get', 'type'],
                                        'track-point',
                                    ],
                                    paint: {
                                        'circle-radius': 4,
                                        'circle-color': COLOR_BLACK,
                                        'circle-opacity': 0.5,
                                    },
                                }}
                            />
                        </MapSource>
                    )}
                    <MapLayer
                        onClick={handlePointClick}
                        layerKey="point-circle"
                        layerOptions={{
                            type: 'circle',
                            paint: {
                                'circle-radius': 12,
                                'circle-color': hazardTypeColorPaint,
                                'circle-opacity': 0.8,
                            },
                        }}
                    />
                    <MapLayer
                        layerKey="hazard-points-icon"
                        layerOptions={{
                            type: 'symbol',
                            paint: {
                                'icon-color': COLOR_WHITE,
                            },
                            layout: allIconsLoaded ? {
                                visibility: 'visible',
                                'icon-image': iconImage,
                                'icon-size': 0.7,
                                'icon-allow-overlap': true,
                            } : { visibility: 'none' },
                        }}
                    />
                </MapSource>
                {bounds && (
                    <MapBounds
                        duration={1000}
                        bounds={bounds}
                        padding={50}
                    />
                )}
            </Map>
            <Container
                heading={sidePanelHeading}
                className={styles.sidePanel}
                withHeaderBorder
                withInternalPadding
                childrenContainerClassName={styles.content}
                actions={isDefined(activeEventId) && (
                    <Button
                        name={undefined}
                        onClick={setActiveEventIdSafe}
                        variant="tertiary"
                        icons={(
                            <ChevronLeftLineIcon className={styles.icon} />
                        )}
                    >
                        Back to events
                    </Button>
                )}
            >
                {isNotDefined(activeEventId) && (
                    <List
                        className={styles.eventList}
                        filtered={false}
                        pending={pending}
                        errored={false}
                        data={events}
                        keySelector={keySelector}
                        renderer={listItemRenderer}
                        rendererParams={eventListRendererParams}
                    />
                )}
                {isDefined(activeEvent) && (
                    <DetailComponent
                        data={activeEvent}
                    />
                )}
            </Container>
        </div>
    );
}

export default RiskImminentEventMap;
