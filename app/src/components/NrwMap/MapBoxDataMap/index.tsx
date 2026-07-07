import 'mapbox-gl-v3/dist/mapbox-gl.css';

import {
    type ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { byPrefixAndName } from '@awesome.me/kit-92f09b5225/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import mapboxgl, { type Map as MapboxGLMap } from 'mapbox-gl-v3';

import { mbtoken } from '#config';
import useAlert from '#hooks/useAlert';
import { defaultMapZoom } from '#utils/nrw/nrwConstants';
import { fetchExposedAdminAreasFeatures } from '#utils/nrw/nrwDataFetchHelpers';
import { exportMapboxToPdf } from '#utils/nrw/nrwMapboxToPdfExporter';
import {
    getZIndexOffset,
    makeExposedAreasFillLayerFromFeatures,
} from '#utils/nrw/nrwMapHelpers';
import {
    scopedCountriesAdmin0BorderPaint,
    scopedCountriesAdmin0FillPaint,
    setExposureColorsOnFeatures,
} from '#utils/nrw/nrwMapStyles';
import type {
    MapLayerFunctions,
    MapSelectionView,
    NrwMapboxLayer,
    SelectedEventDetails,
} from '#utils/nrw/nrwMapTypes';
import { getAdminAreaUrl } from '#utils/nrw/nrwUrls';

import styles from './styles.module.css';

const defaultCenter: [number, number] = [10.4515, 51.1657];
const scopedCountriesAdminSourceId = 'nrw-source-scoped-countries-admin0';
const scopedCountriesAdminFillLayerId = 'nrw-layer-scoped-countries-admin0-fill';
const scopedCountriesAdminBorderLayerId = 'nrw-layer-scoped-countries-admin0-border';

// Z index offset for the exposed admin areas fill layer.
// Keep this above the rasters but below the point layers (see getZIndexOffset).
const exposedAreasZIndex = 1200;

interface MapBoxDataMapProps {
    // ISO_A3 code list of countries that the map is scoped to.
    scopedCountries: string[];

    // Details for the currently selected event (centroid, exposed areas)
    // Pass null when no event is selected
    selectedEventDetails?: SelectedEventDetails | null;

    // Initial map view from URL search params, if available
    initialMapView?: MapSelectionView | null;

    // Optional arg to expose the map layer functions to the data loader.
    // It is a function that takes the layer functions object as an argument.
    registerMapLayerFunctions?: (mapLayerFunctions: MapLayerFunctions) => void;

    // Callback for when map center/zoom change finishes
    // This will be hit a lot through map interaction, so don't run costly actions on it
    onViewChange?: (mapView: MapSelectionView) => void;

    // Layer panel rendered as an overlay when the layers button is pressed
    layerPanel: ReactNode;
}

function getViewConfig(initialMapView?: MapSelectionView | null) {
    return {
        center: initialMapView
            ? [initialMapView.center.lon, initialMapView.center.lat] as [number, number]
            : defaultCenter,
        zoom: initialMapView?.zoom ?? defaultMapZoom,
    };
}

function hasValidInitialMapCenter(initialMapView?: MapSelectionView | null): boolean {
    return Boolean(
        initialMapView
        && Number.isFinite(initialMapView.center.lon)
        && Number.isFinite(initialMapView.center.lat),
    );
}

function clampNumber(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function getConstrainedCenter(
    center: { lng: number; lat: number },
    bounds: [[number, number], [number, number]],
): [number, number] {
    const [southWest, northEast] = bounds;
    const constrainedLongitude = clampNumber(center.lng, southWest[0], northEast[0]);
    const constrainedLatitude = clampNumber(center.lat, southWest[1], northEast[1]);

    return [constrainedLongitude, constrainedLatitude];
}

function constrainMapPanToBounds(
    map: MapboxGLMap,
    bounds: [[number, number], [number, number]],
): boolean {
    const mapCenter = map.getCenter();
    const [constrainedLongitude, constrainedLatitude] = getConstrainedCenter(mapCenter, bounds);

    if (constrainedLongitude === mapCenter.lng && constrainedLatitude === mapCenter.lat) {
        return false;
    }

    map.setCenter([constrainedLongitude, constrainedLatitude]);

    return true;
}

function getBoundsFromFeatures(
    features: GeoJSON.Feature[],
): [[number, number], [number, number]] | null {
    let minLongitude = Infinity;
    let minLatitude = Infinity;
    let maxLongitude = -Infinity;
    let maxLatitude = -Infinity;
    let hasAtLeastOneCoordinate = false;

    const addCoordinate = (coordinate: unknown) => {
        if (!Array.isArray(coordinate) || coordinate.length < 2) {
            return;
        }
        const longitude = Number(coordinate[0]);
        const latitude = Number(coordinate[1]);
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
            return;
        }

        hasAtLeastOneCoordinate = true;
        minLongitude = Math.min(minLongitude, longitude);
        minLatitude = Math.min(minLatitude, latitude);
        maxLongitude = Math.max(maxLongitude, longitude);
        maxLatitude = Math.max(maxLatitude, latitude);
    };

    const traverseCoordinates = (coordinates: unknown) => {
        if (!Array.isArray(coordinates)) {
            return;
        }

        if (coordinates.length > 0 && typeof coordinates[0] === 'number') {
            addCoordinate(coordinates);
            return;
        }

        coordinates.forEach(traverseCoordinates);
    };

    const traverseGeometry = (geometry: GeoJSON.Geometry | undefined) => {
        if (!geometry) {
            return;
        }

        if (geometry.type === 'GeometryCollection') {
            geometry.geometries.forEach(traverseGeometry);
            return;
        }

        traverseCoordinates(geometry.coordinates);
    };

    features.forEach((feature) => {
        traverseGeometry(feature.geometry ?? undefined);
    });

    if (!hasAtLeastOneCoordinate) {
        return null;
    }

    return [
        [minLongitude, minLatitude],
        [maxLongitude, maxLatitude],
    ];
}

async function drawScopedCountriesAdmin0Layer(
    map: MapboxGLMap,
    scopedCountries: string[],
    initialMapView?: MapSelectionView | null,
): Promise<[[number, number], [number, number]]> {
    const admin0GeoJson = await Promise.allSettled(
        scopedCountries.map(async (countryCodeIso3) => {
            const response = await fetch(getAdminAreaUrl(countryCodeIso3, 0));
            if (!response.ok) {
                throw new Error(`Failed to load admin0 for ${countryCodeIso3}`);
            }
            return response.json() as Promise<GeoJSON.FeatureCollection>;
        }),
    );

    const features = admin0GeoJson.flatMap((result) => (
        result.status === 'fulfilled'
            ? (result.value.features ?? [])
            : []
    ));

    if (features.length === 0) {
        throw new Error('Failed to load scoped countries admin0 features');
    }

    if (map.getLayer(scopedCountriesAdminBorderLayerId)) {
        map.removeLayer(scopedCountriesAdminBorderLayerId);
    }
    if (map.getLayer(scopedCountriesAdminFillLayerId)) {
        map.removeLayer(scopedCountriesAdminFillLayerId);
    }
    if (map.getSource(scopedCountriesAdminSourceId)) {
        map.removeSource(scopedCountriesAdminSourceId);
    }

    map.addSource(scopedCountriesAdminSourceId, {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features,
        },
    });

    map.addLayer({
        id: scopedCountriesAdminFillLayerId,
        type: 'fill',
        source: scopedCountriesAdminSourceId,
        paint: scopedCountriesAdmin0FillPaint,
    });

    map.addLayer({
        id: scopedCountriesAdminBorderLayerId,
        type: 'line',
        source: scopedCountriesAdminSourceId,
        paint: scopedCountriesAdmin0BorderPaint,
    });

    const bounds = getBoundsFromFeatures(features);
    if (!bounds) {
        throw new Error('Failed to compute bounds for scoped countries admin0 features');
    }

    // Respect URL-supplied view; otherwise fit map to scoped countries on first load.
    if (!hasValidInitialMapCenter(initialMapView)) {
        map.fitBounds(bounds, {
            padding: 30,
            duration: 500,
        });
    }

    return bounds;
}

