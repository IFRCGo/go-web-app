import { useEffect, useRef } from 'react';
import Map from 'ol/Map.js';
import { View } from 'ol';
import { fromLonLat } from 'ol/proj';
import BaseLayer from 'ol/layer/Base';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import { CountryData, noCountrySelectedValue } from '#utils/ibfMap';
import { apply } from 'ol-mapbox-style';
import styles from './styles.module.css';

interface OlDataMapProps {
    // ISO_A2 code of the selected country
    selectedCountry: string;

    // StyleJson format vector tile map url
    mapStyleJsonUrl?: string;

    // Optional base map layer
    additionalVectorLayer?: BaseLayer;

    // Optional arg to expose adding a layer
    // It is a function that takes the add-layer function as an argument.
    addLayerFunction?: (addLayer: (layer: BaseLayer) => void) => void;
}

/**
 * OpenLayers map component for IBF data maps *
 * @returns A component that can be either standalone, or nested in a IbfMapContainer.
 */
export function OlDataMap({ selectedCountry, additionalVectorLayer, mapStyleJsonUrl, addLayerFunction }: OlDataMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const countryInfo = selectedCountry === noCountrySelectedValue ?  undefined : CountryData.get(selectedCountry);

    // Default center/zoom which is overridden if a country is selected.
    let center = [0, 0];
    let zoom = 2;

    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {

            // If a country is selected, center/zoom in on it.
            if (countryInfo) {
                center = fromLonLat([countryInfo.latlon[1], countryInfo.latlon[0]]);
                zoom = countryInfo.initialZoom;
            }

            mapInstanceRef.current = new Map({
                target: mapRef.current,
                controls: defaultControls({ attribution: false }),

                view: countryInfo ? new View({
                    center,
                    zoom,
                    // Constrain where the user can pan to
                    extent: countryInfo.safeExtents,
                    // The center of the country can't be panned off the view
                    // Not using this can make it hard to get the edge of the map to the screen center
                    constrainOnlyCenter: true,
                }) : new View({
                    center,
                    zoom,
                }),
            });

            if (additionalVectorLayer) {
                // Ensure this layer is on top of the other map layers
                additionalVectorLayer.setZIndex(1000);
                mapInstanceRef.current.addLayer(additionalVectorLayer);
            }

            if (mapStyleJsonUrl) {
                apply(mapInstanceRef.current, mapStyleJsonUrl)
                    .catch((error: any) => {
                        console.error('Style apply error:', error);
                    });
            }

            // Expose addLayer function to parent
            if (addLayerFunction) {
                addLayerFunction((newLayer: BaseLayer) => {
                    mapInstanceRef.current?.addLayer(newLayer);
                });
            }
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setTarget(undefined);
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className={styles.container}>
            <div
                ref={mapRef}
                className={styles.map}
            />
        </div>
    );
}