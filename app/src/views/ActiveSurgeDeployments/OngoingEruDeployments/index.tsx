import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    LegendItem,
    Pager,
    SelectInput,
    Table,
    TableBodyContent,
} from '@ifrc-go/ui';
import { type RowOptions } from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createEmptyColumn,
    createExpandColumn,
    createMultiTimelineColumn,
    createStringColumn,
    createTimelineColumn,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import {
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
} from '#utils/constants';
import { getEruEventDates } from '#utils/domain/eru';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type DeploymentsEruTypeEnum = components<'read'>['schemas']['DeploymentsEruTypeEnum'];

type GetEruByEventResponse = GoApiResponse<'/api/v2/deployed_eru_by_event/'>;
type EruByEvent = NonNullable<GetEruByEventResponse['results']>[number];
type EruListItem = NonNullable<EruByEvent['active_erus']>[number];

const deployedEruKeySelector = (item: EruByEvent) => item.id;

const emergencyResponseUnitTypeKeySelector = (item: DeploymentsEruTypeEnum) => item.key;
const emergencyResponseUnitTypeLabelSelector = (item: DeploymentsEruTypeEnum) => item.value ?? '?';

const PAGE_SIZE = 5;

function OngoingEruDeployments() {
    const strings = useTranslation(i18n);

    const {
        sortState,
        page,
        setPage,
        limit,
        offset,
        filter,
        rawFilter,
        filtered,
        setFilterField,
    } = useFilterState<{type? : DeploymentsEruTypeEnum['key']}>({
        filter: {},
        pageSize: PAGE_SIZE,
    });

    const {
        deployments_eru_type: eruTypes,
    } = useGlobalEnums();

    const [expandedRow, setExpandedRow] = useState<EruByEvent | undefined>();

    const {
        pending: deployedEruResponsePending,
        response: deployedEruResponse,
    } = useRequest({
        url: '/api/v2/deployed_eru_by_event/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            eru_type: isDefined(filter.type) ? filter.type : undefined,
        },
    });

    const eruEventDates = useMemo(() => {
        if (isNotDefined(deployedEruResponse)) {
            return undefined;
        }
        return getEruEventDates(deployedEruResponse.results);
    }, [deployedEruResponse]);

    const timelineDateRange = useMemo(() => {
        if (isNotDefined(eruEventDates)) {
            return undefined;
        }
        if (isNotDefined(eruEventDates.timelineStartDate)
            || isNotDefined(eruEventDates.timelineEndDate)) {
            return undefined;
        }
        return {
            start: eruEventDates.timelineStartDate,
            end: eruEventDates.timelineEndDate,
        };
    }, [eruEventDates]);

    const handleExpandClick = useCallback(
        (row: EruByEvent) => {
            setExpandedRow(
                (prevValue) => (prevValue?.id === row.id ? undefined : row),
            );
        },
        [],
    );

    const columns = useMemo(
        () => ([
            createLinkColumn<EruByEvent, number>(
                'name',
                strings.eruEmergency,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: {
                        emergencyId: String(item.id),
                    },
                }),
            ),
            createStringColumn<EruByEvent, number>(
                'organisation',
                strings.eruOrganisation,
                () => '',
                {
                    defaultEmptyValue: '',
                    columnClassName: styles.organisation,
                },
            ),
            createStringColumn<EruByEvent, number>(
                'country',
                strings.eruDeploymentCountry,
                () => '',
                {
                    defaultEmptyValue: '',
                    columnClassName: styles.country,
                },
            ),
            createMultiTimelineColumn<EruByEvent, number>(
                'timeline',
                timelineDateRange,
                (item) => {
                    const itemDateRange = getEruEventDates([item]);
                    return {
                        startDate: itemDateRange?.appealStartDate,
                        endDate: itemDateRange?.appealEndDate,
                        highlightedStartDate: itemDateRange?.eruStartDate,
                        highlightedEndDate: itemDateRange?.eruEndDate,
                        startDateLabel: strings.ongoingEmergencyStartDate,
                        endDateLabel: strings.ongoingEmergencyEndDate,
                        highlightedStartDateLabel: strings.eruStartDate,
                        highlightedEndDateLabel: strings.eruEndDate,
                    };
                },
                { columnClassName: styles.timeline },
            ),
            createExpandColumn<EruByEvent, number>(
                'expandRow',
                '',
                (row) => ({
                    onClick: handleExpandClick,
                    expanded: row.id === expandedRow?.id,
                }),
            ),
        ]),
        [
            handleExpandClick,
            expandedRow,
            timelineDateRange,
            strings.eruEmergency,
            strings.eruOrganisation,
            strings.ongoingEmergencyStartDate,
            strings.ongoingEmergencyEndDate,
            strings.eruStartDate,
            strings.eruEndDate,
            strings.eruDeploymentCountry,
        ],
    );

    const eruColumns = useMemo(
        () => ([
            createStringColumn<EruListItem, number>(
                'name',
                strings.eruName,
                (item) => item?.type_display,
            ),
            createStringColumn<EruListItem, number>(
                'society_name',
                strings.eruOrganisation,
                (item) => item?.eru_owner_details?.national_society_country_details?.society_name,
            ),
            createLinkColumn<EruListItem, number>(
                'country',
                strings.eruDeploymentCountry,
                (item) => item.deployed_to.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: {
                        countryId: item.deployed_to.id,
                    },
                }),
            ),
            createTimelineColumn<EruListItem, number>(
                'timeline',
                timelineDateRange,
                (item) => ({
                    startDate: item.start_date,
                    endDate: item.end_date,
                }),
                { columnClassName: styles.timeline },
            ),
            createEmptyColumn<EruListItem, number>(),
        ]),
        [
            timelineDateRange,
            strings.eruOrganisation,
            strings.eruDeploymentCountry,
            strings.eruName,
        ],
    );

    const rowModifier = useCallback(
        ({ row, datum }: RowOptions<EruByEvent, number>) => {
            if (datum.id !== expandedRow?.id) {
                return row;
            }

            const subRows = datum.active_erus;

            return (
                <>
                    {row}
                    <TableBodyContent
                        keySelector={numericIdSelector}
                        data={subRows}
                        columns={eruColumns}
                        cellClassName={styles.subCell}
                    />
                </>
            );
        },
        [
            expandedRow,
            eruColumns,
        ],
    );

    return (
        <Container
            className={styles.ongoingEruDeployments}
            heading={strings.eruHeading}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={deployedEruResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            actions={(
                <Link
                    to="allDeployedEmergencyResponseUnits"
                    withLinkIcon
                    withUnderline
                >
                    {strings.eruViewAll}
                </Link>
            )}
            filters={(
                <SelectInput
                    placeholder={strings.eruTypes}
                    name="type"
                    value={rawFilter.type}
                    onChange={setFilterField}
                    keySelector={emergencyResponseUnitTypeKeySelector}
                    labelSelector={emergencyResponseUnitTypeLabelSelector}
                    options={eruTypes}
                />
            )}
            footerContent={(
                <>
                    <LegendItem
                        label={strings.eruEmergencyTimeline}
                        color={COLOR_LIGHT_GREY}
                    />
                    <LegendItem
                        label={strings.eruDeploymentTimeline}
                        color={COLOR_PRIMARY_RED}
                    />
                </>
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    className={styles.table}
                    pending={deployedEruResponsePending}
                    columns={columns}
                    rowModifier={rowModifier}
                    keySelector={deployedEruKeySelector}
                    data={deployedEruResponse?.results}
                    filtered={filtered}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default OngoingEruDeployments;
