import type {
    Map as MapboxGLMap,
    MapMouseEvent,
} from 'mapbox-gl-v3';

import {
    type AdminAreaDetails,
    getAdminAreaDetailsFromProperties,
} from '#utils/nrw/nrwDataFetchHelpers';
import { getMapViewParametersFromMap } from '#utils/nrw/nrwMapViewHelpers';

interface HandleMapClickParams {
    map: MapboxGLMap;
    event: MapMouseEvent;
    exposedLayerId?: string;
    onMapItemSelect: (
        placeCode: string,
        details: AdminAreaDetails | null,
        mapView?: ReturnType<typeof getMapViewParametersFromMap>,
    ) => void;
}

export default function handleMapClick({
    map,
    event,
    exposedLayerId,
    onMapItemSelect: onSelect,
}: HandleMapClickParams): void {
    if (!exposedLayerId || !map.getLayer(exposedLayerId)) {
        return;
    }

    const clickedFeatures = map.queryRenderedFeatures(event.point, {
        layers: [exposedLayerId],
    });
    const clickedFeature = clickedFeatures[0];
    if (!clickedFeature) {
        return;
    }

    const details = getAdminAreaDetailsFromProperties(clickedFeature.properties);
    if (!details) {
        return;
    }

    const mapView = getMapViewParametersFromMap(map);

    onSelect(details.code, details, mapView);
}