/**
 * Mapbox v3 map component for NRW data maps.
 * Data layers are added via the map layer functions exposed through
 * registerMapLayerFunctions, which is driven by the useNrwDataLoader hook.
 * Map click interactions (admin area selection, popups) are not implemented yet.
 * @returns A component that can be either standalone, or nested in a NrwMapContainer.
 */
export default function MapBoxDataMap({
    scopedCountries,
    selectedEventDetails,
    initialMapView,
    registerMapLayerFunctions,
    onViewChange,
    layerPanel,
}: MapBoxDataMapProps) {
    const alert = useAlert();
    const selectedCountry = scopedCountries[0] ?? '';
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<MapboxGLMap | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
    const scopedCountriesBoundsRef = useRef<[[number, number], [number, number]] | null>(null);
    const isApplyingPanConstraintRef = useRef(false);
    // Layer ids of added data layers with their z index, sorted by z index.
    // Used to insert new layers at the right position (mapbox orders by list position).
    const orderedLayersRef = useRef<{ layerId: string; zIndex: number }[]>([]);
    // The exposed admin areas layer for the currently selected event, if any
    const exposedAreasLayerRef = useRef<NrwMapboxLayer | null>(null);
    // Callback tracked by ref in case it changes
    const onViewChangeRef = useRef(onViewChange);

    useEffect(() => {
        onViewChangeRef.current = onViewChange;
    }, [onViewChange]);

    // Initialize the Mapbox map instance once
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) {
            return undefined;
        }

        mapboxgl.accessToken = mbtoken;
        const { center, zoom } = getViewConfig(initialMapView);

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/e2r2i2k2/cmraet1zi001s01qu7a6a1d07',
            projection: 'mercator',
            center,
            zoom,
            attributionControl: true,
            preserveDrawingBuffer: true,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.on('load', () => {
            setIsMapLoaded(true);

            drawScopedCountriesAdmin0Layer(map, scopedCountries, initialMapView)
                .then((scopedCountriesBounds) => {
                    scopedCountriesBoundsRef.current = scopedCountriesBounds;
                })
                .catch((error) => {
                    alert.show('Failed to load country boundaries for the map.', {
                        variant: 'danger',
                    });
                    console.error('[MapBoxDataMap] Failed to load scoped admin0:', error);
                });

            // Expose the layer functions to the data loader once the style has
            // loaded, since layers can't be added before that.
            if (registerMapLayerFunctions) {
                registerMapLayerFunctions({
                    addLayer: (newLayer: NrwMapboxLayer, layerDetails) => {
                        if (map.getLayer(newLayer.layerId)) {
                            return;
                        }
                        if (!map.getSource(newLayer.sourceId)) {
                            map.addSource(newLayer.sourceId, newLayer.source);
                        }

                        // Insert the new layer before the first data layer with a
                        // higher z index, so layer ordering matches the offsets.
                        const zIndex = getZIndexOffset(layerDetails);
                        const layerAbove = orderedLayersRef.current.find(
                            (entry) => entry.zIndex > zIndex,
                        );
                        map.addLayer(newLayer.layer, layerAbove?.layerId);

                        orderedLayersRef.current = [
                            ...orderedLayersRef.current,
                            { layerId: newLayer.layerId, zIndex },
                        ].sort((a, b) => a.zIndex - b.zIndex);
                    },
                    setLayerVisibility: (layer: NrwMapboxLayer, visible: boolean) => {
                        if (!map.getLayer(layer.layerId)) {
                            return;
                        }
                        map.setLayoutProperty(
                            layer.layerId,
                            'visibility',
                            visible ? 'visible' : 'none',
                        );
                    },
                });
            }
        });

        // Keep panning constrained continuously (no moveend snap-back)
        map.on('move', () => {
            if (isApplyingPanConstraintRef.current) {
                return;
            }

            const scopedCountriesBounds = scopedCountriesBoundsRef.current;
            if (!scopedCountriesBounds) {
                return;
            }

            isApplyingPanConstraintRef.current = true;
            constrainMapPanToBounds(map, scopedCountriesBounds);
            isApplyingPanConstraintRef.current = false;
        });

        // Update map view state after each pan/zoom end
        map.on('moveend', () => {
            const mapCenter = map.getCenter();
            const mapZoom = map.getZoom();

            if (!Number.isFinite(mapCenter.lng) || !Number.isFinite(mapCenter.lat)
                || !Number.isFinite(mapZoom)) {
                return;
            }

            onViewChangeRef.current?.({
                zoom: mapZoom,
                center: {
                    lon: mapCenter.lng,
                    lat: mapCenter.lat,
                },
            });
        });

        mapInstanceRef.current = map;

        return () => {
            orderedLayersRef.current = [];
            exposedAreasLayerRef.current = null;
            scopedCountriesBoundsRef.current = null;
            isApplyingPanConstraintRef.current = false;
            mapInstanceRef.current?.remove();
            mapInstanceRef.current = null;
            setIsMapLoaded(false);
        };
    }, [initialMapView, registerMapLayerFunctions, scopedCountries, alert]);
    // When the event selection changes, draw the exposed admin areas for the
    // selected event as a colored fill layer (or remove them on deselection).
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isMapLoaded) {
            return undefined;
        }

        // Remove the exposed areas of the previously selected event, if any
        const previousLayer = exposedAreasLayerRef.current;
        if (previousLayer) {
            if (map.getLayer(previousLayer.layerId)) {
                map.removeLayer(previousLayer.layerId);
            }
            if (map.getSource(previousLayer.sourceId)) {
                map.removeSource(previousLayer.sourceId);
            }
            orderedLayersRef.current = orderedLayersRef.current.filter(
                (entry) => entry.layerId !== previousLayer.layerId,
            );
            exposedAreasLayerRef.current = null;
        }

        if (!selectedEventDetails) {
            return undefined;
        }

        // Guard against missing/invalid exposed population data
        const { exposedPopulationPerAreaByLevel } = selectedEventDetails;
        if (!exposedPopulationPerAreaByLevel
            || Object.keys(exposedPopulationPerAreaByLevel).length === 0) {
            alert.show('Event has no exposed population data', { variant: 'danger' });
            return undefined;
        }

        // Ignore the fetch result if the selection changed while it was in flight
        let isStale = false;

        fetchExposedAdminAreasFeatures(selectedCountry, selectedEventDetails)
            .then((features) => {
                const coloredFeatures = setExposureColorsOnFeatures(
                    features,
                    selectedEventDetails,
                );
                const newLayer = makeExposedAreasFillLayerFromFeatures(
                    `exposed-areas-event-${selectedEventDetails.eventId}`,
                    coloredFeatures,
                );
                const currentMap = mapInstanceRef.current;
                if (isStale || !currentMap) {
                    return;
                }
                if (!currentMap.getSource(newLayer.sourceId)) {
                    currentMap.addSource(newLayer.sourceId, newLayer.source);
                }

                // Insert below any data layer with a higher z index (i.e. point layers)
                const layerAbove = orderedLayersRef.current.find(
                    (entry) => entry.zIndex > exposedAreasZIndex,
                );
                currentMap.addLayer(newLayer.layer, layerAbove?.layerId);

                orderedLayersRef.current = [
                    ...orderedLayersRef.current,
                    { layerId: newLayer.layerId, zIndex: exposedAreasZIndex },
                ].sort((a, b) => a.zIndex - b.zIndex);
                exposedAreasLayerRef.current = newLayer;
            })
            .catch((error) => {
                if (isStale) {
                    return;
                }
                alert.show('Failed to load exposed areas for the event.', { variant: 'danger' });
                console.error('[MapBoxDataMap] Failed to load exposed areas:', error);
            });

        return () => {
            isStale = true;
        };
    }, [selectedEventDetails, selectedCountry, isMapLoaded, alert]);

    const handleDebugExport = useCallback(async () => {
        const mapInstance = mapInstanceRef.current;
        if (!mapInstance) {
            alert.show('Map is not ready yet.', { variant: 'warning' });
            return;
        }

        try {
            await exportMapboxToPdf(mapInstance, [selectedCountry]);
        } catch (error) {
            alert.show('Failed to export Mapbox PDF. Please try again.', { variant: 'danger' });
            console.error('[MapBoxDataMap] Export failed:', error);
        }
    }, [alert, selectedCountry]);

    return (
        <div className={styles.container}>
            <div className={styles.debugToolbar}>
                <button
                    type="button"
                    className={styles.debugExportButton}
                    onClick={handleDebugExport}
                    disabled={!isMapLoaded}
                >
                    Debug Export PDF (Mapbox)
                </button>
            </div>
            <div className={styles.mapWrapper}>
                <div
                    ref={mapContainerRef}
                    className={styles.map}
                />
                <div
                    className={styles.layerPanelOverlay}
                    // Keep the panel mounted so deeplinked layers load on mount,
                    // but hide it visually until the user opens it.
                    hidden={!isLayerPanelOpen}
                >
                    {layerPanel}
                </div>
                <button
                    type="button"
                    className={styles.layersButton}
                    aria-label="Layers"
                    aria-expanded={isLayerPanelOpen}
                    onClick={() => setIsLayerPanelOpen((prev) => !prev)}
                >
                    <FontAwesomeIcon icon={byPrefixAndName.far!['layer-group']!} />
                </button>
            </div>
        </div>
    );
}
