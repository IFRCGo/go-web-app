import {
    useContext, useMemo, useCallback, useState,
} from 'react';
import { generatePath } from 'react-router-dom';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToMap,
    unique,
    sum,
} from '@togglecorp/fujs';
import Map, {
    MapContainer,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';
import { ChevronRightLineIcon } from '@ifrc-go/icons';

import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
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
import { Appeal } from '#types/emergency';
import { Country } from '#types/country';
import { resolveToComponent } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
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

interface Props {
    className?: string;
}

function ActiveOperationMap(props: Props) {
    const {
        className,
    } = props;

    const {
        country: countryRoute,
    } = useContext(RouteContext);

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint| undefined>();

    const [scaleBy, setScaleBy] = useInputState<ScaleOption['value']>('peopleTargeted');
    const strings = useTranslation(i18n);
    const {
        response: appealResponse,
    } = useRequest<ListResponse<Appeal>>({
        url: 'api/v2/appeal/',
        query: {
            end_date__gt: today,
            limit: 200,
        },
    });

    const {
        response: countryResponse,
    } = useRequest<ListResponse<Country>>({
        url: 'api/v2/country/',
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
            (appeal) => appeal.country.iso3,
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

                    const peopleTargeted = sum(
                        appealList.map((appeal) => appeal.num_beneficiaries),
                    );
                    const financialRequirements = sum(
                        appealList.map((appeal) => +appeal.amount_requested),
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
                    .filter((country) => country.independent || country.record_type)
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
                            geometry: country.centroid,
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
                    to="/"
                    actions={<ChevronRightLineIcon />}
                    underline
                >
                    {strings.operationMapViewAll}
                </Link>
            )}
        >
            <Map
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
                                        value={+appeal.num_beneficiaries}
                                        description={strings.operationPopoverPeopleAffected}
                                        valueType="number"
                                    />
                                    <TextOutput
                                        value={+appeal.amount_requested}
                                        description={strings.operationPopoverAmountRequested}
                                        valueType="number"
                                    />
                                    <TextOutput
                                        value={Math.round(+appeal.amount_funded)}
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
