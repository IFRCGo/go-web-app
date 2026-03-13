import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Container,
    DateInput,
    InlineLayout,
    SelectInput,
    Tab,
    TabList,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    hasSomeDefinedValue,
    resolveToComponent,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import { type LngLatBoundsLike } from 'mapbox-gl';

import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import DistrictSearchMultiSelectInput, { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import Link from '#components/Link';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import {
    DISASTER_CATEGORY_ORANGE,
    DISASTER_CATEGORY_RED,
    DISASTER_CATEGORY_YELLOW,
} from '#utils/constants';
import type {
    GoApiResponse,
    GoApiUrlQuery,
} from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import OperationMapContainer from './OperationMapContainer';
import {
    APPEAL_TYPE_DREF,
    APPEAL_TYPE_EMERGENCY,
    APPEAL_TYPE_MULTIPLE,
    COLOR_DREF,
    COLOR_EMERGENCY_APPEAL,
    COLOR_MULTIPLE_TYPES,
    COLOR_ORANGE_SEVERITY,
    COLOR_RED_SEVERITY,
    COLOR_YELLOW_SEVERITY,
    type ScaleOption,
} from './utils';

import i18n from './i18n.json';

type AppealQueryParams = GoApiUrlQuery<'/api/v2/appeal/'>;
type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type AppealTypeOption = NonNullable<GlobalEnumsResponse['api_appeal_type']>[number];

const appealTypeKeySelector = (option: AppealTypeOption) => option.key;
const appealTypeLabelSelector = (option: AppealTypeOption) => option.value;

const now = new Date().toISOString();

type BaseProps = {
    className?: string;
    bbox: LngLatBoundsLike | undefined;
    presentationModeAdditionalBeforeContent?: React.ReactNode;
    presentationModeAdditionalAfterContent?: React.ReactNode;
    mapTitle: string;
};

type CountryProps = {
    variant: 'country';
    countryId: number;
};
type RegionProps = {
    variant: 'region';
    regionId: number;
};

type GlobalProps = {
    variant: 'global';
};

type Props = BaseProps & (RegionProps | GlobalProps | CountryProps);

function ActiveOperationMap(props: Props) {
    const {
        className,
        variant,
        presentationModeAdditionalBeforeContent,
        presentationModeAdditionalAfterContent,
        bbox,
        mapTitle,
    } = props;

    const [presentationMode, setPresentationMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'crisis' | 'appeal'>('crisis');

    const {
        filter,
        filtered,
        limit,
        rawFilter,
        setFilter,
        setFilterField,
    } = useFilterState<{
        appeal?: AppealTypeOption['key'];
        district?: number[];
        displacement?: number;
        startDateAfter?: string;
        startDateBefore?: string;
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
                // NOTE: Filtering only those appeals that has not been confirmed
                // and does not contain event
                has_event: true,
                needs_confirmation: false,
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

    const strings = useTranslation(i18n);
    const { api_appeal_type: appealTypeOptionsRaw } = useGlobalEnums();
    const {
        response: appealResponse,
        pending: appealPending,
        error: appealError,
    } = useRequest({
        url: '/api/v2/appeal/',
        query,
    });

    const appealTypeOptions = useMemo(() => (
        appealTypeOptionsRaw?.filter(
            (appealTypeOption) => appealTypeOption.key === APPEAL_TYPE_DREF
                || appealTypeOption.key === APPEAL_TYPE_EMERGENCY,
        )
    ), [appealTypeOptionsRaw]);

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

    const handlePresentationMode = useCallback((presentation: boolean) => {
        setPresentationMode(presentation);
    }, []);

    const handleClearFiltersButtonClick = useCallback(() => {
        setFilter({});
    }, [setFilter]);

    const [districtOptions, setDistrictOptions] = useState<DistrictItem[] | null | undefined>();

    const handleTabChanges = useCallback(
        (name: 'crisis' | 'appeal') => {
            setActiveTab(name);
        },
        [],
    );

    const legendOptions = useMemo(() => {
        if (activeTab === 'appeal') {
            return ([
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
                    value: APPEAL_TYPE_MULTIPLE,
                    label: strings.explanationBubbleMultiple,
                    color: COLOR_MULTIPLE_TYPES,
                },
            ]);
        }
        return ([
            {
                value: DISASTER_CATEGORY_RED,
                label: strings.crisisRedEmergency,
                color: COLOR_RED_SEVERITY,
            },
            {
                value: DISASTER_CATEGORY_ORANGE,
                label: strings.crisisOrangeEmergency,
                color: COLOR_ORANGE_SEVERITY,
            },
            {
                value: DISASTER_CATEGORY_YELLOW,
                label: strings.crisisYellowEmergency,
                color: COLOR_YELLOW_SEVERITY,
            },
        ]);
    }, [strings, activeTab]);

    const scaleOptions: ScaleOption[] = useMemo(
        () => [
            {
                value: 'peopleTargeted',
                label: strings.explanationBubblePopulationLabel,
            },
            {
                value: 'financialRequirements',
                label: strings.explanationBubbleAmountLabel,
            },
        ],
        [
            strings.explanationBubblePopulationLabel,
            strings.explanationBubbleAmountLabel,
        ],
    );

    return (
        <Tabs
            onChange={handleTabChanges}
            value={activeTab}
            styleVariant="nav"
        >
            <Container
                pending={appealPending}
                filtered={filtered}
                errored={isDefined(appealError)}
                overlayPending
                className={className}
                heading={!presentationMode && heading}
                withHeaderBorder={!presentationMode}
                filters={
                    !presentationMode && (
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
                            <Button
                                name={undefined}
                                onClick={handleClearFiltersButtonClick}
                                disabled={!filtered}
                            >
                                {strings.operationMapClearFilters}
                            </Button>
                        </>
                    )
                }
                headerActions={
                    !presentationMode && (
                        <Link
                            to="allAppeals"
                            urlSearch={allAppealsType.searchParam}
                            withLinkIcon
                            withUnderline
                        >
                            {allAppealsType.title}
                        </Link>
                    )
                }
            >
                <InlineLayout
                    after={(
                        <TabList>
                            <Tab
                                name="crisis"
                            >
                                {strings.crisisTabName}
                            </Tab>
                            <Tab
                                name="appeal"
                            >
                                {strings.appealTabName}
                            </Tab>
                        </TabList>
                    )}
                />
                <OperationMapContainer
                    variant={activeTab}
                    presentationModeAdditionalAfterContent={
                        presentationModeAdditionalAfterContent
                    }
                    presentationModeAdditionalBeforeContent={
                        presentationModeAdditionalBeforeContent
                    }
                    onPresentationModeChange={handlePresentationMode}
                    mapTitle={mapTitle}
                    bbox={bbox}
                    appealResponse={appealResponse}
                    scaleOptions={scaleOptions}
                    legendOptions={legendOptions}
                />
            </Container>
        </Tabs>
    );
}

export default ActiveOperationMap;
