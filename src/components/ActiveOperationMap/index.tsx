import {
    useContext,
    useMemo,
    useCallback,
    useState,
} from 'react';
import { generatePath } from 'react-router-dom';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToMap,
    unique,
} from '@togglecorp/fujs';
import Map, {
    MapContainer,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';

import { useRequest } from '#utils/restRequest';
import GoMapDisclaimer from '#components/GoMapDisclaimer';
import RadioInput from '#components/RadioInput';
import Container from '#components/Container';
import Link from '#components/Link';
import MapPopup from '#components/MapPopup';
import TextOutput from '#components/TextOutput';
import useInputState from '#hooks/useInputState';
import {
    defaultMapStyle,
    defaultMapOptions,
} from '#utils/map';
import { paths } from '#generated/types';
import { resolveToComponent } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { sumSafe } from '#utils/common';

import i18n from './i18n.json';
import {
    ScaleOption,
    getScaleOptions,
    getLegendOptions,
    optionKeySelector,
    optionLabelSelector,
    outerCircleLayerOptionsForFinancialRequirements,
    outerCircleLayerOptionsForPeopleTargeted,
    basePointLayerOptions,
    APPEAL_TYPE_MULTIPLE,

    adminFillLayerOptions,
    adminLabelLayerOptions,
} from './utils';
import styles from './styles.module.css';

type GetAppeal = paths['/api/v2/appeal/']['get'];
type AppealQueryParams = GetAppeal['parameters']['query'];
type AppealResponse = GetAppeal['responses']['200']['content']['application/json'];

type GetCountry = paths['/api/v2/country/']['get'];
type CountryResponse = GetCountry['responses']['200']['content']['application/json'];

const today = new Date().toISOString();
const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

interface CountryProperties {
    country_id: number;
    disputed: boolean;
    fdrs: string;
    independent: boolean;
    is_deprecated: boolean;
    iso: string;
    iso3: string;
    name: string;
    name_ar: string;
    name_es: string;
    name_fr: string;
    record_type: number;
    region_id: number;
}

interface ClickedPoint {
    feature: GeoJSON.Feature<GeoJSON.Point, CountryProperties>;
    lngLat: mapboxgl.LngLatLike;
}

type BaseProps = {
    className?: string;
}

type RegionProps = {
    variant: 'region';
    regionId: number;
}

type GlobalProps = {
    variant: 'global';
}

type Props = BaseProps & (RegionProps | GlobalProps);

function ActiveOperationMap(props: Props) {
    const {
        className,
        variant,
    } = props;

    // eslint-disable-next-line react/destructuring-assignment
    const regionId = variant === 'region' ? props.regionId : undefined;
    const query = useMemo<AppealQueryParams>(
        () => {
            if (variant === 'global') {
                return {
                    end_date__gt: today,
                    limit: 200,
                };
            }

            return {
                end_date__gt: today,
                limit: 200,
                region: regionId,
            };
        },
        [variant, regionId],
    );

    const {
        country: countryRoute,
        allAppeals: allAppealsRoute,
    } = useContext(RouteContext);

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint| undefined>();

    const [scaleBy, setScaleBy] = useInputState<ScaleOption['value']>('peopleTargeted');
    const strings = useTranslation(i18n);
    const {
        response: appealResponse,
    } = useRequest<AppealResponse>({
        url: 'api/v2/appeal/',
        query,
    });

    const {
        response: countryResponse,
    } = useRequest<CountryResponse>({
        url: 'api/v2/country/',
        // FIXME: only pull countries in the region
        query: {
            limit: 500,
        },
    });

    const [
        scaleOptions,
        legendOptions,
    ] = useMemo(() => ([
        getScaleOptions(strings),
        getLegendOptions(strings),
    ]), [strings]);

    const countryGroupedAppeal = useMemo(() => (
        listToGroupList(
            appealResponse?.results ?? [],
            (appeal) => appeal.country.iso3 ?? '',
        )
    ), [appealResponse]);

    const countryCentroidGeoJson = useMemo(
        (): GeoJSON.FeatureCollection<GeoJSON.Geometry> => {
            const countryToOperationTypeMap = mapToMap(
                countryGroupedAppeal,
                (key) => key,
                (appealList) => {
                    const uniqueAppealList = unique(
                        appealList.map((appeal) => appeal.atype),
                    );

                    const peopleTargeted = sumSafe(
                        appealList.map((appeal) => Number(appeal.num_beneficiaries)),
                    );
                    const financialRequirements = sumSafe(
                        appealList.map((appeal) => Number(appeal.amount_requested)),
                    );

                    if (uniqueAppealList.length > 1) {
                        // multiple types
                        return {
                            appealType: APPEAL_TYPE_MULTIPLE,
                            peopleTargeted,
                            financialRequirements,
                        };
                    }

                    return {
                        appealType: uniqueAppealList[0],
                        peopleTargeted,
                        financialRequirements,
                    };
                },
            );

            return {
                type: 'FeatureCollection' as const,
                features: countryResponse?.results
                    ?.filter((country) => country.independent || country.record_type)
                    .map((country) => {
                        if (!country.centroid || !country.iso3) {
                            return undefined;
                        }

                        const operation = countryToOperationTypeMap[country.iso3];
                        if (isNotDefined(operation)) {
                            return undefined;
                        }

                        return {
                            type: 'Feature' as const,
                            geometry: country.centroid as {
                                type: 'Point',
                                coordinates: [number, number],
                            },
                            properties: {
                                id: country.iso3,
                                appealType: operation.appealType,
                                peopleTargeted: operation.peopleTargeted,
                                financialRequirements: operation.financialRequirements,
                            },
                        };
                    }).filter(isDefined) ?? [],
            };
        },
        [countryResponse, countryGroupedAppeal],
    );

    const heading = resolveToComponent(
        strings.activeOperationsTitle,
        { numAppeals: appealResponse?.count ?? '--' },
    );

    const handleCountryClick = useCallback((
        feature: mapboxgl.MapboxGeoJSONFeature,
        lngLat: mapboxgl.LngLatLike,
    ) => {
        setClickedPointProperties({
            feature: feature as unknown as ClickedPoint['feature'],
            lngLat,
        });
        return false;
    }, []);

    const handlePointClose = useCallback(
        () => {
            setClickedPointProperties(undefined);
        },
        [setClickedPointProperties],
    );

    const popupDetails = clickedPointProperties
        ? countryGroupedAppeal[clickedPointProperties.feature.properties.iso3]
        : undefined;

    return (
        <Container
            className={_cs(styles.activeOperationMap, className)}
            heading={heading}
            withHeaderBorder
            actions={(
                <Link
                    to={{
                        pathname: allAppealsRoute.absolutePath,
                        search: variant === 'region' ? `region=${regionId}` : undefined,
                    }}
                    withForwardIcon
                    withUnderline
                >
                    {variant === 'region'
                        ? strings.operationMapViewAllInRegion
                        : strings.operationMapViewAll}
                </Link>
            )}
        >
            <Map
                // FIXME: add bounds for region variant
                mapStyle={defaultMapStyle}
                mapOptions={defaultMapOptions}
                navControlShown
                navControlPosition="top-right"
            >
                <div className={styles.mapContainerWrapper}>
                    <MapContainer className={styles.mapContainer} />
                    <GoMapDisclaimer className={styles.mapDisclaimer} />
                </div>
                <MapSource
                    sourceKey="composite"
                    managed={false}
                >
                    <MapLayer
                        layerKey="admin-0"
                        hoverable
                        layerOptions={adminFillLayerOptions}
                        onClick={handleCountryClick}
                    />
                    <MapLayer
                        layerKey="admin-0-label"
                        layerOptions={adminLabelLayerOptions}
                    />
                    <MapLayer
                        layerKey="admin-0-label-priority"
                        layerOptions={adminLabelLayerOptions}
                    />
                </MapSource>
                <MapSource
                    sourceKey="points"
                    sourceOptions={sourceOptions}
                    geoJson={countryCentroidGeoJson}
                >
                    <MapLayer
                        layerKey="point-circle"
                        layerOptions={basePointLayerOptions}
                    />
                    <MapLayer
                        key={scaleBy}
                        layerKey="outer-circle"
                        layerOptions={
                            scaleBy === 'peopleTargeted'
                                ? outerCircleLayerOptionsForPeopleTargeted
                                : outerCircleLayerOptionsForFinancialRequirements
                        }
                    />
                </MapSource>
                {clickedPointProperties?.lngLat && (
                    <MapPopup
                        onCloseButtonClick={handlePointClose}
                        coordinates={clickedPointProperties.lngLat}
                        heading={(
                            <Link
                                to={
                                    generatePath(
                                        countryRoute.absolutePath,
                                        // eslint-disable-next-line max-len
                                        { countryId: clickedPointProperties.feature.properties.country_id },
                                    )
                                }
                            >
                                {clickedPointProperties.feature.properties.name}
                            </Link>
                        )}
                        childrenContainerClassName={styles.popupContent}
                    >
                        {popupDetails?.map(
                            (appeal) => (
                                <Container
                                    key={appeal.id}
                                    className={styles.popupAppeal}
                                    childrenContainerClassName={styles.popupAppealDetail}
                                    heading={appeal.name}
                                    headingLevel={5}
                                >
                                    <TextOutput
                                        value={Number(appeal.num_beneficiaries)}
                                        description={strings.operationPopoverPeopleAffected}
                                        valueType="number"
                                    />
                                    <TextOutput
                                        value={Number(appeal.amount_requested)}
                                        description={strings.operationPopoverAmountRequested}
                                        valueType="number"
                                    />
                                    <TextOutput
                                        value={Number(appeal.amount_funded)}
                                        description={strings.operationPopoverAmountFunded}
                                        valueType="number"
                                    />
                                </Container>
                            ),
                        )}
                        {(!popupDetails || popupDetails.length === 0) && (
                            <div className={styles.empty}>
                                {strings.operationPopoverEmpty}
                            </div>
                        )}
                    </MapPopup>
                )}
            </Map>
            <div className={styles.footer}>
                <div className={styles.left}>
                    <RadioInput
                        label={strings.explanationBubbleScalePoints}
                        name={undefined}
                        options={scaleOptions}
                        keySelector={optionKeySelector}
                        labelSelector={optionLabelSelector}
                        value={scaleBy}
                        onChange={setScaleBy}
                    />
                </div>
                <div className={styles.legend}>
                    {legendOptions.map((legendItem) => (
                        <div
                            key={legendItem.value}
                            className={styles.legendItem}
                        >
                            <div
                                className={styles.color}
                                style={{ backgroundColor: legendItem.color }}
                            />
                            <div className={styles.label}>
                                {legendItem.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
}

export default ActiveOperationMap;
