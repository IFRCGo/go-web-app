import {
    useEffect,
    useRef,
} from 'react';
import { View } from 'ol';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import type { EventsKey } from 'ol/events';
import type BaseLayer from 'ol/layer/Base';
import type VectorLayer from 'ol/layer/Vector';
import MapOl from 'ol/Map.js';
import { unByKey } from 'ol/Observable';
import {
    fromLonLat,
    toLonLat,
} from 'ol/proj';
import { apply } from 'ol-mapbox-style';

import {
    type AdminAreaDetails,
    fetchAdminAreaDetails,
} from '#utils/nrw/nrwDataFetchHelpers';
import {
    getExtentForVectorData,
    getZIndexOffset,
    initializeMapView,
} from '#utils/nrw/nrwMapHelpers';
import {
    createAdminLayer,
    handleFeatureClick,
    type MapSelectionView,
    type MapViewState,
} from '#utils/nrw/nrwMapInteractionHelpers';
import type {
    MapLayerDetails,
    SelectedEventMapDetails,
} from '#utils/nrw/nrwMapTypes';
import { MapLayerDisplayType } from '#utils/nrw/nrwMapTypes';
import { mapUrlSimpleStyleJson } from '#utils/nrw/nrwUrls';

import { createMapPopupPanel } from '../NrwMapPopupPanel';

import styles from './styles.module.css';

interface OlDataMapProps {
  // ISO_A3 code of the selected country
  selectedCountry: string;

  // Details for the currently selected event (centroid, exposed regions)
  // Pass null when no event is selected
  selectedEventDetails?: SelectedEventMapDetails | null;

  // Optional arg to expose a method for adding a layer
  // It is a function that takes the add-layer function as an argument.
  addLayerFunction?: (
    addLayer: (layer: BaseLayer, layerInfo: MapLayerDetails) => void,
  ) => void;

  // Callbacks for the map interactions
  // Interactable feature click callback (i.e. on clicking admin area)
  onSelect: (
    placeCode: string,
    details: AdminAreaDetails | null,
    mapView?: MapSelectionView,
  ) => void;
  // Callback for when map center/zoom change finishes
  // This will be hit a lot though map interaction, so don't run costly actions on it
  onViewChange?: (mapView: MapSelectionView) => void;

  // Initial map view from URL search params, if available
  initialMapView?: MapSelectionView | null;

  // Initial admin code from URL search params, if available
  // When set, the map will fetch the admin area details and select it along with its parents
  initialAdminCode?: string | null;

  // Callback when the map instance is ready
  // This is needed to pass references of the map for exporting to PDF
  onMapReady?: (map: MapOl) => void;
}

type AddAdminLayerFunction = (level: 1 | 2 | 3, country?: string, parentCode?: string) => void;

/**
 * OpenLayers map component for NRW data maps
 * This mainly handles interactivity of the map, with additional data layers added via the
 * exposed addLayerFunction.
 * Admin areas are the main interactive feature of the map, so they need to be added and
 * managed by this component.
 * @returns A component that can be either standalone, or nested in a NrwMapContainer.
 */
