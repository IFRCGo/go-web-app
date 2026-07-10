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
    MAP_CONTAINER_ELEMENT_ID,
    NRW_MAPBOX_STYLE_URL,
} from '#utils/nrw/nrwConstants';
import { type AdminAreaDetails } from '#utils/nrw/nrwDataFetchHelpers';
import renderSelectedEventExposedAreasOnMap from '#utils/nrw/nrwMapEventHelpers';
import {
    addOrderedLayer,
    drawScopedCountriesAdmin0Layer,
    getDrawOrder,
    removeLayerAndSource,
} from '#utils/nrw/nrwMapHelpers';
import type {
    MapLayerFunctions,
    MapViewParameters,
    NrwMapboxLayer,
    OrderedMapLayer,
    SelectedEventDetails,
} from '#utils/nrw/nrwMapTypes';
import {
    getMapViewFromParameters,
    getMapViewParametersFromMap,
} from '#utils/nrw/nrwMapViewHelpers';

import handleMapClick from './nrwMapInteractions';

import styles from './styles.module.css';

interface MapboxDataMapProps {
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
 * Data layers are added via the exposed map layer functions.
 * @returns A component that can be either standalone, or nested in a NrwMapContainer.
 */
export default function MapboxDataMap({
    scopedCountries,
    selectedEventDetails,
    initialMapView,
    registerMapLayerFunctions,
    onSelect,
    onViewChange,
    layerPanel,
}: MapboxDataMapProps) {
    const alert = useAlert();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<MapboxGLMap | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
    // Layer ids of added data layers and draw order value, sorted by draw order.
    // Mapbox uses list position to determine draw order.
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
        const { center, zoom } = getMapViewFromParameters(initialMapView);

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: NRW_MAPBOX_STYLE_URL,
            projection: 'mercator',
            center,
            zoom,
            attributionControl: true,
            // Required so the map canvas can be captured for PDF export.
            preserveDrawingBuffer: true,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.on('load', () => {
            setIsMapLoaded(true);

            drawScopedCountriesAdmin0Layer(map, scopedCountries, initialMapView)
                .then((latLonBounds) => {
                    if (!latLonBounds) {
                        alert.show('Failed to load country boundaries for the map.', {
                            variant: 'danger',
                        });
                    }
                });

            // Expose the layer functions to the data loader once the style has
            // loaded, since layers can't be added before that.
            if (registerMapLayerFunctions) {
                registerMapLayerFunctions({
                    addLayer: (newLayer: NrwMapboxLayer, layerDetails) => {
                        orderedLayersRef.current = addOrderedLayer(
                            map,
                            newLayer,
                            getDrawOrder(layerDetails.layerName),
                            orderedLayersRef.current,
                        );
                    },
                    setLayerVisibility: (layer: NrwMapboxLayer, visible: boolean) => {
                        if (!map.getLayer(layer.renderLayerId)) {
                            return;
                        }
                        map.setLayoutProperty(
                            layer.renderLayerId,
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

        // Handle map interactions
        map.on('click', (event) => {
            handleMapClick({
                map,
                event,
                exposedLayerId: exposedAreasLayerRef.current?.renderLayerId,
                onMapItemSelect: onSelectRef.current,
            });
        });

        mapInstanceRef.current = map;

        return () => {
            // Clean up on unmount
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
                if (isOutdated) {
                    return;
                }

                if (!result) {
                    alert.show('No exposed areas data available for this event.', { variant: 'danger' });
                    return;
                }

                orderedLayersRef.current = result.orderedLayers;
                exposedAreasLayerRef.current = result.layer;
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
                    id={MAP_CONTAINER_ELEMENT_ID}
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
