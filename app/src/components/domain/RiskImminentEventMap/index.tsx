import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    Label,
    ListView,
    RawList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { formatNumber } from '@ifrc-go/ui/utils';
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
    CircleLayer,
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
    COLOR_PRIMARY_RED,
    COLOR_WHITE,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
    MAX_PAGE_LIMIT,
} from '#utils/constants';
import { getGeoJsonBounds } from '#utils/geo';
import { useRequest } from '#utils/restRequest';

import { type HdxLayerSelection } from './hdxLayers';
import JbaCogRasterLayer from './JbaCogRasterLayer';
import LayerOptions, { type LayerOptionsValue } from './LayerOptions';
import LayersPanel from './LayersPanel';
import {
    activeHazardPointLayer,
    BASEMAP_ADMIN_1_BOUNDARY_LAYER,
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
import RasterOverlayControl from './RasterOverlayControl';
import useHdxLayers from './useHdxLayers';
import useLocalUnits, {
    DEFAULT_LOCAL_UNITS_OPACITY,
    type LocalUnitsSelection,
} from './useLocalUnits';
import { type RiskLayerProperties } from './utils';

import i18n from './i18n.json';
import styles from './styles.module.css';

const mapImageOption = {
    sdf: true,
};

// Stable reference for the "no layers selected" case so useHdxLayers' memos
// don't re-run every render when activeHdxLayers is undefined.
const EMPTY_SELECTIONS: HdxLayerSelection[] = [];
const EMPTY_KEYS: string[] = [];

// Compact number formatting for the bubble size-legend range.
const COMPACT_NUMBER_OPTIONS = { compact: true, maximumFractionDigits: 1 } as const;

// Graduated-bubble radius range (px) for the bubble representation.
const MIN_BUBBLE_RADIUS = 4;
const MAX_BUBBLE_RADIUS = 24;

const DEFAULT_RASTER_OPACITY = 0.75;

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
    activeHdxLayers?: HdxLayerSelection[];
    onActiveHdxLayersChange?: (next: HdxLayerSelection[]) => void;
    localUnits?: LocalUnitsSelection;
    onLocalUnitsChange?: (next: LocalUnitsSelection) => void;
    // When set, enables the raster-overlay toggle in EventDetails and
    // streams the COG into a Mapbox image source. Undefined → no toggle.
    cogUrl?: string;
    baseLayers?: React.ReactNode;
    // Rendered inline in the side-panel header (Container's headerActions).
    headerActions?: React.ReactNode;
    // When this changes, the open event detail and its raster controls are reset
    // (e.g. JBA passes lead time + ingestion run, whose change swaps the dataset).
    detailResetKey?: string | number;
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
        sidePanelFilters,
        bbox,
        onActiveEventChange,
        activeEventExposurePending,
        source,
        showLayerSelection,
        iso3ForChoropleth,
        activeHdxLayers,
        onActiveHdxLayersChange,
        localUnits,
        onLocalUnitsChange,
        cogUrl,
        baseLayers,
        headerActions,
        detailResetKey,
    } = props;

    const strings = useTranslation(i18n);

    const [activeEventId, setActiveEventId] = useState<KEY | undefined>(undefined);
    const [layerOptions, setLayerOptions] = useState<LayerOptionsValue>({
        showStormPosition: true,
        showForecastUncertainty: true,
        showTrackLine: true,
        showExposedArea: true,
    });
    const [showRaster, setShowRaster] = useState(false);
    const [rasterOpacity, setRasterOpacity] = useState(DEFAULT_RASTER_OPACITY);

    // Collapse the open detail and reset its raster controls when the dataset
    // behind it changes (detailResetKey = JBA lead time + ingestion run). The
    // events themselves get new ids, so a stale open detail/raster must not linger.
    // Deps are intentionally just [detailResetKey] — adding onActiveEventChange
    // (whose identity changes when `events` refetches) would wipe the user's
    // selection on every data refresh, not only on a real dataset switch.
    useEffect(() => {
        setActiveEventId(undefined);
        setShowRaster(false);
        setRasterOpacity(DEFAULT_RASTER_OPACITY);
        // Keep the parent's derived detail state (e.g. active timeline) in sync.
        onActiveEventChange(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detailResetKey]);
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

            // The raster overlay control lives inside the event detail, so
            // collapsing or switching the detail must also clear the overlay
            // it controls — otherwise the raster lingers with no way to turn
            // it off.
            setShowRaster(false);
            setRasterOpacity(DEFAULT_RASTER_OPACITY);

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
                    {isDefined(cogUrl) && (
                        <RasterOverlayControl
                            show={showRaster}
                            onShowChange={setShowRaster}
                            opacity={rasterOpacity}
                            onOpacityChange={setRasterOpacity}
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
            cogUrl,
            showRaster,
            rasterOpacity,
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

    const activeSelections = activeHdxLayers ?? EMPTY_SELECTIONS;
    // Keyed on a join-string so the array identity (and thus the expensive
    // layer-resolution memos in useHdxLayers) only changes when the SET of
    // active keys changes — not on every opacity/representation tweak.
    const activeKeysSignature = activeSelections.map((selection) => selection.key).join('|');
    const activeKeys = useMemo(
        () => (activeKeysSignature ? activeKeysSignature.split('|') : EMPTY_KEYS),
        [activeKeysSignature],
    );

    const {
        optionGroups: hdxOptionGroups,
        activeLayers: resolvedHdxLayers,
    } = useHdxLayers(activeKeys, Boolean(showLayerSelection));

    const resolvedByKey = useMemo(
        () => new Map(resolvedHdxLayers.map((layer) => [layer.key, layer])),
        [resolvedHdxLayers],
    );

    // Bubble representation needs admin-2 centroids (keyed by pcode === `code`);
    // only fetched when at least one active layer is shown as bubbles.
    const hasBubbleLayer = activeSelections.some(
        (selection) => selection.representation === 'bubble',
    );
    const { response: allAdmin2Response } = useRequest({
        skip: isNotDefined(iso3ForChoropleth) || !hasBubbleLayer,
        url: '/api/v2/admin2/',
        query: {
            admin1__country__iso3: iso3ForChoropleth,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const centroidByPcode = useMemo(() => {
        const map = new Map<string, [number, number]>();
        allAdmin2Response?.results?.forEach((item) => {
            const centroid = item?.centroid as
                | { type: 'Point'; coordinates: [number, number] }
                | undefined;
            if (item?.code && centroid?.type === 'Point') {
                map.set(item.code, centroid.coordinates);
            }
        });
        return map;
    }, [allAdmin2Response]);

    // One stacked admin2 fill per active *choropleth* layer, in selection order
    // (last on top), each at its own user-set opacity.
    const choroplethFillLayers = useMemo<
        Array<{ key: string; layerOptions: Omit<FillLayer, 'id'> }>
    >(() => {
        if (!iso3ForChoropleth) {
            return [];
        }
        return activeSelections
            .filter((selection) => selection.representation === 'choropleth')
            .map((selection): { key: string; layerOptions: Omit<FillLayer, 'id'> } | undefined => {
                const layer = resolvedByKey.get(selection.key);
                if (!layer || layer.pcodeToColor.size === 0) {
                    return undefined;
                }
                const matchPairs: string[] = [];
                layer.pcodeToColor.forEach((color, pcode) => {
                    matchPairs.push(pcode, color);
                });
                const fillColor: NonNullable<FillLayer['paint']>['fill-color'] = [
                    'match',
                    ['get', 'code'],
                    ...matchPairs,
                    COLOR_LIGHT_GREY,
                ];
                return {
                    key: selection.key,
                    layerOptions: {
                        type: 'fill',
                        // FIXME: update layer name
                        'source-layer': `go-admin2-${iso3ForChoropleth}-staging`,
                        paint: {
                            'fill-color': fillColor,
                            'fill-opacity': selection.opacity / 100,
                        },
                        layout: { visibility: 'visible' },
                    },
                };
            })
            .filter(isDefined);
    }, [iso3ForChoropleth, activeSelections, resolvedByKey]);

    // One graduated-bubble circle layer per active *bubble* layer: a point at
    // each admin-2 centroid, radius scaled by the metric value, own opacity.
    const bubbleLayers = useMemo<Array<{
        key: string;
        geoJson: GeoJSON.FeatureCollection<GeoJSON.Point, { value: number }>;
        layerOptions: Omit<CircleLayer, 'id'>;
    }>>(() => {
        if (!iso3ForChoropleth || centroidByPcode.size === 0) {
            return [];
        }
        return activeSelections
            .filter((selection) => selection.representation === 'bubble')
            .map((selection): {
                key: string;
                geoJson: GeoJSON.FeatureCollection<GeoJSON.Point, { value: number }>;
                layerOptions: Omit<CircleLayer, 'id'>;
            } | undefined => {
                const layer = resolvedByKey.get(selection.key);
                if (!layer || layer.pcodeToValue.size === 0) {
                    return undefined;
                }
                const features: GeoJSON.Feature<GeoJSON.Point, { value: number }>[] = [];
                layer.pcodeToValue.forEach((value, pcode) => {
                    const coordinates = centroidByPcode.get(pcode);
                    if (coordinates) {
                        features.push({
                            type: 'Feature',
                            geometry: { type: 'Point', coordinates },
                            properties: { value },
                        });
                    }
                });
                if (features.length === 0) {
                    return undefined;
                }
                const { min, max } = layer.valueRange;
                const circleRadius: NonNullable<CircleLayer['paint']>['circle-radius'] = max > min
                    ? [
                        'interpolate', ['linear'], ['get', 'value'],
                        min, MIN_BUBBLE_RADIUS,
                        max, MAX_BUBBLE_RADIUS,
                    ]
                    : (MIN_BUBBLE_RADIUS + MAX_BUBBLE_RADIUS) / 2;
                return {
                    key: selection.key,
                    geoJson: {
                        type: 'FeatureCollection' as const,
                        features,
                    },
                    layerOptions: {
                        type: 'circle',
                        paint: {
                            'circle-radius': circleRadius,
                            'circle-color': layer.rampColor,
                            'circle-opacity': selection.opacity / 100,
                            'circle-stroke-color': COLOR_WHITE,
                            'circle-stroke-width': 1,
                            'circle-stroke-opacity': selection.opacity / 100,
                        },
                        layout: { visibility: 'visible' },
                    },
                };
            })
            .filter(isDefined);
    }, [iso3ForChoropleth, activeSelections, resolvedByKey, centroidByPcode]);

    // Local units point layer (National Society branches/facilities) — a single
    // toggleable marker layer with its own opacity (handoff point group).
    const localUnitsActive = localUnits?.active ?? false;
    const localUnitsOpacity = localUnits?.opacity ?? DEFAULT_LOCAL_UNITS_OPACITY;

    const { geoJson: localUnitsGeoJson } = useLocalUnits(iso3ForChoropleth, localUnitsActive);

    const localUnitsLayerOptions = useMemo<Omit<CircleLayer, 'id'>>(() => ({
        type: 'circle',
        paint: {
            'circle-radius': 5,
            'circle-color': COLOR_PRIMARY_RED,
            'circle-opacity': localUnitsOpacity / 100,
            'circle-stroke-color': COLOR_WHITE,
            'circle-stroke-width': 1,
            'circle-stroke-opacity': localUnitsOpacity / 100,
        },
        layout: { visibility: 'visible' },
    }), [localUnitsOpacity]);

    const handleLocalUnitsToggle = useCallback(
        (active: boolean) => {
            onLocalUnitsChange?.({ active, opacity: localUnitsOpacity });
        },
        [onLocalUnitsChange, localUnitsOpacity],
    );

    const handleLocalUnitsOpacityChange = useCallback(
        (opacity: number) => {
            onLocalUnitsChange?.({ active: localUnitsActive, opacity });
        },
        [onLocalUnitsChange, localUnitsActive],
    );

    const choroplethOutlineLayer = useMemo<Omit<LineLayer, 'id'> | undefined>(() => {
        if (!iso3ForChoropleth || choroplethFillLayers.length === 0) {
            return undefined;
        }
        return {
            type: 'line',
            // FIXME: update layer name
            'source-layer': `go-admin2-${iso3ForChoropleth}-staging`,
            paint: {
                'line-color': COLOR_BLACK,
                'line-opacity': 0.3,
                'line-width': 0.5,
            },
            layout: { visibility: 'visible' },
        };
    }, [iso3ForChoropleth, choroplethFillLayers.length]);

    const layerSelectionNode = useMemo(() => {
        // NOTE: not gated on hdxOptionGroups.length — the Local units point layer
        // is independent of HDX and must stay toggleable while HDX is empty/loading.
        if (!showLayerSelection || !onActiveHdxLayersChange) {
            return undefined;
        }
        return (
            <LayersPanel
                optionGroups={hdxOptionGroups}
                value={activeSelections}
                onChange={onActiveHdxLayersChange}
                localUnitsActive={localUnitsActive}
                localUnitsOpacity={localUnitsOpacity}
                onLocalUnitsToggle={handleLocalUnitsToggle}
                onLocalUnitsOpacityChange={handleLocalUnitsOpacityChange}
            />
        );
    }, [
        showLayerSelection,
        onActiveHdxLayersChange,
        hdxOptionGroups,
        activeSelections,
        localUnitsActive,
        localUnitsOpacity,
        handleLocalUnitsToggle,
        handleLocalUnitsOpacityChange,
    ]);

    const legendNode = useMemo(() => {
        // In selection order, joined to resolved data — so each layer's legend
        // matches its representation (gradient swatches vs graduated bubbles).
        const items = activeSelections
            .map((selection) => {
                const layer = resolvedByKey.get(selection.key);
                return layer ? { selection, layer } : undefined;
            })
            .filter(isDefined);
        // Only advertise local units when markers are actually drawn (the layer
        // itself is gated on features.length > 0).
        const showLocalUnitsLegend = localUnitsActive && localUnitsGeoJson.features.length > 0;
        if (items.length === 0 && !showLocalUnitsLegend) {
            return null;
        }
        return (
            <ListView
                className={styles.legendList}
                layout="block"
                spacing="sm"
                withPadding
                withBackground
            >
                {showLocalUnitsLegend && (
                    <div className={styles.bubbleLegend}>
                        <span
                            className={styles.bubbleSampleSmall}
                            style={{ backgroundColor: COLOR_PRIMARY_RED }}
                        />
                        {/* FIXME: use strings */}
                        <Label textSize="sm">Local units</Label>
                    </div>
                )}
                {items.map(({ selection, layer }) => {
                    const rangeLabel = `${formatNumber(layer.valueRange.min, COMPACT_NUMBER_OPTIONS) ?? ''} – ${formatNumber(layer.valueRange.max, COMPACT_NUMBER_OPTIONS) ?? ''}`;
                    return (
                        <ListView
                            key={selection.key}
                            layout="block"
                            spacing="3xs"
                            className={styles.legendItem}
                        >
                            <Label
                                textSize="sm"
                                strong
                            >
                                {layer.label}
                            </Label>
                            {selection.representation === 'bubble' ? (
                                <div className={styles.bubbleLegend}>
                                    <span
                                        className={styles.bubbleSampleSmall}
                                        style={{ backgroundColor: layer.rampColor }}
                                    />
                                    <span
                                        className={styles.bubbleSampleLarge}
                                        style={{ backgroundColor: layer.rampColor }}
                                    />
                                    <Label textSize="sm">
                                        {rangeLabel}
                                    </Label>
                                </div>
                            ) : (
                                <StepGradientBar
                                    steps={layer.bins.map((bin) => ({
                                        color: bin.color,
                                        label: bin.label,
                                    }))}
                                />
                            )}
                        </ListView>
                    );
                })}
            </ListView>
        );
    }, [activeSelections, resolvedByKey, localUnitsActive, localUnitsGeoJson]);

    return (
        <div className={styles.riskImminentEventMap}>
            <GlobalMap
                mapOptions={{ bounds }}
                baseLayers={baseLayers}
            >
                <GoMapContainer
                    className={styles.mapContainer}
                    title={strings.riskImminentEventsMap}
                    layerSelection={layerSelectionNode}
                >
                    {legendNode}
                </GoMapContainer>
                {iso3ForChoropleth && choroplethFillLayers.length > 0 && (
                    <MapSource
                        sourceKey="hdx-choropleth"
                        sourceOptions={{
                            type: 'vector',
                            url: `mapbox://go-ifrc.go-admin2-${iso3ForChoropleth}-staging`,
                        }}
                    >
                        {choroplethFillLayers.map((fillLayer) => (
                            <MapLayer
                                key={fillLayer.key}
                                layerKey={`hdx-choropleth-fill-${fillLayer.key}`}
                                layerOptions={fillLayer.layerOptions}
                                beneath={BASEMAP_ADMIN_1_BOUNDARY_LAYER}
                            />
                        ))}
                        {choroplethOutlineLayer && (
                            <MapLayer
                                layerKey="hdx-choropleth-outline"
                                layerOptions={choroplethOutlineLayer}
                                beneath={BASEMAP_ADMIN_1_BOUNDARY_LAYER}
                            />
                        )}
                    </MapSource>
                )}
                {bubbleLayers.map((bubble) => (
                    <MapSource
                        key={bubble.key}
                        sourceKey={`hdx-bubble-${bubble.key}`}
                        sourceOptions={geojsonSourceOptions}
                        geoJson={bubble.geoJson}
                    >
                        <MapLayer
                            layerKey={`hdx-bubble-circle-${bubble.key}`}
                            layerOptions={bubble.layerOptions}
                        />
                    </MapSource>
                ))}
                {iso3ForChoropleth && localUnitsActive && localUnitsGeoJson.features.length > 0 && (
                    <MapSource
                        sourceKey="local-units"
                        sourceOptions={geojsonSourceOptions}
                        geoJson={localUnitsGeoJson}
                    >
                        <MapLayer
                            layerKey="local-units-circle"
                            layerOptions={localUnitsLayerOptions}
                        />
                    </MapSource>
                )}
                {/* isDefined(activeEvent) keeps the raster from outliving its
                control when the active event disappears from a refreshed
                event list without going through setActiveEventIdSafe. */}
                {showRaster && isDefined(cogUrl) && isDefined(activeEvent) && (
                    <JbaCogRasterLayer
                        cogUrl={cogUrl}
                        opacity={rasterOpacity}
                    />
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
                {/* Surface layers (choropleth fills/outline, COG raster) are
                inserted beneath the basemap's admin-1 boundary so boundary
                lines and labels stay readable above them. They need their own
                MapOrder: MapOrder packs all listed layers at the position of
                the last listed one, so merging them into the marker ordering
                below would pull them back above the labels. */}
                <MapOrder
                    ordering={[
                        ...choroplethFillLayers.map(
                            (fillLayer) => getLayerName(
                                'hdx-choropleth',
                                `hdx-choropleth-fill-${fillLayer.key}`,
                                true,
                            ),
                        ),
                        getLayerName('hdx-choropleth', 'hdx-choropleth-outline', true),
                        getLayerName('jba-cog', 'jba-cog-layer', true),
                    ]}
                />
                <MapOrder
                    ordering={[
                        ...bubbleLayers.map(
                            (bubble) => getLayerName(
                                `hdx-bubble-${bubble.key}`,
                                `hdx-bubble-circle-${bubble.key}`,
                                true,
                            ),
                        ),
                        getLayerName('local-units', 'local-units-circle', true),
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
                withoutWrapInHeader
                headerActions={headerActions}
                pending={pending}
                empty={isNotDefined(events) || events.length === 0}
                emptyMessage={strings.emptyImminentEventMessage}
                withPadding
                withBackground
                withShadow
                withContentOverflow
                spacing="sm"
                withoutSpacingOpticalCorrection
                headerDescription={sidePanelFilters}
            >
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
            </Container>
        </div>
    );
}

export default RiskImminentEventMap;
