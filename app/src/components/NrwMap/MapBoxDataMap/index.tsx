import 'mapbox-gl-v3/dist/mapbox-gl.css';

import {
    type ReactNode,
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
    type AdminAreaDetails,
    getAdminAreaDetailsFromProperties,
} from '#utils/nrw/nrwDataFetchHelpers';
import {
    addOrderedLayer,
    drawScopedCountriesAdmin0Layer,
    getInitialMapViewConfig,
    getMapViewParametersFromMap,
    removeLayerAndSource,
} from '#utils/nrw/nrwMapHelpers';
import type {
    MapLayerFunctions,
    MapViewParameters,
    NrwMapboxLayer,
    OrderedMapLayer,
    SelectedEventDetails,
} from '#utils/nrw/nrwMapTypes';
import renderSelectedEventExposedAreasOnMap from '#utils/nrw/nrwSelectedEventMapHelpers';

import styles from './styles.module.css';

interface MapBoxDataMapProps {
    // ISO_A3 code list of countries that the map is scoped to.
    scopedCountries: string[];

    // Details for the currently selected event (centroid, exposed areas)
    // Pass null when no event is selected
    selectedEventDetails?: SelectedEventDetails | null;

    // Initial map view from URL search params, if available
    initialMapView?: MapViewParameters | null;

    // Optional arg to expose the map layer functions to the data loader.
    // It is a function that takes the layer functions object as an argument.
    registerMapLayerFunctions?: (mapLayerFunctions: MapLayerFunctions) => void;

    // Interactable feature click callback (i.e. on clicking admin area)
    onSelect: (
        placeCode: string,
        details: AdminAreaDetails | null,
        mapView?: MapViewParameters,
    ) => void;

    // Callback for when map center/zoom change finishes
    // This will be hit a lot through map interaction, so don't run costly actions on it
    onViewChange?: (mapView: MapViewParameters) => void;

    // Layer panel rendered as an overlay when the layers button is pressed
    layerPanel: ReactNode;
}

/**
 * Mapbox v3 map component for NRW data maps.
 * Data layers are added via the map layer functions exposed through
 * registerMapLayerFunctions, which is driven by the useNrwDataLoader hook.
 * Exposed admin areas can be selected by clicking on the map.
 * @returns A component that can be either standalone, or nested in a NrwMapContainer.
 */
export default function MapBoxDataMap({
    scopedCountries,
    selectedEventDetails,
    initialMapView,
    registerMapLayerFunctions,
    onSelect,
    onViewChange,
    layerPanel,
}: MapBoxDataMapProps) {
    const alert = useAlert();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<MapboxGLMap | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
    // Layer ids of added data layers with their z index, sorted by z index.
    // Used to insert new layers at the right position (mapbox orders by list position).
    const orderedLayersRef = useRef<OrderedMapLayer[]>([]);
    // The exposed admin areas layer for the currently selected event, if any
    const exposedAreasLayerRef = useRef<NrwMapboxLayer | null>(null);
    // Callback tracked by ref in case it changes
    const onSelectRef = useRef(onSelect);
    const onViewChangeRef = useRef(onViewChange);

    useEffect(() => {
        onSelectRef.current = onSelect;
    }, [onSelect]);

    useEffect(() => {
        onViewChangeRef.current = onViewChange;
    }, [onViewChange]);

    // Initialize the Mapbox map instance
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) {
            return undefined;
        }

        mapboxgl.accessToken = mbtoken;
        const { center, zoom } = getInitialMapViewConfig(initialMapView);

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
                        orderedLayersRef.current = addOrderedLayer(
                            map,
                            newLayer,
                            layerDetails,
                            orderedLayersRef.current,
                        );
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
            const mapView = getMapViewParametersFromMap(map);
            if (!mapView) {
                return;
            }

            onViewChangeRef.current?.(mapView);
        });

        // Handle selecting exposed admin areas by clicking on the fill layer.
        map.on('click', (event) => {
            const exposedLayerId = exposedAreasLayerRef.current?.layerId;
            if (!exposedLayerId || !map.getLayer(exposedLayerId)) {
                return;
            }

            const clickedFeatures = map.queryRenderedFeatures(event.point, {
                layers: [exposedLayerId],
            });
            const clickedFeature = clickedFeatures[0];
            if (!clickedFeature || typeof clickedFeature.properties !== 'object'
                || clickedFeature.properties === null) {
                return;
            }

            const details = getAdminAreaDetailsFromProperties(
                clickedFeature.properties as Record<string, unknown>,
            );
            if (!details) {
                return;
            }

            const mapView = getMapViewParametersFromMap(map);

            onSelectRef.current(details.code, details, mapView);
        });

        mapInstanceRef.current = map;

        return () => {
            orderedLayersRef.current = [];
            exposedAreasLayerRef.current = null;
            mapInstanceRef.current?.remove();
            mapInstanceRef.current = null;
            setIsMapLoaded(false);
        };
    // Set the dependencies to empty since this only runs on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle loading event data on the map when the selected event changes.
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isMapLoaded) {
            return undefined;
        }

        // Remove the exposed areas of the previously selected event, if any
        const previousLayer = exposedAreasLayerRef.current;
        if (previousLayer) {
            orderedLayersRef.current = removeLayerAndSource(
                map,
                previousLayer,
                orderedLayersRef.current,
            );
            exposedAreasLayerRef.current = null;
        }

        if (!selectedEventDetails) {
            return undefined;
        }

        // Ignore the fetch result if the selection changed while it was in flight
        let isOutdated = false;

        renderSelectedEventExposedAreasOnMap({
            map,
            scopedCountries,
            selectedEventDetails,
            orderedLayers: orderedLayersRef.current,
            isOutdated: () => isOutdated,
        })
            .then((result) => {
                if (!result || isOutdated) {
                    return;
                }

                orderedLayersRef.current = result.orderedLayers;
                exposedAreasLayerRef.current = result.layer;
            })
            .catch((error) => {
                if (isOutdated) {
                    return;
                }

                if (error instanceof Error
                    && error.message === 'Event has no exposed population data') {
                    alert.show('Event has no exposed population data', { variant: 'danger' });
                    return;
                }

                alert.show('Failed to load exposed areas for the event.', { variant: 'danger' });
                console.error('[MapBoxDataMap] Failed to load exposed areas:', error);
            });

        return () => {
            // If this call is cancelled by React (e.g., it starts a new fetch), this block will get
            // hit before the fetch promise resolves, so we know we can ignore the result.
            isOutdated = true;
        };
    }, [selectedEventDetails, scopedCountries, isMapLoaded, alert]);

    return (
        <div className={styles.container}>
            <div className={styles.mapWrapper}>
                <div
                    id="nrw-mapbox-map"
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
