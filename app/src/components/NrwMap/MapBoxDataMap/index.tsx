import 'mapbox-gl-v3/dist/mapbox-gl.css';

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import mapboxgl, { type Map as MapboxGLMap } from 'mapbox-gl-v3';

import {
    ibfApiBackend,
    mbtoken,
} from '#config';
import useAlert from '#hooks/useAlert';
import { noCountrySelectedValue } from '#utils/nrw/nrwConstants';
import { getCountryMapData } from '#utils/nrw/nrwDataFetchHelpers';
import { exportMapboxToPdf } from '#utils/nrw/nrwMapboxToPdfExporter';
import { isValidCoordinatePair } from '#utils/nrw/nrwMapHelpers';
import type { MapSelectionView } from '#utils/nrw/nrwMapInteractionHelpers';
import {
    getHealthLocsApiUrl,
    getRcLocsApiUrl,
    seedRepoPopDataUrl,
} from '#utils/nrw/nrwUrls';
import type { MapLayerDetailsDto } from '#utils/nrw/shared-dtos';
import {
    MapLayerDisplayType,
    MapLayerInfoType,
} from '#utils/nrw/shared-enums';

import styles from './styles.module.css';

const defaultCenter: [number, number] = [10.4515, 51.1657];
const defaultZoom = 3;

// Convert EPSG:3857 meters to WGS84 longitude degrees
function mercatorToLon(x: number): number {
    return (x / 20037508.34) * 180;
}

// Convert EPSG:3857 meters to WGS84 latitude degrees
function mercatorToLat(y: number): number {
    return (Math.atan(Math.exp((y / 20037508.34) * Math.PI)) * 360) / Math.PI - 90;
}

interface MbLayerEntry {
    sourceId: string;
    layerId: string;
}

interface MapBoxDataMapProps {
    selectedCountries: string[];
    initialMapView?: MapSelectionView | null;
    // Resource IDs of layers that should currently be visible
    visibleLayerIds?: string[];
    // Layers from the currently selected event (if any)
    availableEventLayers?: MapLayerDetailsDto[];
}

function getViewConfig(initialMapView?: MapSelectionView | null) {
    return {
        center: initialMapView
            ? [initialMapView.center.lon, initialMapView.center.lat] as [number, number]
            : defaultCenter,
        zoom: initialMapView?.zoom ?? defaultZoom,
    };
}

async function loadPointLayer(
    map: MapboxGLMap,
    sourceId: string,
    layerId: string,
    dataType: MapLayerInfoType,
    selectedCountry: string,
): Promise<void> {
    const apiUrl = dataType === MapLayerInfoType.RedCrossBranches
        ? getRcLocsApiUrl(selectedCountry)
        : getHealthLocsApiUrl(selectedCountry);

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { results?: Record<string, unknown>[] };

    const features = (data.results ?? []).flatMap((item) => {
        let longitude: number;
        let latitude: number;

        if (dataType === MapLayerInfoType.RedCrossBranches) {
            const locJson = item.location_geojson as { coordinates?: [number, number] } | null;
            const coords = locJson?.coordinates;
            if (!coords || coords.length < 2) return [];
            longitude = Number(coords[0]);
            latitude = Number(coords[1]);
        } else {
            const loc = item.location as { lat?: number; lng?: number } | null;
            longitude = Number(loc?.lng);
            latitude = Number(loc?.lat);
        }

        if (!isValidCoordinatePair(longitude, latitude)) return [];

        return [{
            type: 'Feature' as const,
            geometry: { type: 'Point' as const, coordinates: [longitude, latitude] },
            properties: {},
        }];
    });

    map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
    });

    map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
            'circle-radius': 5,
            'circle-color': dataType === MapLayerInfoType.RedCrossBranches ? '#e63636' : '#3694d1',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
        },
    });
}

async function loadRasterLayer(
    map: MapboxGLMap,
    sourceId: string,
    layerId: string,
    dataType: MapLayerInfoType,
    resourceId: string,
    selectedCountry: string,
): Promise<void> {
    let imageUrl: string;
    let west: number;
    let south: number;
    let east: number;
    let north: number;

    if (dataType === MapLayerInfoType.Population) {
        const name = `${selectedCountry}_population`;
        const metaRes = await fetch(`${seedRepoPopDataUrl}${name}_metadata.json`);
        if (!metaRes.ok) throw new Error(`Metadata HTTP ${metaRes.status}`);
        const meta = await metaRes.json() as {
            bounds: { left: number; bottom: number; right: number; top: number };
        };
        west = mercatorToLon(meta.bounds.left);
        south = mercatorToLat(meta.bounds.bottom);
        east = mercatorToLon(meta.bounds.right);
        north = mercatorToLat(meta.bounds.top);
        imageUrl = `${seedRepoPopDataUrl}${name}.png`;
    } else {
        // FloodDepth — event-specific raster served by IBF API in WGS84
        const baseUrl = `${ibfApiBackend}rasters/alert`;
        const metaRes = await fetch(`${baseUrl}/${resourceId}`);
        if (!metaRes.ok) throw new Error(`Metadata HTTP ${metaRes.status}`);
        const meta = await metaRes.json() as {
            extent: { xmin: number; ymin: number; xmax: number; ymax: number };
        };
        west = meta.extent.xmin;
        south = meta.extent.ymin;
        east = meta.extent.xmax;
        north = meta.extent.ymax;
        imageUrl = `${baseUrl}/${resourceId}/image`;
    }

    map.addSource(sourceId, {
        type: 'image',
        url: imageUrl,
        coordinates: [
            [west, north],
            [east, north],
            [east, south],
            [west, south],
        ],
    });

    // Use 'nearest' resampling to avoid blurring the raster when zoomed in
    map.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: {
            'raster-opacity': 0.8,
            'raster-resampling': 'nearest',
        },
    });
}

