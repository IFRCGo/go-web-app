import {
    useMemo,
    useCallback,
    useState,
} from 'react';
import {
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';

import Table from '#components/Table';
import {
    createNumberColumn,
    createDateColumn,
    createLinkColumn,
    createStringColumn,
    createExpandColumn,
    createEmptyColumn,
    createExpansionIndicatorColumn,
    createElementColumn,
} from '#components/Table/ColumnShortcuts';
import { SortContext } from '#components/Table/useSorting';
import TableBodyContent from '#components/Table/TableBodyContent';
import { type RowOptions } from '#components/Table/types';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import RegionSelectInput, { type RegionOption } from '#components/domain/RegionSelectInput';
import Link from '#components/Link';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';

import PerTableActions, { type Props as PerTableActionsProps } from './PerTableActions';
import i18n from './i18n.json';
import styles from './styles.module.css';

type AggregatedPerProcessStatusResponse = GoApiResponse<'/api/v2/aggregated-per-process-status/'>;
type PerProcessStatusItem = NonNullable<AggregatedPerProcessStatusResponse['results']>[number];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        sortState,
        ordering,
        filter,
        filtered,
        setFilterField,
    } = useFilterState<{
        region?: RegionOption['key'],
        country?: number,
    }>(
        {},
        { name: 'date_of_assessment', direction: 'dsc' },
    );

    const [expandedRow, setExpandedRow] = useState<PerProcessStatusItem | undefined>();

    const {
        pending: aggregatedStatusPending,
        response: aggregatedStatusResponse,
    } = useRequest({
        url: '/api/v2/aggregated-per-process-status/',
        query: {
            ordering,
            country: isDefined(filter.country) ? [filter.country] : undefined,
            region: filter.region,
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
                    urlParams: { countryId: item.country },
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
                (item) => (isDefined(item.phase) ? `${item.phase} - ${item.phase_display}` : '-'),
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
                }),
            ),
        ]),
        [strings],
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
                <Link
                    to="newPerOverviewForm"
                    variant="primary"
                >
                    {strings.newProcessButtonLabel}
                </Link>
            )}
            filtersContainerClassName={styles.filters}
            filters={(
                <>
                    <RegionSelectInput
                        placeholder={strings.allRegions}
                        name="region"
                        value={filter.region}
                        onChange={setFilterField}
                        disabled={isDefined(filter.country)}
                    />
                    <CountrySelectInput
                        placeholder={strings.allCountries}
                        name="country"
                        value={filter.country}
                        disabled={isDefined(filter.region)}
                        onChange={setFilterField}
                    />
                </>
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
