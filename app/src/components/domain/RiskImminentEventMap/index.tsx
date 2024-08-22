import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    List,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';
import {
    getLayerName,
    MapBounds,
    MapImage,
    MapLayer,
    MapOrder,
    MapSource,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';
import getBuffer from '@turf/buffer';
import type {
    LngLatBoundsLike,
    SymbolLayer,
} from 'mapbox-gl';

import BaseMap from '#components/domain/BaseMap';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import { type components } from '#generated/riskTypes';
import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    COLOR_WHITE,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import {
    BUFFERS,
    TRACKS,
    UNCERTAINTY,
} from '#utils/domain/risk';

import {
    cycloneLabelLayer,
    exposureFillLayer,
    gdacsCycloneExposureFillLayer,
    gdacsCycloneTrackArrowLayer,
    gdacsCycloneTrackOutlineLayer,
    gdacsUncertaintyTrackOutlineLayer,
    geojsonSourceOptions,
    hazardKeyToIconmap,
    hazardPointIconLayout,
    hazardPointLayer,
    invisibleLayout,
    trackArrowLayer,
    trackOutlineLayer,
    trackPointLayer,
} from './mapStyles';

import i18n from './i18n.json';
import styles from './styles.module.css';

const mapImageOption = {
    sdf: true,
};

type HazardType = components<'read'>['schemas']['HazardTypeEnum'];

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

type Footprint = GeoJSON.FeatureCollection<GeoJSON.Geometry> | undefined;

interface EventDetailProps<EVENT, EXPOSURE> {
    data: EVENT;
    exposure: EXPOSURE | undefined;
    pending: boolean;
    onLayerChange: (value: boolean, name: number) => void;
    layer: {[key: string]: boolean};
}

interface Props<EVENT, EXPOSURE, KEY extends string | number> {
    events: EVENT[] | undefined;
    keySelector: (event: EVENT) => KEY;
    pointFeatureSelector: (event: EVENT) => EventPointFeature | undefined;
    footprintSelector: (activeEventExposure: EXPOSURE | undefined) => Footprint | undefined;
    activeEventExposure: EXPOSURE | undefined;
    listItemRenderer: React.ComponentType<EventItemProps<EVENT>>;
    detailRenderer: React.ComponentType<EventDetailProps<EVENT, EXPOSURE>>;
    pending: boolean;
    sidePanelHeading: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
    onActiveEventChange: (eventId: KEY | undefined) => void;
    activeEventExposurePending: boolean;
}

const defaultLayersValue = {
    1: true,
    2: true,
    3: true,
    4: true,
};
function RiskImminentEventMap<
    EVENT,
    EXPOSURE,
    KEY extends string | number
>(props: Props<EVENT, EXPOSURE, KEY>) {
    const {
        events,
        pointFeatureSelector,
        keySelector,
        listItemRenderer,
        detailRenderer,
        pending,
        activeEventExposure,
        footprintSelector,
        sidePanelHeading,
        bbox,
        onActiveEventChange,
        activeEventExposurePending,
    } = props;

    const strings = useTranslation(i18n);

    const [activeEventId, setActiveEventId] = useState<KEY | undefined>(undefined);
    const [layers, setLayers] = useState<{[key: string]: boolean }>(defaultLayersValue);
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

    const activeEventFootprint = useMemo(
        () => {
            if (isNotDefined(activeEventId) || activeEventExposurePending) {
                return undefined;
            }

            return footprintSelector(activeEventExposure);
        },
        [activeEventId, activeEventExposure, activeEventExposurePending, footprintSelector],
    );

    const bounds = useMemo(
        () => {
            if (isNotDefined(activeEvent) || activeEventExposurePending) {
                return bbox;
            }

            const activePoint = pointFeatureSelector(activeEvent);
            if (isNotDefined(activePoint)) {
                return bbox;
            }
            const bufferedPoint = getBuffer(activePoint, 10);

            if (activeEventFootprint) {
                return getBbox({
                    ...activeEventFootprint,
                    features: [
                        ...activeEventFootprint.features,
                        bufferedPoint,
                    ],
                });
            }

            return getBbox(bufferedPoint);
        },
        [activeEvent, activeEventFootprint, pointFeatureSelector, bbox, activeEventExposurePending],
    );

    // Avoid abrupt zooming
    const boundsSafe = useDebouncedValue(bounds);

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

    const setActiveEventIdSafe = useCallback(
        (eventId: string | number | undefined) => {
            const eventIdSafe = eventId as KEY | undefined;

            setActiveEventId(eventIdSafe);
            onActiveEventChange(eventIdSafe);
        },
        [onActiveEventChange],
    );

    const handlePointClick = useCallback(
        (e: mapboxgl.MapboxGeoJSONFeature) => {
            const pointProperties = e.properties as EventPointProperties;
            setActiveEventIdSafe(pointProperties.id as KEY | undefined);
            return undefined;
        },
        [setActiveEventIdSafe],
    );

    const eventListRendererParams = useCallback(
        (_: string | number, event: EVENT): EventItemProps<EVENT> => ({
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

    const handleLayerChange = useCallback((value: boolean, name: number) => {
        setLayers((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    }, []);

    return (
        <div className={styles.riskImminentEventMap}>
            <BaseMap
                mapOptions={{ bounds }}
            >
                <MapContainerWithDisclaimer
                    title={strings.riskImminentEventsMap}
                    className={styles.mapContainer}
                />
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
                {/* FIXME: footprint layer should always be the bottom layer */}
                {activeEventFootprint && (
                    <MapSource
                        sourceKey="active-event-footprint"
                        sourceOptions={geojsonSourceOptions}
                        geoJson={activeEventFootprint}
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
                            layerKey="track-arrow"
                            layerOptions={trackArrowLayer}
                        />
                        <MapLayer
                            layerKey="track-point"
                            layerOptions={trackPointLayer}
                        />
                        {layers[BUFFERS] && (
                            <MapLayer
                                layerKey="cyclone-exposure-fill"
                                layerOptions={gdacsCycloneExposureFillLayer}
                            />
                        )}
                        {(layers[UNCERTAINTY]) && (
                            <MapLayer
                                layerKey="cyclone-uncertainty-track-line"
                                layerOptions={gdacsUncertaintyTrackOutlineLayer}
                            />
                        )}
                        {layers[TRACKS] && (
                            <>
                                <MapLayer
                                    layerKey="cyclone-track-outline"
                                    layerOptions={gdacsCycloneTrackOutlineLayer}
                                />
                                <MapLayer
                                    layerKey="cyclone-track-arrow"
                                    layerOptions={gdacsCycloneTrackArrowLayer}
                                />
                                <MapLayer
                                    layerKey="cyclone-track-points-label"
                                    layerOptions={cycloneLabelLayer}
                                />
                            </>
                        )}
                    </MapSource>
                )}
                <MapSource
                    sourceKey="event-points"
                    sourceOptions={geojsonSourceOptions}
                    geoJson={pointFeatureCollection}
                >
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
                {boundsSafe && (
                    <MapBounds
                        duration={DURATION_MAP_ZOOM}
                        bounds={boundsSafe}
                        padding={DEFAULT_MAP_PADDING}
                    />
                )}
                {activeEventFootprint && (
                    <MapOrder ordering={[
                        getLayerName('active-event-footprint', 'exposure-fill', true),
                        getLayerName('active-event-footprint', 'cyclone-exposure-fill', true),
                        getLayerName('active-event-footprint', 'cyclone-uncertainty-track-line', true),
                        getLayerName('active-event-footprint', 'cyclone-tracks-points-label', true),
                        getLayerName('active-event-footprint', 'cyclone-track-outline', true),
                        getLayerName('active-event-footprint', 'cyclone-track-arrow', true),
                        getLayerName('active-event-footprint', 'track-outline', true),
                        getLayerName('active-event-footprint', 'track-arrow', true),
                        getLayerName('active-event-footprint', 'track-point', true),
                        getLayerName('event-points', 'point-circle', true),
                        getLayerName('event-points', 'hazard-points-icon', true),
                        getLayerName('active-event-footprint', 'cyclone-track-points-label', true),
                        getLayerName('active-event-footprint', 'cyclone-track-points', true),
                    ]}
                    />
                )}
            </BaseMap>
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
                        {strings.backToEventsLabel}
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
                        emptyMessage={strings.emptyImminentEventMessage}
                    />
                )}
                {isDefined(activeEvent) && (
                    <DetailComponent
                        data={activeEvent}
                        exposure={activeEventFootprint}
                        pending={activeEventExposurePending}
                        onLayerChange={handleLayerChange}
                        layer={layers}
                    />
                )}
            </Container>
        </div>
    );
}

export default RiskImminentEventMap;
