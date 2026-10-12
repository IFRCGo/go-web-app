import {
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import mapboxgl, {
    type Marker as MapboxMarker,
    type MarkerOptions,
} from 'mapbox-gl-v3';

import type NrwLngLat from '#views/CountryProfileNationalRiskWatch/NrwLngLat';

import NrwMapContext from '../NrwMapContext';

import styles from './styles.module.css';

export type NrwMarkerPlacement = Pick<MarkerOptions, 'anchor' | 'offset'>;

function useNrwMapMarker(
    coordinates: NrwLngLat,
    placement: NrwMarkerPlacement = { anchor: 'center' },
): HTMLDivElement {
    const { map } = useContext(NrwMapContext);

    const { lng, lat } = coordinates;

    const [element] = useState(() => {
        const markerElement = document.createElement('div');
        markerElement.className = _cs(styles.marker);
        return markerElement;
    });
    const markerRef = useRef<MapboxMarker | undefined>(undefined);

    useEffect(() => {
        if (isNotDefined(map)) {
            return undefined;
        }

        const marker = new mapboxgl.Marker({ element, ...placement })
            .setLngLat([lng, lat])
            .addTo(map);

        markerRef.current = marker;

        return () => {
            markerRef.current = undefined;
            marker.remove();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, element]);

    useEffect(() => {
        markerRef.current?.setLngLat([lng, lat]);
    }, [lng, lat]);

    return element;
}

export default useNrwMapMarker;
