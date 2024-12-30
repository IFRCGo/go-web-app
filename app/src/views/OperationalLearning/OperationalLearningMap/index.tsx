import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    NumberOutput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { maxSafe } from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';

import GlobalMap from '#components/domain/GlobalMap';
import Link from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import useCountry from '#hooks/domain/useCountry';
import {
    COLOR_BLUE,
    COLOR_LIGHT_BLUE,
} from '#utils/constants';
import {
    adminFillLayerOptions,
    getPointCircleHaloPaint,
} from '#utils/map';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type learningStatsResponse = GoApiResponse<'/api/v2/ops-learning/stats/'>;
const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

interface CountryProperties {
    country_id: number;
    name: string;
    operation_count: number;
}
interface ClickedPoint {
    feature: GeoJSON.Feature<GeoJSON.Point, CountryProperties>;
    lngLat: mapboxgl.LngLatLike;
}

const LEARNINGS_LOW_COLOR = COLOR_LIGHT_BLUE;
const LEARNINGS_HIGH_COLOR = COLOR_BLUE;

interface Props {
    className?: string;
    learning: learningStatsResponse | undefined;
 }

function OperationalLearningMap(props: Props) {
    const strings = useTranslation(i18n);
    const {
        className,
        learning,
    } = props;

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const countryResponse = useCountry();

    const learningByCountry = useMemo(() => {
        const map: Record<number, { count: number }> = {};
        learning?.learning_by_country.forEach((item) => {
            map[item.country_id] = item;
        });
        return map;
    }, [learning]);

    const countryCentroidGeoJson = useMemo(
        (): GeoJSON.FeatureCollection<GeoJSON.Geometry> => {
            const features = countryResponse
                ?.map((country) => {
                    const learningList = learningByCountry[country.id];
                    if (isNotDefined(learningList)) {
                        return undefined;
                    }
                    const units = learningList.count;
                    return {
                        type: 'Feature' as const,
                        geometry: country.centroid as {
                        type: 'Point',
                        coordinates: [0, 0],
                    },
                        properties: {
                            country_id: country.id,
                            name: country.name,
                            operation_count: units,
                        },
                    };
                })
                .filter(isDefined) ?? [];
            return {
                type: 'FeatureCollection',
                features,
            };
        },
        [countryResponse, learningByCountry],
    );

    const bluePointHaloCirclePaint = useMemo(() => {
        const learningCount = learning?.learning_by_country
            .filter((country) => country.count > 0);

        const maxScaleValue = learningCount && learningCount.length > 0
            ? Math.max(
                ...(learningCount
                    .map((activity: { count: number; }) => activity.count)
                    .filter(isDefined) ?? []),
            )
            : 0;

        return getPointCircleHaloPaint(COLOR_BLUE, 'operation_count', maxScaleValue);
    }, [learning]);

    const handlePointClose = useCallback(() => {
        setClickedPointProperties(undefined);
    }, []);

    const handlePointClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLatLike) => {
            setClickedPointProperties({
                feature: feature as unknown as ClickedPoint['feature'],
                lngLat,
            });
            return true;
        },
        [setClickedPointProperties],
    );

    const maxLearning = useMemo(() => {
        const learningData = learning?.learning_by_country.filter(
            ({ count }) => isDefined(count),
        );

        return maxSafe(
            learningData?.map(({ count }) => count),
        );
    }, [learning]);

    return (
        <Container
            className={_cs(styles.learningMap, className)}
            footerClassName={styles.footer}
            footerContent={(
                <div className={styles.learningsLegend}>
                    <div className={styles.legendLabel}>{strings.learningLegendLabel}</div>
                    <div className={styles.legendContent}>
                        <div
                            className={styles.learningGradient}
                            style={{ background: `linear-gradient(90deg, ${LEARNINGS_LOW_COLOR}, ${LEARNINGS_HIGH_COLOR})` }}
                        />
                        <div className={styles.labelList}>
                            <NumberOutput
                                value={0}
                            />
                            <NumberOutput
                                value={maxLearning}
                            />
                        </div>
                    </div>
                </div>
            )}
        >
            <GlobalMap
                baseLayers={(
                    <MapLayer
                        layerKey="admin-0"
                        hoverable
                        layerOptions={adminFillLayerOptions}
                        onClick={handlePointClick}
                    />
                )}
            >
                <MapContainerWithDisclaimer
                    className={styles.mapContainer}
                    title={strings.downloadMapTitle}
                />
                <MapSource
                    sourceKey="points"
                    sourceOptions={sourceOptions}
                    geoJson={countryCentroidGeoJson}
                >
                    <MapLayer
                        layerKey="points-circle"
                        onClick={handlePointClick}
                        layerOptions={{
                            type: 'circle',
                            paint: bluePointHaloCirclePaint,
                        }}
                    />
                </MapSource>
                {clickedPointProperties?.lngLat && (
                    <MapPopup
                        onCloseButtonClick={handlePointClose}
                        coordinates={clickedPointProperties.lngLat}
                        heading={(
                            <Link
                                to="countriesLayout"
                                urlParams={{
                                    countryId: clickedPointProperties.feature.properties.country_id,
                                }}
                            >
                                {clickedPointProperties.feature.properties.name}
                            </Link>
                        )}
                        childrenContainerClassName={styles.popupContent}
                    >
                        <Container
                            className={styles.popupEvent}
                            childrenContainerClassName={styles.popupEventDetail}
                            headingLevel={5}
                        >
                            <TextOutput
                                value={clickedPointProperties.feature.properties.operation_count}
                                label={strings.learningCountLegendLabel}
                                valueType="number"
                            />
                        </Container>
                    </MapPopup>
                )}
            </GlobalMap>
        </Container>
    );
}

export default OperationalLearningMap;
