import 'mapbox-gl-v3/dist/mapbox-gl.css';

import {
    useEffect,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import mapboxgl, { type Map as MapboxGLMap } from 'mapbox-gl-v3';

import {
    mbtoken,
    nrwStandalone,
} from '#config';

import styles from './styles.module.css';

const DEFAULT_MAP_ZOOM = 3;
// Get this from Mapbox Studio > Styles > Style url
const NRW_MAPBOX_STYLE_URL = 'mapbox://styles/510global/cmrls7huy001501sde6mdhzlk';

export default function NrwMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<MapboxGLMap | null>(null);

    // Initialize the Mapbox map instance
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) {
            return undefined;
        }

        mapboxgl.accessToken = mbtoken;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: NRW_MAPBOX_STYLE_URL,
            projection: 'mercator',
            attributionControl: true,
            center: [0, 0],
            zoom: DEFAULT_MAP_ZOOM,
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

        mapInstanceRef.current = map;

        return () => {
            // Clean up on unmount
            mapInstanceRef.current?.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    return (
        <div
            ref={mapContainerRef}
            className={_cs(
                styles.nrwMap,
                nrwStandalone && styles.nrwStandalone,
            )}
        />
    );
}
