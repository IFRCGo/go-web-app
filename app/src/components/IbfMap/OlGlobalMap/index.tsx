import { useEffect, useRef } from 'react';
import Map from 'ol/Map.js';
import styles from './styles.module.css';
import { View } from 'ol';
import { fromLonLat } from 'ol/proj';
import VectorTile from 'ol/source/VectorTile';
import VectorTileLayer from 'ol/layer/VectorTile';
import Attribution from 'ol/control/Attribution.js';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import MVT from 'ol/format/MVT';
import 'ol/ol.css';
import { CountryData, isoA2CountryNameProperty, mapUrlCountryVectorTiles, noCountrySelectedValue } from '#utils/ibfMap';
import { styleMvtGreyWorldMap } from '#utils/ibfMapStyles';

// Initial zoom/focus of map
const center = [0, 0];
const zoom = 2;

interface OlGlobalMapProps {
    // What admin levels are visible. 0: country. 1: country and admin level 1.
    adminLevels: 0 | 1;

    // Callback for when a country is selected.
    onSelect: (country: string) => void;
}

/**
 * Map designed for a global view with country selection. *
 * TODO: redo this for the new way to handle clicks and admin boundaries.
 * See task https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41662
 * @returns A standalone component.
 */
export function OlGlobalMap({ adminLevels: adminLayers, onSelect }: OlGlobalMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const adminLayersRef = useRef<VectorTileLayer | null>(null);

    let selectedCountry = noCountrySelectedValue;

    // By setting the max zoom of the vector tiles layer, we can control what vectors are drawn.
    // It supports all countries at admin0 (at zoom 1) and admin1 (at zoom 2+).
    const countryLayerMaxZoom = adminLayers + 1;

    // Map init called once
    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {
            const attribution = new Attribution({ collapsible: false });

            // Create vector tile layer for admin boundaries
            adminLayersRef.current = new VectorTileLayer({
                source: new VectorTile({
                    url: mapUrlCountryVectorTiles,
                    format: new MVT(),
                    maxZoom: countryLayerMaxZoom,
                }),
                style: (feature) => styleMvtGreyWorldMap(feature, selectedCountry),
            });

            // Create map and add the boundaries
            mapInstanceRef.current = new Map({
                target: mapRef.current,
                controls: defaultControls({ attribution: false }).extend([attribution]),
                layers: [adminLayersRef.current],
                view: new View({
                    constrainResolution: true,
                    center,
                    zoom,
                    maxZoom: 6,
                }),
            });

            // Change cursor on hover
            mapInstanceRef.current.on('pointermove', (evt) => {
                const pixel = mapInstanceRef.current!.getEventPixel(evt.originalEvent);
                const hit = mapInstanceRef.current!.hasFeatureAtPixel(pixel);
                mapInstanceRef.current!.getTargetElement().style.cursor = hit ? 'pointer' : '';
            });

            // Click handler
            mapInstanceRef.current.on('click', (evt) => {
                mapInstanceRef.current!.forEachFeatureAtPixel(evt.pixel, (feature) => {
                    const properties = feature.getProperties();
                    const newSelectedCountry = properties[isoA2CountryNameProperty] || noCountrySelectedValue;

                    if (selectedCountry !== newSelectedCountry) {
                        onSelect(newSelectedCountry);

                        // Zoom to country
                        const countryInfo = CountryData.get(newSelectedCountry);
                        if (countryInfo) {
                            const [lat, lon] = countryInfo.latlon;
                            mapInstanceRef.current!.getView().animate({
                                center: fromLonLat([lon, lat]),
                                zoom: countryInfo.initialZoom,
                                duration: 500, // pan/zoom animation in ms
                            });
                        }
                    } else {
                        // deselect country
                        // This is only hit if you click on the same country twice
                        // This is debug behavior though and will be changed.
                        onSelect(noCountrySelectedValue);
                    }

                    selectedCountry = newSelectedCountry;
                    adminLayersRef.current!.setStyle((feature) => styleMvtGreyWorldMap(feature, selectedCountry));

                    return true;
                });
            });
        }

        return () => {
            // Clean up map ref
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
