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
import TableBodyContent from '#components/Table/TableBodyContent';
import type { RowOptions } from '#components/Table/types';
import Link from '#components/Link';
import Container from '#components/Container';
import RouteContext from '#contexts/route';
import type { GET } from '#types/serverResponse';
import { useRequest } from '#utils/restRequest';
import {
    STEP_OVERVIEW,
    STEP_ASSESSMENT,
    STEP_PRIORITIZATION,
    STEP_WORKPLAN,
} from '#utils/per';
import { numericIdSelector } from '#utils/selectors';

import styles from './styles.module.css';

type PerProcessStatusResponse = GET['api/v2/aggregated-per-process-status'];
type PerProcessStatusItem = PerProcessStatusResponse['results'][number];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [expandedRow, setExpandedRow] = useState<PerProcessStatusItem | undefined>();
    const {
        pending: aggregatedStatusPending,
        response: aggregatedStatusResponse,
    } = useRequest<PerProcessStatusResponse>({
        url: 'api/v2/aggregated-per-process-status',
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
                'Country',
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
                'Start date',
                (item) => item.date_of_assessment,
            ),
            createNumberColumn<PerProcessStatusItem, number | string>(
                'assessment_number',
                'PER cycle',
                (item) => item.assessment_number,
            ),
            createStringColumn<PerProcessStatusItem, number | string>(
                'phase',
                'Phase',
                (item) => (isDefined(item.phase) ? `${item.phase} - ${item.phase_display}` : '-'),
            ),
            createActionColumn<PerProcessStatusItem, number | string>(
                'actions',
                (item) => ({
                    children: isDefined(item.phase) ? (
                        <Link
                            to={getRouteUrl(item.phase, item.id)}
                        >
                            {`Edit ${item.phase_display}`}
                        </Link>
                    ) : undefined,
                }),
            ),
        ]),
        [countryRoute, getRouteUrl],
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
            // FIXME: use translations
            heading="PER Process Status"
            headingLevel={2}
            withHeaderBorder
            actions={(
                // FIXME: use translations
                <Link to={newPerOverviewFormRoute.absolutePath}>
                    Start New PER Process
                </Link>
            )}
        >
            <Table
                pending={aggregatedStatusPending}
                columns={aggregatedColumns}
                keySelector={numericIdSelector}
                data={aggregatedStatusResponse?.results}
                rowModifier={rowModifier}
            />
        </Container>
    );
}

Component.displayName = 'AccountPerForms';