async function loadMbLayer(
    map: MapboxGLMap,
    layerInfo: MapLayerDetailsDto,
    sourceId: string,
    layerId: string,
    selectedCountry: string,
): Promise<void> {
    const { dataType, displayType, resourceId } = layerInfo;

    if (displayType === MapLayerDisplayType.Point) {
        await loadPointLayer(map, sourceId, layerId, dataType, selectedCountry);
    } else if (displayType === MapLayerDisplayType.Raster) {
        await loadRasterLayer(map, sourceId, layerId, dataType, resourceId, selectedCountry);
    }
}

/**
 * Lightweight Mapbox v3 map for NRW, with support for the same data layers as OlDataMap.
 */
export default function MapBoxDataMap({
    selectedCountries,
    initialMapView,
    visibleLayerIds = [],
    availableEventLayers = [],
}: MapBoxDataMapProps) {
    const alert = useAlert();
    const selectedCountry = selectedCountries[0] ?? noCountrySelectedValue;
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<MapboxGLMap | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [countryLayers, setCountryLayers] = useState<MapLayerDetailsDto[]>([]);
    // Tracks Mapbox source/layer IDs for each loaded resource, keyed by resourceId
    const mbLayerMapRef = useRef<Map<string, MbLayerEntry>>(new Map());

    // Initialize the Mapbox map instance once
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) {
            return undefined;
        }

        mapboxgl.accessToken = mbtoken;
        const { center, zoom } = getViewConfig(initialMapView);

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/standard',
            projection: 'mercator',
            center,
            zoom,
            attributionControl: true,
            preserveDrawingBuffer: true,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.on('load', () => {
            setIsMapLoaded(true);
        });

        mapInstanceRef.current = map;

        return () => {
            mapInstanceRef.current?.remove();
            mapInstanceRef.current = null;
            setIsMapLoaded(false);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Animate to updated view when country or initialMapView changes
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) {
            return;
        }

        const { center, zoom } = getViewConfig(initialMapView);

        map.easeTo({
            center,
            zoom,
            duration: 0,
        });
    }, [initialMapView, selectedCountry]);

    // Fetch the layer definitions available for this country
    useEffect(() => {
        const load = async () => {
            const data = await getCountryMapData();
            setCountryLayers(data[selectedCountry]?.availableLayers ?? []);
        };
        load();
    }, [selectedCountry]);

    // Show, hide, or load Mapbox layers whenever visibleLayerIds changes
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isMapLoaded) return;

        const allLayers = [...availableEventLayers, ...countryLayers];

        allLayers.forEach((layerInfo) => {
            const { resourceId } = layerInfo;
            const shouldBeVisible = visibleLayerIds.includes(resourceId);
            const existing = mbLayerMapRef.current.get(resourceId);

            if (existing) {
                map.setLayoutProperty(
                    existing.layerId,
                    'visibility',
                    shouldBeVisible ? 'visible' : 'none',
                );
            } else if (shouldBeVisible) {
                const sourceId = `nrw-src-${resourceId}`;
                const layerId = `nrw-lyr-${resourceId}`;

                loadMbLayer(map, layerInfo, sourceId, layerId, selectedCountry)
                    .then(() => {
                        mbLayerMapRef.current.set(resourceId, { sourceId, layerId });
                    })
                    .catch((err: unknown) => {
                        console.error(`[MapBoxDataMap] Failed to load layer ${resourceId}:`, err);
                    });
            }
        });
    }, [visibleLayerIds, isMapLoaded, countryLayers, availableEventLayers, selectedCountry]);

    const handleDebugExport = useCallback(async () => {
        const mapInstance = mapInstanceRef.current;
        if (!mapInstance) {
            alert.show('Map is not ready yet.', { variant: 'warning' });
            return;
        }

        try {
            await exportMapboxToPdf(mapInstance, [selectedCountry]);
        } catch (error) {
            alert.show('Failed to export Mapbox PDF. Please try again.', { variant: 'danger' });
            console.error('[MapBoxDataMap] Export failed:', error);
        }
    }, [alert, selectedCountry]);

    return (
        <div className={styles.container}>
            <div className={styles.debugToolbar}>
                <button
                    type="button"
                    className={styles.debugExportButton}
                    onClick={handleDebugExport}
                    disabled={!isMapLoaded}
                >
                    Debug Export PDF (Mapbox)
                </button>
            </div>
            <div
                ref={mapContainerRef}
                className={styles.map}
            />
        </div>
    );
}
