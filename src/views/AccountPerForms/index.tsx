import {
    useMemo,
    useContext,
    useCallback,
    useState,
} from 'react';
import { generatePath } from 'react-router-dom';
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
import { useSortState, SortContext, getOrdering } from '#components/Table/useSorting';
import TableBodyContent from '#components/Table/TableBodyContent';
import type { RowOptions } from '#components/Table/types';
import CountrySearchSelectInput from '#components/CountrySearchSelectInput';
import RegionSelectInput from '#components/RegionSelectInput';
import Link from '#components/Link';
import Container from '#components/Container';
import RouteContext from '#contexts/route';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';
import useInputState from '#hooks/useInputState';

import PerTableActions from './PerTableActions';
import type { Props as PerTableActionsProps } from './PerTableActions';
import i18n from './i18n.json';
import styles from './styles.module.css';

type AggregatedPerProcessStatusResponse = GoApiResponse<'/api/v2/aggregated-per-process-status/'>;
type AggregatedPerProcessStatusItem = NonNullable<AggregatedPerProcessStatusResponse['results']>[number];

type PerProcessStatusItem = NonNullable<AggregatedPerProcessStatusResponse['results']>[number];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'date_of_assessment', direction: 'dsc' });
    const { sorting } = sortState;
    const [expandedRow, setExpandedRow] = useState<PerProcessStatusItem | undefined>();
    const [filterCountry, setFilterCountry] = useInputState<number | undefined>(undefined);
    const [filterRegion, setFilterRegion] = useInputState<number | undefined>(undefined);

    const {
        pending: aggregatedStatusPending,
        response: aggregatedStatusResponse,
    } = useRequest({
        url: '/api/v2/aggregated-per-process-status/',
        query: {
            ordering: getOrdering(sorting),
            country: isDefined(filterCountry) ? [filterCountry] : undefined,
            region: filterRegion,
        },
    });

    const {
        // pending: countryStatusPending,
        response: countryStatusResponse,
    } = useRequest({
        skip: isNotDefined(expandedRow),
        url: '/api/v2/per-process-status/',
        query: {
            country: Number(expandedRow?.country),
            // FIXME: typings should be fixed in server
        } as never,
    });

    const {
        country: countryRoute,
        newPerOverviewForm: newPerOverviewFormRoute,
    } = useContext(RouteContext);

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
            createLinkColumn<AggregatedPerProcessStatusItem, number>(
                'country',
                strings.tableCountryTitle,
                (item) => item.country_details?.name,
                (item) => ({
                    to: generatePath(
                        countryRoute.absolutePath,
                        { countryId: String(item.country) },
                    ),
                }),
            ),
            createDateColumn<AggregatedPerProcessStatusItem, number>(
                'date_of_assessment',
                strings.tableStartDateTitle,
                (item) => item.date_of_assessment,
                { sortable: true },
            ),
            createNumberColumn<AggregatedPerProcessStatusItem, number>(
                'assessment_number',
                strings.tablePerCycleTitle,
                (item) => item.assessment_number,
            ),
            createStringColumn<AggregatedPerProcessStatusItem, number>(
                'phase',
                strings.tablePerPhaseTitle,
                (item) => (isDefined(item.phase) ? `${item.phase} - ${item.phase_display}` : '-'),
                { sortable: true },
            ),
            createElementColumn<AggregatedPerProcessStatusItem, number, PerTableActionsProps>(
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
        [strings, countryRoute],
    );

    const aggregatedColumns = useMemo(
        () => ([
            createExpansionIndicatorColumn<PerProcessStatusItem, number | string>(
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
            headingLevel={2}
            withHeaderBorder
            actions={(
                <Link
                    to={newPerOverviewFormRoute.absolutePath}
                    variant="primary"
                >
                    {strings.newProcessButtonLabel}
                </Link>
            )}
            filtersContainerClassName={styles.filters}
            filters={(
                <>
                    <RegionSelectInput
                        placeholder="All Regions"
                        name={undefined}
                        value={filterRegion}
                        onChange={setFilterRegion}
                        disabled={isDefined(filterCountry)}
                    />
                    <CountrySearchSelectInput
                        // FIXME: use translations
                        placeholder="All Countries"
                        name={undefined}
                        value={filterCountry}
                        disabled={isDefined(filterRegion)}
                        onChange={setFilterCountry}
                    />
                    <div />
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
                    filtered={false}
                />
            </SortContext.Provider>
        </Container>
    );
}

Component.displayName = 'AccountPerForms';
