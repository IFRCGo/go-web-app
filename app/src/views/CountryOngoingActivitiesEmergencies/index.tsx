import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    ArtboardLineIcon,
    PencilFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    LegendItem,
    Pager,
    RadioInput,
    Table,
    TextOutput,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createNumberColumn,
    createProgressColumn,
    createStringColumn,
    getPercentage,
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
import getBbox from '@turf/bbox';

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
    ScaleOption,
} from '#components/domain/ActiveOperationMap/utils';
import BaseMap from '#components/domain/BaseMap';
import HighlightedOperations from '#components/domain/HighlightedOperations';
import Link from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import WikiLink from '#components/WikiLink';
import { adminUrl } from '#config';
import useAuth from '#hooks/domain/useAuth';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import useFilterState from '#hooks/useFilterState';
import useInputState from '#hooks/useInputState';
import {
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import { adminFillLayerOptions } from '#utils/map';
import { type CountryOutletContext } from '#utils/outletContext';
import { resolveUrl } from '#utils/resolveUrl';
import type {
    GoApiResponse,
    GoApiUrlQuery,
} from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import CountryKeyFigures from './CountryKeyFigures';
import Filters from './Filters';

import i18n from './i18n.json';
import styles from './styles.module.css';

type AppealQueryParams = GoApiUrlQuery<'/api/v2/appeal/'>;
type AppealResponse = GoApiResponse<'/api/v2/appeal/'>;
type AppealListItem = NonNullable<AppealResponse['results']>[number];

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type AppealTypeOption = NonNullable<GlobalEnumsResponse['api_appeal_type']>[number];

const appealKeySelector = (option: AppealListItem) => option.id;
const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

const now = new Date().toISOString();
type BaseProps = {
    className?: string;
    presentationMode?: boolean;
    onPresentationModeButtonClick?: () => void;
}

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

// eslint-disable-next-line import/prefer-default-export
export function Component(props: BaseProps) {
    const {
        className,
        onPresentationModeButtonClick,
        presentationMode = false,
    } = props;

    const strings = useTranslation(i18n);
    const { isAuthenticated } = useAuth();

    const {
        countryId,
        // Note: countryResponse is used only for bounds
        countryResponse,
    } = useOutletContext<CountryOutletContext>();
    const countryRawResponse = useCountryRaw();

    const {
        filter,
        filtered,
        limit,
        page,
        rawFilter,
        setFilter,
        setFilterField,
        setPage,
        sortState,
    } = useFilterState<{
        appeal?: AppealTypeOption['key'],
        district?: number[],
        displacement?: number,
        startDateAfter?: string,
        startDateBefore?: string,
    }>({
        filter: {},
        pageSize: 5,
    });

    const countryBounds = useMemo(() => (
        (countryResponse && countryResponse.bbox)
            ? getBbox(countryResponse.bbox)
            : undefined
    ), [countryResponse]);

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

            return {
                ...baseQuery,
                region: undefined,
                country: countryId ? Number(countryId) : undefined,
            };
        },
        [filter, limit, countryId],
    );

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();
    const isFiltered = hasSomeDefinedValue(rawFilter);

    const [scaleBy, setScaleBy] = useInputState<ScaleOption['value']>('peopleTargeted');

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
        error: aggregatedAppealError,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/appeal/aggregated',
        query: { country: Number(countryId) },
    });

    const {
        pending: appealsPending,
        response: appealsResponse,
        error: appealsResponseError,
    } = useRequest({
        url: '/api/v2/appeal/',
        preserveResponse: true,
        query,
    });

    const heading = resolveToComponent(
        strings.countryOngoingActiveOperationsTitle,
        { numAppeals: appealsResponse?.count ?? '--' },
    );

    const columns = useMemo(
        () => ([
            createDateColumn<AppealListItem, number>(
                'start_date',
                strings.appealsTableStartDate,
                (item) => item.start_date,
                {
                    sortable: true,
                    columnClassName: styles.startDate,
                },
            ),
            createStringColumn<AppealListItem, number>(
                'atype',
                strings.appealsTableType,
                (item) => item.atype_display,
                {
                    sortable: true,
                    columnClassName: styles.appealType,
                },
            ),
            createStringColumn<AppealListItem, number>(
                'code',
                strings.appealsTableCode,
                (item) => item.code,
                {
                    columnClassName: styles.code,
                },
            ),
            createLinkColumn<AppealListItem, number>(
                'operation',
                strings.appealsTableOperation,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.event },
                }),
            ),
            createStringColumn<AppealListItem, number>(
                'dtype',
                strings.appealsTableDisastertype,
                (item) => item.dtype?.name,
                { sortable: true },
            ),
            createNumberColumn<AppealListItem, number>(
                'amount_requested',
                strings.appealsTableRequestedAmount,
                (item) => item.amount_requested,
                {
                    sortable: true,
                    suffix: ' CHF',
                },
            ),
            createProgressColumn<AppealListItem, number>(
                'amount_funded',
                strings.appealsTableFundedAmount,
                // FIXME: use progress function
                (item) => (
                    getPercentage(
                        item.amount_funded,
                        item.amount_requested,
                    )
                ),
                { sortable: true },
            ),
        ].filter(isDefined)),
        [
            strings.appealsTableStartDate,
            strings.appealsTableType,
            strings.appealsTableCode,
            strings.appealsTableOperation,
            strings.appealsTableDisastertype,
            strings.appealsTableRequestedAmount,
            strings.appealsTableFundedAmount,
        ],
    );

    const countryGroupedAppeal = useMemo(() => (
        listToGroupList(
            appealsResponse?.results ?? [],
            (appeal) => appeal.country.iso3 ?? '<no-key>',
        )
    ), [appealsResponse]);

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
                features: countryRawResponse
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
        [countryRawResponse, countryGroupedAppeal],
    );

    const allAppealsType = useMemo(() => {
        if (isDefined(countryId)) {
            return {
                searchParam: `country=${countryId}`,
                title: strings.operationMapViewAllInCountry,
            };
        }
        return {
            searchParam: undefined,
            title: strings.operationMapViewAll,
        };
    }, [
        countryId,
        strings.operationMapViewAllInCountry,
        strings.operationMapViewAll,
    ]);

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

    const popupDetails = clickedPointProperties
        ? countryGroupedAppeal[clickedPointProperties.feature.properties.iso3]
        : undefined;

    return (
        <Container
            className={styles.countryOngoingActivities}
            actions={isAuthenticated && (
                <>
                    <Link
                        external
                        href={resolveUrl(adminUrl, `api/country/${countryId}/change/`)}
                        variant="secondary"
                        icons={<PencilFillIcon />}
                    >
                        {strings.editCountryLink}
                    </Link>
                    <WikiLink
                        href="user_guide/Country_Pages#on-going-activities"
                    />
                </>
            )}
            headerDescription={strings.countryOngoingActivitiesEmergenciesDescription}
            withCenteredHeaderDescription
            contentViewType="vertical"
            spacing="loose"
            pending={aggregatedAppealPending || appealsPending}
        >
            <Container
                pending={aggregatedAppealPending}
                errored={isDefined(aggregatedAppealError)}
                errorMessage={aggregatedAppealError?.value?.messageForNotification}
            >
                {aggregatedAppealResponse && (
                    <CountryKeyFigures
                        data={aggregatedAppealResponse}
                    />
                )}
            </Container>
            {isDefined(countryId) && (
                <HighlightedOperations
                    variant="country"
                    countryId={Number(countryId)}
                />
            )}
            {isDefined(countryId) && (
                <Container
                    className={_cs(styles.activeOperationMap, className)}
                    heading={!presentationMode && heading}
                    withHeaderBorder={!presentationMode}
                    childrenContainerClassName={styles.content}
                    withGridViewInFilter
                    filters={(
                        <Filters
                            value={rawFilter}
                            onChange={setFilterField}
                            setFilter={setFilter}
                            filtered={filtered}
                        />
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
                    footerActions={(
                        <Pager
                            activePage={page}
                            itemsCount={appealsResponse?.count ?? 0}
                            maxItemsPerPage={limit}
                            onActivePageChange={setPage}
                        />
                    )}
                    contentViewType="vertical"
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
                                popupClassName={styles.mapPopup}
                                onCloseButtonClick={handlePointClose}
                                coordinates={clickedPointProperties.lngLat}
                                heading={(
                                    <Link
                                        to="countriesLayout"
                                        urlParams={{
                                            // eslint-disable-next-line max-len
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
                                                description={strings.operationAmountRequested}
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
                        {isDefined(countryBounds) && (
                            <MapBounds
                                duration={DURATION_MAP_ZOOM}
                                bounds={countryBounds}
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
                    <SortContext.Provider value={sortState}>
                        <Table
                            pending={appealsPending}
                            filtered={isFiltered}
                            className={styles.table}
                            columns={columns}
                            keySelector={appealKeySelector}
                            data={appealsResponse?.results}
                            errored={isDefined(appealsResponseError)}
                        />
                    </SortContext.Provider>
                </Container>
            )}
        </Container>
    );
}