export default function OlDataMap({
    selectedCountry,
    selectedEventDetails,
    initialMapView,
    initialAdminCode,
    addLayerFunction,
    onSelect,
    onViewChange,
    onMapReady,
}: OlDataMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<MapOl | null>(null);
    const stateRef = useRef<MapViewState | null>(null);
    const adminLayersRef = useRef<Map<number, VectorLayer>>(new Map());
    const pointLayersRef = useRef<Set<BaseLayer>>(new Set());
    // Store addAdminLayer function to call from event selection effect
    const addAdminLayerFunctionRef = useRef<AddAdminLayerFunction | null>(null);
    const shouldApplyInitialMapViewRef = useRef(Boolean(initialMapView));
    // Track whether initial admin selection has been applied
    const shouldApplyInitialAdminRef = useRef(Boolean(initialAdminCode));
    // Store event handler keys for cleanup
    const eventKeysRef = useRef<EventsKey[]>([]);
    // Callbacks tracked by refs in case they change
    const onSelectRef = useRef(onSelect);
    const onViewChangeRef = useRef(onViewChange);

    useEffect(() => {
        onSelectRef.current = onSelect;
    }, [onSelect]);

    useEffect(() => {
        onViewChangeRef.current = onViewChange;
    }, [onViewChange]);

    useEffect(() => {
        const state: MapViewState = {
            mapInstance: null,
            // TODO: support countries with max admin levels of 2, 3, and 4
            // See task: https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41768
            selectedAdminCodes: new Map([
                [1, null],
                [2, null],
                [3, null],
                [4, null],
            ]),
            selectedEventId: selectedEventDetails?.eventId ?? null,
            exposedRegionsByLevel:
        selectedEventDetails?.exposedRegionsByLevel ?? new Map(),
            isEventSelected() {
                return state.selectedEventId !== null;
            },
        };
        stateRef.current = state;

        const adminLayers = new Map<number, VectorLayer>();
        adminLayersRef.current = adminLayers;
        const pointLayers = pointLayersRef.current;

        const mapPopup = createMapPopupPanel();

        function isInteractiveLayer(layer: BaseLayer) {
            return (
                adminLayers.get(1) === layer
                || adminLayers.get(2) === layer
                || adminLayers.get(3) === layer
                || pointLayers.has(layer)
            );
        }

        function addAdminLayer(
            level: 1 | 2 | 3 | 4,
            country?: string,
            parentCode?: string,
        ) {
            // Remove layers at this level and below
            for (let l = 4; l >= level; l -= 1) {
                const existing = adminLayers.get(l);
                if (existing) {
                    mapInstanceRef.current?.removeLayer(existing);
                    adminLayers.delete(l);
                    state.selectedAdminCodes.set(l, null);
                }
            }

            const newLayer = createAdminLayer(state, level, country, parentCode);
            mapInstanceRef.current?.addLayer(newLayer);
            adminLayers.set(level, newLayer);
            return newLayer;
        }

        // Init the admin map layers based on the initial map view from the search params
        function initMapAdminLayers(
            country?: string,
        ) {
            const newLayer = addAdminLayer(1, country);

            // get initial admin selection from URL params
            if (initialAdminCode && shouldApplyInitialAdminRef.current) {
                fetchAdminAreaDetails(country ?? '', initialAdminCode).then((details) => {
                    // Use refs to avoid stale closure issues with async callback
                    const currentState = stateRef.current;
                    const currentAddAdminLayer = addAdminLayerFunctionRef.current;
                    if (!currentState || !currentAddAdminLayer) return;

                    if (details) {
                        // Pass details for the selection
                        onSelectRef.current(details.code, details);
                        // Add layers based on current admin level selection
                        if (details.adminLevel === 1) {
                            currentAddAdminLayer(2, country, details.code);
                        } else if (details.adminLevel === 2 && details.admin1Pcode) {
                            currentAddAdminLayer(2, country, details.admin1Pcode);
                            currentAddAdminLayer(3, country, details.code);
                        } else if (details.adminLevel === 3
                            && details.admin1Pcode
                            && details.admin2Pcode) {
                            currentAddAdminLayer(2, country, details.admin1Pcode);
                            currentAddAdminLayer(3, country, details.admin2Pcode);
                            // TODO: add support for admin level 4
                            // See task: https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41768
                        }

                        // Set the map view state
                        // This must be done after the above layers were added
                        currentState.selectedAdminCodes.set(1, details.admin1Pcode);
                        currentState.selectedAdminCodes.set(2, details.admin2Pcode);
                        currentState.selectedAdminCodes.set(3, details.admin3Pcode);
                        currentState.selectedAdminCodes.set(details.adminLevel, details.code);
                    }

                    shouldApplyInitialAdminRef.current = false;
                });
            }

            // Set initial zoom/pan
            if (mapInstanceRef.current) {
                const map = mapInstanceRef.current;
                const source = newLayer.getSource();
                if (source) {
                    source.once('featuresloadend', () => {
                        const extent = getExtentForVectorData(source);
                        if (extent) {
                            // Apply initial view from URL params (first load only),
                            // otherwise fit to extent
                            const viewParams = shouldApplyInitialMapViewRef.current
                                ? initialMapView
                                : null;
                            initializeMapView(map, extent, viewParams);
                            shouldApplyInitialMapViewRef.current = false;
                        }
                    });
                }
            }
        }

        // Store ref for use in event selection effect
        addAdminLayerFunctionRef.current = addAdminLayer;

        if (mapRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = new MapOl({
                target: mapRef.current,
                controls: defaultControls({ attribution: false }),
                view: new View({ center: [0, 0], zoom: 2 }),
            });

            // Apply base map style
            apply(mapInstanceRef.current, mapUrlSimpleStyleJson);
            mapInstanceRef.current.addOverlay(mapPopup.overlay);

            // Expose addLayer function to parent
            if (addLayerFunction) {
                addLayerFunction(
                    (newLayer: BaseLayer, layerDetails: MapLayerDetails) => {
                        const zIndex = getZIndexOffset(layerDetails);
                        newLayer.setZIndex(zIndex);
                        if (layerDetails.displayType === MapLayerDisplayType.Point) {
                            pointLayers.add(newLayer);
                        }
                        mapInstanceRef.current?.addLayer(newLayer);
                    },
                );
            }

            state.mapInstance = mapInstanceRef.current;
            initMapAdminLayers(selectedCountry);

            // Notify parent that map is ready
            if (onMapReady && mapInstanceRef.current) {
                onMapReady(mapInstanceRef.current);
            }

            // Change cursor on hover
            const pointerMoveKey = mapInstanceRef.current.on('pointermove', (evt) => {
                const pixel = mapInstanceRef.current!.getEventPixel(evt.originalEvent);
                const hit = mapInstanceRef.current!.hasFeatureAtPixel(pixel, {
                    layerFilter: isInteractiveLayer,
                });
                mapInstanceRef.current!.getTargetElement().style.cursor = hit
                    ? 'pointer'
                    : '';
            });
            eventKeysRef.current.push(pointerMoveKey);

            // Click handler
            const clickKey = mapInstanceRef.current.on('click', (evt) => {
                mapPopup.hide();
                mapInstanceRef.current!.forEachFeatureAtPixel(
                    evt.pixel,
                    (feature, layer) => {
                        if (layer && pointLayers.has(layer)) {
                            mapPopup.show(feature, evt.coordinate);
                            return true;
                        }

                        const result = handleFeatureClick(
                            state,
                            feature,
                            layer,
                            adminLayers,
                            onSelectRef.current,
                        );
                        if (result?.showChildLevel) {
                            addAdminLayer(
                                result.showChildLevel,
                                selectedCountry,
                                result.parentCode,
                            );
                        }
                        return true;
                    },
                    {
                        layerFilter: isInteractiveLayer,
                    },
                );
            });
            eventKeysRef.current.push(clickKey);

            // Update map view state after each pan/zoom end ('moveend')
            const moveEndKey = mapInstanceRef.current.on('moveend', () => {
                const view = mapInstanceRef.current!.getView();
                const center = view.getCenter();
                const zoom = view.getZoom();

                if (!center || zoom === undefined) {
                    return;
                }

                const [lon, lat] = toLonLat(center);

                if (lon === undefined || lat === undefined
                    || !Number.isFinite(lon) || !Number.isFinite(lat)) {
                    return;
                }

                onViewChangeRef.current?.({
                    zoom,
                    center: {
                        lon,
                        lat,
                    },
                });
            });
            eventKeysRef.current.push(moveEndKey);
        }

        return () => {
            mapPopup.hide();
            adminLayers.forEach((layer) => {
                mapInstanceRef.current?.removeLayer(layer);
            });
            adminLayers.clear();
            pointLayers.clear();
            // Unregister all event listeners
            eventKeysRef.current.forEach((key) => unByKey(key));
            eventKeysRef.current = [];
            if (mapInstanceRef.current) {
                mapInstanceRef.current.removeOverlay(mapPopup.overlay);
                mapInstanceRef.current.setTarget(undefined);
                mapInstanceRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When and event selection changes, the following runs to update the view,
    // such as pan, zoom, change focused admin level, update styling, etc.
    useEffect(() => {
        const state = stateRef.current;
        const map = mapInstanceRef.current;
        const addAdminLayer = addAdminLayerFunctionRef.current;
        if (!state || !map || !addAdminLayer) return;

        // Update state with new event details
        state.selectedEventId = selectedEventDetails?.eventId ?? null;
        state.exposedRegionsByLevel = selectedEventDetails?.exposedRegionsByLevel ?? new Map();

        // If event selected with exposed regions, drill down to admin3
        if (selectedEventDetails) {
            // Get the first exposed admin1 region as parent for drilling down
            const exposedAdmin1 = state.exposedRegionsByLevel.get(1);
            const exposedAdmin2 = state.exposedRegionsByLevel.get(2);

            // Set admin1 selection to match the event's admin1 region
            if (exposedAdmin1 && exposedAdmin1.length > 0) {
                state.selectedAdminCodes.set(1, exposedAdmin1[0]!);
            }

            if (exposedAdmin2 && exposedAdmin2.length > 0) {
                // If we have one or more admin2 exposed regions,
                // load admin 2 and all it's childed admin3 regions.
                // TODO: revist this logic after more designs are done
                const parentCode = exposedAdmin2[0]!;
                addAdminLayer(2, selectedCountry, parentCode);
                addAdminLayer(3, selectedCountry, parentCode);
            } else if (exposedAdmin1 && exposedAdmin1.length > 0) {
                // If there are no exposed admin 2, just admin 1,
                // load the admin 1 and its child admin 2 regions.
                const admin1Code = exposedAdmin1[0]!;
                addAdminLayer(2, selectedCountry, admin1Code);
            }

            // Pan to event centroid
            if (selectedEventDetails.centroid) {
                const [lon, lat] = selectedEventDetails.centroid;
                map.getView().animate({
                    center: fromLonLat([lon, lat]),
                    // TODO: derive zoom from event details
                    zoom: 9,
                    duration: 500,
                });
            }
        } else {
            // No event selected: reset admin layers back to level 1 only
            for (let l = 4; l > 1; l -= 1) {
                const existing = adminLayersRef.current.get(l);
                if (existing) {
                    map.removeLayer(existing);
                    adminLayersRef.current.delete(l);
                    state.selectedAdminCodes.set(l as 2 | 3 | 4, null);
                }
            }
            // Layer 1 remains, but clear any admin area selection on it
            state.selectedAdminCodes.set(1, null);
        }

        // Trigger re-render of admin layers to apply new styling
        adminLayersRef.current.forEach((layer) => {
            layer.changed();
        });
    }, [selectedEventDetails, selectedCountry]);

    return (
        <div className={styles.container}>
            <div ref={mapRef} className={styles.map} />
        </div>
    );
}
