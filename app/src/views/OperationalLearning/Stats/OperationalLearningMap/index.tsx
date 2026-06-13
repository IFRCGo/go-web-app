import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    DataDisplay,
    ListView,
    NumberDisplay,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { maxSafe } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import { type CirclePaint } from 'mapbox-gl';

import GlobalMap from '#components/domain/GlobalMap';
import GoMapContainer from '#components/GoMapContainer';
import GradientBar from '#components/GradientBar';
import Link from '#components/Link';
import MapPopup from '#components/MapPopup';
import useCountry from '#hooks/domain/useCountry';
import {
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import { getCountryListBoundingBox } from '#utils/map';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type OperationLearningStatsResponse = GoApiResponse<'/api/v2/ops-learning/stats/'>;
const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

interface CountryProperties {
    countryId: number;
    name: string;
    learningCount: number;
}
interface ClickedPoint {
    feature: GeoJSON.Feature<GeoJSON.Point, CountryProperties>;
    lngLat: mapboxgl.LngLatLike;
}

const MIN_LEARNING_COUNT = 0;
const LEARNING_COUNT_LOW_COLOR = '#AEB7C2';
const LEARNING_COUNT_HIGH_COLOR = '#011E41';

interface Props {
    learningByCountry: OperationLearningStatsResponse['learning_by_country'] | undefined;
}

function OperationalLearningMap(props: Props) {
    const strings = useTranslation(i18n);
    const { learningByCountry } = props;

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const countries = useCountry();

    const countriesMap = useMemo(() => (
        listToMap(countries, (country) => country.id)
    ), [countries]);

    const learningCountGeoJSON = useMemo(
        (): GeoJSON.FeatureCollection<GeoJSON.Geometry> | undefined => {
            if ((countries?.length ?? 0) < 1 || (learningByCountry?.length ?? 0) < 1) {
                return undefined;
            }

            const features = learningByCountry
                ?.map((value) => {
                    const country = countriesMap?.[value.country_id];
                    if (isNotDefined(country)) {
                        return undefined;
                    }
                    return {
                        type: 'Feature' as const,
                        geometry: country.centroid as {
                        type: 'Point',
                        coordinates: [number, number],
                    },
                        properties: {
                            countryId: country.id,
                            name: country.name,
                            learningCount: value.count,
                        },
                    };
                })
                .filter(isDefined) ?? [];

            return {
                type: 'FeatureCollection',
                features,
            };
        },
        [learningByCountry, countriesMap, countries],
    );

    const bluePointHaloCirclePaint: CirclePaint = useMemo(() => {
        const countriesWithLearning = learningByCountry?.filter((value) => value.count > 0);

        const maxScaleValue = countriesWithLearning && countriesWithLearning.length > 0
            ? Math.max(
                ...(countriesWithLearning
                    .map((country) => country.count)),
            )
            : 0;

        return {
            'circle-opacity': 0.9,
            'circle-color': [
                'interpolate',
                ['linear'],
                ['number', ['get', 'learningCount']],
                0,
                LEARNING_COUNT_LOW_COLOR,
                maxScaleValue,
                LEARNING_COUNT_HIGH_COLOR,
            ],
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                3, 10,
                8, 15,
            ],
        };
    }, [learningByCountry]);

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

    const maxLearning = useMemo(() => (
        maxSafe(
            learningByCountry?.map((value) => value.count),
        )
    ), [learningByCountry]);

    const bounds = useMemo(
        () => {
            if (isNotDefined(learningByCountry)) {
                return undefined;
            }
            const countryList = learningByCountry
                .map((d) => countriesMap?.[d.country_id])
                .filter(isDefined);
            return getCountryListBoundingBox(countryList);
        },
        [countriesMap, learningByCountry],
    );

    return (
        <GlobalMap>
            <GoMapContainer
                title={strings.downloadMapTitle}
                footer={(
                    <DataDisplay
                        label={strings.learningCount}
                        value={(
                            <ListView
                                layout="block"
                                spacing="none"
                            >
                                <GradientBar
                                    startColor={LEARNING_COUNT_LOW_COLOR}
                                    endColor={LEARNING_COUNT_HIGH_COLOR}
                                />
                                <ListView withSpaceBetweenContents>
                                    <NumberDisplay value={MIN_LEARNING_COUNT} />
                                    <NumberDisplay value={maxLearning} />
                                </ListView>
                            </ListView>
                        )}
                    />
                )}
            />
            {isDefined(learningCountGeoJSON) && (
                <MapSource
                    sourceKey="points"
                    sourceOptions={sourceOptions}
                    geoJson={learningCountGeoJSON}
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
            )}
            {clickedPointProperties?.lngLat && (
                <MapPopup
                    onCloseButtonClick={handlePointClose}
                    coordinates={clickedPointProperties.lngLat}
                    heading={(
                        <Link
                            to="countriesLayout"
                            urlParams={{
                                countryId: clickedPointProperties.feature.properties.countryId,
                            }}
                        >
                            {clickedPointProperties.feature.properties.name}
                        </Link>
                    )}
                >
                    <Container
                        headingLevel={5}
                    >
                        <DataDisplay
                            value={clickedPointProperties.feature.properties.learningCount}
                            label={strings.learningCount}
                            valueType="number"
                        />
                    </Container>
                </MapPopup>
            )}
            {isDefined(bounds) && (
                <MapBounds
                    duration={DURATION_MAP_ZOOM}
                    bounds={bounds}
                    padding={DEFAULT_MAP_PADDING}
                />
            )}
        </GlobalMap>
    );
}

export default OperationalLearningMap;
