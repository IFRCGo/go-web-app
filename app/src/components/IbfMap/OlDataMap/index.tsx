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
    getExtentForVectorData,
    getZIndexOffset,
    initializeMapView,
    mapUrlSimpleStyleJson,
} from '#utils/ibfMapHelpers';
import {
    createAdminLayer,
    handleFeatureClick,
    type MapSelectionView,
    type MapViewState,
} from '#utils/ibfMapInteractionHelpers';
import type {
    MapLayerDetails,
    SelectedEventMapDetails,
} from '#utils/ibfMapTypes';
import { MapLayerDisplayType } from '#utils/ibfMapTypes';

import { createMapPopupPanel } from '../MapPopupPanel';

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
  onSelect: (placeCode: string, mapView?: MapSelectionView) => void;
  // Callback for when map center/zoom change finishes
  // This will be hit a lot though map interaction, so don't run costly actions on it
  onViewChange?: (mapView: MapSelectionView) => void;

  // Initial map view from URL search params, if available
  initialMapView?: MapSelectionView | null;

  // Callback when the map instance is ready
  // This is needed to pass references of the map for exporting to PDF
  onMapReady?: (map: MapOl) => void;
}

type AddAdminLayerFunction = (level: 1 | 2 | 3, country?: string, parentCode?: string) => void;

/**
 * OpenLayers map component for IBF data maps
 * This mainly handles interactivity of the map, with additional data layers added via the
 * exposed addLayerFunction.
 * Admin areas are the main interactive feature of the map, so they need to be added and
 * managed by this component.
 * @returns A component that can be either standalone, or nested in a IbfMapContainer.
 */
export default function OlDataMap({
    selectedCountry,
    selectedEventDetails,
    initialMapView,
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
            ]),
            selectedEventId: selectedEventDetails?.eventId ?? '',
            exposedRegionsByLevel:
        selectedEventDetails?.exposedRegionsByLevel ?? new Map(),
            isEventSelected() {
                return state.selectedEventId !== '';
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
            level: 1 | 2 | 3,
            country?: string,
            parentCode?: string,
        ) {
            // Remove layers at this level and below
            for (let l = 3; l >= level; l -= 1) {
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

            // For admin level 1
            // This is only done at first load of the country, so this handles setting
            // the inital map focus and panning extents (which are based on admin level 1)
            if (level === 1 && mapInstanceRef.current) {
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
            addAdminLayer(1, selectedCountry, undefined);

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

                if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
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
        state.selectedEventId = selectedEventDetails?.eventId ?? '';
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
            // and fit view to country extent
            addAdminLayer(1, selectedCountry);
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
