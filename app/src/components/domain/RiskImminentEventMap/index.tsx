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
    MapBounds,
    MapImage,
    MapLayer,
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
    ClickedPoint,
    COLOR_WHITE,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import {
    ImminentEventSource,
    LAYER_CYCLONE_BUFFERS,
    LAYER_CYCLONE_NODES,
    LAYER_CYCLONE_TRACKS,
    LAYER_CYCLONE_UNCERTAINTY,
    LAYER_CYCLONE_UNCERTAINTY_FIVE_DAYS,
    LAYER_CYCLONE_UNCERTAINTY_THREE_DAYS,
    LayerOption,
    LayerType,
} from '#utils/domain/risk';

import GdacsMap from '../RiskImminentEvents/Gdacs/GdacsMap';
import PdcMap from '../RiskImminentEvents/Pdc/PdcMap';
import WfpAdamMap from '../RiskImminentEvents/WfpAdam/WfpAdamMap';
import {
    geojsonSourceOptions,
    hazardKeyToIconmap,
    hazardPointIconLayout,
    hazardPointLayer,
    invisibleLayout,
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

interface EventDetailProps<EVENT, EXPOSURE, EVENT_PROPERTIES> {
    data: EVENT;
    exposure: EXPOSURE | undefined;
    pending: boolean;
    layers: Record<LayerType, boolean>;
    onLayerChange: (value: boolean, name: LayerType) => void;
    options: LayerOption[];
    clickedPointProperties: ClickedPoint<EVENT_PROPERTIES> | undefined;
    handlePointClick: (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => boolean;
    handlePointClose: () => void;
}

interface Props<EVENT, EXPOSURE, EVENT_PROPERTIES, KEY extends string | number> {
    events: EVENT[] | undefined;
    keySelector: (event: EVENT) => KEY;
    pointFeatureSelector: (event: EVENT) => EventPointFeature | undefined;
    footprintSelector: (activeEventExposure: EXPOSURE | undefined) => Footprint | undefined;
    activeEventExposure: EXPOSURE | undefined;
    listItemRenderer: React.ComponentType<EventItemProps<EVENT>>;
    detailRenderer: React.ComponentType<EventDetailProps<EVENT, EXPOSURE, EVENT_PROPERTIES>>;
    pending: boolean;
    sidePanelHeading: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
    onActiveEventChange: (eventId: KEY | undefined) => void;
    activeEventExposurePending: boolean;
    activeView: ImminentEventSource;
    activeLayersMapping: Record<LayerType, boolean>;
    layers: Record<LayerType, boolean>;
    onLayerChange: (value: boolean, name: LayerType) => void;
    clickedPointProperties: ClickedPoint<EVENT_PROPERTIES> | undefined;
    handleCyclonePointClick: (
        feature: mapboxgl.MapboxGeoJSONFeature,
        lngLat: mapboxgl.LngLat,
    ) => boolean;
    handleCyclonePointClose: () => void;
}

function RiskImminentEventMap<
    EVENT,
    EXPOSURE,
    EVENT_PROPERTIES,
    KEY extends string | number
>(props: Props<EVENT, EXPOSURE, EVENT_PROPERTIES, KEY>) {
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
        activeView,
        activeLayersMapping,
        layers,
        onLayerChange,
        clickedPointProperties,
        handleCyclonePointClick,
        handleCyclonePointClose,
    } = props;

    const strings = useTranslation(i18n);

    const [activeEventId, setActiveEventId] = useState<KEY | undefined>(undefined);

    const layerOptions: LayerOption[] = useMemo(() => [
        {
            key: LAYER_CYCLONE_NODES,
            label: strings.eventLayerNodes,
        },
        {
            key: LAYER_CYCLONE_BUFFERS,
            label: strings.eventLayerBuffers,
        },
        {
            key: LAYER_CYCLONE_TRACKS,
            label: strings.eventLayerTracks,
        },
        {
            key: LAYER_CYCLONE_UNCERTAINTY,
            label: strings.eventLayerForecastUncertainty,
        },
        {
            key: LAYER_CYCLONE_UNCERTAINTY_FIVE_DAYS,
            label: strings.eventLayerForecastUncertaintyFiveDays,
        },
        {
            key: LAYER_CYCLONE_UNCERTAINTY_THREE_DAYS,
            label: strings.eventLayerForecastUncertaintyThreeDays,
        },
    ], [strings]);

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

    const activeLayerOptions = useMemo(() => {
        if (isNotDefined(activeLayersMapping)) {
            return [];
        }
        return layerOptions.filter((opt) => activeLayersMapping[opt?.key]);
    }, [activeLayersMapping, layerOptions]);

    const getLayerBySource = useCallback((source: ImminentEventSource) => {
        if (source === 'pdc') {
            return (
                <PdcMap
                    activeEventFootprint={activeEventFootprint}
                    layers={layers}
                    hazardType={activeEvent?.hazard_type}
                />
            );
        }

        if (source === 'gdacs') {
            return (
                <GdacsMap
                    activeEventFootprint={activeEventFootprint}
                    layers={layers}
                    hazardType={activeEvent?.hazard_type}
                    handlePointClick={handleCyclonePointClick}
                    handlePointClose={handleCyclonePointClose}
                    clickedPointProperties={clickedPointProperties}
                />
            );
        }
        if (source === 'wfpAdam') {
            return (
                <WfpAdamMap
                    activeEventFootprint={activeEventFootprint}
                    layers={layers}
                    hazardType={activeEvent?.hazard_type}
                />
            );
        }
        return null;
    }, [
        activeEventFootprint,
        layers,
        activeEvent,
        handleCyclonePointClick,
        handleCyclonePointClose,
        clickedPointProperties,
    ]);

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
                    getLayerBySource(activeView)
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
                        exposure={activeEventExposure}
                        pending={activeEventExposurePending}
                        onLayerChange={onLayerChange}
                        layers={layers}
                        options={activeLayerOptions}
                        handlePointClick={handleCyclonePointClick}
                        handlePointClose={handleCyclonePointClose}
                        clickedPointProperties={clickedPointProperties}
                    />
                )}
            </Container>
        </div>
    );
}

export default RiskImminentEventMap;
