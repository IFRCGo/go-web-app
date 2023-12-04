import {
    useMemo,
    useCallback,
    useState,
} from 'react';
import type { LngLatBoundsLike } from 'mapbox-gl';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToMap,
    unique,
} from '@togglecorp/fujs';
import {
    MapSource,
    MapLayer,
    MapBounds,
} from '@togglecorp/re-map';
import {
    ArtboardLineIcon,
    CloseLineIcon,
} from '@ifrc-go/icons';

import BaseMap from '#components/domain/BaseMap';
import Button from '#components/Button';
import Container from '#components/Container';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import LegendItem from '#components/LegendItem';
import Link from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import MultiSelectInput from '#components/MultiSelectInput';
import RadioInput from '#components/RadioInput';
import SelectInput from '#components/SelectInput';
import TextOutput from '#components/TextOutput';
import useFilterState from '#hooks/useFilterState';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useInputState from '#hooks/useInputState';
import { useRequest } from '#utils/restRequest';
import type { GoApiUrlQuery, GoApiResponse } from '#utils/restRequest';
import {
    numericIdSelector,
    stringNameSelector,
} from '#utils/selectors';
import {
    adminFillLayerOptions,
} from '#utils/map';
import { resolveToComponent } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';
import { hasSomeDefinedValue, sumSafe } from '#utils/common';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import { DEFAULT_MAP_PADDING, DURATION_MAP_ZOOM } from '#utils/constants';
import DateInput from '#components/DateInput';

import i18n from './i18n.json';
import {
    ScaleOption,
    optionKeySelector,
    optionLabelSelector,
    outerCircleLayerOptionsForFinancialRequirements,
    outerCircleLayerOptionsForPeopleTargeted,
    basePointLayerOptions,
    COLOR_EMERGENCY_APPEAL,
    COLOR_DREF,
    COLOR_EAP,
    COLOR_MULTIPLE_TYPES,
    APPEAL_TYPE_DREF,
    APPEAL_TYPE_EMERGENCY,
    APPEAL_TYPE_EAP,
    APPEAL_TYPE_MULTIPLE,
} from './utils';
import styles from './styles.module.css';

type AppealQueryParams = GoApiUrlQuery<'/api/v2/appeal/'>;
type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type AppealTypeOption = NonNullable<GlobalEnumsResponse['api_appeal_type']>[number];

const appealTypeKeySelector = (option: AppealTypeOption) => option.key;
const appealTypeLabelSelector = (option: AppealTypeOption) => option.value;

const now = new Date().toISOString();
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

type DistrictListItem = NonNullable<GoApiResponse<'/api/v2/district/'>['results']>[number];

type BaseProps = {
    className?: string;
    onPresentationModeButtonClick?: () => void;
    presentationMode?: boolean;
    bbox: LngLatBoundsLike | undefined;
}

type CountryProps = {
    variant: 'country';
    countryId: number;
    districtList: DistrictListItem[];
}
type RegionProps = {
    variant: 'region';
    regionId: number;
}

type GlobalProps = {
    variant: 'global';
}

type Props = BaseProps & (RegionProps | GlobalProps | CountryProps);

