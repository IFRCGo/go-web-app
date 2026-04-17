import {
    useEffect,
    useRef,
} from 'react';
import { View } from 'ol';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import type BaseLayer from 'ol/layer/Base';
import type VectorLayer from 'ol/layer/Vector';
import MapOl from 'ol/Map.js';
import { fromLonLat } from 'ol/proj';
import { apply } from 'ol-mapbox-style';

import {
    CountryData,
    mapUrlSimpleStyleJson,
    noCountrySelectedValue,
} from '#utils/ibfMap';
import { getZIndexOffset } from '#utils/ibfMapHelpers';
import {
    createAdminLayer,
    handleFeatureClick,
    type MapViewState,
} from '#utils/ibfMapInteractionHelpers';
import type {
    MapLayerDetails,
    SelectedEventMapDetails,
} from '#utils/ibfMapTypes';

import styles from './styles.module.css';

function createView(countryInfo?: CountryData) {
    if (!countryInfo) {
        return new View({ center: [0, 0], zoom: 2 });
    }
    return new View({
        center: fromLonLat([countryInfo.latlon[1], countryInfo.latlon[0]]),
        zoom: countryInfo.initialZoom,
        extent: countryInfo.safeExtents,
        constrainOnlyCenter: true,
    });
}

interface OlDataMapProps {
  // ISO_A2 code of the selected country
  // TODO: move to ISO_A3
  // See task: https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41656
  selectedCountry: string;

  // Details for the currently selected event (centroid, exposed regions)
  // Pass null when no event is selected
  selectedEventDetails?: SelectedEventMapDetails | null;

  // Optional arg to expose a method for adding a layer
  // It is a function that takes the add-layer function as an argument.
  addLayerFunction?: (
    addLayer: (layer: BaseLayer, layerInfo: MapLayerDetails) => void,
  ) => void;

  // Callback for when a map feature is selected.
  onSelect: (placeCode: string) => void;

  // Callback when the map instance is ready
  // This is needed to pass references of the map for exporting to PDF
  onMapReady?: (map: MapOl) => void;
}

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
    addLayerFunction,
    onSelect,
    onMapReady,
}: OlDataMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<MapOl | null>(null);
    const stateRef = useRef<MapViewState | null>(null);
    const adminLayersRef = useRef<Map<number, VectorLayer>>(new Map());
    // Store addAdminLayer function to call from event selection effect
    const addAdminLayerFunctionRef = useRef<(
      (level: 1 | 2 | 3, country?: string, parentCode?: string) => void)
        | null
        >(null,
        );
    const legacy_countryInfo = selectedCountry === noCountrySelectedValue
        ? undefined
        : CountryData.get(selectedCountry);

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

        function isInteractiveLayer(layer: BaseLayer) {
            return (
                adminLayers.get(1) === layer
        || adminLayers.get(2) === layer
        || adminLayers.get(3) === layer
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
        }
        // Store ref for use in event selection effect
        addAdminLayerFunctionRef.current = addAdminLayer;

        if (mapRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = new MapOl({
                target: mapRef.current,
                controls: defaultControls({ attribution: false }),
                view: createView(legacy_countryInfo),
            });

            // Apply base map style
            apply(mapInstanceRef.current, mapUrlSimpleStyleJson);

            // Expose addLayer function to parent
            if (addLayerFunction) {
                addLayerFunction(
                    (newLayer: BaseLayer, layerDetails: MapLayerDetails) => {
                        const zIndex = getZIndexOffset(layerDetails);
                        newLayer.setZIndex(zIndex);
                        mapInstanceRef.current?.addLayer(newLayer);
                    },
                );
            }

            state.mapInstance = mapInstanceRef.current;
            addAdminLayer(1, selectedCountry);

            // Notify parent that map is ready
            if (onMapReady && mapInstanceRef.current) {
                onMapReady(mapInstanceRef.current);
            }

            // Change cursor on hover
            mapInstanceRef.current.on('pointermove', (evt) => {
                const pixel = mapInstanceRef.current!.getEventPixel(evt.originalEvent);
                const hit = mapInstanceRef.current!.hasFeatureAtPixel(pixel, {
                    layerFilter: isInteractiveLayer,
                });
        mapInstanceRef.current!.getTargetElement().style.cursor = hit
            ? 'pointer'
            : '';
            });

            // Click handler
            mapInstanceRef.current.on('click', (evt) => {
        mapInstanceRef.current!.forEachFeatureAtPixel(
            evt.pixel,
            (feature, layer) => {
                const result = handleFeatureClick(
                    state,
                    feature,
                    layer,
                    adminLayers,
                    onSelect,
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
        }

        return () => {
            adminLayers.forEach((layer) => {
                mapInstanceRef.current?.removeLayer(layer);
            });
            adminLayers.clear();
            if (mapInstanceRef.current) {
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
                // Reload admin1 layer to reflect new selection
                addAdminLayer(1, selectedCountry);
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
