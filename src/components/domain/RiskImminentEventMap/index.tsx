import type { LngLatBoundsLike, SymbolLayer } from 'mapbox-gl';
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
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import getBbox from '@turf/bbox';
import getBuffer from '@turf/buffer';

import Container from '#components/Container';
import Button from '#components/Button';
import List from '#components/List';
import {
    defaultMapOptions,
    defaultMapStyle,
} from '#utils/map';
import type { components } from '#generated/riskTypes';
import { COLOR_WHITE, DEFAULT_MAP_PADDING, DURATION_MAP_ZOOM } from '#utils/constants';

import {
    exposureFillLayer,
    geojsonSourceOptions,
    hazardPointLayer,
    trackOutlineLayer,
    trackPointLayer,
    hazardKeyToIconmap,
    invisibleLayout,
    hazardPointIconLayout,
} from './mapStyles';

import styles from './styles.module.css';

const mapImageOption = {
    sdf: true,
};

type HazardType = components['schemas']['HazardTypeEnum'];

const hazardKeys = Object.keys(hazardKeyToIconmap) as HazardType[];

const mapIcons = mapToList(
    hazardKeyToIconmap,
    (icon, key) => (icon ? ({ key, icon }) : undefined),
).filter(isDefined);

type EventPointProperties = {
    id: string | number,
    hazard_type: HazardType,
}

export type EventPointFeature = GeoJSON.Feature<GeoJSON.Point, EventPointProperties>;

interface EventItemProps<EVENT> {
    data: EVENT;
    onExpandClick: (eventId: number | string) => void;
}

interface EventDetailProps<EVENT> {
    data: EVENT;
}

interface Props<EVENT> {
    events: EVENT[] | undefined;
    keySelector: (event: EVENT) => string | number;
    pointFeatureSelector: (event: EVENT) => EventPointFeature | undefined;
    footprintSelector?: (
        eventId: string | number | undefined,
        successCallback: (
            footprint: GeoJSON.FeatureCollection<GeoJSON.Geometry> | undefined
        ) => void,
    ) => void;
    listItemRenderer: React.ComponentType<EventItemProps<EVENT>>;
    detailRenderer: React.ComponentType<EventDetailProps<EVENT>>;
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

    const bounds = useMemo(
        () => {
            if (isNotDefined(activeEvent)) {
                return bbox;
            }

            const activePoint = pointFeatureSelector(activeEvent);
            if (isNotDefined(activePoint)) {
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

    const pointFeatureCollection = useMemo<
        GeoJSON.FeatureCollection<GeoJSON.Point, EventPointProperties>
    >(
        () => ({
            type: 'FeatureCollection' as const,
            features: events?.map(
                pointFeatureSelector,
            ).filter(isDefined) ?? [],
        }),
        [events, pointFeatureSelector],
    );

    const promptForFootprint = useCallback(
        (eventId: string | number | undefined) => {
            if (isNotDefined(footprintSelector)) {
                return;
            }

            // FIXME: check if component is still
            // mounted when we get the footprint
            footprintSelector(eventId, setActivePointFootprint);
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
        (_: string | number, event: EVENT) => ({
            data: event,
            onExpandClick: setActiveEventIdSafe,
        }),
        [setActiveEventIdSafe],
    );

    const DetailComponent = detailRenderer;

    const [loadedIcons, setLoadedIcons] = useState<Record<string, boolean>>({});

    const handleIconLoad = useCallback(
        (loaded: boolean, key: HazardType) => {
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

    const hazardPointIconLayer = useMemo<Omit<SymbolLayer, 'id'>>(
        () => ({
            type: 'symbol',
            paint: { 'icon-color': COLOR_WHITE },
            layout: allIconsLoaded ? hazardPointIconLayout : invisibleLayout,
        }),
        [allIconsLoaded],
    );

    return (
        <div className={styles.riskImminentEventMap}>
            <Map
                mapStyle={defaultMapStyle}
                mapOptions={defaultMapOptions}
                navControlShown
                navControlPosition="top-right"
                scaleControlShown={false}
            >
                {/* FIXME: MapImage is not working in strict mode */}
                {hazardKeys.map((key) => {
                    const url = hazardKeyToIconmap[key];

                    if (isNotDefined(url)) {
                        return null;
                    }

                    return (
                        <MapImage
                            key={key}
                            name={key}
                            url={url}
                            onLoad={handleIconLoad}
                            imageOptions={mapImageOption}
                        />
                    );
                })}
                <MapContainer className={styles.mapContainer} />
                <MapSource
                    sourceKey="event-points"
                    sourceOptions={geojsonSourceOptions}
                    geoJson={pointFeatureCollection}
                >
                    {/* FIXME: footprint layer should always be the bottom layer */}
                    {activePointFootprint && (
                        <MapSource
                            sourceKey="active-event-footprint"
                            sourceOptions={geojsonSourceOptions}
                            geoJson={activePointFootprint}
                        >
                            <MapLayer
                                layerKey="exposure-fill"
                                layerOptions={exposureFillLayer}
                            />
                            <MapLayer
                                layerKey="track-outline"
                                layerOptions={trackOutlineLayer}
                            />
                            <MapLayer
                                layerKey="track-point"
                                layerOptions={trackPointLayer}
                            />
                        </MapSource>
                    )}
                    <MapLayer
                        onClick={handlePointClick}
                        layerKey="point-circle"
                        layerOptions={hazardPointLayer}
                    />
                    <MapLayer
                        layerKey="hazard-points-icon"
                        layerOptions={hazardPointIconLayer}
                    />
                </MapSource>
                {bounds && (
                    <MapBounds
                        duration={DURATION_MAP_ZOOM}
                        bounds={bounds}
                        padding={DEFAULT_MAP_PADDING}
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
                        {/* FIXME: use translation */}
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
