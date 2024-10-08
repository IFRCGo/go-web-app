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
    MapState,
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

import LayerOptions, { LayerOptionsValue } from './LayerOptions';
import {
    activeHazardPointLayer,
    exposureFillLayer,
    exposureFillOutlineLayer,
    geojsonSourceOptions,
    hazardKeyToIconmap,
    hazardPointIconLayout,
    hazardPointLayer,
    invisibleCircleLayer,
    invisibleFillLayer,
    invisibleLayout,
    invisibleLineLayer,
    trackLineLayer,
    trackPointLayer,
    trackPointOuterCircleLayer,
    uncertaintyConeLayer,
} from './mapStyles';
import { RiskLayerProperties } from './utils';

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

export interface RiskEventListItemProps<EVENT> {
    data: EVENT;
    onExpandClick: (eventId: number | string) => void;
    className?: string;
}

export interface RiskEventDetailProps<EVENT, EXPOSURE> {
    data: EVENT;
    exposure: EXPOSURE | undefined;
    pending: boolean;
    children?: React.ReactNode;
}

type Footprint = GeoJSON.FeatureCollection<GeoJSON.Geometry, RiskLayerProperties> | undefined;

interface Props<EVENT, EXPOSURE, KEY extends string | number> {
    events: EVENT[] | undefined;
    keySelector: (event: EVENT) => KEY;
    hazardTypeSelector: (event: EVENT) => HazardType | '' | undefined;
    pointFeatureSelector: (event: EVENT) => EventPointFeature | undefined;
    footprintSelector: (activeEventExposure: EXPOSURE | undefined) => Footprint | undefined;
    activeEventExposure: EXPOSURE | undefined;
    listItemRenderer: React.ComponentType<RiskEventListItemProps<EVENT>>;
    detailRenderer: React.ComponentType<RiskEventDetailProps<EVENT, EXPOSURE>>;
    pending: boolean;
    sidePanelHeading: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
    onActiveEventChange: (eventId: KEY | undefined) => void;
    activeEventExposurePending: boolean;
}

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
        hazardTypeSelector,
        footprintSelector,
        sidePanelHeading,
        bbox,
        onActiveEventChange,
        activeEventExposurePending,
    } = props;

    const strings = useTranslation(i18n);

    const [activeEventId, setActiveEventId] = useState<KEY | undefined>(undefined);
    const [layerOptions, setLayerOptions] = useState<LayerOptionsValue>({
        showStormPosition: true,
        showForecastUncertainty: true,
        showTrackLine: true,
        showExposedArea: true,
    });
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

    const eventVisibilityAttributes = useMemo(
        () => events?.map((event) => {
            const key = keySelector(event);

            return {
                id: key,
                value: isNotDefined(activeEventId) || activeEventId === key,
            };
        }),
        [events, activeEventId, keySelector],
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
                (event) => {
                    const feature = pointFeatureSelector(event);

                    if (isNotDefined(feature)) {
                        return undefined;
                    }

                    return {
                        ...feature,
                        id: keySelector(event),
                    };
                },
            ).filter(isDefined) ?? [],
        }),
        [events, pointFeatureSelector, keySelector],
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
        (_: string | number, event: EVENT): RiskEventListItemProps<EVENT> => ({
            data: event,
            onExpandClick: setActiveEventIdSafe,
            className: styles.riskEventListItem,
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
            paint: {
                'icon-color': COLOR_WHITE,
                'icon-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'eventVisible'], true],
                    1,
                    0,
                ],
                /*
                'icon-opacity-transition': {
                    duration: 200,
                },
                */
            },
            layout: allIconsLoaded ? hazardPointIconLayout : invisibleLayout,
        }),
        [allIconsLoaded],
    );

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
                {activeEventFootprint && (
                    <MapSource
                        sourceKey="active-event-footprint"
                        sourceOptions={geojsonSourceOptions}
                        geoJson={activeEventFootprint}
                    >
                        <MapLayer
                            layerKey="exposure-fill"
                            layerOptions={layerOptions.showExposedArea
                                ? exposureFillLayer
                                : invisibleFillLayer}
                        />
                        <MapLayer
                            layerKey="exposure-fill-outline"
                            layerOptions={layerOptions.showExposedArea
                                ? exposureFillOutlineLayer
                                : invisibleFillLayer}
                        />
                        <MapLayer
                            layerKey="track-line"
                            layerOptions={layerOptions.showTrackLine
                                ? trackLineLayer
                                : invisibleLineLayer}
                        />
                        {/*
                        <MapLayer
                            layerKey="track-arrow"
                            layerOptions={layerOptions.showTrackLine
                                ? trackArrowLayer
                                : invisibleSymbolLayer}
                        />
                        */}
                        <MapLayer
                            layerKey="track-point"
                            layerOptions={layerOptions.showStormPosition
                                ? trackPointLayer
                                : invisibleCircleLayer}
                        />
                        <MapLayer
                            layerKey="track-point-outer-circle"
                            layerOptions={layerOptions.showStormPosition
                                ? trackPointOuterCircleLayer
                                : invisibleCircleLayer}
                        />
                        <MapLayer
                            layerKey="uncertainty-cone"
                            layerOptions={layerOptions.showForecastUncertainty
                                ? uncertaintyConeLayer
                                : invisibleLineLayer}
                        />
                        <MapLayer
                            layerKey="hazard-point"
                            layerOptions={activeHazardPointLayer}
                        />
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
                    <MapState
                        // sourceLayer="event-points"
                        attributeKey="eventVisible"
                        // @ts-expect-error Wrong typing in @togglecorp/re-map
                        attributes={eventVisibilityAttributes}
                    />
                </MapSource>
                <MapOrder
                    ordering={[
                        getLayerName('active-event-footprint', 'exposure-fill', true),
                        getLayerName('active-event-footprint', 'exposure-fill-outline', true),
                        getLayerName('active-event-footprint', 'uncertainty-cone', true),
                        getLayerName('active-event-footprint', 'track-point-outer-circle', true),
                        getLayerName('active-event-footprint', 'track-line', true),
                        getLayerName('active-event-footprint', 'track-arrow', true),
                        getLayerName('active-event-footprint', 'track-point', true),
                        getLayerName('active-event-footprint', 'hazard-point', true),
                        getLayerName('event-points', 'point-circle', true),
                        getLayerName('event-points', 'hazard-points-icon', true),
                    ]}
                />
                {boundsSafe && (
                    <MapBounds
                        duration={DURATION_MAP_ZOOM}
                        bounds={boundsSafe}
                        padding={DEFAULT_MAP_PADDING}
                    />
                )}
            </BaseMap>
            <Container
                heading={sidePanelHeading}
                className={styles.sidePanel}
                withHeaderBorder
                withInternalPadding
                childrenContainerClassName={styles.content}
                spacing="cozy"
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
                        exposure={activeEventExposure}
                        pending={activeEventExposurePending}
                    >
                        {hazardTypeSelector(activeEvent) === 'TC' && (
                            <LayerOptions
                                value={layerOptions}
                                onChange={setLayerOptions}
                            />
                        )}
                    </DetailComponent>
                )}
            </Container>
        </div>
    );
}

export default RiskImminentEventMap;
