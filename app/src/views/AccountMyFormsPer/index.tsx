import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    Pager,
    Table,
    TableBodyContent,
} from '@ifrc-go/ui';
import { type RowOptions } from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createElementColumn,
    createEmptyColumn,
    createExpandColumn,
    createExpansionIndicatorColumn,
    createNumberColumn,
    createStringColumn,
    DEFAULT_INVALID_TEXT,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import RegionSelectInput, { type RegionOption } from '#components/domain/RegionSelectInput';
import Link from '#components/Link';
import WikiLink from '#components/WikiLink';
import useFilterState from '#hooks/useFilterState';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import PerTableActions, { type Props as PerTableActionsProps } from './PerTableActions';

import i18n from './i18n.json';
import styles from './styles.module.css';

type AggregatedPerProcessStatusResponse = GoApiResponse<'/api/v2/aggregated-per-process-status/'>;
type PerProcessStatusItem = NonNullable<AggregatedPerProcessStatusResponse['results']>[number];

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        sortState,
        ordering,
        rawFilter,
        filter,
        filtered,
        setFilterField,
        limit,
        offset,
        page,
        setPage,
    } = useFilterState<{
        region?: RegionOption['key'],
        country?: number,
    }>({
        filter: {},
        ordering: { name: 'date_of_assessment', direction: 'dsc' },
        pageSize: 10,
    });

    const [expandedRow, setExpandedRow] = useState<PerProcessStatusItem | undefined>();

    const {
        pending: aggregatedStatusPending,
        response: aggregatedStatusResponse,
    } = useRequest({
        url: '/api/v2/aggregated-per-process-status/',
        preserveResponse: true,
        query: {
            ordering,
            country: isDefined(filter.country) ? [filter.country] : undefined,
            region: filter.region,
            limit,
            offset,
        },
    });

    const {
        // pending: countryStatusPending,
        response: countryStatusResponse,
    } = useRequest({
        skip: isNotDefined(expandedRow),
        url: '/api/v2/per-process-status/',
        query: {
            country: expandedRow?.country
                ? [expandedRow.country]
                : undefined,
            limit: 9999,
        },
    });

    const handleExpandClick = useCallback(
        (row: PerProcessStatusItem) => {
            setExpandedRow(
                (prevValue) => (prevValue?.id === row.id ? undefined : row),
            );
        },
        [],
    );

    const baseColumn = useMemo(
        () => ([
            createLinkColumn<PerProcessStatusItem, number>(
                'country',
                strings.tableCountryTitle,
                (item) => item.country_details?.name,
                (item) => ({
                    to: 'countryPreparedness',
                    urlParams: {
                        countryId: item.country,
                        perId: item.id,
                    },
                }),
            ),
            createDateColumn<PerProcessStatusItem, number>(
                'date_of_assessment',
                strings.tableStartDateTitle,
                (item) => item.date_of_assessment,
                { sortable: true },
            ),
            createNumberColumn<PerProcessStatusItem, number>(
                'assessment_number',
                strings.tablePerCycleTitle,
                (item) => item.assessment_number,
            ),
            createStringColumn<PerProcessStatusItem, number>(
                'phase',
                strings.tablePerPhaseTitle,
                (item) => (isDefined(item.phase) ? `${item.phase} - ${item.phase_display}` : DEFAULT_INVALID_TEXT),
                { sortable: true },
            ),
            createElementColumn<PerProcessStatusItem, number, PerTableActionsProps>(
                'actions',
                '',
                PerTableActions,
                (perId, statusItem) => ({
                    perId,
                    phase: statusItem.phase,
                    phaseDisplay: statusItem.phase_display,
                    country: statusItem.country_details.name ?? '--',
                }),
            ),
        ]),
        [
            strings.tableCountryTitle,
            strings.tableStartDateTitle,
            strings.tablePerCycleTitle,
            strings.tablePerPhaseTitle,
        ],
    );

    const aggregatedColumns = useMemo(
        () => ([
            createExpansionIndicatorColumn<PerProcessStatusItem, number>(
                false,
            ),
            ...baseColumn,
            createExpandColumn<PerProcessStatusItem, number>(
                'expandRow',
                '',
                (row) => ({
                    onClick: handleExpandClick,
                    expanded: row.id === expandedRow?.id,
                    disabled: (row.assessment_number ?? 0) <= 1,
                }),
            ),
        ]),
        [handleExpandClick, baseColumn, expandedRow?.id],
    );

    const detailColumns = useMemo(
        () => ([
            createExpansionIndicatorColumn<PerProcessStatusItem, number>(
                true,
            ),
            ...baseColumn,
            createEmptyColumn(),
        ]),
        [baseColumn],
    );

    const rowModifier = useCallback(
        ({ row, datum }: RowOptions<PerProcessStatusItem, number>) => {
            if (datum.country !== expandedRow?.country) {
                return row;
            }

            const subRows = countryStatusResponse?.results?.filter(
                (subRow) => subRow.id !== datum.id,
            );

            return (
                <>
                    {row}
                    <TableBodyContent
                        keySelector={numericIdSelector}
                        data={subRows}
                        columns={detailColumns}
                        cellClassName={styles.subCell}
                    />
                </>
            );
        },
        [expandedRow, detailColumns, countryStatusResponse],
    );

    return (
        <Container
            className={styles.accountPerForms}
            heading={strings.processStatusTitle}
            withHeaderBorder
            actions={(
                <>
                    <Link
                        to="newPerOverviewForm"
                        variant="primary"
                    >
                        {strings.newProcessButtonLabel}
                    </Link>
                    <WikiLink
                        href="user_guide/Preparedness#register-or-update-a-per-process"
                    />
                </>
            )}
            filters={(
                <>
                    <RegionSelectInput
                        placeholder={strings.allRegions}
                        name="region"
                        value={rawFilter.region}
                        onChange={setFilterField}
                        disabled={isDefined(rawFilter.country)}
                    />
                    <CountrySelectInput
                        placeholder={strings.allCountries}
                        name="country"
                        value={rawFilter.country}
                        disabled={isDefined(rawFilter.region)}
                        onChange={setFilterField}
                    />
                </>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    onActivePageChange={setPage}
                    itemsCount={aggregatedStatusResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                />
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={aggregatedStatusPending}
                    columns={aggregatedColumns}
                    keySelector={numericIdSelector}
                    data={aggregatedStatusResponse?.results}
                    rowModifier={rowModifier}
                    filtered={filtered}
                />
            </SortContext.Provider>
        </Container>
    );
}

Component.displayName = 'AccountPerForms';
