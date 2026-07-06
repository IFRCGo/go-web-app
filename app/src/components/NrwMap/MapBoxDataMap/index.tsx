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
import {
    defaultMapZoom,
    noCountrySelectedValue,
} from '#utils/nrw/nrwConstants';
import { exportMapboxToPdf } from '#utils/nrw/nrwMapboxToPdfExporter';
import { getZIndexOffset } from '#utils/nrw/nrwMapHelpers';
import type {
    MapLayerFunctions,
    MapSelectionView,
    NrwMapboxLayer,
} from '#utils/nrw/nrwMapTypes';

import styles from './styles.module.css';

const defaultCenter: [number, number] = [10.4515, 51.1657];

interface MapBoxDataMapProps {
    // ISO_A3 code list of selected countries
    scopedCountries: string[];

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

/**
 * Mapbox v3 map component for NRW data maps.
 * Data layers are added via the map layer functions exposed through
 * registerMapLayerFunctions, which is driven by the useNrwDataLoader hook.
 * Map click interactions (admin area selection, popups) are not implemented yet.
 * @returns A component that can be either standalone, or nested in a NrwMapContainer.
 */
export default function MapBoxDataMap({
    scopedCountries,
    initialMapView,
    registerMapLayerFunctions,
    onViewChange,
    layerPanel,
}: MapBoxDataMapProps) {
    const alert = useAlert();
    const selectedCountry = scopedCountries[0] ?? noCountrySelectedValue;
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<MapboxGLMap | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
    // Layer ids of added data layers with their z index, sorted by z index.
    // Used to insert new layers at the right position (mapbox orders by list position).
    const orderedLayersRef = useRef<{ layerId: string; zIndex: number }[]>([]);
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
            style: 'mapbox://styles/mapbox/standard',
            projection: 'mercator',
            center,
            zoom,
            attributionControl: true,
            preserveDrawingBuffer: true,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.on('load', () => {
            setIsMapLoaded(true);

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
            mapInstanceRef.current?.remove();
            mapInstanceRef.current = null;
            setIsMapLoaded(false);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