function ActiveOperationMap(props: Props) {
    const {
        className,
        variant,
        onPresentationModeButtonClick,
        presentationMode = false,
        bbox,
    } = props;

    const {
        filter,
        filtered,
        limit,
        rawFilter,
        setFilter,
        setFilterField,
    } = useFilterState<{
        appeal?: AppealTypeOption['key'],
        district?: number[],
        displacement?: number,
        startDateAfter?: string,
        startDateBefore?: string,
    }>({
        filter: {},
        pageSize: 9999,
    });

    // eslint-disable-next-line react/destructuring-assignment
    const regionId = variant === 'region' ? props.regionId : undefined;
    // eslint-disable-next-line react/destructuring-assignment
    const countryId = variant === 'country' ? props.countryId : undefined;
    // eslint-disable-next-line react/destructuring-assignment
    const districtList = variant === 'country' ? props.districtList : undefined;

    const query = useMemo<AppealQueryParams>(
        () => {
            const baseQuery: AppealQueryParams = {
                atype: filter.appeal,
                dtype: filter.displacement,
                end_date__gt: now,
                start_date__gte: filter.startDateAfter,
                start_date__lte: filter.startDateBefore,
                limit,
            };

            if (variant === 'global') {
                return baseQuery;
            }

            return {
                ...baseQuery,
                region: regionId ? [regionId] : undefined,
                country: countryId ? [countryId] : undefined,
                district: hasSomeDefinedValue(filter.district) ? filter.district : undefined,
            };
        },
        [variant, regionId, filter, limit, countryId],
    );

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint| undefined>();

    const [scaleBy, setScaleBy] = useInputState<ScaleOption['value']>('peopleTargeted');
    const strings = useTranslation(i18n);
    const { api_appeal_type: appealTypeOptions } = useGlobalEnums();
    const {
        response: appealResponse,
    } = useRequest({
        url: '/api/v2/appeal/',
        query,
    });

    const countryResponse = useCountryRaw();

    const scaleOptions: ScaleOption[] = useMemo(() => ([
        { value: 'peopleTargeted', label: strings.explanationBubblePopulationLabel },
        { value: 'financialRequirements', label: strings.explanationBubbleAmountLabel },
    ]), [
        strings.explanationBubblePopulationLabel,
        strings.explanationBubbleAmountLabel,
    ]);

    const legendOptions = useMemo(() => ([
        {
            value: APPEAL_TYPE_EMERGENCY,
            label: strings.explanationBubbleEmergencyAppeal,
            color: COLOR_EMERGENCY_APPEAL,
        },
        {
            value: APPEAL_TYPE_DREF,
            label: strings.explanationBubbleDref,
            color: COLOR_DREF,
        },
        {
            value: APPEAL_TYPE_EAP,
            label: strings.explanationBubbleEAP,
            color: COLOR_EAP,
        },
        {
            value: APPEAL_TYPE_MULTIPLE,
            label: strings.explanationBubbleMultiple,
            color: COLOR_MULTIPLE_TYPES,
        },
    ]), [
        strings.explanationBubbleEmergencyAppeal,
        strings.explanationBubbleDref,
        strings.explanationBubbleEAP,
        strings.explanationBubbleMultiple,
    ]);

    const countryGroupedAppeal = useMemo(() => (
        listToGroupList(
            appealResponse?.results ?? [],
            (appeal) => appeal.country.iso3 ?? '<no-key>',
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
                        appealList.map((appeal) => appeal.num_beneficiaries),
                    );
                    const financialRequirements = sumSafe(
                        appealList.map((appeal) => appeal.amount_requested),
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
                features: countryResponse
                    ?.map((country) => {
                        if (
                            (!country.independent && isNotDefined(country.record_type))
                            || isNotDefined(country.centroid)
                            || isNotDefined(country.iso3)
                        ) {
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

    const handleClearFiltersButtonclick = useCallback(() => {
        setFilter({});
    }, [setFilter]);

    const popupDetails = clickedPointProperties
        ? countryGroupedAppeal[clickedPointProperties.feature.properties.iso3]
        : undefined;

    return (
        <Container
            className={_cs(styles.activeOperationMap, className)}
            heading={!presentationMode && heading}
            withHeaderBorder={!presentationMode}
            filtersContainerClassName={styles.filters}
            childrenContainerClassName={styles.content}
            filters={!presentationMode && (
                <>
                    <DateInput
                        name="startDateAfter"
                        label={strings.mapStartDateAfter}
                        onChange={setFilterField}
                        value={rawFilter.startDateAfter}
                    />
                    <DateInput
                        name="startDateBefore"
                        label={strings.mapStartDateBefore}
                        onChange={setFilterField}
                        value={rawFilter.startDateBefore}
                    />
                    {variant === 'country' && (
                        <MultiSelectInput
                            name="district"
                            label={strings.operationMapProvinces}
                            options={districtList}
                            value={rawFilter.district}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            onChange={setFilterField}
                        />
                    )}
                    <SelectInput
                        placeholder={strings.operationFilterTypePlaceholder}
                        label={strings.operationType}
                        name="appeal"
                        value={rawFilter.appeal}
                        onChange={setFilterField}
                        keySelector={appealTypeKeySelector}
                        labelSelector={appealTypeLabelSelector}
                        options={appealTypeOptions}
                    />
                    <DisasterTypeSelectInput
                        placeholder={strings.operationFilterDisastersPlaceholder}
                        label={strings.operationDisastertype}
                        name="displacement"
                        value={rawFilter.displacement}
                        onChange={setFilterField}
                    />
                    <div className={styles.clearButton}>
                        <Button
                            name={undefined}
                            icons={<CloseLineIcon />}
                            onClick={handleClearFiltersButtonclick}
                            variant="tertiary"
                            disabled={!filtered}
                        >
                            {strings.clearFilters}
                        </Button>
                    </div>
                </>
            )}
            actions={!presentationMode && (
                <Link
                    to="allAppeals"
                    urlSearch={isDefined(regionId) ? `region=${regionId}` : undefined}
                    withLinkIcon
                    withUnderline
                >
                    {variant === 'region'
                        ? strings.operationMapViewAllInRegion
                        : strings.operationMapViewAll}
                </Link>
            )}
        >
            <BaseMap
                baseLayers={(
                    <MapLayer
                        layerKey="admin-0"
                        hoverable
                        layerOptions={adminFillLayerOptions}
                        onClick={handleCountryClick}
                    />
                )}
            >
                <MapContainerWithDisclaimer
                    className={styles.mapContainer}
                    title={strings.downloadMapTitle}
                    footer={(
                        <div className={styles.footer}>
                            <RadioInput
                                label={strings.explanationBubbleScalePoints}
                                name={undefined}
                                options={scaleOptions}
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                value={scaleBy}
                                onChange={setScaleBy}
                            />
                            <div className={styles.legend}>
                                {legendOptions.map((legendItem) => (
                                    <LegendItem
                                        key={legendItem.value}
                                        className={styles.legendItem}
                                        color={legendItem.color}
                                        label={legendItem.label}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                />
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
                        layerKey="point-outer-circle"
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
                                        value={appeal.num_beneficiaries}
                                        description={strings.operationPopoverPeopleAffected}
                                        valueType="number"
                                    />
                                    <TextOutput
                                        value={appeal.amount_requested}
                                        description={strings.operationPopoverAmountRequested}
                                        valueType="number"
                                    />
                                    <TextOutput
                                        value={appeal.amount_funded}
                                        description={strings.operationPopoverAmountFunded}
                                        valueType="number"
                                    />
                                </Container>
                            ),
                        )}
                        {(isNotDefined(popupDetails) || popupDetails.length === 0) && (
                            <div className={styles.empty}>
                                {strings.operationPopoverEmpty}
                            </div>
                        )}
                    </MapPopup>
                )}
                {isDefined(bbox) && (
                    <MapBounds
                        duration={DURATION_MAP_ZOOM}
                        bounds={bbox}
                        padding={DEFAULT_MAP_PADDING}
                    />
                )}
            </BaseMap>
            {onPresentationModeButtonClick && !presentationMode && (
                <Button
                    className={styles.presentationModeButton}
                    name={undefined}
                    icons={<ArtboardLineIcon />}
                    onClick={onPresentationModeButtonClick}
                    variant="secondary"
                >
                    {strings.presentationModeButton}
                </Button>
            )}
        </Container>
    );
}

export default ActiveOperationMap;
