import {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { type MapMouseEvent } from 'mapbox-gl-v3';

import NrwLngLat from '#views/CountryProfileNationalRiskWatch/NrwLngLat';
import {
    type AdminAreaProperties,
    type Latitude,
    type Longitude,
    type PlaceCode,
    type PlaceCodeChangeHandler,
} from '#views/CountryProfileNationalRiskWatch/types';
import { parseAdminAreaProperties } from '#views/CountryProfileNationalRiskWatch/utils';

import NrwMapContext from '../../NrwMapContext';

interface HoveredAdminArea extends AdminAreaProperties {
    coordinates: NrwLngLat;
}

function useAdminAreaHover(
    layerId: string,
    isEnabled: boolean,
    hoveredPlaceCode: PlaceCode | undefined,
    onHoverChange: PlaceCodeChangeHandler,
    canDrillDown: (placeCode: PlaceCode) => boolean,
) {
    const { map } = useContext(NrwMapContext);
    const [hoveredAdminArea, setHoveredAdminArea] = useState<HoveredAdminArea>();

    // canDrillDown changes identity every render. We don't want to re-register
    // the mousemove listener.
    const canDrillDownRef = useRef(canDrillDown);
    useEffect(
        () => {
            canDrillDownRef.current = canDrillDown;
        },
        [canDrillDown],
    );

    const clearHover = useCallback(
        () => {
            if (isDefined(map) && isDefined(map.style)) {
                map.getCanvas().style.cursor = '';
            }
            setHoveredAdminArea(undefined);
            onHoverChange(undefined);
        },
        [map, onHoverChange],
    );

    useEffect(
        () => {
            if (isNotDefined(map) || !isEnabled) {
                return undefined;
            }

            const handleMouseMove = (event: MapMouseEvent) => {
                const properties = parseAdminAreaProperties(event.features?.[0]?.properties);

                if (properties === null) {
                    return;
                }

                // Show "clickable" pointer cursor only for admin areas that can
                // be drilled into. Default to drag cursor.
                map.getCanvas().style.cursor = canDrillDownRef.current(properties.placeCode) ? 'pointer' : '';
                setHoveredAdminArea({
                    ...properties,
                    coordinates: new NrwLngLat(
                        event.lngLat.lng as Longitude,
                        event.lngLat.lat as Latitude,
                    ),
                });
                onHoverChange(properties.placeCode);
            };

            map.on('mousemove', layerId, handleMouseMove);
            map.on('mouseleave', layerId, clearHover);

            return () => {
                map.off('mousemove', layerId, handleMouseMove);
                map.off('mouseleave', layerId, clearHover);
                clearHover();
            };
        },
        [map, layerId, isEnabled, clearHover, onHoverChange],
    );

    // Features are keyed by place code.
    useEffect(
        () => {
            if (isNotDefined(map) || !isEnabled || isNotDefined(map.getSource(layerId))) {
                return undefined;
            }

            if (isDefined(hoveredPlaceCode)) {
                map.setFeatureState({ source: layerId, id: hoveredPlaceCode }, { hover: true });
            }

            return () => {
                if (isDefined(map.style) && isDefined(map.getSource(layerId))) {
                    map.removeFeatureState({ source: layerId });
                }
            };
        },
        [map, layerId, isEnabled, hoveredPlaceCode],
    );

    return { hoveredAdminArea, clearHover };
}

export default useAdminAreaHover;
