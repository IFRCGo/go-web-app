import 'ol/ol.css';

import {
    useEffect,
    useRef,
} from 'react';
import { View } from 'ol';
import Attribution from 'ol/control/Attribution.js';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map.js';
import VectorSource from 'ol/source/Vector';

import {
    COUNTRY_FIELD_KEY,
    noCountrySelectedValue,
} from '#utils/nrw/nrwConstants';
import {
    getAdminAreaZIndex,
    getExtentForVectorData,
} from '#utils/nrw/nrwMapHelpers';
import {
    styleAdmin0,
    styleAdmin1,
} from '#utils/nrw/nrwMapStyles';
import {
    getAdminRegionUrl,
    getGlobalAdmin0Url,
} from '#utils/nrw/nrwUrls';

import styles from './styles.module.css';

// Initial zoom/focus of map
const center = [0, 0];
const zoom = 2;

interface OlGlobalMapProps {
    // Callback for when a country is selected.
    onSelect: (country: string) => void;
}

/**
 * Global map for country selection, with a callback to know what was selected.
 * This component is a proof of concept to show how OpenLayers could replace general maps in GO.
 * As of April 2026, there is no set UX design for it, so modify it as needed.
 * It's added to make sure our systems can always support this use case.
 * @returns A standalone component.
 */
export default function OlGlobalMap({ onSelect }: OlGlobalMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const admin0LayerRef = useRef<VectorLayer | null>(null);
    const admin1LayerRef = useRef<VectorLayer | null>(null);
    const selectedCountryRef = useRef(noCountrySelectedValue);

    const refreshLayerStyles = () => {
        admin0LayerRef.current?.changed();
        admin1LayerRef.current?.changed();
    };

    const removeAdmin1Layer = () => {
        const existingLayer = admin1LayerRef.current;
        if (existingLayer && mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(existingLayer);
        }
        admin1LayerRef.current = null;
    };

    const fitToLoadedAdmin1 = (admin1Source: VectorSource) => {
        const map = mapInstanceRef.current;
        if (!map) {
            return;
        }

        const extent = getExtentForVectorData(admin1Source);
        if (!extent) {
            return;
        }

        map.getView().fit(extent, {
            duration: 500,
            padding: [50, 50, 50, 50],
        });
    };

    const loadAdmin1LayerForCountry = (country: string) => {
        removeAdmin1Layer();

        if (country === noCountrySelectedValue || !mapInstanceRef.current) {
            return;
        }

        const admin1Source = new VectorSource({
            url: getAdminRegionUrl(country, 1),
            format: new GeoJSON(),
        });

        const admin1Layer = new VectorLayer({
            source: admin1Source,
            style: (feature) => styleAdmin1(feature, selectedCountryRef.current),
        });
        admin1Layer.setZIndex(getAdminAreaZIndex(1));
        mapInstanceRef.current.addLayer(admin1Layer);
        admin1LayerRef.current = admin1Layer;

        // Fit the map to the admin 1 content when loaded
        admin1Source.once('featuresloadend', () => {
            if (selectedCountryRef.current === country) {
                fitToLoadedAdmin1(admin1Source);
            }
        });
    };

    const updateSelectedCountry = (country: string) => {
        onSelect(country);
        selectedCountryRef.current = country;

        if (country === noCountrySelectedValue) {
            removeAdmin1Layer();
        } else {
            loadAdmin1LayerForCountry(country);
        }

        refreshLayerStyles();
    };

    // Map init called once
    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {
            const attribution = new Attribution({ collapsible: false });
            const admin0Url = getGlobalAdmin0Url();

            // Create admin0 layer for all countries
            admin0LayerRef.current = new VectorLayer({
                source: new VectorSource({
                    url: admin0Url,
                    format: new GeoJSON(),
                }),
                style: (feature) => styleAdmin0(feature, selectedCountryRef.current),
            });
            admin0LayerRef.current.setZIndex(getAdminAreaZIndex(0));

            // Create map and add the boundaries
            mapInstanceRef.current = new Map({
                target: mapRef.current,
                controls: defaultControls({ attribution: false }).extend([attribution]),
                layers: [admin0LayerRef.current],
                view: new View({
                    constrainResolution: true,
                    center,
                    zoom,
                    maxZoom: 6,
                }),
            });
            const map = mapInstanceRef.current;

            // Change cursor on hover
            map.on('pointermove', (evt) => {
                const pixel = map.getEventPixel(evt.originalEvent);
                const hit = map.hasFeatureAtPixel(pixel);
                map.getTargetElement().style.cursor = hit ? 'pointer' : '';
            });

            // Click handler
            map.on('click', (evt) => {
                map.forEachFeatureAtPixel(evt.pixel, (feature) => {
                    const properties = feature.getProperties();
                    const clickedCountry = properties[COUNTRY_FIELD_KEY]
                    || noCountrySelectedValue;
                    const isSameCountrySelected = selectedCountryRef.current === clickedCountry;

                    if (isSameCountrySelected) {
                        // If the same country is clicked again, deselect it.
                        // This is debug behavior since the design on this map is not yet decided
                        updateSelectedCountry(noCountrySelectedValue);
                    } else {
                        updateSelectedCountry(clickedCountry);
                    }

                    return true;
                });
            });
        }

        return () => {
            removeAdmin1Layer();
            admin0LayerRef.current = null;

            // Clean up map ref
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setTarget(undefined);
                mapInstanceRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
