// Helpers for map interactions, including for admin areas
// since these are the main interactive feature on the map.

import { type FeatureLike } from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import type BaseLayer from 'ol/layer/Base';
import VectorLayer from 'ol/layer/Vector';
import type MapOl from 'ol/Map.js';
import VectorSource from 'ol/source/Vector';

import {
    noCountrySelectedValue,
    PLACE_CODE_FIELD_KEY,
} from './ibfMap';
import {
    getAdminAreaZIndex,
    getAdminRegionUrl,
    getNestedAdminUrl,
} from './ibfMapHelpers';
import {
    styleAdmin1region,
    styleAdmin2region,
    styleAdmin3Region,
} from './ibfMapStyles';

// Fit the map view to a feature's geometry with animation
function fitToFeature(state: MapViewState, feature: FeatureLike) {
    const geometry = feature.getGeometry?.();
    if (!geometry) return;
    state.mapInstance?.getView().fit(geometry.getExtent(), {
        duration: 500,
        padding: [50, 50, 50, 50],
    });
}

export interface MapViewState {
  mapInstance: MapOl | null;

  // Map of the selected codes, indexed by the admin level (level 1, 2, 3).
  // TODO: support variable max admin levels (2, 3 or 4) for here, and throughout the code
  // See task: https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41768
  selectedAdminCodes: Map<number, string | null>;

  selectedEventId: string;

  // Affected region codes by admin level. This is populated when an event is selected.
  exposedRegionsByLevel: Map<number, string[]>;

  isEventSelected(): boolean;
}

// Create a VectorLayer for the given admin level.
export function createAdminLayer(
    state: MapViewState,
    adminLevel: 1 | 2 | 3,
    country?: string,
    parentCode?: string,
): VectorLayer {
    // Create the admin area url.
    // Admin level 1 has a different format than nested admin levels.
    const url = adminLevel === 1
        ? getAdminRegionUrl(country ?? '', 1)
        : getNestedAdminUrl(country!, parentCode!, adminLevel);

    const layer = new VectorLayer({
        source: new VectorSource({
            url,
            format: new GeoJSON(),
        }),
        style: (feature) => {
            const code = feature.get(PLACE_CODE_FIELD_KEY);
            if (adminLevel === 3) {
                const affectedRegions = state.exposedRegionsByLevel.get(3) ?? [];

                return styleAdmin3Region(
                    code,
                    state.selectedAdminCodes.get(3) ?? null,
                    affectedRegions,
                    state.isEventSelected(),
                );
            }
            if (adminLevel === 2) {
                return styleAdmin2region(
                    code,
                    state.selectedAdminCodes.get(2) ?? null,
                    state.isEventSelected(),
                );
            }
            return styleAdmin1region(
                code,
                state.selectedAdminCodes.get(1) ?? null,
                state.isEventSelected(),
            );
        },
    });

    layer.setZIndex(getAdminAreaZIndex(adminLevel));
    return layer;
}

// Handle a click on a map feature (admin region or event).
// Returns an object describing what happened so the caller can
// manage layers and animations.
export function handleFeatureClick(
    state: MapViewState,
    feature: FeatureLike,
    layer: BaseLayer,
    adminLayers: Map<number, VectorLayer>,
    onSelect: (placeCode: string) => void,
): {
  showChildLevel: 2 | 3;
  parentCode: string;
} | void {
    const properties = feature.getProperties();

    // Print out all features of the item clicked on.
    // Use only for DEV builds.
    if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
        console.log('Clicked feature properties:', properties);
    }

    const newSelectedRegionCode = properties[PLACE_CODE_FIELD_KEY] || noCountrySelectedValue;

    let processAdmin3Clicks = layer === adminLayers.get(3);
    if (processAdmin3Clicks && state.isEventSelected()) {
        const affectedRegions = state.exposedRegionsByLevel.get(3) ?? [];
        if (!affectedRegions.includes(newSelectedRegionCode)) {
            processAdmin3Clicks = false;
        }
    }

    // Clicked on admin3 layer
    if (processAdmin3Clicks) {
        onSelect(newSelectedRegionCode);
        state.selectedAdminCodes.set(3, newSelectedRegionCode);
        adminLayers.forEach((adminLayer) => adminLayer.changed());

        fitToFeature(state, feature);
        return;
    }

    // Handle clicks for admin1 and 2
    // For current design, the user can't interact with these is an event is selected.
    if (!state.isEventSelected()) {
        let selectedLayer: VectorLayer | null = null;
        let level = 1;
        // Only 2 and 3 are valid child levels
        let childLevel: 2 | 3 = 2;

        // Clicked on admin1 and 2 handling layer
        if (layer === adminLayers.get(2)) {
            selectedLayer = adminLayers.get(2) ?? null;
            level = 2;
            childLevel = 3;
        } else if (layer === adminLayers.get(1)) {
            selectedLayer = adminLayers.get(1) ?? null;
            // use defaults for level and childLevel
        }

        if (selectedLayer) {
            onSelect(newSelectedRegionCode);
            state.selectedAdminCodes.set(level, newSelectedRegionCode);
            selectedLayer.changed();
            fitToFeature(state, feature);

            // eslint-disable-next-line consistent-return
            return {
                showChildLevel: childLevel,
                parentCode: newSelectedRegionCode,
            };
        }
    }

    state.selectedAdminCodes.set(0, newSelectedRegionCode);
}
