import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    CheckboxBlankFillIcon,
    PlayIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    RawButton,
    TextOutput,
} from '@ifrc-go/ui';
import {
    maxSafe,
    minSafe,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';
import {
    getLayerName,
    MapBounds,
    MapImage,
    MapLayer,
    MapOrder,
    MapSource,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';
import { type SymbolLayer } from 'mapbox-gl';

import GlobalMap from '#components/domain/GlobalMap';
import {
    activeHazardPointLayer,
    exposureFillLayer,
    exposureFillOutlineLayer,
    geojsonSourceOptions,
    hazardKeyToIconmap,
    hazardPointIconLayout,
    invisibleLayout,
    trackLineLayer,
    trackPointLayer,
    trackPointOuterCircleLayer,
    uncertaintyConeLayer,
} from '#components/domain/RiskImminentEventMap/mapStyles';
import {
    type RiskLayerProperties,
    type RiskLayerSeverity,
    type RiskLayerTypes,
} from '#components/domain/RiskImminentEventMap/utils';
import Link from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import Page from '#components/Page';
import { type components } from '#generated/riskTypes';
import {
    COLOR_WHITE,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import { isValidFeatureCollection } from '#utils/domain/risk';

import AnimatedNumberOutput from './AnimatedNumberOutput';

import data01 from './data/geojson_1001131_1.json';
import data02 from './data/geojson_1001131_2.json';
import data03 from './data/geojson_1001131_3.json';
import data04 from './data/geojson_1001131_4.json';
import data05 from './data/geojson_1001131_5.json';
import data06 from './data/geojson_1001131_6.json';
import data07 from './data/geojson_1001131_7.json';
import data08 from './data/geojson_1001131_8.json';
import data09 from './data/geojson_1001131_9.json';
import data10 from './data/geojson_1001131_10.json';
import data11 from './data/geojson_1001131_11.json';
import data12 from './data/geojson_1001131_12.json';
import data13 from './data/geojson_1001131_13.json';
import data14 from './data/geojson_1001131_14.json';
import data15 from './data/geojson_1001131_15.json';
import data16 from './data/geojson_1001131_16.json';
import data17 from './data/geojson_1001131_17.json';
import data18 from './data/geojson_1001131_18.json';
import data19 from './data/geojson_1001131_19.json';
import data20 from './data/geojson_1001131_20.json';
import data21 from './data/geojson_1001131_21.json';
import data22 from './data/geojson_1001131_22.json';
import data23 from './data/geojson_1001131_23.json';
import data24 from './data/geojson_1001131_24.json';
import data25 from './data/geojson_1001131_25.json';
import data26 from './data/geojson_1001131_26.json';
import data27 from './data/geojson_1001131_27.json';
import data28 from './data/geojson_1001131_28.json';
import data29 from './data/geojson_1001131_29.json';
import styles from './styles.module.css';

interface CommonFeatureProperties {
    Class: string;
}

type FeatureAlertLevel = 'Green' | 'Red' | 'Orange';

const mapImageOption = {
    sdf: true,
};

interface HazardPointFeatureProperties extends CommonFeatureProperties {
    alertlevel: FeatureAlertLevel,
}

const severityMapping: Record<string, RiskLayerSeverity> = {
    Red: 'red',
    Orange: 'orange',
    Green: 'green',
};

function getLayerProperties(
    feature: GeoJSON.Feature<GeoJSON.Geometry>,
    hazardDate: string | undefined,
): RiskLayerProperties {
    if (isNotDefined(feature.properties) || !('Class' in feature.properties)) {
        return {
            type: 'unknown',
        };
    }

    const {
        Class: featureClass,
    } = feature.properties;

    const splits = featureClass.split('_');

    if (splits[0] === 'Point') {
        if (splits[1] === 'Centroid') {
            const severityStr = (feature.properties as HazardPointFeatureProperties).alertlevel;

            return {
                type: 'hazard-point',
                severity: severityMapping[severityStr] ?? 'unknown',
            };
        }

        // Converting format from 'dd/MM/yyyy hh:mm:ss' to 'yyyy-MM-ddThh:mm:ss.sssZ'
        const [date, time] = feature.properties.trackdate.split(' ');
        const [d, m, y] = date.split('/');
        const standardDateTime = `${y}-${m}-${d}T${time}.000Z`;

        return {
            type: 'track-point',
            isFuture: hazardDate
                ? new Date(standardDateTime).getTime() > new Date(hazardDate).getTime()
                : false,
        };
    }

    if (splits[0] === 'Line') {
        return {
            type: 'track-linestring',
        };
    }

    if (splits[0] === 'Poly') {
        if (splits[1] === 'Cones') {
            return {
                type: 'uncertainty-cone',
                forecastDays: undefined,
            };
        }

        if (splits[1] === 'Red' || splits[1] === 'Orange' || splits[1] === 'Green') {
            return {
                type: 'exposure',
                severity: severityMapping[splits[1]] ?? 'unknown',
            };
        }

        if (splits[1] === 'Polygon' && splits[2] === 'Point') {
            return {
                type: 'track-point-boundary',
            };
        }
    }

    return {
        type: 'unknown',
    };
}

const mapIcons = mapToList(
    hazardKeyToIconmap,
    (icon, key) => (icon ? ({ key, icon }) : undefined),
).filter(isDefined);

type Snapshot = GeoJSON.FeatureCollection & {
    metadata: {
        episodeid: string,
        latitude: string,
        longitude: string,
        fromdate: string,
        todate: string,

        name?: string,
        htmldescription?: string,
        country?: string,
        link?: string,

        current_windspeed?: string,
        current_stormstatus?: string,
    }
}

function isValidSnapshot(maybeSnapshot: unknown): maybeSnapshot is Snapshot {
    if (!isValidFeatureCollection(maybeSnapshot)) {
        return false;
    }

    if (!('metadata' in maybeSnapshot)) {
        return false;
    }

    const { metadata } = maybeSnapshot;

    if (typeof metadata !== 'object' || isNotDefined(metadata)) {
        return false;
    }

    if (
        !('episodeid' in metadata)
            || !('latitude' in metadata)
            || !('longitude' in metadata)
            || !('fromdate' in metadata)
            || !('todate' in metadata)
    ) {
        return false;
    }

    return true;
}

const snapshots = ([
    data01,
    data02,
    data03,
    data04,
    data05,
    data06,
    data07,
    data08,
    data09,
    data10,
    data11,
    data12,
    data13,
    data14,
    data15,
    data16,
    data17,
    data18,
    data19,
    data20,
    data21,
    data22,
    data23,
    data24,
    data25,
    data26,
    data27,
    data28,
    data29,
] as unknown[]).filter(isValidSnapshot).map(
    (snapshot) => ({
        ...snapshot,
        features: snapshot.features.map((feature) => ({
            ...feature,
            properties: {
                ...feature.properties,
                // NOTE: the todate format is 'dd MMM yyyy hh:mm:ss'
                ...getLayerProperties(feature, snapshot.metadata.todate),
                hazard_type: 'TC' as const,
            },
        })),
    }),
);

type HazardType = components<'read'>['schemas']['HazardTypeEnum'];
const hazardKeys = Object.keys(hazardKeyToIconmap) as HazardType[];

const normalizationFactor = snapshots.length / (snapshots.length + 1);
const dateFormatter = new Intl.DateTimeFormat(
    undefined,
    {
        day: 'numeric',
        month: 'short',
    },
);

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [loadedIcons, setLoadedIcons] = useState<Record<string, boolean>>({});
    const [activeSnapshotIndex, setActiveSnapshotIndex] = useState<number>(0);
    const activeSnapshot = snapshots[activeSnapshotIndex];
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const handleIconLoad = useCallback(
        (loaded: boolean, key: HazardType) => {
            setLoadedIcons((prevValue) => ({
                ...prevValue,
                [key]: loaded,
            }));
        },
        [],
    );
    const bounds = useMemo(
        () => (
            getBbox({
                type: 'FeatureCollection' as const,
                features: snapshots.flatMap((snapshot) => snapshot.features),
            })
        ),
        [],
    );

    const allIconsLoaded = useMemo(
        () => (
            Object.values(loadedIcons)
                .filter(Boolean).length === mapIcons.length
        ),
        [loadedIcons],
    );

    const hazardPointIconLayer = useMemo<Omit<SymbolLayer, 'id'>>(
        () => ({
            type: 'symbol',
            filter: [
                '==',
                ['get', 'type'],
                'hazard-point' satisfies RiskLayerTypes,
            ],
            paint: {
                'icon-color': COLOR_WHITE,
                'icon-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'eventVisible'], true],
                    1,
                    0,
                ],
            },
            layout: allIconsLoaded ? hazardPointIconLayout : invisibleLayout,
        }),
        [allIconsLoaded],
    );

    const intervalRef = useRef<number>();

    useEffect(() => {
        window.clearTimeout(intervalRef.current);

        if (isPlaying) {
            intervalRef.current = window.setInterval(
                () => {
                    setActiveSnapshotIndex((prevIndex) => {
                        const newIndex = prevIndex < (snapshots.length - 1) ? (prevIndex + 1) : 0;

                        return newIndex;
                    });
                },
                1200,
            );
        }

        return () => {
            window.clearTimeout(intervalRef.current);
        };
    }, [isPlaying]);

    const timePoints = useMemo(() => {
        const timestampList = snapshots.map((snapshot) => (
            new Date(snapshot.metadata.todate).getTime()
        ));

        const timeDateFormatter = new Intl.DateTimeFormat(
            undefined,
            {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h24',
            },
        );

        const minTime = minSafe(timestampList);
        const maxTime = maxSafe(timestampList);

        if (!minTime || !maxTime) {
            return undefined;
        }

        const diff = maxTime - minTime;

        return timestampList.map((timestamp, index) => ({
            key: timestamp,
            index,
            offset: (100 * (timestamp - minTime)) / diff,
            normalizedOffset: (100 * (normalizationFactor) * (timestamp - minTime)) / diff,
            label: timeDateFormatter.format(new Date(timestamp)),
        }));
    }, []);

    const windSpeeds = useMemo(() => {
        const currentWindspeedList = snapshots.map((snapshot) => (
            Number(snapshot.metadata.current_windspeed)
        ));

        const maxWindspeed = maxSafe(currentWindspeedList);

        if (!maxWindspeed) {
            return undefined;
        }

        return currentWindspeedList.map((windspeed, index) => ({
            key: index,
            index,
            height: (100 * windspeed) / maxWindspeed,
            value: windspeed,
        }));
    }, []);

    const activeSnapshotDate = useMemo(
        () => new Date(activeSnapshot.metadata.todate),
        [activeSnapshot],
    );

    const timelinePointWidth = 100 / snapshots.length;
    const globalOffset = (normalizationFactor * timelinePointWidth) / 3;

    const [hoveredIndex, setHoveredIndex] = useState<number>();

    const getClickZoneHoverHandler = useCallback((index: number | undefined) => (
        () => {
            setHoveredIndex(index);
        }
    ), []);

    return (
        <Page
            className={styles.chidoTwentyFive}
            title="Chido-25"
            heading="Chido-25"
            mainSectionClassName={styles.mainContent}
        >
            <div className={styles.mapSection}>
                <GlobalMap>
                    <MapContainerWithDisclaimer
                        title="Chido-25"
                        className={styles.mapContainer}
                        footer={(
                            <div className={styles.activeSnapshotTemporalInfo}>
                                <div className={styles.timeInfo}>
                                    <AnimatedNumberOutput
                                        prefix={`${dateFormatter.format(activeSnapshotDate)}, `}
                                        value={activeSnapshotDate.getHours()}
                                        suffix={`:${activeSnapshotDate.getMinutes().toString().padStart(2, '0')}`}
                                    />
                                </div>
                                <div className={styles.windSpeed}>
                                    <AnimatedNumberOutput
                                        value={Number(activeSnapshot.metadata.current_windspeed)}
                                        suffix=" km/h"
                                    />
                                </div>
                            </div>
                        )}
                    />
                    {hazardKeys.map((key) => {
                        const url = hazardKeyToIconmap[key];

                        if (isNotDefined(url)) {
                            return null;
                        }

                        return (
                            <MapImage
                                key={key}
                                name={key}
                                url={url}
                                onLoad={handleIconLoad}
                                imageOptions={mapImageOption}
                            />
                        );
                    })}
                    <MapSource
                        sourceKey="active-event-snapshot"
                        sourceOptions={geojsonSourceOptions}
                        geoJson={activeSnapshot}
                    >
                        <MapLayer
                            layerKey="exposure-fill"
                            layerOptions={exposureFillLayer}
                        />
                        <MapLayer
                            layerKey="exposure-fill-outline"
                            layerOptions={exposureFillOutlineLayer}
                        />
                        <MapLayer
                            layerKey="track-line"
                            layerOptions={trackLineLayer}
                        />
                        <MapLayer
                            layerKey="track-point"
                            layerOptions={trackPointLayer}
                        />
                        <MapLayer
                            layerKey="track-point-outer-circle"
                            layerOptions={trackPointOuterCircleLayer}
                        />
                        <MapLayer
                            layerKey="uncertainty-cone"
                            layerOptions={uncertaintyConeLayer}
                        />
                        <MapLayer
                            layerKey="hazard-point"
                            layerOptions={activeHazardPointLayer}
                        />
                        <MapLayer
                            layerKey="hazard-points-icon"
                            layerOptions={hazardPointIconLayer}
                        />
                    </MapSource>
                    <MapOrder
                        ordering={[
                            getLayerName('active-event-snapshot', 'exposure-fill', true),
                            getLayerName('active-event-snapshot', 'exposure-fill-outline', true),
                            getLayerName('active-event-snapshot', 'uncertainty-cone', true),
                            getLayerName('active-event-snapshot', 'track-point-outer-circle', true),
                            getLayerName('active-event-snapshot', 'track-line', true),
                            getLayerName('active-event-snapshot', 'track-arrow', true),
                            getLayerName('active-event-snapshot', 'track-point', true),
                            getLayerName('active-event-snapshot', 'hazard-point', true),
                            getLayerName('active-event-snapshot', 'hazard-points-icon', true),
                        ]}
                    />
                    {bounds && (
                        <MapBounds
                            duration={DURATION_MAP_ZOOM}
                            bounds={bounds}
                            padding={DEFAULT_MAP_PADDING}
                        />
                    )}
                </GlobalMap>
                <Container
                    className={styles.sidePanel}
                    childrenContainerClassName={styles.sidePanelContent}
                    contentViewType="vertical"
                    heading={activeSnapshot.metadata.name}
                    headerDescription={activeSnapshot.metadata.htmldescription}
                    withBorderAndHeaderBackground
                >
                    <TextOutput
                        strongLabel
                        label="Snapshot date"
                        value={activeSnapshot.metadata.todate}
                        valueType="date"
                    />
                    <TextOutput
                        strongLabel
                        label="Affected countries"
                        value={activeSnapshot.metadata.country}
                    />
                    <TextOutput
                        strongLabel
                        label="Windspeed"
                        value={Number(activeSnapshot.metadata.current_windspeed)}
                        valueType="number"
                        suffix=" km/h"
                    />
                    <TextOutput
                        strongLabel
                        label="Storm category"
                        value={activeSnapshot.metadata.current_stormstatus}
                    />
                    <Link
                        external
                        href={activeSnapshot.metadata.link}
                        withLinkIcon
                        withUnderline
                    >
                        More info
                    </Link>
                </Container>
            </div>
            <div className={styles.timeline}>
                <Button
                    className={styles.playPauseButton}
                    name={!isPlaying}
                    onClick={setIsPlaying}
                    variant="secondary"
                >
                    {isPlaying
                        ? <CheckboxBlankFillIcon className={styles.icon} />
                        : <PlayIcon className={styles.icon} />}
                </Button>
                <div className={styles.snapshotPoints}>
                    <div className={styles.windSpeedList}>
                        {windSpeeds?.map((ws, i) => (
                            <div
                                className={_cs(
                                    styles.windSpeedBar,
                                    ws.index === activeSnapshotIndex && styles.active,
                                    ws.index === hoveredIndex && styles.hovered,
                                )}
                                key={ws.key}
                                style={{
                                    height: `${ws.height}%`,
                                    left: `${(timePoints?.[i].normalizedOffset ?? 0) + timelinePointWidth / 2}%`,
                                    width: `${timelinePointWidth}%`,
                                }}
                            />
                        ))}
                    </div>
                    <div
                        className={styles.track}
                        style={{
                            width: `${100 * normalizationFactor}%`,
                            left: `${globalOffset}%`,
                        }}
                    />
                    <div
                        className={styles.progress}
                        style={{
                            width: `${timePoints?.[activeSnapshotIndex].normalizedOffset}%`,
                            left: `${globalOffset}%`,
                        }}
                    />
                    {timePoints?.map((timePoint) => (
                        <div
                            key={timePoint.key}
                            className={_cs(
                                styles.snapshotDot,
                                timePoint.index === hoveredIndex && styles.hovered,
                                timePoint.index === activeSnapshotIndex && styles.active,
                                timePoint.index < activeSnapshotIndex && styles.past,
                            )}
                            style={{
                                left: `${timePoint.normalizedOffset + globalOffset}%`,
                            }}
                        />
                    ))}
                    <div className={styles.clickZones}>
                        {timePoints?.map((timePoint) => (
                            <RawButton
                                key={timePoint.key}
                                name={timePoint.index}
                                onClick={setActiveSnapshotIndex}
                                className={styles.clickZone}
                                style={{
                                    left: `${timePoint.normalizedOffset}%`,
                                    width: `${timelinePointWidth}%`,
                                }}
                                title={timePoint.label}
                                onMouseOver={getClickZoneHoverHandler(timePoint.index)}
                                onMouseOut={getClickZoneHoverHandler(undefined)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Page>
    );
}

Component.displayName = 'ChidoTwentyFive';
