import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { ArtboardLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    DateInput,
    LegendItem,
    RadioInput,
    SelectInput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    hasSomeDefinedValue,
    resolveToComponent,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToMap,
    unique,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import { type LngLatBoundsLike } from 'mapbox-gl';

import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import DistrictSearchMultiSelectInput, { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import Link from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import useInputState from '#hooks/useInputState';
import {
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import type {
    GoApiResponse,
    GoApiUrlQuery,
} from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import GlobalMap, { type AdminZeroFeatureProperties } from '../GlobalMap';
import {
    APPEAL_TYPE_DREF,
    APPEAL_TYPE_EAP,
    APPEAL_TYPE_EMERGENCY,
    APPEAL_TYPE_MULTIPLE,
    basePointLayerOptions,
    COLOR_DREF,
    COLOR_EAP,
    COLOR_EMERGENCY_APPEAL,
    COLOR_MULTIPLE_TYPES,
    optionKeySelector,
    optionLabelSelector,
    outerCircleLayerOptionsForFinancialRequirements,
    outerCircleLayerOptionsForPeopleTargeted,
    type ScaleOption,
} from './utils';

import i18n from './i18n.json';
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

interface ClickedPoint {
    featureProperties: AdminZeroFeatureProperties;
    lngLat: mapboxgl.LngLatLike;
}

type BaseProps = {
    className?: string;
    onPresentationModeButtonClick?: () => void;
    presentationMode?: boolean;
    bbox: LngLatBoundsLike | undefined;
}

type CountryProps = {
    variant: 'country';
    countryId: number;
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

    const query = useMemo<AppealQueryParams>(
        () => {
            const baseQuery: AppealQueryParams = {
                atype: filter.appeal,
                dtype: filter.displacement,
                district: hasSomeDefinedValue(filter.district) ? filter.district : undefined,
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
                region: isDefined(regionId) ? [regionId] : undefined,
                country: isDefined(countryId) ? [countryId] : undefined,
            };
        },
        [variant, regionId, filter, limit, countryId],
    );

    const [
        clickedPoint,
        setClickedPoint,
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

    const allAppealsType = useMemo(() => {
        if (isDefined(countryId)) {
            return {
                searchParam: `country=${countryId}`,
                title: strings.operationMapViewAllInCountry,
            };
        }
        if (isDefined(regionId)) {
            return {
                searchParam: `region=${regionId}`,
                title: strings.operationMapViewAllInRegion,
            };
        }
        return {
            searchParam: undefined,
            title: strings.operationMapViewAll,
        };
    }, [
        countryId,
        regionId,
        strings.operationMapViewAllInCountry,
        strings.operationMapViewAllInRegion,
        strings.operationMapViewAll,
    ]);

    const heading = resolveToComponent(
        strings.activeOperationsTitle,
        { numAppeals: appealResponse?.count ?? '--' },
    );

    const handleCountryClick = useCallback((
        featureProperties: AdminZeroFeatureProperties,
        lngLat: mapboxgl.LngLatLike,
    ) => {
        setClickedPoint({
            featureProperties,
            lngLat,
        });

        return true;
    }, []);

    const handlePointClose = useCallback(
        () => {
            setClickedPoint(undefined);
        },
        [setClickedPoint],
    );

    const handleClearFiltersButtonClick = useCallback(() => {
        setFilter({});
    }, [setFilter]);

    const popupDetails = clickedPoint
        ? countryGroupedAppeal[clickedPoint.featureProperties.iso3]
        : undefined;

    const [districtOptions, setDistrictOptions] = useState<DistrictItem[] | null | undefined>();

    return (
        <Container
            className={_cs(styles.activeOperationMap, className)}
            heading={!presentationMode && heading}
            withHeaderBorder={!presentationMode}
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
                        <DistrictSearchMultiSelectInput
                            name="district"
                            placeholder={strings.operationFilterDistrictPlaceholder}
                            label={strings.operationMapProvinces}
                            value={rawFilter.district}
                            options={districtOptions}
                            onOptionsChange={setDistrictOptions}
                            onChange={setFilterField}
                            countryId={countryId}
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
                        label={strings.operationDisasterType}
                        name="displacement"
                        value={rawFilter.displacement}
                        onChange={setFilterField}
                    />
                    <div className={styles.clearButton}>
                        <Button
                            name={undefined}
                            onClick={handleClearFiltersButtonClick}
                            variant="secondary"
                            disabled={!filtered}
                        >
                            {strings.operationMapClearFilters}
                        </Button>
                    </div>
                </>
            )}
            actions={!presentationMode && (
                <Link
                    to="allAppeals"
                    urlSearch={allAppealsType.searchParam}
                    withLinkIcon
                    withUnderline
                >
                    {allAppealsType.title}
                </Link>
            )}
        >
            <GlobalMap
                onAdminZeroFillClick={handleCountryClick}
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
                {clickedPoint?.lngLat && (
                    <MapPopup
                        onCloseButtonClick={handlePointClose}
                        coordinates={clickedPoint.lngLat}
                        heading={(
                            <Link
                                to="countriesLayout"
                                urlParams={{
                                    countryId: clickedPoint.featureProperties.country_id,
                                }}
                            >
                                {clickedPoint.featureProperties.name}
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
            </GlobalMap>
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
