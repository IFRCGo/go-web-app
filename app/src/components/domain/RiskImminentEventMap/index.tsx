import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { LayoutGridLineIcon } from '@ifrc-go/icons';
import {
    Container,
    DropdownMenu,
    ListView,
    RadioInput,
    RawList,
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
import getBuffer from '@turf/buffer';
import type {
    FillLayer,
    LineLayer,
    LngLatBoundsLike,
    SymbolLayer,
} from 'mapbox-gl';

import GlobalMap from '#components/domain/GlobalMap';
import GoMapContainer from '#components/GoMapContainer';
import StepGradientBar from '#components/StepGradientBar';
import { type components } from '#generated/riskTypes';
import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    COLOR_BLACK,
    COLOR_LIGHT_GREY,
    COLOR_WHITE,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import { getGeoJsonBounds } from '#utils/geo';

import { type HdxOption } from './hdxLayers';
import LayerOptions, { type LayerOptionsValue } from './LayerOptions';
import {
    activeHazardPointLayer,
    exposureFillLayer,
    exposureFillOutlineLayer,
    geojsonSourceOptions,
    hazardKeyToIconMap,
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
import useHdxLayers from './useHdxLayers';
import { type RiskLayerProperties } from './utils';

import i18n from './i18n.json';
import styles from './styles.module.css';

const mapImageOption = {
    sdf: true,
};

type CommonHazardType = components<'read'>['schemas']['CommonHazardTypeEnumKey'];

const hazardKeys = Object.keys(hazardKeyToIconMap) as CommonHazardType[];

const mapIcons = mapToList(
    hazardKeyToIconMap,
    (icon, key) => (icon ? ({ key, icon }) : undefined),
).filter(isDefined);

type EventPointProperties = {
    id: string | number,
    hazard_type: CommonHazardType,
}

export type EventPointFeature = GeoJSON.Feature<GeoJSON.Point, EventPointProperties>;

export interface RiskEventListItemProps<EVENT> {
    data: EVENT;
    expanded: boolean;
    onExpandClick: (eventId: number | string) => void;
    className?: string;
    children?: React.ReactNode;
}

export interface RiskEventDetailProps<EVENT, EXPOSURE> {
    data: EVENT;
    exposure: EXPOSURE | undefined;
    pending: boolean;
    children?: React.ReactNode;
}

type Footprint = GeoJSON.FeatureCollection<GeoJSON.Geometry, RiskLayerProperties> | undefined;

// FIXME: read this from common type
type ImminentEventSource = 'pdc' | 'wfpAdam' | 'gdacs' | 'meteoSwiss' | 'jba' | 'arc';

interface Props<EVENT, EXPOSURE, KEY extends string | number> {
    // FIXME: use props for configuration rather than
    // passing source here
    source: ImminentEventSource;
    events: EVENT[] | undefined;
    keySelector: (event: EVENT) => KEY;
    hazardTypeSelector: (event: EVENT) => CommonHazardType | '' | undefined;
    pointFeatureSelector: (event: EVENT) => EventPointFeature | undefined;
    footprintSelector: (activeEventExposure: EXPOSURE | undefined) => Footprint | undefined;
    activeEventExposure: EXPOSURE | undefined;
    listItemRenderer: React.ComponentType<RiskEventListItemProps<EVENT>>;
    detailRenderer: React.ComponentType<RiskEventDetailProps<EVENT, EXPOSURE>>;
    pending: boolean;
    sidePanelHeading: React.ReactNode;
    sidePanelFilters?: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
    onActiveEventChange: (eventId: KEY | undefined) => void;
    activeEventExposurePending: boolean;
    showLayerSelection?: boolean;
    iso3ForChoropleth?: string;
    activeHdxOptionKey?: string;
    onActiveHdxOptionKeyChange?: (key: string | undefined) => void;
}

function hdxOptionKeySelector(opt: HdxOption) { return opt.key; }
function hdxOptionLabelSelector(opt: HdxOption) { return opt.label; }

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
        sidePanelFilters,
        bbox,
        onActiveEventChange,
        activeEventExposurePending,
        source,
        showLayerSelection,
        iso3ForChoropleth,
        activeHdxOptionKey,
        onActiveHdxOptionKeyChange,
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

            if (isNotDefined(bufferedPoint)) {
                return bbox;
            }

            if (activeEventFootprint) {
                return getGeoJsonBounds({
                    ...activeEventFootprint,
                    features: [
                        ...activeEventFootprint.features,
                        bufferedPoint,
                    ],
                });
            }

            return getGeoJsonBounds(bufferedPoint);
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

            if (activeEventId === eventIdSafe) {
                setActiveEventId(undefined);
                onActiveEventChange(undefined);
            } else {
                setActiveEventId(eventIdSafe);
                onActiveEventChange(eventIdSafe);
            }
        },
        [onActiveEventChange, activeEventId],
    );

    const handlePointClick = useCallback(
        (e: mapboxgl.MapboxGeoJSONFeature) => {
            const pointProperties = e.properties as EventPointProperties;
            setActiveEventIdSafe(pointProperties.id as KEY | undefined);
            return undefined;
        },
        [setActiveEventIdSafe],
    );

    const DetailComponent = detailRenderer;

    const eventListRendererParams = useCallback(
        (_: string | number, event: EVENT): RiskEventListItemProps<EVENT> => ({
            data: event,
            onExpandClick: setActiveEventIdSafe,
            expanded: activeEventId === keySelector(event),
            className: styles.riskEventListItem,
            children: activeEventId === keySelector(event) && (
                <DetailComponent
                    data={event}
                    exposure={activeEventExposure}
                    pending={activeEventExposurePending}
                >
                    {hazardTypeSelector(event) === 'TC' && (
                        <LayerOptions
                            value={layerOptions}
                            // NOTE: Currently the information is only visible in gdacs
                            exposureAreaControlHidden={source !== 'gdacs'}
                            onChange={setLayerOptions}
                        />
                    )}
                </DetailComponent>
            ),
        }),
        [
            setActiveEventIdSafe,
            activeEventExposure,
            activeEventExposurePending,
            layerOptions,
            hazardTypeSelector,
            DetailComponent,
            activeEventId,
            keySelector,
            source,
        ],
    );

    const [loadedIcons, setLoadedIcons] = useState<Record<string, boolean>>({});

    const handleIconLoad = useCallback(
        (loaded: boolean, key: CommonHazardType) => {
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

    const {
        options: hdxOptions,
        activeOption: activeHdxOption,
        pcodeToColor,
        bins: choroplethBins,
    } = useHdxLayers(activeHdxOptionKey, Boolean(showLayerSelection));

    const choroplethFillLayer = useMemo<Omit<FillLayer, 'id'> | undefined>(() => {
        if (!iso3ForChoropleth || !pcodeToColor || pcodeToColor.size === 0) {
            return undefined;
        }
        const matchPairs: string[] = [];
        pcodeToColor.forEach((color, pcode) => {
            matchPairs.push(pcode, color);
        });
        const fillColor: NonNullable<FillLayer['paint']>['fill-color'] = [
            'match',
            ['get', 'code'],
            ...matchPairs,
            COLOR_LIGHT_GREY,
        ];
        return {
            type: 'fill',
            'source-layer': `go-admin2-${iso3ForChoropleth}-staging`,
            paint: {
                'fill-color': fillColor,
                'fill-opacity': 0.7,
            },
            layout: { visibility: 'visible' },
        };
    }, [iso3ForChoropleth, pcodeToColor]);

    const choroplethOutlineLayer = useMemo<Omit<LineLayer, 'id'> | undefined>(() => {
        if (!iso3ForChoropleth || !pcodeToColor || pcodeToColor.size === 0) {
            return undefined;
        }
        return {
            type: 'line',
            'source-layer': `go-admin2-${iso3ForChoropleth}-staging`,
            paint: {
                'line-color': COLOR_BLACK,
                'line-opacity': 0.3,
                'line-width': 0.5,
            },
            layout: { visibility: 'visible' },
        };
    }, [iso3ForChoropleth, pcodeToColor]);

    const layerSelectionNode = useMemo(() => {
        if (!showLayerSelection || !onActiveHdxOptionKeyChange) {
            return undefined;
        }
        return (
            <DropdownMenu
                // FIXME: use strings
                label={activeHdxOption?.label ?? 'Layers'}
                labelBefore={<LayoutGridLineIcon />}
                labelStyleVariant="filled"
                persistent
                preferredPopupWidth={30}
            >
                <RadioInput
                    name="hdxLayer"
                    clearable
                    value={activeHdxOptionKey}
                    options={hdxOptions}
                    keySelector={hdxOptionKeySelector}
                    labelSelector={hdxOptionLabelSelector}
                    radioListLayout="block"
                    onChange={onActiveHdxOptionKeyChange}
                    spacing="2xs"
                />
            </DropdownMenu>
        );
    }, [
        showLayerSelection,
        onActiveHdxOptionKeyChange,
        activeHdxOptionKey,
        hdxOptions,
        activeHdxOption,
    ]);

    const legendNode = useMemo(() => {
        if (!activeHdxOption || !choroplethBins) {
            return null;
        }
        return (
            <StepGradientBar
                steps={choroplethBins.map((bin) => ({
                    color: bin.color,
                    label: bin.label,
                }))}
            />
        );
    }, [activeHdxOption, choroplethBins]);

    return (
        <div className={styles.riskImminentEventMap}>
            <GlobalMap
                mapOptions={{ bounds }}
            >
                <GoMapContainer
                    className={styles.mapContainer}
                    title={strings.riskImminentEventsMap}
                    layerSelection={layerSelectionNode}
                >
                    {legendNode}
                </GoMapContainer>
                {iso3ForChoropleth && choroplethFillLayer && choroplethOutlineLayer && (
                    <MapSource
                        sourceKey="hdx-choropleth"
                        sourceOptions={{
                            type: 'vector',
                            url: `mapbox://go-ifrc.go-admin2-${iso3ForChoropleth}-staging`,
                        }}
                    >
                        <MapLayer
                            layerKey="hdx-choropleth-fill"
                            layerOptions={choroplethFillLayer}
                        />
                        <MapLayer
                            layerKey="hdx-choropleth-outline"
                            layerOptions={choroplethOutlineLayer}
                        />
                    </MapSource>
                )}
                {hazardKeys.map((key) => {
                    const url = hazardKeyToIconMap[key];

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
                        getLayerName('hdx-choropleth', 'hdx-choropleth-fill', true),
                        getLayerName('hdx-choropleth', 'hdx-choropleth-outline', true),
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
            </GlobalMap>
            <Container
                className={styles.sidePanel}
                heading={sidePanelHeading}
                pending={pending}
                empty={isNotDefined(sidePanelFilters)
                    && (isNotDefined(events) || events.length === 0)}
                emptyMessage={strings.emptyImminentEventMessage}
                withPadding
                withBackground
                withShadow
                withContentOverflow
                withContentWell
                spacing="sm"
                withoutSpacingOpticalCorrection
            >
                {sidePanelFilters}
                {(isDefined(events) && events.length > 0) ? (
                    <ListView
                        layout="block"
                        spacing="2xs"
                    >
                        <RawList
                            data={events}
                            keySelector={keySelector}
                            renderer={listItemRenderer}
                            rendererParams={eventListRendererParams}
                        />
                    </ListView>
                ) : (
                    isDefined(sidePanelFilters) && (
                        <div>{strings.emptyImminentEventMessage}</div>
                    )
                )}
            </Container>
        </div>
    );
}

export default RiskImminentEventMap;
