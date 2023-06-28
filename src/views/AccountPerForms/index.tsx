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
    createActionColumn,
    createNumberColumn,
    createDateColumn,
    createLinkColumn,
    createStringColumn,
    createExpandColumn,
    createEmptyColumn,
} from '#components/Table/ColumnShortcuts';
import { useSortState, SortContext } from '#components/Table/useSorting';
import TableBodyContent from '#components/Table/TableBodyContent';
import type { RowOptions } from '#components/Table/types';
import Link from '#components/Link';
import Container from '#components/Container';
import RouteContext from '#contexts/route';
import type { GET } from '#types/serverResponse';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';
import { useRequest } from '#utils/restRequest';
import {
    STEP_OVERVIEW,
    STEP_ASSESSMENT,
    STEP_PRIORITIZATION,
    STEP_WORKPLAN,
    STEP_ACTION,
} from '#utils/per';
import { numericIdSelector } from '#utils/selectors';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PerProcessStatusResponse = GET['api/v2/aggregated-per-process-status'];
type PerProcessStatusItem = PerProcessStatusResponse['results'][number];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'date_of_assessment', direction: 'dsc' });
    const { sorting } = sortState;
    const [expandedRow, setExpandedRow] = useState<PerProcessStatusItem | undefined>();
    let ordering;
    if (sorting) {
        ordering = sorting.direction === 'dsc'
            ? `-${sorting.name}`
            : sorting.name;
    }
    const {
        pending: aggregatedStatusPending,
        response: aggregatedStatusResponse,
    } = useRequest<PerProcessStatusResponse>({
        url: 'api/v2/aggregated-per-process-status',
        query: {
            ordering,
        },
    });

    const {
        // pending: countryStatusPending,
        response: countryStatusResponse,
    } = useRequest<PerProcessStatusResponse>({
        skip: isNotDefined(expandedRow),
        url: 'api/v2/per-process-status',
        query: {
            country: expandedRow?.country,
        },
    });

    const {
        country: countryRoute,
        perOverviewForm: perOverviewFormRoute,
        perAssessmentForm: perAssessmentFormRoute,
        perPrioritizationForm: perPrioritizationFormRoute,
        perWorkPlanForm: perWorkPlanFormRoute,
        newPerOverviewForm: newPerOverviewFormRoute,
    } = useContext(RouteContext);

    const getRouteUrl = useCallback(
        (currentPhase: number, perId: number) => {
            if (currentPhase === STEP_OVERVIEW) {
                return generatePath(
                    perOverviewFormRoute.absolutePath,
                    { perId },
                );
            }

            if (currentPhase === STEP_ASSESSMENT) {
                return generatePath(
                    perAssessmentFormRoute.absolutePath,
                    { perId },
                );
            }

            if (currentPhase === STEP_PRIORITIZATION) {
                return generatePath(
                    perPrioritizationFormRoute.absolutePath,
                    { perId },
                );
            }

            if (currentPhase === STEP_WORKPLAN) {
                return generatePath(
                    perWorkPlanFormRoute.absolutePath,
                    { perId },
                );
            }

            return undefined;
        },
        [
            perOverviewFormRoute,
            perAssessmentFormRoute,
            perPrioritizationFormRoute,
            perWorkPlanFormRoute,
        ],
    );

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
            createLinkColumn<PerProcessStatusItem, number | string>(
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
            createDateColumn<PerProcessStatusItem, number | string>(
                'date_of_assessment',
                strings.tableStartDateTitle,
                (item) => item.date_of_assessment,
                { sortable: true },
            ),
            createNumberColumn<PerProcessStatusItem, number | string>(
                'assessment_number',
                strings.tablePerCycleTitle,
                (item) => item.assessment_number,
            ),
            createStringColumn<PerProcessStatusItem, number | string>(
                'phase',
                strings.tablePerPhaseTitle,
                (item) => (isDefined(item.phase) ? `${item.phase} - ${item.phase_display}` : '-'),
                { sortable: true },
            ),
            createActionColumn<PerProcessStatusItem, number | string>(
                'actions',
                (item) => ({
                    children: (
                        <>
                            {isDefined(item.phase) && item.phase <= STEP_WORKPLAN && (
                                <Link
                                    to={getRouteUrl(item.phase, item.id)}
                                >
                                    {resolveToString(
                                        strings.tableEditLabel,
                                        { phaseDisplay: item.phase_display },
                                    )}
                                </Link>
                            )}
                            {isDefined(item.phase) && item.phase === STEP_ACTION && (
                                <Link
                                    to={generatePath(
                                        perWorkPlanFormRoute.absolutePath,
                                        { perId: item.id },
                                    )}
                                >
                                    {strings.tableViewWorkPlan}
                                </Link>
                            )}
                        </>
                    ),
                }),
            ),
        ]),
        [strings, countryRoute, getRouteUrl, perWorkPlanFormRoute],
    );

    const aggregatedColumns = useMemo(
        () => ([
            ...baseColumn,
            createExpandColumn<PerProcessStatusItem, number>(
                'expandRow',
                '',
                handleExpandClick,
                expandedRow?.id,
            ),
        ]),
        [handleExpandClick, baseColumn, expandedRow?.id],
    );

    const detailColumns = useMemo(
        () => ([
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

            return (
                <>
                    {row}
                    <TableBodyContent
                        keySelector={numericIdSelector}
                        data={countryStatusResponse?.results}
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
                >
                    {strings.newProcessButtonLabel}
                </Link>
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={aggregatedStatusPending}
                    columns={aggregatedColumns}
                    keySelector={numericIdSelector}
                    data={aggregatedStatusResponse?.results}
                    rowModifier={rowModifier}
                />
            </SortContext.Provider>
        </Container>
    );
}

Component.displayName = 'AccountPerForms';
