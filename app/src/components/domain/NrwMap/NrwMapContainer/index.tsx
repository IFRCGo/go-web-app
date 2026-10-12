import 'mapbox-gl-v3/dist/mapbox-gl.css';

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    faLayerGroup,
    faMinus,
    faPlus,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import mapboxgl, { type Map as MapboxMap } from 'mapbox-gl-v3';

import { mbtoken } from '#config';
import {
    getLayerAnchorId,
    layerDrawOrder,
} from '#utils/nrw/layers';
import {
    type NrwScreenCaptureHandler,
} from '#views/CountryProfileNationalRiskWatch/contexts/NrwScreenCaptureContext';
import {
    type Latitude,
    type Longitude,
    type MapView,
    type MapViewChangeHandler,
    type Zoom,
} from '#views/CountryProfileNationalRiskWatch/types';

import captureNrwMap from '../captureNrwMapScreenCapture';
import NrwMapContext from '../NrwMapContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

// This component wraps Mapbox so the rest of the components don't need to know
// about Mapbox.
// This component does not know about URLs or network requests.

// Get this from Mapbox Studio > Styles > Style url
const nrwMapboxStyleUrl = 'mapbox://styles/510global/cmrls7huy001501sde6mdhzlk';
const paddingPixels = 20;

function NrwMapContainer(props: {
    mapView: MapView;
    preserveInitialView: boolean;
    onMapViewChange: MapViewChangeHandler;
    breadcrumbs?: React.ReactNode;
    layerPanel?: React.ReactNode;
    legend?: React.ReactNode;
    registerScreenCapture: (handler: NrwScreenCaptureHandler | undefined) => void;
    children?: React.ReactNode;
}) {
    const {
        mapView,
        preserveInitialView,
        onMapViewChange,
        breadcrumbs,
        layerPanel,
        legend,
        registerScreenCapture,
        children,
    } = props;

    const { zoom, center, fitBounds } = mapView;

    const [southWest, northEast] = fitBounds ?? [];

    const strings = useTranslation(i18n);

    const containerRef = useRef<HTMLDivElement>(null);
    const [mapboxMap, setMapboxMap] = useState<MapboxMap | undefined>(undefined);
    const [mapLoadComplete, setMapLoadComplete] = useState(false);
    const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
    const [zoomLimits, setZoomLimits] = useState({ atMin: false, atMax: false });

    // Close the panel when the event is unselected.
    const hasLayerPanel = isDefined(layerPanel);
    useEffect(() => {
        if (!hasLayerPanel) {
            setIsLayerPanelOpen(false);
        }
    }, [hasLayerPanel]);

    const onMapViewChangeRef = useRef(onMapViewChange);
    useEffect(() => {
        onMapViewChangeRef.current = onMapViewChange;
    }, [onMapViewChange]);

    // Initialize the Mapbox map instance
    useEffect(() => {
        if (!containerRef.current) {
            return undefined;
        }

        mapboxgl.accessToken = mbtoken;

        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: nrwMapboxStyleUrl,
            projection: 'mercator',
            attributionControl: true,
            logoPosition: 'bottom-right',
            center,
            zoom,
            preserveDrawingBuffer: true,
        });

        map.dragRotate.disable();
        map.touchPitch.disable();
        map.on('style.load', () => {
            // Add invisible 'anchor' layers with specific order (from bottom to top)
            // .. so that later actual layers can be added at right position
            // .. irrespective of when they are added to the map.

            layerDrawOrder.toReversed().forEach((name) => {
                map.addLayer({
                    id: getLayerAnchorId(name),
                    type: 'background',
                    layout: { visibility: 'none' },
                });
            });
            setMapLoadComplete(true);
        });

        // Listener to enable/disable zoom buttons based current zoom level.
        const updateZoomLimits = () => {
            const zoomLevel = map.getZoom();
            setZoomLimits({
                atMin: zoomLevel <= map.getMinZoom(),
                atMax: zoomLevel >= map.getMaxZoom(),
            });
        };
        map.on('zoom', updateZoomLimits);
        updateZoomLimits();

        map.on('moveend', () => {
            onMapViewChangeRef.current(
                map.getZoom() as Zoom,
                map.getCenter().lat as Latitude,
                map.getCenter().lng as Longitude,
            );
        });

        setMapboxMap(map);

        // Cleanup.
        return () => {
            setMapboxMap(undefined);
            setMapLoadComplete(false);
            map.remove();
        };
    // Set the dependencies to empty since we want this to run exactly once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The country bounds arrive after the map is created.
    useEffect(() => {
        if (isNotDefined(mapboxMap) || isNotDefined(fitBounds)) {
            return;
        }

        mapboxMap.fitBounds(fitBounds, { padding: paddingPixels });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapboxMap, southWest?.lng, southWest?.lat, northEast?.lng, northEast?.lat]);

    const mapContext = useMemo(
        () => ({ map: mapLoadComplete ? mapboxMap : undefined, preserveInitialView }),
        [mapboxMap, mapLoadComplete, preserveInitialView],
    );

    // Expose the map capture capability once the map is ready, so that
    // consumers (e.g. the PDF export) don't need to know about Mapbox.
    useEffect(() => {
        if (!mapLoadComplete || isNotDefined(mapboxMap)) {
            registerScreenCapture(undefined);
            return undefined;
        }

        registerScreenCapture(captureNrwMap(mapboxMap));
        return () => registerScreenCapture(undefined);
    }, [mapboxMap, mapLoadComplete, registerScreenCapture]);

    return (
        <>
            <div className={styles.mapWrapper}>
                <div
                    ref={containerRef}
                    className={styles.nrwMapContainer}
                />
                {isDefined(breadcrumbs) && (
                    <div className={styles.mapBreadcrumbs}>
                        {breadcrumbs}
                    </div>
                )}
                <div className={styles.mapControls}>
                    <div className={styles.zoomControls}>
                        <button
                            type="button"
                            className={styles.zoomButton}
                            aria-label={strings.nrwMapContainerZoomInLabel}
                            disabled={zoomLimits.atMax}
                            onClick={() => mapboxMap?.zoomIn()}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                        <button
                            type="button"
                            className={styles.zoomButton}
                            aria-label={strings.nrwMapContainerZoomOutLabel}
                            disabled={zoomLimits.atMin}
                            onClick={() => mapboxMap?.zoomOut()}
                        >
                            <FontAwesomeIcon icon={faMinus} />
                        </button>
                    </div>
                    {hasLayerPanel && (
                        <>
                            <button
                                type="button"
                                className={styles.layersButton}
                                aria-label={strings.nrwMapContainerLayersLabel}
                                aria-expanded={isLayerPanelOpen}
                                onClick={() => setIsLayerPanelOpen((open) => !open)}
                            >
                                <FontAwesomeIcon icon={faLayerGroup} />
                            </button>
                            {isLayerPanelOpen && layerPanel}
                        </>
                    )}
                </div>
                {isDefined(legend) && (
                    <div className={styles.mapLegend}>
                        {legend}
                    </div>
                )}
            </div>
            <NrwMapContext.Provider value={mapContext}>
                {children}
            </NrwMapContext.Provider>
        </>
    );
}

export default NrwMapContainer;
